const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const tcpServer = require('./server.js');

let comName;
let port;

const getComList = () => {
	return new Promise((resolve, reject) => {
		SerialPort.list().then(
			ports => resolve(ports),
			err => reject(err)
		)
	})
}

const setComName = async () => {
	try {
		let comList = await getComList();
		comName = comList[0].comName;
	} catch (err) {
		console.log(err);
	}
}

const setupPort = (portName) => {
	port = new SerialPort(portName, {
		baudRate: 9600,
		autoOpen: false,
		dataBits: 8,
		stopBits: 1,
		parity: 'none',
		xon: true,
		xoff: true
	})
}

const readPort = () => {
	port.open((err) => {
		if (err) {
			console.log('Error Opening Port: ', err);
		}
	})

	const parser = new ReadLine();

	port.pipe(parser);

	port.on('data', (data) => {
		if (data) {
			console.log(data.toString());
		}
	})
}

async function Init() {
	await setComName();
	console.log(comName);
	setupPort(comName);
	//console.log(port);
}

Init();
tcpServer.start();