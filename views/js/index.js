(function () {

  var socket = io('http://localhost:3000');
  socket.on('processing', function (data) {
    hint(data, 0x00f);
  })

  $$.bind($('#submit'), 'click', function (e) {
    if ($('#input').value != '') {
      hint('code submitted...', 0x0f0);
      socket.emit('submit', $('#input').value);
    } else {
      hint('no code to submit...', 0xf00);
    }
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

})();