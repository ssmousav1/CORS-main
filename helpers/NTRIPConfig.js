const cmd = require("node-cmd");
// const fs = require("fs");
const { userDB } = require("../DB");

// const EventLib = require("../util/Eventlib");
// const eventlib = new EventLib().getInstance();

let NTRIPObject

// Generate env file for starting NTRIP
const envGen = (params) => {
  Object.keys(params).forEach(envName => {
    cmd.run(
      `export ${envName}=${params[envName]}`,
      function (err, data, stderr) {
        console.log('setting new envs : ', envName, params[envName], data)
        console.log('setting new envs : ', envName, params[envName], err)
        console.log('setting new envs : ', envName, params[envName], stderr)
      }
    );
  })
}

// Runs before new NTRIP spawn to clear extra containers
const killallProcess = () => {
  cmd.run(
    `pm2 del startntripserver.sh`,
    (err, data, stderr) => {
      console.log('examples dir now contains the example file along with : ', data)
      console.log('examples dir now contains the example file along with : ', err)
      console.log('examples dir now contains the example file along with : ', stderr)
    }
  );
}

const startProcess = (params = null) => {

  if (params) {
    console.log(params);
    cmd.run(
      `SPORT=/dev/ttyO4 BRATE=115200 OUTPUT=2 CASTER=${params.host} CPORT=${params.port} MOUNTPOINT=${params.mountpoint} CPASS=${params.pass} pm2 start startntripserver.sh`,
      function (err, data, stderr) {
        console.log('examples dir now contains the example file along with : ', data)
        console.log('examples dir now contains the example file along with : ', err)
        console.log('examples dir now contains the example file along with : ', stderr)

        if (!!err && !!stderr) {
          userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'error')`, (err) => {
            console.error('error in saving data in DB');
          })
        } else {
          userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'running')`, (err) => {
            console.error('error in saving data in DB');
          })
        }
      }
    );
  } else {
    console.log('start ntrip form DB');
    userDB.all(`SELECT value  FROM setting WHERE key = 'caster'`, (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
      } else {
        if (data[0]) {
          console.log('starting ntrip');
          console.log(`SPORT=/dev/ttyO4  BRATE=115200 OUTPUT=2 CASTER=${JSON.parse(data[0].value).host} CPORT=${JSON.parse(data[0].value).port} MOUNTPOINT=${JSON.parse(data[0].value).mountpoint} CPASS=${JSON.parse(data[0].value).pass} pm2 start startntripserver.sh `);
          cmd.run(
            `SPORT=/dev/ttyO4  BRATE=115200 OUTPUT=2 CASTER=${JSON.parse(data[0].value).host} CPORT=${JSON.parse(data[0].value).port} MOUNTPOINT=${JSON.parse(data[0].value).mountpoint} CPASS=${JSON.parse(data[0].value).pass} pm2 start startntripserver.sh `,
            function (err, data, stderr) {
              console.log('examples dir now contains the example file along with : ', data)
              console.log('examples dir now contains the example file along with : ', err)
              console.log('examples dir now contains the example file along with : ', stderr)

              if (!!err && !!stderr) {
                userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'error')`, (err) => {
                  console.error('error in saving data in DB');
                })
              } else {
                userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'running')`, (err) => {
                  console.error('error in saving data in DB');
                })
              }
            }
          );
        } else {
          console.error('there are no data in DB : ****');
        }
      }
    });
  }

}

const getUptime = () => {
  cmd.run(
    `pm2 status`,
    function (err, data, stderr) {
      console.log('examples dir now contains the example file along with : ', data)
    }
  );
}

// const createNTRIP = (params) => {
//   let container = `cors-ntrip-${params.mounpoint}`;
//   console.log(`container: ${container}`);
//   killallProcess("cors-ntrip*");
//   envGen(params);
//   console.log("done wiritng env to file");
//   let raw = cmd.runSync(
//     `docker run -d -v /dev:/dev -v /run/udev:/run/udev:ro --name=${container} --network='host' --device=/dev/ttyO4 --env-file ntrip-env hirodevelop/cors-ntripserver`
//   );
//   if (raw.data) {
//     // eventlib.emit("msg:log", { status: 200, msg: raw.data });
//     console.log("creating container: " + raw.data);
//     NTRIPObject.NTRIP = container
//     return container;
//   } else {
//     // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
//     console.error(">>>>>>>>>>>" + raw.stderr);
//   }
// }

const stopProcess = () => {
  cmd.run(
    `pm2 stop startntripserver.sh`,
    function (err, data, stderr) {
      console.log('examples dir now contains the example file along with : ', data)
      console.log('examples dir now contains the example file along with : ', err)
      console.log('examples dir now contains the example file along with : ', stderr)

      if (!!err && !!stderr) {
        userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'error')`, (err) => {
          console.error('error in saving data in DB');
        })
      } else {
        userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'stoped')`, (err) => {
          console.error('error in saving data in DB');
        })
      }

    }
  );
}

