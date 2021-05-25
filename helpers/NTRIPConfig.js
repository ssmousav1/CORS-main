const cmd = require("node-cmd");
const fs = require("fs");

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

const startProcess = () => {
  console.log('starting ntrip');
  cmd.run(
    `pm2 start startntripserver.sh`,
    function (err, data, stderr) {
      console.log('examples dir now contains the example file along with : ', data)
      console.log('examples dir now contains the example file along with : ', err)
      console.log('examples dir now contains the example file along with : ', stderr)
    }
  );
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
    }
  );
}

const restartProcess = (name) => {
  cmd.run(
    `pm2 restart startntripserver.sh`,
    function (err, data, stderr) {
      console.log('examples dir now contains the example file along with : ', data)
    }
  );
}

const getStatusNTRIP = (name = NTRIPObject.NTRIP) => {
  cmd.run(`docker logs -n 1 ${name}`, (err, data, stderr) => {
    let raw = stderr.split("\n");
    if (raw[0].includes("transfering data")) {
      // eventlib.emit("ntrip-proc:status", { status: 200 });
    } else if (raw[0].includes("can't connect")) {
      // eventlib.emit("ntrip-proc:status", {
      //   status: 400,
      //   msg: "Wrong/Inaccessible destination provided",
      // });
    } else if (raw[0].includes("Conflict. The container name")) {
      // TODO Dangerous move - needs change
      killallProcess("cors-ntrip*");
      getStatusNTRIP(name);
    } else if (raw[0].includes("ERROR: opening serial")) {
      // eventlib.emit("ntrip-proc:status", {
      //   status: 503,
      //   msg: "Serial not configured",
      // });
    } else if (
      raw[0].includes("ERROR: more than 120") ||
      raw[0].includes("WARNING: reading input failed")
    ) {
      // eventlib.emit("ntrip-proc:status", {
      //   status: 408,
      //   msg: "No data on port",
      // });
    } else if (raw[0].includes("ERROR: Destination caster's reply is not OK")) {
      // eventlib.emit("ntrip-proc:status", {
      //   status: 501,
      //   msg: "Output mode not supported",
      // });
    } else
      eventlib.emit("ntrip-proc:status", {
        status: 500,
      });
  });
}

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
  getStatusNTRIP,
  getUptime,
  NTRIPObject,
  envGen
};
