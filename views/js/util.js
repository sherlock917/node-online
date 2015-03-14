// Utils
function $ (selector) {
  var elems = document.querySelectorAll(selector);
  return (elems.length > 1) ? elems : elems[0];
}

var $$ = (function () {

  function init (dom) {
    var _dom = [];
    if (dom instanceof HTMLElement) {
      _dom.push(dom);
    } else {
      _dom = dom;
    }
    return _dom;
  }

  return {
    bind : function (dom, event, handler) {
      var _dom = init(dom);
      for (var i = 0; i < _dom.length; i++) {
        _dom[i].addEventListener(event, function (e) {
          e.preventDefault();
          handler(e);
        }, false);
      }
    }, 
    asign : function (obj, type, single, multiple) {
      if (obj instanceof type) {
        single(obj);
      } else {
        for (o in obj) {
          if (obj[o] instanceof type) {
            multiple(obj[o]);
          }
        }
      }
    }
  }

})();

// dom manipulation
Object.prototype.show = function (param) {
  $$.asign(this, HTMLElement, function (obj) {
    obj.style.display = (param) ? param : 'block';
  }, function (obj) {
    obj.show(param);
  });
}

Object.prototype.hide = function () {
  $$.asign(this, HTMLElement, function (obj) {
    obj.style.display = 'none';
  }, function (obj) {
    obj.hide();
  });
}

Object.prototype.css = function (param) {
  $$.asign(this, HTMLElement, function (obj) {
    for (p in param) {
      obj.style[p] = param[p];
    }
  }, function (obj) {
    obj.css(param);
  });
}

Object.prototype.addClass = function (classNames) {
  $$.asign(this, HTMLElement, function (obj) {
    obj.className += ' ' + classNames;
  }, function (obj) {
    obj.addClass(classNames);
  });
}

Object.prototype.removeClass = function (classNames) {
  $$.asign(this, HTMLElement, function (obj) {
    classNames = classNames.split(' ');
    for (var i = 0; i < classNames.length; i++) {
      obj.className = obj.className.replace(classNames[i], '');
    }
    if (obj.className.substr(0, 1) == ' ') {
      obj.className = obj.className.substr(1);
    }
    if (obj.className.substr(-1) == ' ') {
      obj.className = obj.className.substr(0, obj.className.length - 1);
    }
  }, function (obj) {
    obj.removeClass(classNames);
  });
}

Object.prototype.hasClass = function (classNames) {
  var result = true;
  var count = 0;
  $$.asign(this, HTMLElement, function (obj) {
    obj.className += ' ';
    classNames = classNames.split(' ');
    for (var i = 0; i < classNames.length; i++) {
      if (!obj.className.match(classNames[i] + ' ')) {
        obj.className = obj.className.substring(0, obj.className.length - 1);
        result = false;
      }
    }
    obj.className = obj.className.substring(0, obj.className.length - 1);
  }, function (obj) {
    if (!obj.hasClass(classNames)) {
      count++;
    }
  });
  if (count) {
    return false;
  } else {
    return result;
  }
}

Object.prototype.find = function (selector) {
  var result = [];
  $$.asign(this, HTMLElement, function (obj) {
    result = result.concat(obj.querySelectorAll(selector))[0];
  }, function (obj) {
    var tmp = obj.find(selector);
    for (var i = 0; i < tmp.length; i++) {
      result.push(tmp[i]);
    }
  });
  return result;
}

// String Extension
String.prototype.getLengthOfBytes = function () {
  var chinese = this.match(/[^\x00-\xff]/ig);
  return this.length + (chinese == null ? 0 : chinese.length);
}