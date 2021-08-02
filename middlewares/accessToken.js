const  { userDB } = require("../DB");
const jwt = require('jsonwebtoken');
const saltHashPassword = require("../helpers/saltGenerator");
require('dotenv').config();
const Logger = require('../middlewares/logger');

const logger = new Logger().getInstance();

const accessToken = async (req, res, next) => {
	console.log('req >>>>>>>>>>>>>>>>>>')
	if (req.headers.authorization) {
		jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret', (err, user) => {
			if (err) {
				try {
					userDB.all(`SELECT username, admin, network_config, file_download, file_delete, file_edit, ntrip_config, password, id  FROM users WHERE username = '${req.body.username}'`, async (err, data) => {
						if (err) {
							console.error('there is an error from loading data from database : ****', err);
							res.status(500).json({ message: 'error in getting data from DB' });
						} else {
							if (data[0]) {
								req.auth = (data[0].password === saltHashPassword(req.body.password, req.body.username).passwordHash)

								const accessToken = jwt.sign({
									username: data[0].username,
									admin: data[0].admin,
									network_config: data[0].network_config,
									file_download: data[0].file_download,
									file_delete: data[0].file_delete,
									file_edit: data[0].file_edit,
									ntrip_config: data[0].ntrip_config,
									userid: data[0].id
								}, process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret', { expiresIn: '1h' })

								logger.log(`${req.originalUrl}  ${req.connection.remoteAddress} ${req.method}   ${data[0].username}    ${data[0].id} `)

								req.access_token = accessToken
								req.user = {
									username: data[0].username,
									admin: data[0].admin,
									network_config: data[0].network_config,
									file_download: data[0].file_download,
									file_edit: data[0].file_edit,
									file_delete: data[0].file_delete,
									ntrip_config: data[0].ntrip_config,
									userid: data[0].id
								}

								next()
							} else {
								res.status(400).json({ message: 'کاربری با این نام وجود ندارد' });
							}
						}
					});
				} catch (error) {
					res.status(400).json({ message: 'خطایی رخ داده دوباره امتحان کنید' });
				}
			} else {
				logger.log(`${req.originalUrl} ${req.connection.remoteAddress}  ${req.method}   ${user.username}    ${user.userid} `)
				res.status(200).json({ message: 'authorized!', payload: { userInfo: user } });
			}
		});
	} else {
		res.status(401).json({ message: 'please send token' });
	}
}


module.exports = accessToken;
