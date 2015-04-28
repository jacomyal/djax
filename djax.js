(function(undefined) {
  'use strict';

  // Declare the ajax function:
  function ajax(opt, fn) {
    if (!ajax.xhr)
      throw new Error(
        'XMLHttpRequest not found. You can specify which XMLHttpRequest ' +
        'you want to use by using `ajax.xhr = myXHR`.'
      );

    // Callbacks:
    var successes = [],
        errors = [],
        beforeSend = [];

    // Check for given callbacks:
    if (typeof opt === 'string') {
      opt = { url: opt };

      if (arguments.length === 2) {
        if (typeof fn === 'function')
          successes.push(fn);
        else if (Array.isArray(fn))
          successes = successes.concat(fn);
      }
    } else if (typeof opt !== 'object' || !opt)
      throw new Error('Wrong arguments');

    if (typeof opt.success === 'function')
      successes.push(opt.success);
    else if (Array.isArray(opt.success))
      successes = successes.concat(opt.success);

    if (typeof opt.error === 'function')
      errors.push(opt.error);
    else if (Array.isArray(opt.error))
      errors = errors.concat(opt.error);

    // Other parameters:
    var key,
        data,
        timer,
        conclude,
        textStatus,
        done = false,
        url = opt.url,
        xhr = new ajax.xhr(),
        type = opt.type || 'GET',
        dataType = opt.dataType || 'json',
        contentType = opt.contentType || 'application/x-www-form-urlencoded';

    if (!url || typeof url !== 'string')
      throw new Error('Wrong arguments');

    if (opt.data) {
      if (typeof opt.data === 'string')
        data = opt.data;
      else if (/json/.test(contentType))
        data = JSON.stringify(opt.data);
      else {
        data = [];
        for (key in opt.data)
          data.push(
            encodeURIComponent(key) + '=' + encodeURIComponent(opt.data[key])
          );
        data = data.join('&');
      }

      if (/GET|DELETE/i.test(type)) {
        url += /\?/.test(url) ?
          '&' + data :
          '?' + data;
        data = '';
      }
    }

    xhr.onreadystatechange = function() {
      if (+xhr.readyState === 4) {
        done = true;

        if (timer)
          clearTimeout(timer);

        if (/^2/.test(xhr.status)) {
          done = true;
          textStatus = 'success';
          data = xhr.responseText;

          if (/json/.test(dataType)) {
            try {
              data = data ? JSON.parse(data) : '';
            } catch (e) {
              conclude = function(successes, errors) {
                errors.forEach(function(fn) {
                  fn(xhr, textStatus = 'parsererror');
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

          conclude = function(successes, errors) {
            successes.forEach(function(fn) {
              fn(data, textStatus, xhr);
            });
          };
          conclude(successes);

        } else {
          conclude = function(successes, errors) {
            errors.forEach(function(fn) {
              fn(
                xhr,
                +xhr.status ? 'error' : 'abort',
                xhr.responseText
              );
            });
          };
          conclude(null, errors);
        }
      }
    };

    // Check xhrFields
    if (opt.xhrFields && typeof opt.xhrFields === 'object')
      for (key in opt.xhrFields)
        xhr[key] = opt.xhrFields[key];

    xhr.open(type, url, true);
    xhr.setRequestHeader('Content-Type', contentType);

    // Check custom headers:
    if (opt.headers)
      for (key in opt.headers)
        xhr.setRequestHeader(key, opt.headers[key]);

    // Check the "beforeSend" callback:
    if (
      typeof opt.beforeSend === 'function' &&
      opt.beforeSend(xhr, opt) === false
    ) {
      done = true;
      conclude = function(successes, errors) {
        errors.forEach(function(fn) {
          fn(
            xhr,
            'abort',
            xhr.responseText
          );
        });
      };
      conclude(null, errors);
      return xhr.abort();
    }

    // Check "timeout":
    if (opt.timeout)
      timer = setTimeout(function() {
        done = true;
        xhr.onreadystatechange = function() {};
        xhr.abort();
        conclude = function(successes, errors) {
          errors.forEach(function(fn) {
            fn(xhr, 'timeout');
          });
        };
        conclude(null, errors);
      }, opt.timeout);

    // Send the AJAX call:
    xhr.send(data);

    // Promise:
    xhr.done = function(callback) {
      if (typeof callback === 'function')
        successes.push(callback);
      else if (Array.isArray(callback))
        successes = successes.concat(callback);
      else
        throw new Error('Wrong arguments.');

      // If the call has already been received:
      if (done) {
        if (typeof callback === 'function')
          conclude([callback]);
        else if (Array.isArray(callback))
          conclude(callback);
      }

      return this;
    };
    xhr.fail = function(callback) {
      if (typeof callback === 'function')
        errors.push(callback);
      else if (Array.isArray(callback))
        errors = errors.concat(callback);
      else
        throw new Error('Wrong arguments.');

      // If the call has already been received:
      if (done) {
        if (typeof callback === 'function')
          conclude(null, [callback]);
        else if (Array.isArray(callback))
          conclude(null, callback);
      }

      return this;
    };
    xhr.then = function(success, error) {
      if (success)
        this.done(success);
      if (error)
        this.fail(error);

      // If the call has already been received:
      if (done)
        conclude(
          Array.isArray(success) ?
            success :
            typeof success === 'function' ?
              [success] : null,
          Array.isArray(error) ?
            error :
            typeof error === 'function' ?
              [error] : null
        );

      return this;
    };

    return xhr;
  }

  // Djax version:
  ajax.version = '1.0.2';

  // Check XMLHttpRequest presence:
  if (typeof XMLHttpRequest !== 'undefined')
    ajax.xhr = XMLHttpRequest;

  // Export the AJAX method:
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = ajax;
    exports.ajax = ajax;
  } else if (typeof define === 'function' && define.amd)
    define('djax', [], function() {
      return ajax;
    });
  else
    this.ajax = ajax;
}).call(this);
