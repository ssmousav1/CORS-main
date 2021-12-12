const cmd = require('node-cmd');
const { NMEAPort } = require('./globalPorts');
const Logger = require('../middlewares/logger');
const { configRAW, configNMEA, configRTCM } = require('./configPorts');
const { userDB } = require('../DB');
const { GPSdata } = require('../api/WS');
const { startProcess } = require('./NTRIPConfig');

const logger = new Logger().getInstance();

const startUp = () => {
	console.log('start up');
	logger.log('app started');

	// cmd.run('sudo ./netconfig.sh', (err, data, stderr) => {
	// 	console.log('sudo ./netconfig.sh', data);
	// 	console.log('sudo ./netconfig.sh', err);
	// 	console.log('sudo ./netconfig.sh', stderr);
	// });

	// Load NTRIP server last status
	userDB.all(`SELECT value  FROM setting WHERE key = 'ntrip'`, (err, data) => {
		console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data);
		if (err) {
		} else if (data && data[0]) {
			console.log(data[0].value);
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', data[0]);
			try {
				GPSdata.ntripservice.status = JSON.parse(data[0].value).status;
				GPSdata.ntripservice.host = JSON.parse(data[0].value).host;
				GPSdata.ntripservice.mount = JSON.parse(data[0].value).mountpoint;
				GPSdata.ntripservice.pass = JSON.parse(data[0].value).pass;
				GPSdata.ntripservice.port = JSON.parse(data[0].value).port;
				GPSdata.ntripservice.user = JSON.parse(data[0].value).user;
				if (JSON.parse(data[0].value).status === 'running') {
					startProcess();
				}
			} catch (e) {
				console.error('GPS Data went wrong');
			}
		}
	});

	// // config ports
	// configRAW(NMEAPort);
	// configNMEA(NMEAPort);
	// if (process.env.LAT && process.env.LON && process.env.ALT) {
	// 	configRTCM(NMEAPort, {
	// 		lat: process.env.LAT,
	// 		lon: process.env.LON,
	// 		alt: process.env.ALT,
	// 	});
	// }
};

module.exports = startUp;
