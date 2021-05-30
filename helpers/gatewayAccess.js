const cmd = require('node-cmd');
const { userDB } = require('../DB');
const { statusMessagesToWatchdog, messagesToWatchdog } = require("./watchdogInterface");
const { LEDCommands, smokeTest } = require("./messages");

const gatewayAccess = () => {

  return new Promise(
    (resolve, reject) => {
      userDB.all(`SELECT value  FROM setting WHERE key = 'network'`, (err, data) => {
        if (err) {
          console.error('there is an error from loading data from database : ****', err);
          reject(err)
          messagesToWatchdog(smokeTest.netFail)
          statusMessagesToWatchdog(LEDCommands.netNone)
        } else {
          if (data[0]) {
		// console.log(data[0])
            try {
              cmd.run(`ping ${JSON.parse(data[0].value).gateway} -c4`, (err, data, stderr) => {
                if (err) {
                  statusMessagesToWatchdog(LEDCommands.netNone)
                  messagesToWatchdog(smokeTest.netFail, JSON.parse(data[0].value).gateway)
                  console.log(err);
                  reject(err)
                } else {
                  messagesToWatchdog(smokeTest.netOk)
                  statusMessagesToWatchdog(LEDCommands.netOK)
                  resolve(LEDCommands.netOK)
                }
              }
              );
          
            } catch (e) {
              console.error('no network data' , e)
            }
          } else {
            resolve(LEDCommands.netConf)
            messagesToWatchdog(smokeTest.netFail)
            statusMessagesToWatchdog(LEDCommands.netConf)
          }
        }
      });
    }
  )
}

module.exports = gatewayAccess
