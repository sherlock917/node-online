var fs = require('fs'),
    spawn = require('child_process').spawn

exports.socketHandler = function (socket) {

  socket.on('run', function (data) {
    socket.emit('processing', 'saving code...')
    save(data, socket)
  })

  socket.on('halt', function () {
    socket.emit('processing', 'stopping...')
    halt()
  })

}

function save (code, socket) {
  var file = './repos/code-' + generateTimeString() + '.js'
  fs.writeFile(file, code, function (err) {
    if (!err) {
      socket.emit('processing', 'code saved, start to compile and run...')
      run(file, socket)
    } else {
      throw err
      socket.emit('error', 'error saving code!')
    }
  })
}

function run (file, socket) {
  socket.emit('success', 'code running...')
  var childProcess = spawn('node', [file]).on('error', function (err) {
    socket.emit('error', err);
  })
  childProcess.stdout.on('data', function (data) {
    socket.emit('stdout', data)
  })
  childProcess.stderr.on('data', function (data) {
    socket.emit('stderr', data)
  })
  childProcess.on('close', function (code) {
    socket.emit('close', code)
  })
}

function generateTimeString () {
  var time = (new Date()).toString().split(' ')
  return time[1] + '-' + 
         time[2] + '-' + 
         time[3] + '-' + 
         time[4].replace(/:/g, '-')
}