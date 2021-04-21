const { messagesToWatchdog } = require("./watchdogInterface");


const allowedMessages = {
  ntrip: 'ntrip:status',
  storage: 'storage:status',
  acpwr: 'acpwr:status',
  uptime: 'uptime:status',
}

const socketMessages = (message) => {
  console.log(message);

  if (Object.keys(allowedMessages).includes(message)) {
    messagesToWatchdog(allowedMessages[message])
  }
}

module.exports = { socketMessages };
