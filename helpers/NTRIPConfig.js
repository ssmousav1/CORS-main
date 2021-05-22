const cmd = require("node-cmd");
const fs = require("fs");

// const EventLib = require("../util/Eventlib");
// const eventlib = new EventLib().getInstance();

// Generate env file for starting NTRIP
const envGen = (params) => {
  let ntripArgs = [
    `SPORT=${params.serialPort}`,
    `BRATE=${params.baudrate}`,
    `OUTPUT=${params.output}`,
    `CASTER=${params.destAddress}`,
    `CPORT=${params.destPort}`,
    `MOUNTPOINT=${params.mounpoint}`,
    // `CUSER=${params.destUser}`,
    `CPASS=${params.destPass}`,
  ];

  cmd.runSync("rm ntrip-env");
  ntripArgs.forEach((element) => {
    fs.appendFileSync("ntrip-env", `${element}\n`);
    console.log(`${element}\n`);
  });
}

// Runs before new NTRIP spawn to clear extra containers
const killallProc = (name) => {
  let raw = cmd.runSync(
    `docker ps -aq --filter name=${name} | xargs docker stop`
  );

  if (raw.data) {
    raw = cmd.runSync(`docker ps -aq --filter name=${name} | xargs docker rm`);
    if (raw.stderr) {
      // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
      console.log("Killall running");
      console.error(raw.stderr);
    } else {
      // eventlib.emit("msg:log", { status: 200, msg: raw.data });
      console.log("Killall running");
      console.log(raw.data);
    }
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.log("Killall running");
    console.error(raw.stderr);
  }
}

const startProc = (name) => {
  let raw = cmd.runSync(`docker start ${name}`);
  if (raw.data) {
    // eventlib.emit("msg:log", { status: 500, msg: raw.data });
    console.log(`starting container: ${name}`);
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.error(">>>>>>>>> " + raw.stderr);
  }
}

const getUptime = (name) => {
  let raw = cmd.runSync(`docker ps | grep ${name}`);
  if (raw.data) {
    // eventlib.emit("msg:log", { status: 200, msg: raw.data });
    console.log(`starting container: ${name}`);
    raw = raw.data.split("  ");
    return { uptime: raw[5] };
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.error(">>>>>>>>> " + raw.stderr);
  }
}

const createNTRIP = (params) => {
  let container = `cors-ntrip-${params.mounpoint}`;
  console.log(`container: ${container}`);
  killallProc("cors-ntrip*");
  envGen(params);
  console.log("done wiritng env to file");
  let raw = cmd.runSync(
    `docker run -d -v /dev:/dev -v /run/udev:/run/udev:ro --name=${container} --network='host' --device=/dev/ttyO4 --env-file ntrip-env hirodevelop/cors-ntripserver`
  );
  if (raw.data) {
    // eventlib.emit("msg:log", { status: 200, msg: raw.data });
    console.log("creating container: " + raw.data);
    return container;
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.error(">>>>>>>>>>>" + raw.stderr);
  }
}

const restartProc = (name) => {
  let raw = cmd.runSync(`docker restart ${name}`);
  if (raw.data) {
    // eventlib.emit("msg:log", { status: 200, msg: raw.data });
    console.log("restart container: " + raw.data);
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.error("restart container >>>>>>>>>>>" + raw.stderr);
  }
}

const stopProc = (name) => {
  let raw = cmd.runSync(`docker stop ${name}`);
  if (raw.data) {
    // eventlib.emit("msg:log", { status: 200, msg: raw.data });
    console.log("stopping container: " + raw.data);
  } else {
    // eventlib.emit("msg:log", { status: 500, msg: raw.stderr });
    console.log("stopping container >>>>>>>>>>>" + raw.stderr);
  }
}

const getStatusNTRIP = (name) => {
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
      killallProc("cors-ntrip*");
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

const createMain = (port = 3001) => {
  let container = `cors-main`;
  killallProc(container);
  console.log(`container: ${container}`);
  let raw = cmd.runSync(
    `docker run -d --restart=always -v /dev:/dev -v /run/udev:/run/udev:ro -v cors-db:/app --name=${container} --network='host' --env-file /home/debian/.cors/.main-env --device=/dev/ttyO1 --device=/dev/ttyO2 --device=/dev/ttyO5 hirodevelop/cors-main`
  );
  if (raw.data) {
    console.log("creating main container: " + raw.data);
    return container;
  } else {
    console.error("createMain >>>>>>>>>>>" + raw.stderr);
  }
}

// function createWeb(port = 80) {
//   let container = `cors-web`;
//   killallProc(container);
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
  createMain,
  createNTRIP,
  startProc,
  stopProc,
  restartProc,
  getStatusNTRIP,
  getUptime,
};
