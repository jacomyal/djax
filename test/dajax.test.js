var assert = require('assert'),
    ajax = require('../dajax.js');

describe('Polymorphism', function() {
  it('should work as ajax({ url, success, error })', function(done) {
    ajax({
      url: '/data/1',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'abcde', id: '1' });
        assert(textStatus === 'ok');
        assert(xhr instanceof ajax.xhr);
        assert(arguments.length === 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work as ajax(url).then(success, error)', function(done) {
    ajax('/data/1')
      .then(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert(textStatus === 'ok');
          assert(xhr instanceof ajax.xhr);
          assert(arguments.length === 3);
          done();
        },
        function() {
          throw new Error('Unexpected error.');
        });
  });

  it('should work as ajax(url).done(success).fail(error)', function(done) {
    ajax('/data/1')
      .done(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert(textStatus === 'ok');
          assert(xhr instanceof ajax.xhr);
          assert(arguments.length === 3);
          done();
        })
      .fail(
        function() {
          throw new Error('Unexpected error.');
        });
  });

  it('should work as ajax(url).fail(error).done(success)', function(done) {
    ajax('/data/1')
      .fail(
        function() {
          throw new Error('Unexpected error.');
        })
      .done(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert(textStatus === 'ok');
          assert(xhr instanceof ajax.xhr);
          assert(arguments.length === 3);
          done();
        });
  });
});

describe('HTTP verbs', function() {
  it('should work with GET calls', function(done) {
    ajax({
      url: '/data/1',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'abcde', id: '1' });
        assert(textStatus === 'ok');
        assert(xhr instanceof ajax.xhr);
        assert(arguments.length === 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with POST calls', function(done) {
    ajax({
      url: '/data/1',
      type: 'POST',
      contentType: 'application/json',
      data: {
        data: 'DEFGH'
      },
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'DEFGH', id: '1' });
        assert(textStatus === 'ok');
        assert(xhr instanceof ajax.xhr);
        assert(arguments.length === 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with PUT calls', function(done) {
    ajax({
      url: '/data/',
      type: 'PUT',
      contentType: 'application/json',
      data: {
        data: 'First entry'
      },
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'First entry', id: '3' });
        assert(textStatus === 'ok');
        assert(xhr instanceof ajax.xhr);
        assert(arguments.length === 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with DELETE calls', function(done) {
    ajax({
      url: '/data/2',
      type: 'DELETE',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data, { ok: true });
        assert(textStatus === 'ok');
        assert(xhr instanceof ajax.xhr);
        assert(arguments.length === 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should trigger the error callback when status is 404', function(done) {
    ajax({
      url: '/data/inexisting_id',
      type: 'POST',
      success: function(data, textStatus, xhr) {
        throw new Error('Unexpected success.');
      },
      error: function(xhr, textStatus, errorThrown) {
        assert(xhr instanceof ajax.xhr);
        assert(textStatus === 'error');
        assert(errorThrown === 'Bad request');
        assert(arguments.length === 3);
        done();
      }
    });
  });
});
