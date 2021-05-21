const cmd = require("node-cmd");

//*nix supports multiline commands

let commands = [`sudo ./start.sh`];
// let commands = [`sudo ./start.sh`, `node config.js`, `pm2 start server.js`];

commands.forEach((command) => {
  let res;
  try {
    res = cmd.runSync(command);
  } catch (error) {
    console.log(error);
		break;
  }
});

// cmd.run(
//   ,
//   function (err, data, stderr) {
//     console.log(
//       "examples dir now contains the example file along with : ",
//       data
//     );

//     console.log(stderr, "**********");
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("$$$$$$$$");
//       cmd.run(`node config.js`, function (err, data, stderr) {
//         console.log(
//           "examples dir now contains the example file along with : ",
//           data
//         );
//       });
//     }
//   }
// );
