const cmd = require('node-cmd');
// const { statusMessagesToWatchdog } = require("./watchdogInterface");
// const { LEDCommands } = require("./messages");

const netAccess = () => {
  return new Promise(
    (resolve, reject) => {
      cmd.run(`npm ping`, (err, data, stderr) => {
        if (err) {
          console.log(err);
          reject(err)
        }
        console.log(`..............${stderr.slice(160, 167)}......`, stderr.slice(160, 167) === 'offline', 'the node-cmd dir contains : ', stderr)
        if (stderr.slice(160, 167) !== 'offline') {
          //statusMessagesToWatchdog(LEDCommands.netInt)
        }
        resolve(stderr.slice(160, 167) === 'offline')
      }
      );
    }
  )
}
module.exports = netAccess