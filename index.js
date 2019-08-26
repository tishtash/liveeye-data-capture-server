const SerialPort = require('serialport');
const LiveEyeSerialPort = require('./serialport');
const tcpServer = require('./server.js');

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
		let server = new tcpServer();
		server.initializeConnection();
		
		for (let idx = 0; idx < comList.length; idx++) {
			console.log(comList[idx].comName);
			let serialPort = new LiveEyeSerialPort(comList[idx].comName);
			serialPort.initializePort();
			serialPort.setServer(server);
		}
	} catch (err) {
		console.log(err);
	}
}


async function Init() {
	await setComName();
}

Init();