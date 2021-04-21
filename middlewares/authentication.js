const jwt = require('jsonwebtoken');
require('dotenv').config();
const Logger = require('../middlewares/logger');

const logger = new Logger().getInstance();

const Auth = (req, res, next) => {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret', (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'لطفا وارد شوید' });
      } else {
        logger.log(`${req.originalUrl} ${req.connection.remoteAddress}   ${req.method}   ${user.username}    ${user.userid} `)
        req.user = user;
      }
      next();
    });
  } else {
    console.error("you need to have access token ")
    res.status(401).json({ message: 'لطفا وارد شوید' });
  }
}


module.exports = Auth;