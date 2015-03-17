(function () {

  // functino to load
  initSocket();
  initDom();
  initAutofill();

  // global variables
  var socket,
      pid,
      tab = 0,
      shift = false,
      newLine = false,
      candidates = [],
      autofilling = false,
      autofillIndex = 0;

  // inits socket, binds event to handlers
  function initSocket() {
    socket = io(location.host);
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
    socket.on('pid', function (data) {
      pid = data;
    });
    socket.on('close', function (data) {
      $('#log').innerHTML += '<br><p>** exit with code ' + data + ' **</p><br>'; 
      $('#log').scrollTop = 999999999;
      hint('done running code', 0x0f0);
      pid = null;
    });
    socket.on('online', function (data) {
      $('#online').innerHTML = data;
    });
    socket.on('running', function (data) {
      $('#running').innerHTML = data;
    });
  }
  
  // bind dom events
  function initDom () {
    $$.bind($('#run'), 'click', function (e) {
      if ($('#input').value != '') {
        $('#log').innerHTML = '';
        hint('code submitted', 0x0f0);
        socket.emit('run', $('#input').value);
      } else {
        hint('no code to submit', 0xf00);
      }
    });
    $$.bind($('#halt'), 'click', function (e) {
      if (pid) {
        socket.emit('halt', pid);
      } else {
        hint('no code running', 0xf00);
      }
    });
    $$.bind($('#input'), 'keyup', function (e) {
      if ($('#input').value == '') {
        tab = 0;
      }
      if (e.keyCode == 13) {
        newLine = true;
        appendTab();
      } else if (e.keyCode == 16) {
        shift = true;
      } else if (e.keyCode == 221 && shift && tab > 0 && newLine) {
        newLine = false;
        shift = false;
        removeTab();
      } else if (e.keyCode == 9) {
        if (autofilling) {
          switchAutoFill();
        } else {
          autofill();
        }
      } else if (e.keyCode == 32) {
        expandAutoFill();
      } else {
        newLine = false;
        autofilling = false;
        candidates = [];
      }
    });
    $('#input').onkeydown = function (e) {
      if (e.keyCode == 9) {
        e.preventDefault();
      }
    }
  }

  // loads all javascript key works to TrieTree
  function initAutofill () {
    var keys = [
      'break',
      'do',
      'instanceof',
      'typeof',
      'case',
      'else',
      'new',
      'var',
      'catch',
      'finally',
      'return',
      'void',
      'continue',
      'for',
      'switch',
      'while',
      'debugger',
      'function',
      'this',
      'with',
      'default',
      'if',
      'throw',
      'delete',
      'in',
      'try'
    ];
    for (var i = 0; i < keys.length; i++) {
      TrieTree.grow(keys[i]);
    }
  }

  function autofill () {
    var query = $('#input').value.replace(/\n/g, ' ').split(' ').pop();
    candidates = TrieTree.search(query);
    applyAutoFill();
  }

  function applyAutoFill () {
    if (candidates.length > 0) {
      $('#input').value += candidates[0]
    }
    autofilling = true;
  }

  function switchAutoFill () {
    if (candidates && candidates.length > 0) {
      $('#input').value = $('#input').value.substring(0, $('#input').value.length - candidates[autofillIndex].length);
      if (autofillIndex + 1 < candidates.length) {
        autofillIndex++;
      } else {
        autofillIndex = 0;
      }
      $('#input').value += candidates[autofillIndex];
    }
  }

  function expandAutoFill () {
    var all = $('#input').value.split(' ');
    var last = all[all.length - 2];
    if (last.length > 1 && last.match(/^([a-zA-z_]{1})([\w]*)$/)) {
      TrieTree.grow(last);
    }
  }

  function appendTab () {
    var latest = $('#input').value.substr(-5).split('');
    if (latest[latest.length - 2] == '{') {
      tab += 2;
    }
    for (var i = 0; i < tab; i++) {
      $('#input').value += ' ';
    }
  }

  function removeTab () {
    tab -= 2;
    $('#input').value = $('#input').value.substring(0, $('#input').value.length - 3) + '}';
  }

  function hint (text, type) {
    var punctuate = '';
    switch (type) {
      case 0xf00:
        if (!$('#hint').hasClass('hint-error')) {
          $('#hint').addClass('hint-error');
          $('#hint').removeClass('hint-success');
          $('#hint').removeClass('hint-processing');
          punctuate = '!';
        }
        break;
      case 0x0f0:
        if (!$('#hint').hasClass('hint-success')) {
          $('#hint').addClass('hint-success');
          $('#hint').removeClass('hint-error');
          $('#hint').removeClass('hint-processing');
          punctuate = '~';
        }
        break;
      case 0x00f:
        if (!$('#hint').hasClass('hint-processing')) {
          $('#hint').addClass('hint-processing');
          $('#hint').removeClass('hint-success');
          $('#hint').removeClass('hint-error');
          punctuate = '...';
        }
        break;
      default :
        break;
    }
    $('#hint').innerHTML = text + punctuate;
  }

  function decode (data, error) {
    var dataView = new DataView(data);
    var decoder = new TextDecoder('utf-8');
    var decodedString = decoder.decode(dataView);
    show(decodedString, error);
  }

  function show (data, error) {
    if (error) {
      $('#log').innerHTML += '<div class="error">' + data.replace(/\n/g, '<br>') + '</div>';
    } else {
      $('#log').innerHTML += '<div>' + data + '</div>';
    }
    $('#log').scrollTop = 999999999;
  }

})();