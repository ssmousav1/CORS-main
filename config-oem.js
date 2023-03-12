const SerialPort = require('serialport');


const writePort = new SerialPort("/dev/ttyO4", {
  baudRate: 115200
})

const commands = [
  // Reset
  //    `$JOFF,PORTB\r\n`,

  `$JASC,GNGSA,1,PORTA\r\n`,
  `$JI\r\n`,
  `$JSHOW\r\n`


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
]

writePort.on('open', () => {
  console.log('<<< Port is Open >>>');
})

writePort.on('data', (data) => {
  console.log(data.toString());
})

commands.forEach(command => {
  writePort.write(command)
  console.log('config raw , command >>>', command);
})

process.on('SIGINT', () => {
  writePort.close();
  process.exit();
})

