const crypto = require('crypto');

const genRandomString = function (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length);   /** return required number of characters */
};


const sha512 = function (password, salt) {
  const hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value
  };
};


const saltHashPassword = (userpassword, salt) => {
  // const salt = genRandomString(16); /** Gives us salt of length 16 */
  const passwordData = sha512(userpassword, salt);
  // console.log('UserPassword = ' + userpassword);
  // console.log('Passwordhash = ' + passwordData.passwordHash);
  // console.log('nSalt = ' + passwordData.salt);
  return passwordData
}

// saltHashPassword('MYPASSWORD')
// console.log(saltHashPassword('MYPASSWORD') === saltHashPassword('MYPASSWORD'));

module.exports = saltHashPassword;