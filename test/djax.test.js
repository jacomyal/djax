import assert from "assert";

const baseUrl = "http://localhost:8001";

export default (ajax, ajaxSettings, ajaxName) => {
  describe(`Polymorphism (${ajaxName})`, () => {
    it("should work without any callback.", done => {
      ajax({ url: baseUrl + "/data/1" });

      setTimeout(done, 200);
    });

    it("should work as ajax().then(success)", done => {
      ajax({
        url: baseUrl + "/data/1",
        error: () => {
          throw new Error("Unexpected error.");
        }
      }).then((data, textStatus, ...rest) => {
        assert.deepEqual(data.result, { data: "abcde", id: "1" });
        assert.equal(textStatus, "success");
        // rest contains xhr, unused here
        assert.equal(rest.length, 1);
        done();
      });
    });

    it("should work as ajax({ url, success, error })", done => {
      const res = ajax({
        url: baseUrl + "/data/1",
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "abcde", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work as ajax(url).then(success, error)", done => {
      const res = ajax(baseUrl + "/data/1");
      res.then(
        (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "abcde", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        () => {
          throw new Error("Unexpected error.");
        }
      );
    });

    it("should work as ajax(url).done(success).fail(error)", done => {
      const res = ajax(baseUrl + "/data/1")
        .done((data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "abcde", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        })
        .fail(() => {
          throw new Error("Unexpected error.");
        });
    });

    it("should work as ajax(url).fail(error).done(success)", done => {
      const res = ajax(baseUrl + "/data/1")
        .fail(() => {
          throw new Error("Unexpected error.");
        })
        .done((data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "abcde", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        });
    });

    it("should work with res.done called after success", done => {
      const res = ajax(baseUrl + "/data/1")
        .fail(() => {
          throw new Error("Unexpected error.");
        })
        .done(() =>
          res.done((data, textStatus, xhr, ...rest) => {
            assert.deepEqual(data.result, { data: "abcde", id: "1" });
            assert.equal(textStatus, "success");
            assert.equal(xhr, res);
            assert.equal(rest.length, 0);
            done();
          })
        );
    });
  });

  describe(`HTTP verbs (${ajaxName})`, () => {
    it("should work with GET calls", done => {
      const res = ajax({
        url: baseUrl + "/data/1",
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "abcde", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with POST calls", done => {
      const res = ajax({
        url: baseUrl + "/data/1",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          data: "DEFGH"
        }),
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "DEFGH", id: "1" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with PUT calls", done => {
      const res = ajax({
        url: baseUrl + "/data/",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
          data: "First entry"
        }),
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data.result, { data: "First entry", id: "3" });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with DELETE calls", done => {
      const res = ajax({
        url: baseUrl + "/data/2",
        type: "DELETE",
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data, { ok: true });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should trigger the error callback when status is 400", done => {
      const res = ajax({
        url: baseUrl + "/data/inexisting_id",
        type: "POST",
        success: () => {
          throw new Error("Unexpected success.");
        },
        error: (xhr, textStatus, errorThrown, ...rest) => {
          assert.deepEqual(xhr, res);
          assert.equal(textStatus, "error");
          // TODO
          // Find why jQuery receives here "Bad Request" while djax
          // receives "Bad request"...
          // assert.equal(errorThrown, 'Bad request');
          assert.equal(errorThrown.toLowerCase(), "bad request");
          assert.equal(rest.length, 0);
          done();
        }
      });
    });

    it("should work with GET calls and empty data", done => {
      const res = ajax({
        url: baseUrl + "/adhoc/",
        success: (data, textStatus, xhr, ...rest) => {
          assert.equal(data, "");
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with GET calls and 204 HTTP status", done => {
      const res = ajax({
        url: baseUrl + "/adhoc/",
        data: { status: 204 },
        success: (data, textStatus, xhr, ...rest) => {
          assert.equal(data, undefined);
          assert.equal(textStatus, "nocontent");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });
  });

  describe(`Content types (${ajaxName})`, () => {
    it("should work with no content type", done => {
      const res = ajax({
        url: "/adhoc/",
        data: { data: "something" },
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(data, "something");
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with a FormData containing a file", done => {
      const form = new FormData();
      form.append("file", testfile, "testfile.json");

      const res = ajax({
        url: "/data/file",
        type: "PUT",
        data: form,
        processData: false,
        contentType: false,
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(JSON.parse(data.result.fileContent), { a: 2, b: 5 });
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });

    it("should work with params in a FormData", done => {
      const form = new FormData();
      form.append("file", testfile, "testfile.json");
      form.append("comment", "this is a test");

      const res = ajax({
        url: "/data/file",
        type: "PUT",
        data: form,
        processData: false,
        contentType: false,
        success: (data, textStatus, xhr, ...rest) => {
          assert.deepEqual(JSON.parse(data.result.fileContent), { a: 2, b: 5 });
          assert.equal(data.result.comment, "this is a test");
          assert.equal(textStatus, "success");
          assert.equal(xhr, res);
          assert.equal(rest.length, 0);
          done();
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });
  });

  describe(`Custom XHR (${ajaxName})`, () => {
    it("should make xhr available", done => {
      assert(ajaxSettings.xhr() instanceof XMLHttpRequest);
      done();
    });

    it("should accept a custom xhr", done => {
      let check = false;
      const res = ajax({
        url: "/adhoc/",
        data: { data: "something" },
        xhr() {
          const xhr = ajaxSettings.xhr();

          xhr.addEventListener(
            "load",
            () => {
              check = true;
            },
            false
          );

          return xhr;
        },
        success: (data, textStatus, xhr, ...rest) => {
          // Timeout to for load to be called before success in djax.
          // As it's a subset of jQuery.ajax, we don't aspire to respect
          // the spec at this level of details
          setTimeout(() => {
            assert(check);
            assert.deepEqual(data, "something");
            assert.equal(textStatus, "success");
            assert.equal(xhr, res);
            assert.equal(rest.length, 0);
            done();
          }, 0);
        },
        error: () => {
          throw new Error("Unexpected error.");
        }
      });
    });
  });
};
