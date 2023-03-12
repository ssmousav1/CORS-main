const { userDB } = require('../DB');
const routes = require('express').Router();
const saltHashPassword = require('../helpers/saltGenerator');
const { validationResult } = require('express-validator');


routes.get('/', (req, res) => {
  if (req.body.username) {
    userDB.all(`SELECT username, admin, network_config, file_download, file_edit, ntrip_config,file_delete, id  FROM users WHERE username = '${req.body.username}'`, (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
        res.status(500).json({ message: 'خطا در دریافت اطلاعات' });
      } else {
        res.status(200).json({ payload: data });
      }
    });
  } else {
    userDB.all("SELECT username, admin, network_config, file_download, file_edit,file_delete, ntrip_config, id  FROM users", (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
        res.status(500).json({ message: 'خطا در دریافت اطلاعات' });
      } else {
        res.status(200).json({ payload: data });
      }
    });
  }
});

routes.post('/', (req, res) => {

  const errors = validationResult(req);
  const {
    username,
    password,
    admin,
    network_config,
    file_download,
    file_edit,
    file_delete,
    ntrip_config } = req.body

  if (admin) {
    return res.status(400).json({ message: ' شما توانایی ساخت کاربر با دسترسی مدیر ندارید' });
  }

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: 'لطفا تمام فیلد ها را به درستی پر کنید' });
  } else {
    userDB.run('INSERT INTO users (username, password, admin, network_config, file_download, file_edit, file_delete, ntrip_config) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        saltHashPassword(password, username).passwordHash,
        admin,
        network_config,
        file_download,
        file_edit,
        file_delete,
        ntrip_config
      ], (err) => {
        if (err) {
          console.error('there is an error from inserting data into database : ===', err);
          res.status(500).json({ message: 'خطا سرور در ذخیره اطلاعات' });
        } else {
          res.status(200).json({ message: 'کاربر جدید با موفقیت ساخته شد' });
        }
      });
  }

});

routes.delete('/', (req, res) => {
  const { userId } = req.body

  userDB.all(`SELECT admin FROM users WHERE ID = '${userId}'`, (err, data) => {
    if (err) {
      console.error('there is an error from loading data from database : ****', err);
      res.status(500).json({ message: 'خطا در استخراج داده از دیتابیس' });
    } else {
      if (data[0].admin) {
        res.status(400).json({ message: 'شما توانایی حذف مدیر سیستم را ندارید' });
      } else {
        userDB.run(`DELETE FROM users WHERE ID = ${userId}`, (err) => {
          if (err) {
            console.error('there is an error from deleting data from database : ===', err);
            res.status(500).json({ message: 'خطا در حذف کاربر' });
          } else {
            res.status(203).json({ message: 'کاربر با موفقیت حذف شد' });
          }
        });
      }
    }
  });
});

routes.put('/', (req, res) => {
  const errors = validationResult(req);
  const {
    username,
    admin,
    network_config,
    file_download,
    file_edit,
    file_delete,
    ntrip_config,
    id
  } = req.body


  if (admin) {
    return res.status(400).json({ message: 'شما توانایی ساخت کاربر با دسترسی مدیر سیستم' });
  }


  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ' خطا در ورودی های ارسال شده ' });
  } else {

    userDB.all(`SELECT username, admin, network_config, file_download, file_edit, ntrip_config, password, id  FROM users WHERE ID = ${id}`, async (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
        res.status(500).json({ message: 'خطا در استخراج اطلاعات ' });
      } else {
        if (req.user.admin || req.user.username === data[0].username) {
          if (data[0]) {
            userDB.run(`UPDATE users SET 
              username = '${username}',
              network_config = ${network_config}, 
              file_download = ${file_download}, 
              file_edit = ${file_edit}, 
              file_delete = ${file_delete}, 
              ntrip_config = ${ntrip_config}
              WHERE ID = ${id}`,
              (err) => {
                if (err) {
                  console.error('there is an error from updating data in database : ===', err);
                  res.status(500).json({ message: 'خطا سرور در ذخیره تغییرات' });
                } else {
                  res.status(200).json({ message: 'تغییرات با موفقیت ذخیره شد' });
                }
              });

          } else {
            res.status(400).json({ message: 'این کاربر وجود ندارد' });
          }
        }
      }
    });
  }
});


routes.put('/password', (req, res) => {
  const errors = validationResult(req);
  const {
    admin,
    id,
    new_password,
    old_password
  } = req.body


  if (admin) {
    return res.status(400).json({ message: 'شما توانایی ساخت کاربر با دسترسی مدیر سیستم' });
  }


  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: ' خطا در ورودی های ارسال شده ' });
  } else {

    userDB.all(`SELECT username, admin, network_config, file_download, file_edit, ntrip_config, password, id  FROM users WHERE ID = ${id}`, async (err, data) => {
      if (err) {
        console.error('there is an error from loading data from database : ****', err);
        res.status(500).json({ message: 'خطا در استخراج اطلاعات ' });
      } else {
        if (data[0]) {
          if (req.user.admin || (old_password && data[0].password === saltHashPassword(old_password, req.user.username).passwordHash)) {
            userDB.run(`UPDATE users SET 
            password = '${saltHashPassword(new_password, data[0].username).passwordHash}'
            WHERE ID = ${id}`,
              (err) => {
                if (err) {
                  console.error('there is an error from updating data in database : ===', err);
                  res.status(500).json({ message: 'خطا سرور در ذخیره تغییرات' });
                } else {
                  res.status(200).json({ message: 'تغییرات با موفقیت ذخیره شد' });
                }
              });

          } else {
            res.status(401).json({ message: 'رمز عبور را وارد کنید' });
          }
        } else {
          res.status(400).json({ message: 'این کاربر وجود ندارد' });
        }
      }
    });
  }
});

module.exports = routes;