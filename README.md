# Djax - a lightweight jQuery.ajax subset
**version: 1.0.1**

## Description

**Djax** is a subset of jQuery.ajax, with the most used features supported. It has initially been developed as domino-ajax, for dealing with REST APIs in domino.js, a JavaScript cascading controller for rich internet applications.

If you are using jQuery, it is recommanded to use jQuery.ajax instead, which supports more features, and is probably better tested.

Here are the supported options:
 - **url**: A string containing the URL to which the request is sent.
 - **type**: The HTTP verb used.
 - **dataType**: The type of data that you're expecting back from the server.
 - **contentType**: The type of request to make, default is "GET"
 - **data**: Data to be sent to the server.
 - **error**: A function to be called if the request fails.
 - **success**: A function to be called if the request succeeds.
 - **headers**: An object of additional header key/value pairs to send along with requests using the XMLHttpRequest transport.
 - **beforeSend**: A pre-request callback function that can be used to modify the XHR object before it is sent.
 - **timeout**: Set a timeout (in milliseconds) for the request.

The ajax function returns an object with the following attributes, to deal with promises:
  - **xhr**: A reference to the XHR.
  - **done**: An alternative construct to the success callback option.
  - **fail**: An alternative construct to the error callback option.
  - **then**: Incorporates the functionality of the #done and #fail methods.

I invite you to read [djax's code](./djax.js) or [jQuery.ajax documentation](http://api.jquery.com/jquery.ajax/) to know more about how this function works. To see examples, you can check the unit tests in [test/unit.js](./test/unit.js).

Finally, if you see common features that are missing or that are not implemented exactly as in jQuery 2.x, please report them on the related [Github issues page](https://github.com/jacomyal/djax/issues).

## Install

First, you can install djax from NPM: `npm install --save djax`, or directly save locally the [`djax.min.js`](./djax.min.js) minified file.

Also, you can install the development version:
 1. Clone the repository: `git clone http://github.com/jacomyal/djax`
 2. Install dependencies: `npm install`
 3. Check the unit tests: `npm test`
 4. Get a minified version (`./djax.min.js`): `npm build`
