const multer = require("multer");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/**
 * MODEL MOCKUP:
 * *************
 */
const model = {
  /**
   * PRIVATE DATA / METHODS:
   * ***********************
   */
  __data: [],
  __dataIndex: {},
  __getID: (() => {
    let i = 0;
    return () => `${++i}`;
  })(),
  __refreshIndex() {
    model.__dataIndex = model.__data.reduce((index, row) => {
      index[row.id] = row;
      return index;
    }, {});
  },

  /**
   * PUBLIC METHODS:
   * ***************
   */
  readData(id) {
    if (!arguments.length) {
      return model.__data;
    }

    if (typeof id !== "string") {
      throw new Error("Wrong type for model#readData argument");
    } else {
      return model.__dataIndex[id];
    }
  },
  updateData(row) {
    if (!row || typeof row !== "object") {
      throw new Error("[0] Wrong type for model#updateData argument");
    }
    if (typeof row.id !== "string") {
      throw new Error("[1] Row's ID must be a string");
    }
    if (typeof row.data !== "string") {
      throw new Error("[2] Row's data must be a string");
    }
    if (!model.__dataIndex[row.id]) {
      throw new Error(`[3] Row "${row.id}" does not exist yet`);
    }

    model.__dataIndex[row.id].data = row.data;
    return model.__dataIndex[row.id];
  },
  createData(data) {
    if (typeof data !== "string") {
      throw new Error("Data must be a string");
    }

    const row = { data, id: model.__getID() };
    model.__data.push(row);
    model.__refreshIndex();

    return row;
  },
  deleteData(id) {
    if (typeof id !== "string") {
      throw new Error("Wrong type for model#deleteData argument");
    }

    if (model.__dataIndex[id]) {
      model.__data = model.__data.filter(row => row.id !== id);
      model.__refreshIndex();
      return true;
    }

    return false;
  }
};

/**
 * CONTROLLER MOCKUP:
 * ******************
 */
const controller = {
  getAll(req, res) {
    return res.send(model.readData());
  },
  getRow(req, res) {
    let result;

    try {
      result = model.readData(req.params.id);
    } catch (e) {
      res.status(400).send("Bad request");
    }

    if (result) {
      res.send({ result });
    } else {
      res.send({ result: null });
    }
  },
  postRow(req, res) {
    let result;
    const row = {
      id: req.params.id,
      data: req.body.data
    };

    try {
      result = model.updateData(row);
      res.send({ result });
    } catch (e) {
      if (e.message.match(/^[3]/)) {
        res.status(404).send("Data not found");
      } else {
        res.status(400).send("Bad request");
      }
    }
  },
  putRow(req, res) {
    let result;
    const data = req.body.data;

    try {
      result = model.createData(data);
    } catch (e) {
      res.status(400).send("lol");
    }

    res.send({ result });
  },
  deleteRow(req, res) {
    let result;
    const id = req.params.id;

    try {
      result = model.deleteData(id);
    } catch (e) {
      res.status(400).send("Bad request");
    }

    if (result) {
      res.send({ ok: 1 });
    } else {
      res.status(404).send("Data not found");
    }
  },
  putFile(req, res) {
    let result;
    const upload = multer({ storage: multer.memoryStorage() }).single("file");

    upload(req, res, () => {
      try {
        result = {
          fileContent: req.file.buffer.toString(),
          comment: req.body.comment
        };
      } catch (e) {
        res.status(400).send("lol");
      }

      res.send({ result });
    });
  }
};

/**
 * INITIALIZE THE DATABASE:
 * ************************
 */
model.createData("abcde");
model.createData("toBeDeleted");

/**
 * MIDDLEWARES:
 * ************
 */
app.use(bodyParser.json());

/**
 * ROUTES:
 * *******
 */
app.get("/data/", controller.getAll);
app.get("/data/:id", controller.getRow);
app.post("/data/:id", controller.postRow);
app.put("/data/", controller.putRow);
app.delete("/data/:id", controller.deleteRow);
app.put("/data/file", controller.putFile);

// Ad-hoc route:
app.get("/adhoc/", (req, res) =>
  res.status(req.query.status || 200).send(req.query.data)
);

// Static files:
app.use("/front", express.static(__dirname));

process.title = "djaxTestServer";
process.stdin.resume();
process.on("SIGTERM", () => process.exit());

app.listen(8001);
