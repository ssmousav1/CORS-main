const fs = require('fs');
const { GPSdata } = require('../api/WS');

const monthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
class Logger {

  constructor() {
    this.logs = [];
  }

  get count() {
    return this.logs.length;
  }

  checkFiles() {
    const date = GPSdata.time;
    const lastDate = new Date(new Date(date).getTime() - (30 * 24 * 60 * 60 * 1000));
    const fileName = lastDate.getFullYear() + '-' + monthes[lastDate.getMonth()] + '-' + lastDate.getDate();
    if (fs.existsSync(`./logs/${fileName}.log`)) {
      fs.unlinkSync(`./logs/${fileName}.log`, () => { });
    }
  }

  async log(message) {
    console.log('this is logger and this  is msg : ', message);
    this.checkFiles();
    const date = new Date(GPSdata.time);
    const fileName = date.getFullYear() + '-' + monthes[date.getMonth()] + '-' + date.getDate();
    if (fs.existsSync(`./logs/${fileName}.log`)) {
      await fs.readFile(`./logs/${fileName}.log`, 'utf8', (err, data) => {
        fs.writeFile(`./logs/${fileName}.log`, data + new Date(Date.now()) + '   :' + message + '\n', (e) => {
          if (e) {
            console.log('error in writin ', e)
          }
        });
      })
    } else {
      fs.writeFile(`./logs/${fileName}.log`, new Date(Date.now()) + '   :' + message + '\n', (e) => {
        if (e) {
          console.log('error in writin ', e)
        }
      });
    }
  }

}

class Singleton {

  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new Logger();
    }
  }

  getInstance() {
    return Singleton.instance;
  }

}

module.exports = Singleton;
