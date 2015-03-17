var http = require('http')

http.createServer (function (req, res) {
  res.wirteHead(200, {'Content-Type' : 'text/html'})
  res.end('hello')
}).listen(3001)