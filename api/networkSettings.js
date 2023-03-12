const { userDB } = require('../DB');
const networkRoutes = require('express').Router();
const { validationResult } = require('express-validator');
// const { messagesToWatchdog } = require("../helpers/watchdogInterface");
// const { WDCommands } = require('../helpers/messages');
const { setNetwork } = require('../helpers/netConfig');

networkRoutes.get('/', (req, res) => {
  userDB.all(`SELECT value  FROM setting WHERE key = 'network'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'خطا در دریافت اطلاعات' });
    } else {
      if (data[0]) {
        res.status(200).json({ payload: JSON.parse(data[0].value) });
      } else {
        res.status(200);
      }
    }
  });
});

networkRoutes.put('/', (req, res) => {

  const errors = validationResult(req);


  if (!!req.user.admin || !!req.user.network_config) {
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        status: 400
      });
    } else {
      setNetwork({
        ip: req.body.ip,
        mask: req.body.subnet,
        gateway: req.body.gateway,
        nameserver: req.body.nameserver
      }).then(data => {
        const networkNewData = JSON.stringify({
          ip: data.ip,
          subnet: data.mask,
          gateway: data.gateway,
          nameserver: req.body.nameserver
        })
        userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('network', '${networkNewData}')`, (err) => {
          if (err) {
            console.error('there is an error from inserting data into database : ===', err);
            res.status(500).json({
              message: 'خطا در ذخیره اطلاعات',
              status: 500
            });
          } else {
            res.status(200).json({
              message: 'اطلاعات با موفقیت تغییر کرد', payload:
              {
                ip: data.ip,
                subnet: data.mask,
                gateway: data.gateway,
                nameserver: req.body.nameserver
              },
              status: 200
            });

          }
        });
      }).catch(err => {
        res.status(500).json({
          message: 'خطا در اعمال اطلاعات',
          status: 500
        });
      })

    }
  } else {
    res.status(403).json({
      message: 'شما مجاز به انجام این کار نیستید',
      status: 403
    });
  }
});

module.exports = networkRoutes;