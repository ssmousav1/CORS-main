const express = require("express");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const nmea = require("nmea-simple");
const Readline = require("@serialport/parser-readline");
const cmd = require("node-cmd");
// environmental variables
require("dotenv").config();
// helpers
const eventEmitterBuilder = require("./helpers/globalEventEmitter");
const { saveRawData } = require("./helpers/rawData");
const { NMEAPort, rawDataPort } = require("./helpers/globalPorts");
const startUp = require("./helpers/startUp");
const Auth = require("./middlewares/authentication");
const accessToken = require("./middlewares/accessToken");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const {
  userValidator,
  casterValidator,
  networkValidator,
  positionValidator,
  rawDataValidator,
  rawDataConfigValidator,
  managementValidator,
} = require("./middlewares/validators");

// API routes
const authRouter = require("./api/auth");
const casterRoutes = require("./api/casterSettings");
const networkRoutes = require("./api/networkSettings");
const positionsRoutes = require("./api/positionsSettings");
const routes = require("./api/user");
const { handleWebSocket, GPSdata } = require("./api/WS");
const {
  rawDataConfigRoutes,
  rawDataRoutes,
  DownloadRawDataRoutes,
} = require("./api/rawData");
const managementRouter = require("./api/management");
const { storageCapacity } = require("./helpers/storageCapacity");
const { userDB } = require("./DB");

const eventEmitter = new eventEmitterBuilder().getInstance();
const NMEAparser = NMEAPort.pipe(new Readline({ delimiter: "\r\n" }));
const app = express();

