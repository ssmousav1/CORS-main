
const Readline = require("@serialport/parser-readline");
const eventEmitterBuilder = require("../helpers/globalEventEmitter");
const { NMEAPort, deviceStatusPort } = require("../helpers/globalPorts");
// const { LEDCommands } = require("../helpers/messages");
// const { messagesToWatchdog } = require("../helpers/watchdogInterface");

const eventEmitter = new eventEmitterBuilder().getInstance();
const parser = NMEAPort.pipe(new Readline({ delimiter: '\r\n' }))
const deviceStatusParser = deviceStatusPort.pipe(new Readline({ delimiter: '\r\n' }))


let GPSdata = {
  hdop: null,
  vdop: null,
  pdop: null,
  active_satellites: {
    GA: [],
    GP: [],
    GL: [],
    GB: []
  },
  lat: null,
  lon: null,
  alt: null,
  satellites: {
    GA: {},
    GP: {},
    GL: {},
    GB: {}
  },
  inViewSatellites: {
    GA: {},
    GP: {},
    GL: {},
    GB: {}
  },
  time: Date.now(),
  ellipseMajor: null,
  ellipseMinor: null,
  ellipseOrientation: null,
  latitudeError: null,
  longitudeError: null,
  heightError: null,
  deviceStatus: {
    antenna: null,
    network: null,
    ntrip: null,
    oem: null,
    storage: {
      total: null,
      used: null,
      percent: null
    },
    NTRIPStatus: null,
    power: null,
    uptime: null,
    deviceHealth: null
  },
  totalRms: null,
  semiMajorError: null,
  semiMinorError: null,
  orientationOfSemiMajorError: null,
  configs: {
    NMEA: 0,
    raw: 0,
    RTCM: 0
  },
  rawFile: null,
  ntripservice: {
    status: null
  }
}


const handleWebSocket = (data) => {
  // console.log(data);
  switch (data.sentenceId) {
    case 'GSA':
      // console.log(data);
      GPSdata.hdop = data.HDOP
      GPSdata.vdop = data.VDOP
      GPSdata.pdop = data.PDOP
      break;
    case 'GGA':
      // console.log(data);
      GPSdata.lat = data.latitude
      GPSdata.lon = data.longitude
      GPSdata.alt = data.altitudeMeters
      break;
    case 'GSV':
      // console.log(data);

      // satellites = data.satellites
      GPSdata.inViewSatellites.all = data.satellites
      switch (data.talkerId) {
        case 'GA':
          data.satellites.map(satInfo => {
            GPSdata.inViewSatellites.GA[satInfo.prnNumber] = satInfo
          })
          break;
        case 'GL':
          data.satellites.map(satInfo => {
            GPSdata.inViewSatellites.GL[satInfo.prnNumber] = satInfo
          })
          break;
        case 'GP':
          data.satellites.map(satInfo => {
            GPSdata.inViewSatellites.GP[satInfo.prnNumber] = satInfo
          })
          break;
        case 'GB':
          data.satellites.map(satInfo => {
            GPSdata.inViewSatellites.GB[satInfo.prnNumber] = satInfo
          })
          break;
        default:
          break;
      }
      break;
    case 'GST':
      //	console.log(new Date(data.time).getTime(),'<<')
      // console.log(data);
      GPSdata.time = data.time
      GPSdata.totalRms = data.totalRms
      GPSdata.ellipseMajor = data.semiMajorError
      GPSdata.ellipseMinor = data.semiMinorError
      GPSdata.ellipseOrientation = data.orientationOfSemiMajorError
      GPSdata.latitudeError = data.latitudeError
      GPSdata.longitudeError = data.longitudeError
      GPSdata.heightError = data.altitudeError

      break;

    default:
      break;
  }
  return JSON.stringify(GPSdata)
}

// setInterval(() => {
//   if (satellites && satellites.length === 0) {
//     messagesToWatchdog(LEDCommands.antConf)
//     // messagesToWatchdog('ant:none')
//   } else {
//     // messagesToWatchdog('nmea:ok')
//     messagesToWatchdog(LEDCommands.antOK)
//   }
// }, 60000)

