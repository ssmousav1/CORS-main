const SerialPort = require('serialport');

export const setupOEM19 = () => {
	const rawDataPort = new SerialPort('/dev/ttyO4', {
		baudRate: 19200,
	});

	const commands = [
		// Reset
		`$JOFF,PORTA\r\n`,
		`$JOFF,PORTB\r\n`,
		`$JOFF,PORTC\r\n`,

		// Set baudrate
		`$JBAUD,115200,PORTA\r\n`,
		`$JBAUD,115200,PORTB\r\n`,
		`$JBAUD,115200,PORTC\r\n`,
	];

	rawDataPort.on('open', () => {
		console.log('Port is open: 19200');
		commands.forEach((command) => {
			rawDataPort.write(command);
			console.log('config port command:', command);
		});

		rawDataPort.close();
	});

	rawDataPort.once('close', () => {
		console.log('19200 >> Port is closed');
	});
};
