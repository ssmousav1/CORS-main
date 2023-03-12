const SerialPort = require('serialport');
const cmd = require('node-cmd');
const logger = require('./middlewares/logger');

const logger = new logger().getInstance();


const writePort = new SerialPort("/dev/ttyO2", {
  baudRate: 115200
})

const commands = [
  `$JOFF,ALL\r\n`,

  `$JASC,GNGSA,1,PORTA\r\n`,
  `$JASC,GPGST,1,PORTA\r\n`,
  `$JASC,GPGSV,1,PORTA\r\n`,
  `$JASC,GLGSV,1,PORTA\r\n`,
  `$JASC,GAGSV,1,PORTA\r\n`,
  `$JASC,GBGSV,1,PORTA\r\n`,
  `$JASC,GPZDA,1,PORTA\r\n`,

  `$JEPHOUT,1\r\n `,
  `$JBIN,34,1,PORTB\r\n`,
  `$JBIN,94,1,PORTB\r\n`,
  `$JBIN,35,1,PORTB\r\n`,
  `$JBIN,45,1,PORTB\r\n`,
  `$JBIN,65,1,PORTB\r\n`,
  `$JBIN,95,1,PORTB\r\n`,
  `$JBIN,36,1,PORTB\r\n`,
  `$JBIN,66,1,PORTB\r\n`,
  `$JBIN,76,1,PORTB\r\n`,
  `$JBIN,16,1,PORTB\r\n`,

  `$JSAVE\r\n`
]

writePort.on('open', () => {
  console.log('<<< Port is Open >>>');
})

writePort.on('data', (data) => {
  console.log(data.toString());
})

let commandNumber = 0

while (commandNumber < commands.length) {
  writePort.write(commands[commandNumber])
  logger.log(`new Command of port : /dev/ttyO2     command : ${commands[commandNumber]}`);
  console.log(commands[commandNumber]);
  commandNumber++
}

if (commandNumber === commands.length) {
  console.log('finito');
  cmd.run(`pm2 start server.js`, (err, data, stderr) => {
    if (err) {
      console.log('error in running server.js >>>', err);
    } else {
      console.log('pm2 start server.js success', data);
      process.exit();
    }
  })
}

process.on('SIGINT', () => {
  writePort.close();
  process.exit();
})

