var fs = require('fs'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn

var io,
    pool = {},
    countOnline = 0,
    countRunning = 0

exports.init = function (app) {
  io = app
}

exports.socketHandler = function (socket) {

  countOnline++
  io.sockets.emit('online', countOnline)

  socket.on('disconnect', function () {
    countOnline--
    io.sockets.emit('online', countOnline)
  })

  socket.on('run', function (data) {
    countRunning++
    io.sockets.emit('running', countRunning)
    socket.emit('processing', 'saving code')
    save(data, socket)
  })

  socket.on('halt', function (data) {
    socket.emit('processing', 'stopping')
    halt(data)
  })

}

function save (code, socket) {
  var file = './repos/code-' + (new Date()).getTime() + '.js'
  fs.writeFile(file, code, function (err) {
    if (!err) {
      socket.emit('processing', 'code saved, start to compile and run')
      run(file, socket)
    } else {
      throw err
      socket.emit('error', 'error saving code!')
      countRunning--
      io.sockets.emit('running', countRunning)
    }
  })
}

function run (file, socket) {
  socket.emit('success', 'code running')
  var childProcess = spawn('node', [file]).on('error', function (err) {
    countRunning--
    io.sockets.emit('running', countRunning)
    socket.emit('error', err)
  })
  childProcess.stdout.on('data', function (data) {
    socket.emit('stdout', data)
  })
  childProcess.stderr.on('data', function (data) {
    socket.emit('stderr', data)
  })
  childProcess.on('close', function (code) {
    countRunning--
    io.sockets.emit('running', countRunning)
    socket.emit('close', code)
    exec('rm ' + pool[childProcess.pid].fileName, function (err, stdout, stderr) {
      if (!err) {
        delete pool[childProcess.pid]
      } else {

      }
    })
  })
  childProcess.fileName = file
  pool[childProcess.pid] = childProcess
  socket.emit('pid', childProcess.pid)
}

function halt (pid) {
  pool[pid].kill('SIGHUP')
}

function generateTimeString () {
  var time = (new Date()).toString().split(' ')
  return time[1] + '-' + 
         time[2] + '-' + 
         time[3] + '-' + 
         time[4].replace(/:/g, '-')
}