const server = new WebSocket.Server({
  server: app.listen(process.env.MAIN_PORT || 3001, () => {
    startUp();
    console.log(
      `Example app listening at http://localhost:${process.env.MAIN_PORT || 3001
      }`
    );
  }),
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
app.use("/auth", accessToken, authRouter);

// protected API routes
app.use("/raw-data-download", DownloadRawDataRoutes);
app.use(Auth);
app.use("/users", userValidator(), routes);
app.use("/caster", casterValidator(), casterRoutes);
app.use("/network", networkValidator(), networkRoutes);
app.use("/position", positionValidator(), positionsRoutes);
app.use("/raw-data", rawDataValidator(), rawDataRoutes);
app.use("/rawconfig", rawDataConfigValidator(), rawDataConfigRoutes);
app.use("/management", managementValidator(), managementRouter);

// // ports data
let nmeaTime;
let rawdataTime;

try {
  console.log("Configuration ...");
  cmd.run('sudo ./start.sh', (err, data, stderr) => {
    console.log('sudo ./start.sh', data)
    console.log('sudo ./start.sh', err)
    console.log('sudo ./start.sh', stderr)
    if (err) {
    } else {
      console.log(`success: sudo ./start.sh`);
      cmd.run('node config19.js', (err, data, stderr) => {
        console.log('node config19.js', data)
        console.log('node config19.js', err)
        console.log('node config19.js', stderr)
        if (err) {
        } else {
          console.log(`success: node config19.js`);
          cmd.run('node config115.js', (err, data, stderr) => {
            console.log('node config115.js', data)
            console.log('node config115.js', err)
            console.log('node config115.js', stderr)
            if (err) {
            } else {
              console.log(`success: node config115.js`);
            }
          }
          );
        }
      }
      );
    }
  }
  );
  console.log("Configuration done");
} catch (error) {
  console.log(error);
  process.exit();
}

NMEAparser.on("data", (data) => {
  // console.log(data);
  nmeaTime = Date.now();
  try {
    const packet = nmea.parseNmeaSentence(data);
    eventEmitter.emit("WSData");
    handleWebSocket(packet);
  } catch (e) { }
});

rawDataPort.on("data", (data) => {
  rawdataTime = Date.now();
  // console.log(data.toString());
  saveRawData(data);
});


// setInterval(() => {
//   if (Date.now() - rawdataTime < 30000) {
//     messagesToWatchdog(smokeTest.rawOk);
//   } else {
//     if (GPSdata.configs.raw > 2) {
//       messagesToWatchdog(smokeTest.rawFail);
//     } else {
//       configRAW(rawDataPort);
//       const rawInterval = setTimeout(() => {
//         messagesToWatchdog(smokeTest.oemRestart);
//         clearTimeout(rawInterval);
//       }, 2000);
//     }
//   }

//   // CHECK NMEA for OEM health
//   if (Date.now() - nmeaTime < 30000) {
//     statusMessagesToWatchdog(LEDCommands.oemOK);
//   } else {
//     if (GPSdata.configs.NMEA > 2) {
//       statusMessagesToWatchdog(LEDCommands.oemNone);
//     } else {
//       configNMEA(NMEAPort);
//       const nmeaTimeout = setTimeout(() => {
//         messagesToWatchdog(smokeTest.oemRestart, LEDCommands.oemNone);
//         clearTimeout(nmeaTimeout);
//       }, 2000);
//     }
//   }

//   // CHECK NMEA for ANT health
//   if (
//     GPSdata.inViewSatellites.all &&
//     GPSdata.inViewSatellites.all.length === 0
//   ) {
//     if (GPSdata.configs.NMEA > 2) {
//       statusMessagesToWatchdog(LEDCommands.antNone);
//     } else {
//       configRTCM(NMEAPort);
//       const antTimeout = setTimeout(() => {
//         messagesToWatchdog(smokeTest.oemRestart, LEDCommands.antNone);
//         clearTimeout(antTimeout);
//       }, 2000);
//     }
//   } else if (GPSdata.inViewSatellites.all) {
//     statusMessagesToWatchdog(LEDCommands.antOK);
//   }
// }, 30000);

// setInterval(() => {
//   gatewayAccess()
//     .then((res) => console.log("gateway result >>>> ", res))
//     .catch((err) => console.error("gateway error > ", err));
// }, 900000);

setInterval(() => {
  cmd.run(
    'pm2 status',
    function (err, data, stderr) {
      console.log('pm2 status >>>>', data.indexOf('online', data.indexOf('startntripserver')))
      if (!!err || !!stderr) {
      } else if (data.indexOf('online', data.indexOf('startntripserver')) > 0 && data.indexOf('startntripserver') > 0) {
        console.log(data.indexOf('online', data.indexOf('startntripserver')), data.indexOf('startntripserver'), '****');
        if (GPSdata.ntripservice.status != 'running') {
          GPSdata.ntripservice.status = 'running'
          userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify({
            status: 'running',
            host: GPSdata.ntripservice.host,
            mountpoint: GPSdata.ntripservice.mountpoint,
            pass: GPSdata.ntripservice.pass,
            port: GPSdata.ntripservice.port,
            user: GPSdata.ntripservice.user
          })}')`, (err, data) => {
            if (err) {
              console.error('error in saving data in DB', err, '**', data);
            } else {
            }
          })
        }
      } else if (data.indexOf('errored', data.indexOf('startntripserver')) > 0 && data.indexOf('startntripserver') > 0) {
        if (GPSdata.ntripservice.status != 'error') {
          GPSdata.ntripservice.status = 'error'
          userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify({
            status: 'error',
            host: GPSdata.ntripservice.host,
            mountpoint: GPSdata.ntripservice.mountpoint,
            pass: GPSdata.ntripservice.pass,
            port: GPSdata.ntripservice.port,
            user: GPSdata.ntripservice.user
          })}')`, (err, data) => {
            if (err) {
              console.error('error in saving data in DB', err, '**', data);
            } else {
            }
          })
        }
      } else {
        if (GPSdata.ntripservice.status != 'stopped') {
          GPSdata.ntripservice.status = 'stopped'
          userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', '${JSON.stringify({
            status: 'stopped',
            host: GPSdata.ntripservice.host,
            mountpoint: GPSdata.ntripservice.mountpoint,
            pass: GPSdata.ntripservice.pass,
            port: GPSdata.ntripservice.port,
            user: GPSdata.ntripservice.user
          })}')`, (err, data) => {
            if (err) {
              console.error('error in saving data in DB', err, '**', data);
            } else {
            }
          })
        }
      }
    }
  );


  storageCapacity()
}, 60000);

//  server connection
let messageInterval = null;

server.on("connection", (socket, req) => {
  console.log("connectted");
  jwt.verify(
    req.url.slice(1),
    process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret",
    (err, user) => {
      if (err) {
        socket.send("please login first");
      } else {
        socket.send(JSON.stringify(GPSdata));
        messageInterval = setInterval(() => {
          socket.send(JSON.stringify(GPSdata));
        }, 15000);
      }
    }
  );

  // socket.on("message", (message) => {
  //   socketMessages(message);
  // });

  socket.on("close", () => {
    clearInterval(messageInterval);
    // server.close()
  });
});
