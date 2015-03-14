(function () {

  var socket = io('http://localhost:3000');
  socket.on('processing', function (data) {
    hint(data, 0x00f);
  });
  socket.on('success', function (data) {
    hint(data, 0x0f0);
  });
  socket.on('error', function (data) {
    hint(data, 0xf00);
  });
  socket.on('stdout', function (data) {
    decode(data);
  });
  socket.on('stderr', function (data) {
    decode(data, true);
  });
  socket.on('close', function (data) {
    $('#log').innerHTML += '<br><p>** exit with code ' + data + ' **</p><br>'; 
    $('#log').scrollTop = 999999999;
  });

  $$.bind($('#run'), 'click', function (e) {
    if ($('#input').value != '') {
      $('#log').innerHTML = '';
      hint('code submitted...', 0x0f0);
      socket.emit('run', $('#input').value);
    } else {
      hint('no code to submit...', 0xf00);
    }
  });

  $$.bind($('#halt'), 'click', function (e) {
    socket.emit('halt');
  });

  function hint (text, type) {
    switch (type) {
      case 0xf00:
        if (!$('#hint').hasClass('hint-error')) {
          $('#hint').addClass('hint-error');
          $('#hint').removeClass('hint-success');
          $('#hint').removeClass('hint-processing');
        }
        break;
      case 0x0f0:
        if (!$('#hint').hasClass('hint-success')) {
          $('#hint').addClass('hint-success');
          $('#hint').removeClass('hint-error');
          $('#hint').removeClass('hint-processing');
        }
        break;
      case 0x00f:
        if (!$('#hint').hasClass('hint-processing')) {
          $('#hint').addClass('hint-processing');
          $('#hint').removeClass('hint-success');
          $('#hint').removeClass('hint-error');
        }
        break;
      default :
        break;
    }
    $('#hint').innerHTML = text;
  }

  function decode (data, error) {
    var dataView = new DataView(data);
    var decoder = new TextDecoder('utf-8');
    var decodedString = decoder.decode(dataView);
    show(decodedString, error);
  }

  function show (data, error) {
    if (error) {
      $('#log').innerHTML += '<p class="error">' + data.replace(/\n/g, '<br>') + '</p>';
    } else {
      $('#log').innerHTML += '<p>' + data + '</p>';
    }
    $('#log').scrollTop = 999999999;
  }

})();