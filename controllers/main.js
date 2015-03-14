var fs = require('fs')

exports.socketHandler = function (socket) {

  socket.on('submit', function (data, callback) {
    socket.emit('processing', 'saving code...')
    save(data, socket)
  })

}

function save (code, socket) {
  var time = generateTimeString()
  fs.writeFile('./repos/code-' + time + '.js', code, function (err) {
    if (!err) {
      socket.emit('processing', 'code saved, start to compile and run...')
    } else {
      throw err
      socket.emit('error', 'error saving code!')
    }
  })
}

function generateTimeString () {
  var time = (new Date()).toString().split(' ')
  return time[1] + '-' + 
         time[2] + '-' + 
         time[3] + '-' + 
         time[4].replace(/:/g, '-')
}