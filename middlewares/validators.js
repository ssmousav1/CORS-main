const { body } = require('express-validator');

const userValidator = () => {
  return [
    body('username').isString().isLength({ min: 4, max: 16 }),
    // body('password').isString().isLength({ min: 8, max: 16 })
  ]
}

const casterValidator = () => {
  return [
    body('hostAddress').isString().isIP(),
    body('port').isString().isPort(),
    body('mountpoint').isString(),
    // body('user').isString().isLength({ min: 4, max: 16 }),
    // body('pass').isString().isLength({ min: 8, max: 16 })
  ]

}

const networkValidator = () => {
  return [
    body('ip').isString().isIP(),
    body('subnet').isString().isIP(),
    body('gateway').isString().isIP(),
    body('nameserver').isString().isIP()
  ]

}

const positionValidator = () => {
  return [
    body('lat').isString().isDecimal({ force_decimal: false, decimal_digits: '8' }),
    body('lon').isString().isDecimal({ force_decimal: false, decimal_digits: '8' }),
    body('alt').isString().isDecimal({ force_decimal: false, decimal_digits: '4' })
  ]
}

const rawDataValidator = () => {
  return [
    body('filename').isString()
  ]
}

const rawDataConfigValidator = () => {
  return [
    body('rate').isString(),
    body('time').isString()
  ]
}

const managementValidator = () => {
  return [
    body('command').isString()
  ]
}

module.exports = { userValidator, casterValidator, networkValidator, positionValidator, rawDataValidator, rawDataConfigValidator, managementValidator };