const restartProcess = (params) => {
  let command

  if (params) {
    command = `
    SPORT=/dev/ttyO4
    BRATE=115200
    OUTPUT=2
    CASTER=${params.host}
    CPORT=${params.port}
    MOUNTPOINT=${params.mountpoint}
    CPASS=${params.pass}
    pm2 start startntripserver.sh
    `
  } else {
    userDB.all(`SELECT value  FROM setting WHERE key = 'caster'`, (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
      } else {
        if (data[0]) {
          console.log('starting ntrip');
          command = `
          SPORT=/dev/ttyO4
          BRATE=115200
          OUTPUT=2
          CASTER=${data[0].value.host}
          CPORT=${data[0].value.port}
          MOUNTPOINT=${data[0].value.mountpoint}
          CPASS=${data[0].value.pass}
          pm2 start startntripserver.sh
          `
        } else {
          return 0
        }
      }
    });
  }
  cmd.run(
    `pm2 stop startntripserver.sh`,
    function (err, data, stderr) {
      if (err || stderr) {

      } else {
        cmd.run(
          command,
          function (err, data, stderr) {
            console.log('examples dir now contains the example file along with : ', data)
            console.log('examples dir now contains the example file along with : ', err)
            console.log('examples dir now contains the example file along with : ', stderr)

            if (!!err && !!stderr) {
              userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'error')`, (err) => {
                console.error('error in saving data in DB');
              })
            } else {
              userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ntrip', 'running')`, (err) => {
                console.error('error in saving data in DB');
              })
            }
          }
        );
      }
    }
  );
}

// const getStatusNTRIP = (name = NTRIPObject.NTRIP) => {
//   cmd.run(`docker logs -n 1 ${name}`, (err, data, stderr) => {
//     let raw = stderr.split("\n");
//     if (raw[0].includes("transfering data")) {
//       // eventlib.emit("ntrip-proc:status", { status: 200 });
//     } else if (raw[0].includes("can't connect")) {
//       // eventlib.emit("ntrip-proc:status", {
//       //   status: 400,
//       //   msg: "Wrong/Inaccessible destination provided",
//       // });
//     } else if (raw[0].includes("Conflict. The container name")) {
//       // TODO Dangerous move - needs change
//       killallProcess("cors-ntrip*");
//       getStatusNTRIP(name);
//     } else if (raw[0].includes("ERROR: opening serial")) {
//       // eventlib.emit("ntrip-proc:status", {
//       //   status: 503,
//       //   msg: "Serial not configured",
//       // });
//     } else if (
//       raw[0].includes("ERROR: more than 120") ||
//       raw[0].includes("WARNING: reading input failed")
//     ) {
//       // eventlib.emit("ntrip-proc:status", {
//       //   status: 408,
//       //   msg: "No data on port",
//       // });
//     } else if (raw[0].includes("ERROR: Destination caster's reply is not OK")) {
//       // eventlib.emit("ntrip-proc:status", {
//       //   status: 501,
//       //   msg: "Output mode not supported",
//       // });
//     } else
//       eventlib.emit("ntrip-proc:status", {
//         status: 500,
//       });
//   });
// }

// const createMain = (port = 3001) => {
//   let container = `cors-main`;
//   killallProcess(container);
//   console.log(`container: ${container}`);
//   let raw = cmd.runSync(
//     `docker run -d --restart=always -v /dev:/dev -v /run/udev:/run/udev:ro -v cors-db:/app --name=${container} --network='host' --env-file /home/debian/.cors/.main-env --device=/dev/ttyO1 --device=/dev/ttyO2 --device=/dev/ttyO5 hirodevelop/cors-main`
//   );
//   if (raw.data) {
//     console.log("creating main container: " + raw.data);
//     return container;
//   } else {
//     console.error("createMain >>>>>>>>>>>" + raw.stderr);
//   }
// }

// function createWeb(port = 80) {
//   let container = `cors-web`;
//   killallProcess(container);
//   console.log(`container: ${container}`);
//   // let raw = cmd.runSync(
//   //   `docker run -d --restart=always --name=${container} -p ${port}:80 hirodevelop/cors-web`
//   // );
//   // For test
//   // let raw = cmd.runSync("pm2 restart 0");
//   if (raw.data) {
//     console.log("container: " + raw.data);
//     return container;
//   } else {
//     console.error(">>>>>>>>>>>" + raw.stderr);
//   }
// }

// this.createNTRIP("FI0", {
//   serialPort: "/dev/ttyO4",
//   baudrate: "115200",
//   destAddress: "192.168.1.189",
//   destPort: "2101",
//   mounpoint: "BUCU0",
//   // destUser: "test",
//   destPass: "sesam01",
// });

module.exports = {
  // createMain,
  // createNTRIP,
  startProcess,
  stopProcess,
  restartProcess,
  // getStatusNTRIP,
  getUptime,
  NTRIPObject,
  envGen
};
