const { userDB } = require('../DB');
const casterRoutes = require('express').Router();
const { validationResult } = require('express-validator');
// const { killNTRIP, startNTRIP } = require('../helpers/NTRIP');
// const { messagesToWatchdog } = require('../helpers/watchdogInterface');
// const { WDCommands } = require('../helpers/messages');
const { restartProcess } = require('../helpers/NTRIPConfig');

casterRoutes.get('/', (req, res) => {
  userDB.all(`SELECT value  FROM setting WHERE key = 'caster'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'error in getting data from DB' });
    } else {
      if (data[0]) {
        res.status(200).json({ message: 'Connected caster!', payload: JSON.parse(data[0].value) });
      } else {
        res.status(200).json({ message: 'Connected caster! there is no data' });
      }
    }
  });
});

casterRoutes.put('/', (req, res) => {

  const errors = validationResult(req);
  const casterNewData = JSON.stringify({
    host: req.body.host,
    port: req.body.port,
    mountpoint: req.body.mountpoint,
    user: req.body.user,
    pass: req.body.pass
  })

  if (!!req.user.admin || !!req.user.ntrip_config) {
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        status: 400
      });
    } else {
      userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('caster', '${casterNewData}')`, (err) => {
        if (err) {
          console.error('there is an error from inserting data into database : ===', err);
          res.status(500).json({
            message: 'خطا در به روزرسانی اطلاعات', action: "خطای سرور",
            status: 500
          });
        } else {
          // messagesToWatchdog(WDCommands.ntripNew, {
          //   host: req.body.host,
          //   port: req.body.port,
          //   mountpoint: req.body.mountpoint,
          //   user: req.body.user,
          //   pass: req.body.pass
          // })
          // TODO comment this function to disable using WD helpers 
          // ps : test it !!
          restartProcess({
            host: req.body.host,
            port: req.body.port,
            mountpoint: req.body.mountpoint,
            user: req.body.user,
            pass: req.body.pass
          })
          res.status(200).json({
            message: 'اطلاعات با موفقیت به روزرسانی شد', payload: {
              host: req.body.host,
              port: req.body.port,
              mountpoint: req.body.mountpoint,
              user: req.body.user,
              pass: req.body.pass
            },
            action: "به روزرسانی NTRIP",
            status: 200
          });
          // messagesToWatchdog(WDCommands.ntripStatus)
        }
      });
    }
  } else {
    res.status(403).json({
      message: 'شما دسترسی به این تنظیمات ندارید',
      status: 403
    });
  }
});

module.exports = casterRoutes;
