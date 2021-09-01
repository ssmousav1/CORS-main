const fs = require("fs");
const path = require('path');
const { rawFiles } = require("../DB");
const eventEmitterBuilder = require("./globalEventEmitter");
const archiver = require('archiver');
const unzipper = require('unzipper');
const { GPSdata } = require("../api/WS");
const eventlib = new eventEmitterBuilder().getInstance();
const gpio = require("onoff").Gpio;

const button = new gpio(66, "in", 'falling')

let flag = true
let fileName = new Date(GPSdata.time).getTime() || Date.now()
// let fileName = Date.now();
let timeOut = 60 * 1000 * 60
let intervalId;

let writeStream


const saveRawData = (data) => {
  //	console.log(new Date(GPSdata.time).getTime())
  // TODO disable this condition if there is no storage data
  // if (GPSdata.deviceStatus.storage.percent < 90) {
  if (flag) {
    writeStream = fs.createWriteStream(`${fileName}.bin`);
    flag = false
  }
  writeStream.write(data)
  // }
}

const startInterval = (TimeOut) => {
  // console.log('1 >>> startInterval function');
  intervalId = setInterval(() => {
    // console.log('2 >>> interval itself');

    writeStream.destroy()
    flag = !flag

    zipRaw(`${fileName}.bin`);

    fileName = new Date(GPSdata.time).getTime() || Date.now()
    // fileName = Date.now();

    writeStream = fs.createWriteStream(`${fileName}.bin`);
  }, TimeOut);
}

startInterval(timeOut)



button.watch((err, value) => {
  if (err) {
    throw err;
  }
  console.log('....', value)
  writeStream.destroy()
  flag = !flag
  //    fileName = new Date(GPSdata.time).getTime() || Date.now()
  fileName = Date.now();
  writeStream = fs.createWriteStream(`${fileName}.bin`);
});



eventlib.on('rawDataTimeout', newTimeOut => {
  flag = false

  writeStream.destroy()
  zipRaw(`${fileName}.bin`)

  fileName = new Date(GPSdata.time).getTime() || Date.now()
  // fileName = Date.now()


  writeStream = fs.createWriteStream(`${fileName}.bin`);

  // stop previous interVal
  clearInterval(intervalId)

  // start a new interval with new time out
  startInterval(newTimeOut)
})

eventlib.on("zip:created", (params) => {
  save2DB(params.dest, params.size);
});


function zipRaw(pathBIN) {
  let archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });
  // <Buffer 68 65 6c 6c 6f 20 74 68 69 73 20 69 73 20 6d 65>
  let destFile = path.basename(pathBIN).split('.bin')[0] + '.zip';
  const output = fs.createWriteStream(`${destFile}`);

  // append a file
  archive.file(pathBIN, { name: pathBIN });
  output.once("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
    archive.destroy();
    eventlib.emit("zip:created", {
      dest: destFile,
      size: getFilesizeInBytes(pathBIN),
    });
  });

  // good practice to catch this error explicitly
  archive.once("error", function (err) {
    return err;
  });

  archive.once("close", () => {
    console.log("closed archive");
  });

  // pipe archive data to the file
  archive.pipe(output);
  archive.finalize();
}

eventlib.on("row:inserted", (filename) => {
  // extractRaw(filename, "./");
  // fs.unlinkSync(`./${filename}.bin`);
  fs.unlinkSync(`./${filename}.zip`);
});

function save2DB(pathZIP, fileSize) {
  let filename = path.basename(pathZIP).split(".zip")[0];
  fs.readFile(pathZIP, (err, file) => {
    if (err) console.log(err);
    rawFiles.run(
      `INSERT INTO raw_files(filename, size, file, timestamp) VALUES(?, ?, ?, ?)`,
      [filename, fileSize, file, filename],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        eventlib.emit("row:inserted", filename);
      }
    );
  });
}

eventlib.on("file:extracted", (filePath) => {
  unzipRaw(filePath, "./");
});

eventlib.on('raw:download', filename => {
  console.log('raw:download >>>>', filename);
  extractRaw(filename, "./");
})

function extractRaw(nameInDB, pathDEST = './') {
  let query = `SELECT filename, file FROM raw_files WHERE filename = '${nameInDB}';`;

  rawFiles.get(query, (err, res) => {
    if (err) {
    } else if (res) {
      let dest = `${pathDEST}${nameInDB}.zip`;
      let fd = fs.openSync(dest, "w");
      fs.writeSync(fd, res.file, 0, Buffer.byteLength(res.file));
      fs.closeSync(fd);

      eventlib.emit("file:extracted", dest);
    }

  });

  // })
}

function unzipRaw(pathZIP, pathDEST) {
  fs.createReadStream(pathZIP).pipe(unzipper.Extract({ path: pathDEST }));
  GPSdata.rawFile = (path.basename(pathZIP).split(".zip")[0] + '.bin')
}

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  console.log(fileSizeInBytes);
  return fileSizeInBytes;
}
module.exports = { saveRawData, extractRaw };
