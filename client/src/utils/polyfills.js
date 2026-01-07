// Polyfills para compatibilidad con navegadores antiguos

// Polyfill para Promise (si es necesario)
if (typeof Promise === 'undefined') {
  console.warn('Promise no está disponible, cargando polyfill...');
  // En este caso, el navegador es demasiado antiguo, pero lo manejamos
}

// Polyfill para Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Polyfill para Array.includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var o = Object(this);
    var len = parseInt(o.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(fromIndex) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }
    function sameValueZero(x, y) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    for (; k < len; k++) {
      if (sameValueZero(o[k], searchElement)) {
        return true;
      }
    }
    return false;
  };
}

// Polyfill para String.includes
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill para fetch (usando XMLHttpRequest como fallback)
if (typeof fetch === 'undefined') {
  window.fetch = function(url, options) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var method = (options && options.method) || 'GET';
      xhr.open(method, url);
      
      if (options && options.headers) {
        Object.keys(options.headers).forEach(function(key) {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }
      
      xhr.onload = function() {
        var response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          json: function() {
            return Promise.resolve(JSON.parse(xhr.responseText));
          },
          text: function() {
            return Promise.resolve(xhr.responseText);
          }
        };
        resolve(response);
      };
      
      xhr.onerror = function() {
        reject(new Error('Network request failed'));
      };
      
      var body = options && options.body;
      xhr.send(body);
    });
  };
}

console.log('✅ Polyfills cargados para compatibilidad');


