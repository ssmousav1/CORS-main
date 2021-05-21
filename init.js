#!/usr/bin/env node
const cmd = require("node-cmd");

let pm2 = `/home/debian/.npm-global/bin/pm2`;

let commands = [
  `${pm2} del all`,
  `sudo ./start.sh`,
  `node config.js`,
  `${pm2} start server.js --watch`,
];

commands.forEach((command) => {
  let res;
  try {
    res = cmd.runSync(command);
    console.log(`success: ${command}`);
  } catch (error) {
    console.log(error);
    process.exit();
  }
});

process.exit();
