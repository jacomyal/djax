function ajax(opt, fn) {
  if (!ajax.XHR) {
    throw new Error(
      'XMLHttpRequest not found. You can specify which XMLHttpRequest ' +
      'you want to use by using `ajax.xhr = myXHR`.'
    );
  }

  // Callbacks:
  let errors = [];
  let successes = [];

  // Check for given callbacks:
  if (typeof opt === 'string') {
    opt = { url: opt };

    if (opt && fn) {
      if (typeof fn === 'function') successes.push(fn);
      else if (Array.isArray(fn)) successes = successes.concat(fn);
    }
  } else if (typeof opt !== 'object' || !opt) {
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
  let key;
  let data;
  let timer;
  let conclude;
  let textStatus;
  let done = false;
  let url = opt.url;
  const xhr = new ajax.XHR();
  const type = opt.method || opt.type || 'GET';
  const dataType = opt.dataType || 'json';
  const contentType = opt.contentType || (
    opt.contentType === false && opt.processData === false ?
      false :
      'application/x-www-form-urlencoded'
  );

  if (!url || typeof url !== 'string') {
    throw new Error('Wrong arguments');
  }

  if (opt.data) {
    if (typeof opt.data === 'string' || !contentType) {
      data = opt.data;
    } else if (/json/.test(contentType)) {
      data = JSON.stringify(opt.data);
    } else {
      data = [];
      for (key in opt.data) {
        if ({}.hasOwnProperty.call(opt.data, key)) {
          data.push(
            encodeURIComponent(key) + '=' + encodeURIComponent(opt.data[key])
          );
        }
      }
      data = data.join('&');
    }

    if (/GET|DELETE/i.test(type)) {
      url += /\?/.test(url) ?
        '&' + data :
        '?' + data;
      data = '';
    }
  }

  xhr.onreadystatechange = () => {
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
            conclude = (_, errs) => (
              errs.forEach(fnc => fnc(xhr, textStatus = 'parsererror'))
            );
            conclude(null, errors);
            return;
          }
        }

        // Specific 204 HTTP status case:
        if (+xhr.status === 204) {
          textStatus = 'nocontent';
          data = undefined;
        }

        conclude = succ => succ.forEach(fnc => fnc(data, textStatus, xhr));
        conclude(successes);
      } else {
        conclude = (_, errs) => (
          errs.forEach(fnc => (
            fnc(
              xhr,
              +xhr.status ? 'error' : 'abort',
              xhr.responseText
            )
          ))
        );
        conclude(null, errors);
      }
    }
  };

  // Check xhrFields
  if (opt.xhrFields && typeof opt.xhrFields === 'object') {
    for (key in opt.xhrFields) {
      if ({}.hasOwnProperty.call(opt.xhrFields, key)) {
        xhr[key] = opt.xhrFields[key];
      }
    }
  }

  xhr.open(type, url, true);

  if (contentType) {
    xhr.setRequestHeader('Content-Type', contentType);
  }

  // Check custom headers:
  if (opt.headers) {
    for (key in opt.headers) {
      if ({}.hasOwnProperty.call(opt.headers, key)) {
        xhr.setRequestHeader(key, opt.headers[key]);
      }
    }
  }

  // Check the "beforeSend" callback:
  if (
    typeof opt.beforeSend === 'function' &&
    opt.beforeSend(xhr, opt) === false
  ) {
    done = true;
    conclude = (_, errs) => (
      errs.forEach(fnc => (
        fnc(
          xhr,
          'abort',
          xhr.responseText
        )
      ))
    );
    conclude(null, errors);
    return xhr.abort();
  }

  // Check "timeout":
  if (opt.timeout) {
    timer = setTimeout(
      () => {
        done = true;
        xhr.onreadystatechange = () => {};
        xhr.abort();
        conclude = (_, errs) => (
          errs.forEach(fnc => fnc(xhr, 'timeout'))
        );
        conclude(null, errors);
      },
      opt.timeout
    );
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
        success = typeof success === 'function' ?
          [success] : null;
      }
      if (!Array.isArray(error)) {
        error = typeof error === 'function' ?
          [error] : null;
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

export default ajax;
