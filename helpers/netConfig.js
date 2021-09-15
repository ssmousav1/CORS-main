
const fs = require("fs");
const cmd = require("node-cmd");
const nc = require("network-calculator");
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const pathBASE = process.cwd();

const setIP = (params) => {
  console.log('params >>>>>>>>', params);
  let { ip, subnet } = params
  // ip addr add 192.168.2.24/24 dev eth0
  // ifconfig eth0 192.168.1.5 netmask 255.255.255.0 up
  console.log(`ip: ${typeof ip} ${ip}`);
  console.log(`sub: ${typeof subnet} ${subnet}`);
  try {
    let bitmask = nc(ip, subnet).bitmask;
    let raw = cmd.runSync(`rm ${pathBASE}/commands/set-ip.sh`);
    console.log(raw);
    const command = `ip addr add ${ip}/${bitmask} dev eth0`;
    fs.writeFileSync(`${pathBASE}/commands/set-ip.sh`, command);
    console.log("success creating ip file!");
    raw = cmd.runSync(`sudo ${pathBASE}/scripts/config.sh ip`);
    console.log(raw);
    // eventlib.emit("msg:log", { status: 200, msg: "Done configuring IP" });
  } catch (error) {
    console.error(error);
  }
}

const setNetwork = ({ ip, mask, gateway }) => {
  let fd = fs.openSync("netconfig.sh", "w", 0o777);
  let contents = `ifconfig eth0 ${ip} netmask ${mask}\r\n`;
  fs.appendFileSync(fd, contents, { mode: 511 });
  contents = `route add default gw ${gateway}\r\n`;
  fs.appendFileSync(fd, contents, { mode: 511 });
  fs.closeSync(fd);

  cmd.run(
    'sudo ./netconfig.sh',
    function (err, data, stderr) {
      console.log('sudo ./netconfig.sh', data)
      console.log('sudo ./netconfig.sh', err)
      console.log('sudo ./netconfig.sh', stderr)
    }
  );
}

const getIP = () => {
  return nets.eth0[0].address
}

module.exports = { setIP, setNetwork, getIP }
