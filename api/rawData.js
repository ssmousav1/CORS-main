const { userDB, rawFiles } = require('../DB');
const jwt = require('jsonwebtoken');
const Logger = require('../middlewares/logger');
const rawDataRoutes = require('express').Router();
const DownloadRawDataRoutes = require('express').Router();
const rawDataConfigRoutes = require('express').Router();
const { validationResult } = require('express-validator');
const eventEmitterBuilder = require('../helpers/globalEventEmitter');
const { extractRaw } = require('../helpers/rawData');
const { GPSdata } = require('./WS');

const logger = new Logger().getInstance();
const eventEmitter = new eventEmitterBuilder().getInstance();

rawDataRoutes.get('/', (req, res) => {
  rawFiles.all(`SELECT id, filename, size, timestamp  FROM raw_files`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'error in getting data from DB' });
    } else {
      res.status(200).json({ message: 'Connected!', payload: data });
    }
  })
});

rawDataRoutes.get('/archive-years', (req, res) => {
  rawFiles.get(`SELECT timestamp FROM raw_files WHERE ID = (SELECT MAX(ID) FROM raw_files)`, (err, lastData) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'error in getting data from DB' });
    } else {
      rawFiles.get(`SELECT timestamp FROM raw_files WHERE ID = (SELECT MIN(ID) FROM raw_files)`, (err, firstData) => {
        if (err) {
          console.error('there is an error from loading data from database : ****', err);
          res.status(500).json({ message: 'error in getting data from DB' });
        } else {
          let years = []
          if (firstData && lastData) {
            for (let year = new Date(parseInt(firstData.timestamp)).getFullYear(); year <= new Date(parseInt(lastData.timestamp)).getFullYear(); year++) {
              years.push(year)
            }
            res.status(200).json({
              message: 'Connected!',
              payload: { years }
            });
          } else {
            res.status(404).json({
              message: 'there is no raw data!'
            });
          }
        }
      })
    }
  })
});

DownloadRawDataRoutes.get('/:filename/:accesstoken', (req, res) => {
  const { filename, accesstoken } = req.params
  console.log(filename, '<<<<<<<<<<<<<< this is filename');
  jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret', (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'لطفا وارد شوید' });
    } else {
      logger.log(`${req.originalUrl} ${req.connection.remoteAddress}   ${req.method}   ${user.username}    ${user.userid} `)
      req.user = user;
      if (!!req.user.admin || !!req.user.file_download) {
        try {
          res.download(`./${filename}.bin`, error => {
            if (error) {
              console.log('there is no file ', error);
            } else {
              try {
              } catch (e) {
                console.error('@@@## error in deleteing files', e)
              }
            }
          })
        } catch (e) {
          res.status(500).json({ message: 'error in getting data from DB' });
        }
      } else {
        res.status(403).json({ message: 'you don not have the right access' });
      }
    }
  });

});

rawDataRoutes.post('/raw-data-daily', (req, res) => {

  const { year, month, day } = req.body

  rawFiles.all(`SELECT id, filename, size, timestamp FROM raw_files WHERE timestamp BETWEEN ${Date.parse(`${year}-${month}-${day} `)} AND ${Date.parse(`${year}-${month}-${day} `) + 86400000} `, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'خطا سرور در استخراج داده' });
    } else {
      if (data[0]) {
        res.status(200).json({ message: 'Connected!', payload: data });
      } else {
        res.status(404).json({ message: 'در این بازه زمانی اطلاعاتی ذخیره نشده است' });
      }
    }
  })
});

rawDataRoutes.put('/', (req, res) => {

  const errors = validationResult(req);
  if (!!req.user.admin || !!req.user.file_edit) {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      rawFiles.run(`UPDATE raw_files SET 
      filename = '${req.body.filename}'
      WHERE ID = ${req.body.id}`,
        (err) => {
          if (err) {
            console.error('there is an error from updating data in database : ===', err);
            res.status(500).json({ message: 'خطا سرور در ذخیره اطلاعات' });
          } else {
            res.status(200).json({ message: 'تغییرات با موفقیت ذخیره شد' });
          }
        });
    }
  } else {
    res.status(403).json({ message: 'شما دسترسی مورد نیاز را ندارید' });
  }
});

rawDataRoutes.delete('/', (req, res) => {
  const { filename } = req.body
  if (!!req.user.admin || !!req.user.file_delete) {
    rawFiles.run(`DELETE FROM raw_files WHERE filename = '${filename}'`, (err) => {
      if (err) {
        console.error('there is an error from deleting data from database : ===', err);
        res.status(500).json({ message: 'خطا سرور در حذف اطلاعات' });
      } else {
        res.status(203).json({ message: 'فایل با موفقیت حذف شد' });
      }
    });
  } else {
    res.status(403).json({ message: 'شما دسترسی مورد نیاز را ندارید' });
  }
});

rawDataConfigRoutes.get('/', (req, res) => {
  userDB.all(`SELECT value  FROM setting WHERE key = 'raw'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'error in getting data from DB' });
    } else {
      if (data[0]) {
        res.status(200).json({ message: 'Connected!', payload: JSON.parse(data[0].value) });
      } else {
        res.status(404).json({ message: 'there is no data!' });
      }
    }
  })
});

rawDataConfigRoutes.put('/', (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      status: 400
    });
  } else {

    const rawDataConfig = JSON.stringify({
      rate: req.body.rate,
      time: req.body.time,
    })
    userDB.run(`INSERT OR REPLACE INTO setting (key, value) values ('raw', '${rawDataConfig}')`, (err) => {
      if (err) {
        console.error('there is an error from inserting data into database : ===', err);
        res.status(500).json({
          message: 'خطا سرور در ذخیره اطلاعات',
          status: 500
        });
      } else {
        res.status(200).json({
          message: 'تغییرات با موفقیت ذخیره شد', payload:
          {
            rate: req.body.rate,
            time: req.body.time,
          },
          status: 200
        });
        eventEmitter.emit('rawDataTimeout', req.body.time)
      }
    });
  }
});


module.exports = { rawDataRoutes, rawDataConfigRoutes, DownloadRawDataRoutes };