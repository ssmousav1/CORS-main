const authRouter = require('express').Router();

authRouter.post('/login', (req, res) => {
  if (req.auth) {
    res.status(200).json({ message: 'authRouter this is login!', payload: { access_token: req.access_token, userInfo: req.user } });
  } else {
    res.status(401).json({ message: 'unauthorized please login first' });
  }
});

authRouter.post('/logout', (req, res) => {
  res.status(200).json({ message: 'authRouter! put' });
});

authRouter.get('/verify-token', (req, res) => {
  res.status(200).json({ message: 'authRouter! put', payload: { userInfo: req.user } });
});

module.exports = authRouter;