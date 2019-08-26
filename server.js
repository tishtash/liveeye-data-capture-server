const net = require('net');
const server = net.createServer();

class tcpServer {
	constructor() {
		this.socketRef = null;
	}


	initializeConnection() {
		this.setupServer();
		this.startConnection();
	}

	setupServer() {
		server.listen({
			port: 8000
		}, () => {
			console.log(`Opened Server on `, server.address());
		})
	}

	startConnection() {
		server.on('error', (err) => {
			this.socketRef = null;
			console.log(`Error:: ${err}`);
		})

		server.on('connection', (socket) => {
			console.log('A Connection Has Been Established');
			this.socketRef = socket;

			socket.on('error', (err) => {
				this.socketRef = null;
				console.log(`Socket Errored out ${err}`);
			})

			socket.on('end', () => {
				this.socketRef = null;
				console.log('Closing connection with the socket');
			})
		})
	}

	writeData(bufferData) {
		if(this.socketRef) {
			this.socketRef.write(bufferData);
		}
	}
}

module.exports = tcpServer;