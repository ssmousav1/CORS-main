const cmd = require("node-cmd");
const { GPSdata } = require("../api/WS");

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
