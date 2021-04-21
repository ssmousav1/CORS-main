const { smokeTest } = require("../helpers/messages");
const { messagesToWatchdog } = require("../helpers/watchdogInterface");
const sqlite3 = require("sqlite3").verbose();

let userDB = new sqlite3.Database('./user.db', (err) => {
  if (err) {
    console.error(err.message);
    messagesToWatchdog(smokeTest.userDBFail)
  } else {
    console.log('Connected to the database.');
    messagesToWatchdog(smokeTest.userDBOk)
    createUserTable()
    createSettingsTable()
    // createRawDataFiles()
  }
});

let rawFiles = new sqlite3.Database('./raw.db', (err) => {
  if (err) {
    console.error(err.message);
    messagesToWatchdog(smokeTest.rawDBFail)
  } else {
    messagesToWatchdog(smokeTest.rawDBOk)
    console.log('raw DB created');
    createRawDataFiles()
  }
});


const createUserTable = () => {
  console.log("create database table users");
  userDB.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT UNIQUE,
    password TEXT,
    admin ,
    network_config ,
    file_download ,
    file_delete ,
    file_edit ,
    ntrip_config
    )`);
}

const createSettingsTable = () => {
  console.log("create database table setting");
  userDB.run(`CREATE TABLE IF NOT EXISTS setting(
    key TEXT UNIQUE,
    value TEXT 
    )`, (err, res) => {
    if (err) {
      console.error(err);
    }
  })
}

const createRawDataFiles = () => {
  console.log("create database table raw data files");
  rawFiles.run(`CREATE TABLE IF NOT EXISTS raw_files (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		filename TEXT NOT NULL UNIQUE,
		timestamp TEXT NOT NULL UNIQUE,
		size INTEGER NOT NULL,
		file BLOB NOT NULL
    )`, (err, res) => {
    if (err) console.log(err);
  })
    ;
}


module.exports = { userDB, rawFiles };
