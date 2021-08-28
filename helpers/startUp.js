const cmd = require('node-cmd');
// const ConfigCommand = require("./configCommands");
const { NMEAPort } = require("./globalPorts");
// const {
//   messagesToWatchdog,
//   statusMessagesToWatchdog,
// } = require("./watchdogInterface");
// const { LEDCommands, WDCommands } = require("./messages");
const gatewayAccess = require("./gatewayAccess");
const Logger = require("../middlewares/logger");
const { checkNTRIP } = require("./checkNTRIP");
// const { configStop, configNMEA, configSave, configBaudRate } = require("./configPorts");
const { configRAW, configNMEA, configRTCM } = require("./configPorts");
const { userDB } = require("../DB");
const { GPSdata } = require('../api/WS');
const { startProcess } = require('./NTRIPConfig');
// const { startProcess, envGen } = require('./NTRIPConfig');

const logger = new Logger().getInstance();

// const wholeConf = [
//   // Reset
//   `$JOFF,PORTA\r\n`,
//   `$JOFF,PORTB\r\n`,
//   `$JOFF,PORTC\r\n`,
//   // Tracked satellites
//   `$JASC,GNGSA,1,PORTA\r\n`,
//   // Lat, lon position
//   `$JASC,GPGGA,1,PORTA\r\n`,
//   // In view sats
//   `$JASC,GPGSV,1,PORTA\r\n`,
//   `$JASC,GLGSV,1,PORTA\r\n`,
//   `$JASC,GAGSV,1,PORTA\r\n`,
//   `$JASC,GBGSV,1,PORTA\r\n`,
//   // Time
//   `$JASC,GPZDA,1,PORTA\r\n`,
//   `$JASC,GPGST,1,PORTA\r\n`,
//   // RAW data
//   `$JBIN,34,1,PORTB\r\n`,
//   `$JBIN,35,1,PORTB\r\n`,
//   `$JBIN,45,1,PORTB\r\n`,
//   `$JBIN,65,1,PORTB\r\n`,
//   `$JBIN,94,1,PORTB\r\n`,
//   `$JBIN,95,1,PORTB\r\n`,
//   `$JBIN,36,1,PORTB\r\n`,
//   `$JBIN,66,1,PORTB\r\n`,
//   `$JBIN,76,1,PORTB\r\n`,
//   `$JBIN,16,1,PORTB\r\n`,
//   `$JEPHOUT,60\r\n`,
//   // FIXPOS
//   `$JRTK,1,35.73853090,51.38968660,1341.9000\r\n`,
//   // RTCM
//   `$JASC,RTCM3,1,PORTC\r\n`,
//   // Baudrate config
//   `$JBAUD,115200,PORTA\r\n`,
//   `$JBAUD,115200,PORTB\r\n`,
//   `$JBAUD,115200,PORTC\r\n`,
//   // Save
//   `$JSAVE\r\n`,
// ];

const startUp = () => {
  console.log("start up");
  logger.log("app started");

  cmd.run(
    'sudo ./netconfig.sh',
    function (err, data, stderr) {
      console.log('sudo ./netconfig.sh', data)
      console.log('sudo ./netconfig.sh', err)
      console.log('sudo ./netconfig.sh', stderr)
    }
  );

  // const ntripData = JSON.stringify({
  //   status: 'loading',
  //   host: 'GPSdata.ntripservice.host',
  //   mountpoint: 'GPSdata.ntripservice.mountpoint',
  //   pass: ' GPSdata.ntripservice.pass',
  //   por: 'GPSdata.ntripservice.port'
  // })
  // userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${ntripData}')`, (err, data) => {
  //   if (err) {
  //     console.error('error in saving data in DB', err, '**', data);
  //   } else {
  //     GPSdata.ntripservice.status = 'loading'
  //   }
  // })

  // Load NTRIP server last status
  userDB.all(`SELECT value  FROM setting WHERE key = 'ntrip'`, (err, data) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
    if (err) {

    } else if (data && data[0]) {
      console.log(data[0].value);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data[0]);
      try {
        GPSdata.ntripservice.status = JSON.parse(data[0].value).status
        GPSdata.ntripservice.host = JSON.parse(data[0].value).host
        GPSdata.ntripservice.mount = JSON.parse(data[0].value).mountpoint
        GPSdata.ntripservice.pass = JSON.parse(data[0].value).pass
        GPSdata.ntripservice.port = JSON.parse(data[0].value).port
        GPSdata.ntripservice.user = JSON.parse(data[0].value).user
        if (JSON.parse(data[0].value).status === 'running') {
          startProcess()
        }
      } catch (e) {

      }

    }
  })

  // send data to watchdog at startup
  // statusMessagesToWatchdog(LEDCommands.antConf);
  // statusMessagesToWatchdog(LEDCommands.netConf);
  // statusMessagesToWatchdog(LEDCommands.ntripConf);
  // statusMessagesToWatchdog(LEDCommands.oemConf);

  // config ports
  configRAW(NMEAPort);
  configNMEA(NMEAPort);
  if (process.env.LAT && process.env.LON && process.env.ALT) {
    configRTCM(NMEAPort, {
      lat: process.env.LAT,
      lon: process.env.LON,
      alt: process.env.ALT,
    });
  }

  // check connectivity to gateway
  gatewayAccess()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

  // check ntrip status
  checkNTRIP();

  // messagesToWatchdog(WDCommands.storageStatus);
  // messagesToWatchdog(WDCommands.uptimeStatus);

  userDB.all(
    `SELECT value  FROM setting WHERE key = 'network'`,
    (err, data) => {
      if (err) {
        console.error(
          "there is an error from loading data from database : ****",
          err
        );
      } else {
        if (data[0]) {
          // messagesToWatchdog(WDCommands.netConfig, data[0].value);
        }
      }
    }
  );

  // wholeConf.forEach((command) => {
  //   NMEAPort.write(command);
  //   console.log(command);
  // });
};

module.exports = startUp;
