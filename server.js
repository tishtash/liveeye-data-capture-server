const net = require('net');
const server = net.createServer();

const start = () => {
	server.listen({
		port: 8000
	}, () => {
		console.log(`Opened Server on `, server.address());
	})

	server.on('error', (err) => {
		console.log(`Error:: ${err}`);
	})

	server.on('connection', (socket) => {
		console.log('A Connection Has Been Established');
		socket.write(Buffer.from('Live Eye Surveillance.\nData Capture Processor Has Been Initialized\n'));
		let intervalVar = setInterval(() => socket.write(Buffer.from('Testing \n')), 5000);

		socket.on('error', (err) => {
			console.log(`Socket Errored out ${err}`);
		})

		socket.on('end', () => {
			clearInterval(intervalVar);
			console.log('Closing connection with the socket');
		})
	})
}

module.exports = {
	start: start
}