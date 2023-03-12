const cmd = require("node-cmd");
const { GPSdata } = require("../api/WS");
const { rawFiles } = require("../DB");
const fs = require("fs");

// Convert strings to numbers with base unit as MB
const unitConversion = (data) => {
  return {
    total: data.total.includes("G")
      ? parseFloat(data.total) * 1000
      : parseFloat(data.total),
    used: data.used.includes("G")
      ? parseFloat(data.used) * 1000
      : parseFloat(data.used),
    percent: parseFloat(data.percent),
  };
};

// delete files in filesystem
const deleteOldRawFileSystem = (files) => {
  files.forEach(file => {
    fs.unlink(`${file.timestamp}.bin`, (err) => {
      if (err) {
        console.log('error in deleting first data from DB', err);
      } else {
        console.log('File deleted!');
      }
    });
  });
}

// delete old data in DB
const deleteOldRaw = () => {
  rawFiles.all(`SELECT id,timestamp FROM raw_files LIMIT 1`, (err, firstData) => {
    if (err) {
      console.log('error in getting firstData from DB for deleting');
    } else {
      console.log('firstData for delete  ===>>>', firstData);
      console.log(firstData[0].timestamp);
      rawFiles.run(`DELETE FROM raw_files WHERE timestamp = ${firstData[0].timestamp}`, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('first data in DB deleted');
          deleteOldRawFileSystem(firstData)
        }
      })
    }
  })
}

const storageCapacity = () => {
  try {
    let raw = cmd.runSync("df -H");
    raw = raw.data.split("\n").filter((line) => line.includes("mmcblk"));
    raw = raw[0].split(/\s+/);
    console.log(unitConversion({
      total: raw[1],
      used: raw[2],
      percent: raw[4],
    }))


    // checking device storag capacity and start deleting files from DB and filesystem when device is starting to get full
    if (unitConversion({ total: raw[1], used: raw[2], percent: raw[4], }).used > 58000) {
      deleteOldRaw()
    }


    GPSdata.deviceStatus.storage = unitConversion({
      total: raw[1],
      used: raw[2],
      percent: raw[4],
    })
    return unitConversion({
      total: raw[1],
      used: raw[2],
      percent: raw[4],
    });
  } catch (error) {

  }
}

module.exports = { storageCapacity }
