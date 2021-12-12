const express = require('express');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const nmea = require('nmea-simple');
const Readline = require('@serialport/parser-readline');
const cmd = require('node-cmd');
const five = require('johnny-five');
const BeagleBone = require('beaglebone-io');

// environmental variables
require('dotenv').config();

// helpers
const eventEmitterBuilder = require('./helpers/globalEventEmitter');
const { saveRawData } = require('./helpers/rawData');
const { NMEAPort, rawDataPort } = require('./helpers/globalPorts');
const startUp = require('./helpers/startUp');
const Auth = require('./middlewares/authentication');
const accessToken = require('./middlewares/accessToken');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const {
	userValidator,
	casterValidator,
	networkValidator,
	positionValidator,
	rawDataValidator,
	rawDataConfigValidator,
	managementValidator,
} = require('./middlewares/validators');

// API routes
const authRouter = require('./api/auth');
const casterRoutes = require('./api/casterSettings');
const networkRoutes = require('./api/networkSettings');
const positionsRoutes = require('./api/positionsSettings');
const routes = require('./api/user');
const { handleWebSocket, GPSdata } = require('./api/WS');
const {
	rawDataConfigRoutes,
	rawDataRoutes,
	DownloadRawDataRoutes,
} = require('./api/rawData');
const managementRouter = require('./api/management');
const { storageCapacity } = require('./helpers/storageCapacity');
const { userDB } = require('./DB');
const { getIP } = require('./helpers/netConfig');

const eventEmitter = new eventEmitterBuilder().getInstance();
const NMEAparser = NMEAPort.pipe(new Readline({ delimiter: '\r\n' }));
const app = express();

const server = new WebSocket.Server({
	server: app.listen(process.env.MAIN_PORT || 3001, () => {
		startUp();
		console.log(
			`Example app listening at http://localhost:${
				process.env.MAIN_PORT || 3001
			}`
		);
	}),
});

// Pin controller
const gpioAdapter = {
	oemEn: {
		gpio: 45,
		header: 'P8_11',
	},
};

const board = new five.Board({
	io: new BeagleBone(),
});

// middleware
app.use(
	fileUpload({
		createParentPath: true,
	})
);
app.use(cors());
app.use(express.json());

// login route
app.use('/auth', accessToken, authRouter);

// protected API routes
app.use('/raw-data-download', DownloadRawDataRoutes);
app.use(Auth);
app.use('/users', userValidator(), routes);
app.use('/caster', casterValidator(), casterRoutes);
app.use('/network', networkValidator(), networkRoutes);
app.use('/position', positionValidator(), positionsRoutes);
app.use('/raw-data', rawDataValidator(), rawDataRoutes);
app.use('/rawconfig', rawDataConfigValidator(), rawDataConfigRoutes);
app.use('/management', managementValidator(), managementRouter);

// // ports data
let nmeaTime;
let rawdataTime;

board.on('ready', function () {
	try {
		const oem = new five.Pin(gpioAdapter.oemEn.header);
		oem.high();
	} catch (err) {
		console.error(`Board Error >>> ${err}`);
		process.exit(0);
	}
});

// try {
// 	console.log(' >>>>>>>>>>>>>>>Configuration ...');
// 	cmd.run('sudo ./start.sh', (err, data, stderr) => {
// 		console.log('sudo ./start.sh data :', data);
// 		console.log('sudo ./start.sh error : ', err);
// 		console.log('sudo ./start.sh stderr :', stderr);
// 		if (err) {
// 		} else {
// 		}
// 	});
// 	console.log(' >>>>>>>>>>>>>>>Configuration done');
// } catch (error) {
// 	console.log(error);
// 	process.exit();
// }

NMEAparser.on('data', (data) => {
	nmeaTime = Date.now();
	try {
		const packet = nmea.parseNmeaSentence(data);
		eventEmitter.emit('WSData');
		handleWebSocket(packet);
	} catch (err) {
		console.error(`NMEA Error >>> ${err}`);
	}
});

rawDataPort.on('data', (data) => {
	rawdataTime = Date.now();
	saveRawData(data);
});

// setInterval(() => {
// 	cmd.run('pm2 status', function (err, data, stderr) {
// 		console.log(
// 			'pm2 status >>>>',
// 			data.indexOf('online', data.indexOf('startntripserver'))
// 		);
// 		if (!!err || !!stderr) {
// 		} else if (
// 			data.indexOf('online', data.indexOf('startntripserver')) > 0 &&
// 			data.indexOf('startntripserver') > 0
// 		) {
// 			console.log(
// 				data.indexOf('online', data.indexOf('startntripserver')),
// 				data.indexOf('startntripserver'),
// 				'****'
// 			);
// 			if (GPSdata.ntripservice.status != 'running') {
// 				GPSdata.ntripservice.status = 'running';
// 				userDB.run(
// 					`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify(
// 						{
// 							status: 'running',
// 							host: GPSdata.ntripservice.host,
// 							mountpoint: GPSdata.ntripservice.mountpoint,
// 							pass: GPSdata.ntripservice.pass,
// 							port: GPSdata.ntripservice.port,
// 							user: GPSdata.ntripservice.user,
// 						}
// 					)}')`,
// 					(err, data) => {
// 						if (err) {
// 							console.error('error in saving data in DB', err, '**', data);
// 						} else {
// 						}
// 					}
// 				);
// 			}
// 		} else if (
// 			data.indexOf('errored', data.indexOf('startntripserver')) > 0 &&
// 			data.indexOf('startntripserver') > 0
// 		) {
// 			if (GPSdata.ntripservice.status != 'error') {
// 				GPSdata.ntripservice.status = 'error';
// 				userDB.run(
// 					`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify(
// 						{
// 							status: 'error',
// 							host: GPSdata.ntripservice.host,
// 							mountpoint: GPSdata.ntripservice.mountpoint,
// 							pass: GPSdata.ntripservice.pass,
// 							port: GPSdata.ntripservice.port,
// 							user: GPSdata.ntripservice.user,
// 						}
// 					)}')`,
// 					(err, data) => {
// 						if (err) {
// 							console.error('error in saving data in DB', err, '**', data);
// 						} else {
// 						}
// 					}
// 				);
// 			}
// 		} else {
// 			if (GPSdata.ntripservice.status != 'stopped') {
// 				GPSdata.ntripservice.status = 'stopped';
// 				userDB.run(
// 					`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify(
// 						{
// 							status: 'stopped',
// 							host: GPSdata.ntripservice.host,
// 							mountpoint: GPSdata.ntripservice.mountpoint,
// 							pass: GPSdata.ntripservice.pass,
// 							port: GPSdata.ntripservice.port,
// 							user: GPSdata.ntripservice.user,
// 						}
// 					)}')`,
// 					(err, data) => {
// 						if (err) {
// 							console.error('error in saving data in DB', err, '**', data);
// 						} else {
// 						}
// 					}
// 				);
// 			}
// 		}
// 	});

// 	// check storage capacity
// 	storageCapacity();

// 	// setIP
// 	GPSdata.deviceStatus.IP = getIP();
// }, 60000);

//  server connection
let messageInterval = null;

server.on('connection', (socket, req) => {
	console.log('connectted');
	jwt.verify(
		req.url.slice(1),
		process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret',
		(err, user) => {
			if (err) {
				socket.send('please login first');
			} else {
				socket.send(JSON.stringify(GPSdata));
				messageInterval = setInterval(() => {
					socket.send(JSON.stringify(GPSdata));
				}, 15000);
			}
		}
	);

	socket.on('close', () => {
		clearInterval(messageInterval);
	});
});
