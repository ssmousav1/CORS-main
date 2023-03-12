const SerialPort = require('serialport');
const cmd = require('node-cmd');
const logger = require('./middlewares/logger');


const logger = new logger().getInstance();

const writePort = new SerialPort("/dev/ttyO4", {
  baudRate: 19200
})

const commands = [
  `$JOFF,ALL\r\n`,
  `$JBAUD,115200,PORTA,SAVE\r\n`,
  `$JBAUD,115200,PORTB,SAVE\r\n`,
  `$JBAUD,115200,PORTC,SAVE\r\n`,
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
  logger.log(`new Command of port : /dev/ttyO4     command : ${commands[commandNumber]}`);
  console.log(commands[commandNumber]);
  commandNumber++
}

if (commandNumber === commands.length) {
  console.log('finito');
  cmd.run(`node configs115.js`, (err, data, stderr) => {
    if (err) {
      console.log('error in running configs115.js >>>', err);
    } else {
      console.log('node configs115.js success', data);
      process.exit();
    }
  })
}

process.on('SIGINT', () => {
  writePort.close();
  process.exit();
})


