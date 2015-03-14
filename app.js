var app = require('http').createServer(server),
    url = require('url'),
    fs = require('fs'),
    io = require('socket.io')(app)

var controller = require('./controllers/main')

function server (req, res) {
  var path = (url.parse(req.url).pathname == '/') 
    ? '/views/index.html' 
    : '/views/' + url.parse(req.url).pathname
  var mime = path.split('.').pop()
  if (mime == 'js') {
    mime = 'text/javascript'
  } else if (mime == 'jpg' || mime == 'png') {
    mime = 'image/' + mime
  } else {
    mime = 'text/' + mime
  }
  fs.readFile('.' + path, function (err, data) {
    if (err) {
      res.writeHead(404)
      return res.end('resource not found')
    } else {
      res.writeHead(200, {"Content-Type": mime})
      res.end(data)
    }
  })
}

controller.init(io)
io.on('connection', controller.socketHandler)

app.listen(3000)