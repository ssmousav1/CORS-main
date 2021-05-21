#!/usr/bin/env node
const cmd = require("node-cmd");

// let pm2 = `/home/debian/.npm-global/bin/pm2`;

let commands = [
  `sudo ./start.sh`,
  `node config19.js`,
  `node config115.js`,
  `pm2 restart 0`,
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
