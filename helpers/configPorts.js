const { GPSdata } = require('../api/WS');
const { userDB } = require('../DB')
// const {
//   NMEAPort,
//   rawDataPort,
//   RTCMPort
// } = require('./globalPorts')

const configRAW = (writePort, port = null, cycle = null) => {
  const commands = [
    // Reset
    `$JOFF,PORTB\r\n`,
    // RAW data
    `$JBIN,34,1,PORTB\r\n`,
    `$JBIN,35,1,PORTB\r\n`,
    `$JBIN,45,1,PORTB\r\n`,
    `$JBIN,65,1,PORTB\r\n`,
    `$JBIN,94,1,PORTB\r\n`,
    `$JBIN,95,1,PORTB\r\n`,
    `$JBIN,36,1,PORTB\r\n`,
    `$JBIN,66,1,PORTB\r\n`,
    `$JBIN,76,1,PORTB\r\n`,
    `$JBIN,16,1,PORTB\r\n`,
    `$JEPHOUT,60\r\n`,
    // Baudrate
    `$JBAUD,115200,PORTB\r\n`,
    // Save
    `$JSAVE\r\n`,
  ]

  commands.forEach(command => {
    writePort.write(command)
    console.log('config raw , command :', command);
  })
  GPSdata.configs.raw = GPSdata.configs.raw + 1
}

const configNMEA = (writePort, port = null) => {
  const commands = [
    // Reset
    `$JOFF,PORTA\r\n`,
    // Tracked satellites
    `$JASC,GNGSA,1,PORTA\r\n`,
    // Lat, lon position
    `$JASC,GPGGA,1,PORTA\r\n`,
    // In view sats
    `$JASC,GPGSV,1,PORTA\r\n`,
    `$JASC,GLGSV,1,PORTA\r\n`,
    `$JASC,GAGSV,1,PORTA\r\n`,
    `$JASC,GBGSV,1,PORTA\r\n`,
    // Time
    `$JASC,GPZDA,1,PORTA\r\n`,
    `$JASC,GPGST,1,PORTA\r\n`,

    // Baudrate
    `$JBAUD,115200,PORTA\r\n`,
    // Save
    `$JSAVE\r\n`,
  ]

  commands.forEach(command => {
    writePort.write(command)
    console.log('config NMEA , command :', command);
  })
  GPSdata.configs.NMEA = GPSdata.configs.NMEA + 1
}

const configRTCM = (writePort, params = null) => {
  let { lat, lon, alt, port } = params

  if (!lat && !lon && !alt) {
    userDB.all(`SELECT value  FROM setting WHERE key = 'position'`, (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
      } else {
        lat = JSON.parse(data[0].value).lat
        lon = JSON.parse(data[0].value).lon
        alt = JSON.parse(data[0].value).alt
      }
    });
  }
  const commands = [
    // Reset
    `$JOFF,PORTC\r\n`,
    // FIXPOS
    `$JRTK,1,${lat},${lon},${alt}\r\n`,
    // RTCM
    `$JASC,RTCM3,1,PORTC\r\n`,
    // Baudrate
    `$JBAUD,115200,PORTC\r\n`,
    // Save
    `$JSAVE\r\n`,
  ];

  commands.forEach(command => {
    writePort.write(command)
    console.log('config RTCM , command :', command);
  })
  GPSdata.configs.RTCM = GPSdata.configs.RTCM + 1
}

module.exports = {
  configNMEA,
  configRAW,
  configRTCM
}