let flag = 1
parser.on("data", line => {
  try {
    if (line.slice(1, 6) === 'GNGSA') {
      switch (flag) {
        case 1:
          flag = 2
          GPSdata.active_satellites = { ...GPSdata.active_satellites, GP: line.split(',').slice(3, -4).filter(prn => !!prn) }
          break;
        case 2:
          flag = 3
          GPSdata.active_satellites = { ...GPSdata.active_satellites, GL: line.split(',').slice(3, -4).filter(prn => !!prn) }
          break;
        case 3:
          flag = 4
          GPSdata.active_satellites = { ...GPSdata.active_satellites, GA: line.split(',').slice(3, -4).filter(prn => !!prn) }
          break;
        case 4:
          flag = 5
          GPSdata.active_satellites = { ...GPSdata.active_satellites, GB: line.split(',').slice(3, -4).filter(prn => !!prn) }
          break;
        default:
          flag = 1
          // console.log(' empty >>', line.split(','));
          break;
      }
    }
  } catch (error) {
    console.error("Got bad packet:", line, error);
  }
});

const checkDeviceStatus = (deviceStatus) => {

  return {
    '12V0_MAIN': parseFloat(deviceStatus['12V0_MAIN']) > 11.5 && parseFloat(deviceStatus['12V0_MAIN']) < 12.5,
    '5V0_MAIN': parseFloat(deviceStatus['5V0_MAIN']) > 4.8 && parseFloat(deviceStatus['5V0_MAIN']) < 5.2,
    '3V7_MAIN': parseFloat(deviceStatus['3V7_MAIN']) > 3.5 && parseFloat(deviceStatus['3V7_MAIN']) < 3.9,
    '3V3_CORE': parseFloat(deviceStatus['3V3_CORE']) > 3 && parseFloat(deviceStatus['3V3_CORE']) < 3.6,
    '3V3_GPS': parseFloat(deviceStatus['3V3_CORE']) > 3 && parseFloat(deviceStatus['3V3_CORE']) < 3.6,
    '4V2_BATTERY': parseFloat(deviceStatus['3V3_CORE']) > 3.5 && parseFloat(deviceStatus['3V3_CORE']) < 4.25,
    HUMIDITY: parseFloat(deviceStatus.HUMIDITY) > 0 && parseFloat(deviceStatus.HUMIDITY) < 40,
    TEPERATURE: parseFloat(deviceStatus.TEPERATURE) > 10 && parseFloat(deviceStatus.TEPERATURE) < 60,
    RESERVE_1: false,
    RESERVE_2: false
  }
}

deviceStatusParser.on("data", line => {
  try {
    GPSdata.deviceStatus = { ...GPSdata.deviceStatus, ...JSON.parse(line), deviceHealth: checkDeviceStatus(JSON.parse(line)) }
  } catch (error) {
    console.error("Got bad packet:", line, error);
  }
});

// {
//   '12V0_MAIN': '11.69',
//   '5V0_MAIN': '4.91',
//   '3V7_MAIN': '3.60',
//   '3V3_CORE': '3.22',
//   '3V3_GPS': '3.25',
//   '4V2_BATTERY': '0.00',
//   HUMIDITY: '0.15',
//   TEPERATURE: '25.50',
//   RESERVE_1: '',
//   RESERVE_2: ''
// }

eventEmitter.on('msg:sending', status => {
  switch (status.split(':')[0]) {
    case 'antenna':
      GPSdata.deviceStatus.antenna = status
      break;
    case 'network':
      GPSdata.deviceStatus.network = status
      break;
    case 'ntrip':
      GPSdata.deviceStatus.ntrip = status
      break;
    case 'oem':
      GPSdata.deviceStatus.oem = status
      break;
    default:
      break;
  }
})

module.exports = { handleWebSocket, GPSdata };
