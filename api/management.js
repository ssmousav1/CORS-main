const managementRouter = require('express').Router();
const eventEmitterBuilder = require('../helpers/globalEventEmitter');
const { validationResult } = require('express-validator');
const { userDB } = require('../DB');
const Logger = require('../middlewares/logger');
const resetConfig = require('../helpers/reset');
const netAccess = require('../helpers/netAccess');
// const { messagesToWatchdog } = require('../helpers/watchdogInterface');
// const { WDCommands } = require('../helpers/messages');
const { startProcess, stopProcess, restartProcess } = require('../helpers/NTRIPConfig');

const eventEmitter = new eventEmitterBuilder().getInstance();
const logger = new Logger().getInstance();

const allowedCommands = ['reboot', 'reset', 'startNTRIP', 'newNTRIP', 'stopNTRIP', 'restartNTRIP', 'update', 'SSHOn', 'SSHOff']

managementRouter.get('/netaccess', (req, res) => {
  netAccess()
    .then(respond => {
      res.status(200).json({ net_access: !respond })
    })
    .catch(error => {
      res.status(500).json({ message: 'there was an error ' })
    })
})

managementRouter.get('/ssh', (req, res) => {
  userDB.all(`SELECT value FROM setting WHERE key = 'ssh'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'error in getting data from DB' });
    } else {
      if (data[0]) {
        res.status(200).json({ message: 'Connected!', payload: parseInt(data[0].value) });
      }
    }
  });
})

managementRouter.post('/', (req, res) => {
  const errors = validationResult(req);
  const { command, data } = req.body

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: 'خطا در ارسال دستور' });
  } else {
    logger.log(`${req.originalUrl} ${req.connection.remoteAddress}  ${req.method} ${command}   ${req.user.username}    ${req.user.userid} `)
    if (allowedCommands.includes(command)) {
      eventEmitter.emit(`management:${command}`)
      handleManageCommands(command, res, data)
    } else {
      res.status(404).json({ message: 'دستور اشتباه ' });
    }
  }
});

managementRouter.post('/update', async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).json({
        message: 'فایلی ارسال نشد'
      });
    } else {
      const updateFile = req.files.updateFile;
      console.log(updateFile);

      updateFile.mv('./uploads/' + updateFile.name);

      //send response
      res.status(200).json({
        message: 'فایل با موفقیت ارسال شد',
        action: 'ارسال فایل آپدیت ',
        payload: {
          name: updateFile.name,
          mimetype: updateFile.mimetype,
          size: updateFile.size
        }
      });
      eventEmitter.emit(`management:update`)
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

const handleManageCommands = (command, res, data) => {
  console.log(command);
  switch (command) {
    case 'SSHOn':
      userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ssh', '1')`, (err) => {
        if (err) {
          console.error('there is an error from inserting data into database : ===', err);
          res.status(500).json({ message: 'خطا سرور در ذخیره ' });
        } else {
          res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
          // messagesToWatchdog(WDCommands.sshOn)
        }
      })
      break;
    case 'SSHOff':
      userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('ssh', '0')`, (err) => {
        if (err) {
          console.error('there is an error from inserting data into database : ===', err);
          res.status(500).json({ message: 'خطا در ذخیره تغییرات' });
        } else {
          res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
          // messagesToWatchdog(WDCommands.sshOff)
        }
      })
      break;
    case 'startNTRIP':
      // TODO test this !!
      // TODO IMPORTANT : remember to get data from DB **************
      startProcess()
      // messagesToWatchdog(WDCommands.ntripStart)
      res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
      break;
    case 'stopNTRIP':
      // TODO test this !!
      stopProcess()
      // messagesToWatchdog(WDCommands.ntripStop)
      res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
      break;
    case 'restartNTRIP':
      // TODO test this !!
      restartProcess()
      // messagesToWatchdog(WDCommands.ntripRestart)
      res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
      break;
    case 'newNTRIP':
      // TODO test this !!
      // createNTRIP(data)
      startProcess()
      console.log(data);
      // messagesToWatchdog(WDCommands.ntripRestart, data)
      res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
      break;
    case 'reboot':
      // send restart msg to watchdog
      // messagesToWatchdog(WDCommands.sysReboot)
      res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
      break;
    case 'reset':
      resetConfig()
        .then(respond => {
          if (respond) {
            res.status(200).json({ message: `فرمان با موفقیت ارسال شد` });
          } else {
            res.status(500).json({ message: `خطا در اجرای فرمان` });
          }
        })
        .catch(error => {
          console.error('there is an error from calling reset command >>>', error)
          res.status(500).json({ message: `خطا در اجرای فرمان` });
        })
      break;
    default:
      break;
  }
}


module.exports = managementRouter;