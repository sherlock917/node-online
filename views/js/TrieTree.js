var TrieTree = (function () {
  var __TrieTree = {}

  function __grow (str) {
    var strArr = str.split('')
    var node = __TrieTree
    for (var i = 0; i < strArr.length; i++) {
      if (!node[strArr[i]]) {
        node[strArr[i]] = {}
        if (node.size) {
          node.size++
        } else {
          node.size = 1
        }
      }
      node = node[strArr[i]]
      if (i == strArr.length - 1) {
        node.end = true
      }
    }
  }

  function __search (query) {
    var components = query.split('')
    var target = '__TrieTree'
    for (var i = 0; i < components.length; i++) {
      target += '["' + components[i] + '"]'
      if (!eval(target)) {
        return []
      }
    }
    return __searchInner(eval(target))
  }

  function __searchInner (root) {
    var result = []
    for (var i in root) {
      if (typeof(root[i]) == 'object') {
        var current = '' + i
        if (!root[i].end) {
          var r = '' + __searchInner(root[i])
          var p = r.split(',')
          var prefix = current
          for (var j = 0; j < p.length; j++) {
            if (j > 0) {
              current += prefix + p[j]
            } else {
              current += p[j]
            }
            if (j < p.length - 1) {
              current += ','
            }
          }
        } else if (root[i].size > 0) {
          var r = '' + __searchInner(root[i])
          current += ',' + i + r.replace(/,/g, ',' + i)
        }
        result = result.concat(current.split(','))
      }
    }
    return result
  }

  return {
    intance : __TrieTree,
    grow : __grow,
    search : __search
  }
})()