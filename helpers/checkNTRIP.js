const { userDB } = require('../DB');
const { LEDCommands, WDCommands } = require('./messages');
const { statusMessagesToWatchdog, messagesToWatchdog } = require('./watchdogInterface');


const checkNTRIP = () => {
  userDB.all(`SELECT value  FROM setting WHERE key = 'position'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      statusMessagesToWatchdog(LEDCommands.ntripConf)
    } else {
      if (data[0]) {
        userDB.all(`SELECT value  FROM setting WHERE key = 'caster'`, (err, data) => {
          if (err) {
            console.error('there is an error from loading data from database : ****', err);
            statusMessagesToWatchdog(LEDCommands.ntripConf)
          } else {
            if (data[0]) {
              messagesToWatchdog(WDCommands.ntripStatus)
            } else {
              statusMessagesToWatchdog(LEDCommands.ntripConf)
            }
          }
        });
      } else {
        statusMessagesToWatchdog(LEDCommands.ntripConf)
      }
    }
  });
}

module.exports = { checkNTRIP }