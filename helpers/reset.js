const  { userDB } = require("../DB");

const resetConfig = () => {
  return new Promise(
    (resolve, reject) => {
      userDB.run(`DELETE FROM setting WHERE key = 'position'`, (err) => {
        if (err) {
          console.error('there is an error from inserting data into database : ===', err);
          reject(false)
        } else {
          userDB.run(`DELETE FROM setting WHERE key = 'caster'`, (err) => {
            if (err) {
              console.error('there is an error from inserting data into database : ===', err);
              reject(false)
            } else {
              userDB.run(`DELETE FROM users WHERE admin = 0`, (err) => {
                if (err) {
                  console.error('there is an error from deleting data from database : ===', err);
                  reject(false)
                } else {
                  userDB.run(`DELETE FROM raw_files`, (err) => {
                    if (err) {
                      console.error('there is an error from deleting data from database : ===', err);
                      reject(false)
                    } else {
                      resolve(true)
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  )

}

module.exports = resetConfig