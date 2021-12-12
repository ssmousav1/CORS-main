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
const oem19 = require('./configs/config19');
const oem115 = require('./configs/config115');
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
	// 	rxUART4: { gpio: 30, header: 'P9_11' },
	// 	txUART4: { gpio: 31, header: 'P9_11' },
	// 	rxUART1: { gpio: 14, header: 'P9_26' },
	// 	txUART1: { gpio: 15, header: 'P9_24' },
	// 	rxUART2: { gpio: 2, header: 'P9_22' },
	// 	txUART2: { gpio: 3, header: 'P9_21' },
	// 	rxUART5: { gpio: 79, header: 'P8_38' },
	// 	txUART5: { gpio: 78, header: 'P8_37' },
};

const gpioAdapterL = [
	'P9_11',
	'P9_11',
	'P9_26',
	'P9_24',
	'P9_22',
	'P9_21',
	'P8_38',
	'P8_37',
];

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

let rawCount = 0;
let nmeaCount = 0;

board.on('ready', function () {
	try {
		const oem = new five.Pin(gpioAdapter.oemEn.header);
		oem.high();

		// Config UART pins
		gpioAdapterL.forEach((pin) => {
			cmd.run(`config-pin ${pin} uart`, (err, data, stderr) => {
				console.log(`pin-config ${pin} >>> data:`, data);
				console.log(`pin-config ${pin} >>> err:`, err);
				console.log(`pin-config ${pin} >>> stderr:`, stderr);
			});
		});

		oem19.setupOEM19();
		oem115.setupOEM115();
	} catch (err) {
		console.error(`Board Error >>> ${err}`);
		process.exit(0);
	}
});

NMEAparser.on('data', (data) => {
	nmeaTime = Date.now();
	if (nmeaCount % 10 == 0) {
		console.log(`NMEA Data: >>>`);
		console.log(data.toString());
	}
	nmeaCount += 1;
	try {
		const packet = nmea.parseNmeaSentence(data);
		eventEmitter.emit('WSData');
		let satData = handleWebSocket(packet);
		if (nmeaCount % 10 === 0)
			console.log(JSON.parse(satData).active_satellites);
	} catch (err) {
		console.error(`NMEA Error >>> ${err}`);
	}
});

rawDataPort.on('data', (data) => {
	rawdataTime = Date.now();
	if (rawCount % 10 == 0) {
		console.log(`Raw Data: >>>`);
		console.log(data.toString());
	}
	rawCount += 1;
	saveRawData(data);
});

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
