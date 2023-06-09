const { userDB } = require('../DB');
const positionsRoutes = require('express').Router();
// const cmd = require('node-cmd');
const { validationResult } = require('express-validator');
const { configRTCM } = require('../helpers/configPorts');
const { NMEAPort } = require('../helpers/globalPorts');

positionsRoutes.get('/', (req, res) => {
  userDB.all(`SELECT value  FROM setting WHERE key = 'position'`, (err, data) => {
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

positionsRoutes.put('/', (req, res) => {
  const errors = validationResult(req);
  const positionNewData = JSON.stringify({
    lat: req.body.lat,
    lon: req.body.lon,
    alt: req.body.alt
  })

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      status: 400
    });
  } else {

    userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('position', '${positionNewData}')`, (err) => {
      if (err) {
        console.error('there is an error from inserting data into database : ===', err);
        res.status(500).json({
          message: 'خطا در ذخیره تغییرات',
          status: 500
        });
      } else {
        res.status(200).json({
          message: 'اطلاعات با موفقیت تغییر کرد', payload:
          {
            lat: req.body.lat,
            lon: req.body.lon,
            alt: req.body.alt
          },
          status: 200
        });

        console.log('****** config RTCM ******', {
          lat: req.body.lat,
          lon: req.body.lon,
          alt: req.body.alt
        });
        configRTCM(NMEAPort, {
          lat: req.body.lat,
          lon: req.body.lon,
          alt: req.body.alt
        })

      }
    });
  }
});

module.exports = positionsRoutes;