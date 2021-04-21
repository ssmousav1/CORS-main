const io = require('socket.io-client');
const eventEmitterBuilder = require("../helpers/globalEventEmitter");
const socket = io.connect(`http://${process.env.WD_ADDRESS || 'localhost'}:${process.env.WD_PORT || '3003'}`);
const { WDCommands } = require('./messages')
const { NMEAPort } = require("./globalPorts");
// const readline = require("readline");
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: '$'
// });

const Logger = require('../middlewares/logger');
const { GPSdata } = require('../api/WS');
const { configRTCM } = require('./configPorts');
const logger = new Logger().getInstance();

const eventEmitter = new eventEmitterBuilder().getInstance();

const messagesToWatchdog = (msg, data = null) => {
  socket.emit(msg, data);
  eventEmitter.emit(msg, data)
  logger.log(`watchdog message ${msg} --  data : ${JSON.stringify(data)} `)
}

const statusMessagesToWatchdog = (msg) => {
  socket.emit("status:msg", msg);
  eventEmitter.emit('status:msg', msg)
  logger.log(`watchdog message ${msg} `)
}



socket.on('connect', () => {
  console.log('watchdog socket connected');
  socket.on(`${WDCommands.uptimeUpdate}`, (data) => {
    GPSdata.deviceStatus.uptime = data
    logger.log(`watchdog message uptime:update >>>> ${data}`)
  });
  socket.on(`${WDCommands.acpwrUpdate}`, (data) => {
    GPSdata.deviceStatus.power = data
    logger.log(`watchdog message acpwr:update >>>> ${data}`)
  });
  socket.on(`${WDCommands.storageUpdate}`, (data) => {
    console.log(data);
    GPSdata.deviceStatus.storage = data
    logger.log(`watchdog message storage:update >>>> ${data}`)
  });
  socket.on(`${WDCommands.ntripUpdate}`, (data) => {
    GPSdata.deviceStatus.NTRIPStatus = data
    logger.log(`watchdog message ntrip:update >>>> ${data}`)
  });
  socket.on(`${WDCommands.WDLogs}`, (log) => {
    logger.log(`watchdog loggs : ${JSON.stringify(log)} `)
  });
  socket.on(`${WDCommands.ntripConfigure}`, () => {
    logger.log(`watchdog message ntrip:configure  `)
    configRTCM(NMEAPort, { lat: 35.73853090, lon: 51.38968660, alt: 1341.9000 })
  });
});

socket.on('close', () => {
  console.log('socket closed');
  process.exit();
});

process.on('SIGINT', () => {
  process.exit();
})

module.exports = { messagesToWatchdog, statusMessagesToWatchdog, socket }