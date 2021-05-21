const SerialPort = require("serialport");

const rawDataPort = new SerialPort("/dev/ttyO2", {
  baudRate: 19200,
});

const commands = [
  // Reset
  `$JOFF,PORTB\r\n`,
  // RAW data
  `$JBIN,34,1,PORTB\r\n`,
  `$JBIN,35,1,PORTB\r\n`,
  `$JBIN,45,1,PORTB\r\n`,
  `$JBIN,65,1,PORTB\r\n`,
  `$JBIN,94,1,PORTB\r\n`,
  `$JBIN,95,1,PORTB\r\n`,
  `$JBIN,36,1,PORTB\r\n`,
  `$JBIN,66,1,PORTB\r\n`,
  `$JBIN,76,1,PORTB\r\n`,
  `$JBIN,16,1,PORTB\r\n`,
  `$JEPHOUT,60\r\n`,
  // Baudrate
  `$JBAUD,115200,PORTB\r\n`,
  // Save
  `$JSAVE\r\n`,

  // Reset
  `$JOFF,PORTA\r\n`,
  `$JASC,GNGSA,1,PORTA\r\n`,
  // Lat, lon position
  `$JASC,GPGGA,1,PORTA\r\n`,
  // In view sats
  `$JASC,GPGSV,1,PORTA\r\n`,
  `$JASC,GLGSV,1,PORTA\r\n`,
  `$JASC,GAGSV,1,PORTA\r\n`,
  `$JASC,GBGSV,1,PORTA\r\n`,
  // Time
  `$JASC,GPZDA,1,PORTA\r\n`,
  `$JASC,GPGST,1,PORTA\r\n`,
  // Baudrate
  `$JBAUD,115200,PORTA\r\n`,
  // Save
  `$JSAVE\r\n`,
];

rawDataPort.on("open", () => {
  console.log("Port is open");
  commands.forEach((command) => {
    rawDataPort.write(command);
    console.log("config port command:", command);
  });

  rawDataPort.close();
});

rawDataPort.once("close", () => {
  console.log("Port is closed");
});
