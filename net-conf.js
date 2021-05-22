const fs = require("fs");
const cmd = require("node-cmd");

function setNetwork() {
  let contents = `ifconfig eth0 ${process.env.UD_IP} netmask ${process.env.UD_NMASK}\r\n`;
  fs.appendFileSync("netconfig.sh", contents, { mode: 511 });
  contents = `route add default gw ${process.env.UD_GW}\r\n`;
  fs.appendFileSync("netconfig.sh", contents, { mode: 511 });
  console.log(process.env.UD_IP);
  console.log(process.env.UD_NMASK);
  console.log(process.env.UD_GW);
  fs.closeSync();
}

setNetwork();
