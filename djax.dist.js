'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function ajax(opt, fn) {
  if (!ajax.XHR) {
    throw new Error('XMLHttpRequest not found. You can specify which XMLHttpRequest ' + 'you want to use by using `ajax.xhr = myXHR`.');
  }

  // Callbacks:
  var errors = [];
  var successes = [];

  // Check for given callbacks:
  if (typeof opt === 'string') {
    opt = { url: opt };

    if (opt && fn) {
      if (typeof fn === 'function') successes.push(fn);else if (Array.isArray(fn)) successes = successes.concat(fn);
    }
  } else if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) !== 'object' || !opt) {
    throw new Error('Wrong arguments');
  }

  if (typeof opt.success === 'function') {
    successes.push(opt.success);
  } else if (Array.isArray(opt.success)) {
    successes = successes.concat(opt.success);
  }

  if (typeof opt.error === 'function') {
    errors.push(opt.error);
  } else if (Array.isArray(opt.error)) {
    errors = errors.concat(opt.error);
  }

  // Other parameters:
  var key = void 0;
  var data = void 0;
  var timer = void 0;
  var conclude = void 0;
  var textStatus = void 0;
  var done = false;
  var url = opt.url;
  var xhr = new ajax.XHR();
  var type = opt.method || opt.type || 'GET';
  var dataType = opt.dataType || 'json';
  var contentType = opt.contentType || 'application/x-www-form-urlencoded';

  if (!url || typeof url !== 'string') {
    throw new Error('Wrong arguments');
  }

  if (opt.data) {
    if (typeof opt.data === 'string') {
      data = opt.data;
    } else if (/json/.test(contentType)) {
      data = JSON.stringify(opt.data);
    } else {
      data = [];
      for (key in opt.data) {
        if ({}.hasOwnProperty.call(opt.data, key)) {
          data.push(encodeURIComponent(key) + '=' + encodeURIComponent(opt.data[key]));
        }
      }
      data = data.join('&');
    }

    if (/GET|DELETE/i.test(type)) {
      url += /\?/.test(url) ? '&' + data : '?' + data;
      data = '';
    }
  }

  xhr.onreadystatechange = function () {
    if (+xhr.readyState === 4) {
      done = true;

      if (timer) clearTimeout(timer);

      if (/^2/.test(xhr.status + '')) {
        done = true;
        textStatus = 'success';
        data = xhr.responseText;

        if (/json/.test(dataType)) {
          try {
            data = data ? JSON.parse(data) : '';
          } catch (e) {
            conclude = function conclude(_, errs) {
              return errs.forEach(function (fnc) {
                return fnc(xhr, textStatus = 'parsererror');
              });
            };
            conclude(null, errors);
            return;
          }
        }

        // Specific 204 HTTP status case:
        if (+xhr.status === 204) {
          textStatus = 'nocontent';
          data = undefined;
        }

        conclude = function conclude(succ) {
          return succ.forEach(function (fnc) {
            return fnc(data, textStatus, xhr);
          });
        };
        conclude(successes);
      } else {
        conclude = function conclude(_, errs) {
          return errs.forEach(function (fnc) {
            return fnc(xhr, +xhr.status ? 'error' : 'abort', xhr.responseText);
          });
        };
        conclude(null, errors);
      }
    }
  };

  // Check xhrFields
  if (opt.xhrFields && _typeof(opt.xhrFields) === 'object') {
    for (key in opt.xhrFields) {
      if ({}.hasOwnProperty.call(opt.xhrFields, key)) {
        xhr[key] = opt.xhrFields[key];
      }
    }
  }

  xhr.open(type, url, true);
  xhr.setRequestHeader('Content-Type', contentType);

  // Check custom headers:
  if (opt.headers) {
    for (key in opt.headers) {
      if ({}.hasOwnProperty.call(opt.headers, key)) {
        xhr.setRequestHeader(key, opt.headers[key]);
      }
    }
  }

  // Check the "beforeSend" callback:
  if (typeof opt.beforeSend === 'function' && opt.beforeSend(xhr, opt) === false) {
    done = true;
    conclude = function conclude(_, errs) {
      return errs.forEach(function (fnc) {
        return fnc(xhr, 'abort', xhr.responseText);
      });
    };
    conclude(null, errors);
    return xhr.abort();
  }

  // Check "timeout":
  if (opt.timeout) {
    timer = setTimeout(function () {
      done = true;
      xhr.onreadystatechange = function () {};
      xhr.abort();
      conclude = function conclude(_, errs) {
        return errs.forEach(function (fnc) {
          return fnc(xhr, 'timeout');
        });
      };
      conclude(null, errors);
    }, opt.timeout);
  }

  // Send the AJAX call:
  xhr.send(data);

  // Promise:
  xhr.done = function xhrDone(callback) {
    if (typeof callback === 'function') {
      successes.push(callback);
    } else if (Array.isArray(callback)) {
      successes = successes.concat(callback);
    } else {
      throw new Error('Wrong arguments.');
    }

    // If the call has already been received:
    if (done) {
      if (typeof callback === 'function') {
        conclude([callback]);
      } else if (Array.isArray(callback)) {
        conclude(callback);
      }
    }

    return this;
  };
  xhr.fail = function xhrFail(callback) {
    if (typeof callback === 'function') {
      errors.push(callback);
    } else if (Array.isArray(callback)) {
      errors = errors.concat(callback);
    } else {
      throw new Error('Wrong arguments.');
    }

    // If the call has already been received:
    if (done) {
      if (typeof callback === 'function') {
        conclude(null, [callback]);
      } else if (Array.isArray(callback)) {
        conclude(null, callback);
      }
    }

    return this;
  };
  xhr.then = function xhrThen(success, error) {
    if (success) this.done(success);
    if (error) this.fail(error);

    // If the call has already been received:
    if (done) {
      if (!Array.isArray(success)) {
        success = typeof success === 'function' ? [success] : null;
      }
      if (!Array.isArray(error)) {
        error = typeof error === 'function' ? [error] : null;
      }
      conclude(success, error);
    }

    return this;
  };

  return xhr;
}

// Djax version:
ajax.version = '1.2.0';

// Check XMLHttpRequest presence:
if (typeof XMLHttpRequest !== 'undefined') {
  ajax.XHR = XMLHttpRequest;
}

exports.default = ajax;
module.exports = exports['default'];
