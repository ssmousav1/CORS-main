const SerialPort = require('serialport');


const NMEAPort = new SerialPort("/dev/ttyO1", {
  baudRate: 115200
})
const rawDataPort = new SerialPort("/dev/ttyO2", {
  baudRate: 115200
})
// const RTCMPort = new SerialPort("/dev/ttyO4", {
//   baudRate: 115200
// })
const deviceStatusPort = new SerialPort("/dev/ttyO5", { 
	baudRate: 115200
});

module.exports = {
  NMEAPort,
  rawDataPort,
  deviceStatusPort,
  // RTCMPort
}