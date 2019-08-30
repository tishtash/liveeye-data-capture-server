const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

class LiveEyeSerialPort {
    constructor(portName) {
        this.portName = portName;
    }

    setServer(server){
        this.server = server;
    }

    initializePort() {
        this.setupPort();
        this.setupParser();
        this.readPort();
    }

    setupPort() {
        this.portName = new SerialPort(this.portName, {
            baudRate: 9600,
            autoOpen: false,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            xon: true,
            xoff: true
        })
    }

    setupParser() {
        this.parser = new Readline({
            delimiter: '\r\n'
        });
        this.portName.pipe(this.parser);
    }

    readPort() {
        this.portName.open((err) => {
            if (err) {
                console.log('Error Opening Port: ', err);
            }
        });

        this.parser.on('data', (data) => {
            if (data) {
                this.server.writeData(data);
            }
        })
    }
}

module.exports = LiveEyeSerialPort;