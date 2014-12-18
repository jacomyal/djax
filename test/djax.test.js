var assert = require('assert');

describe('Polymorphism (' + ajaxName + ')', function() {
  it('should work as ajax({ url, success, error })', function(done) {
    var res = ajax({
      url: '/data/1',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'abcde', id: '1' });
        assert.equal(textStatus, 'success');
        assert.equal(xhr, res);
        assert.equal(arguments.length, 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work as ajax(url).then(success, error)', function(done) {
    var res = ajax('/data/1');
    res.then(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert.equal(textStatus, 'success');
          assert.equal(xhr, res);
          assert.equal(arguments.length, 3);
          done();
        },
        function() {
          throw new Error('Unexpected error.');
        });
  });

  it('should work as ajax(url).done(success).fail(error)', function(done) {
    var res = ajax('/data/1')
      .done(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert.equal(textStatus, 'success');
          assert.equal(xhr, res);
          assert.equal(arguments.length, 3);
          done();
        })
      .fail(
        function() {
          throw new Error('Unexpected error.');
        });
  });

  it('should work as ajax(url).fail(error).done(success)', function(done) {
    var res = ajax('/data/1')
      .fail(
        function() {
          throw new Error('Unexpected error.');
        })
      .done(
        function(data, textStatus, xhr) {
          assert.deepEqual(data.result, { data: 'abcde', id: '1' });
          assert.equal(textStatus, 'success');
          assert.equal(xhr, res);
          assert.equal(arguments.length, 3);
          done();
        });
  });

  it('should work with res.done called after success', function(done) {
    var res = ajax('/data/1')
      .fail(
        function() {
          throw new Error('Unexpected error.');
        })
      .done(
        function() {
          res.done(function(data, textStatus, xhr) {
            assert.deepEqual(data.result, { data: 'abcde', id: '1' });
            assert.equal(textStatus, 'success');
            assert.equal(xhr, res);
            assert.equal(arguments.length, 3);
            done();
          });
        });
  });
});

describe('HTTP verbs (' + ajaxName + ')', function() {
  it('should work with GET calls', function(done) {
    var res = ajax({
      url: '/data/1',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'abcde', id: '1' });
        assert.equal(textStatus, 'success');
        assert.equal(xhr, res);
        assert.equal(arguments.length, 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with POST calls', function(done) {
    var res = ajax({
      url: '/data/1',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        data: 'DEFGH'
      }),
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'DEFGH', id: '1' });
        assert.equal(textStatus, 'success');
        assert.equal(xhr, res);
        assert.equal(arguments.length, 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with PUT calls', function(done) {
    var res = ajax({
      url: '/data/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        data: 'First entry'
      }),
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data.result, { data: 'First entry', id: '3' });
        assert.equal(textStatus, 'success');
        assert.equal(xhr, res);
        assert.equal(arguments.length, 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should work with DELETE calls', function(done) {
    var res = ajax({
      url: '/data/2',
      type: 'DELETE',
      success: function(data, textStatus, xhr) {
        assert.deepEqual(data, { ok: true });
        assert.equal(textStatus, 'success');
        assert.equal(xhr, res);
        assert.equal(arguments.length, 3);
        done();
      },
      error: function() {
        throw new Error('Unexpected error.');
      }
    });
  });

  it('should trigger the error callback when status is 404', function(done) {
    var res = ajax({
      url: '/data/inexisting_id',
      type: 'POST',
      success: function(data, textStatus, xhr) {
        throw new Error('Unexpected success.');
      },
      error: function(xhr, textStatus, errorThrown) {
        assert.deepEqual(xhr, res);
        assert.equal(textStatus, 'error');
        // TODO
        // Find why jQuery receives here "Bad Request" while djax receives "Bad request"...
        // assert.equal(errorThrown, 'Bad request');
        assert.equal(errorThrown.toLowerCase(), 'bad request');
        assert.equal(arguments.length, 3);
        done();
      }
    });
  });
});
