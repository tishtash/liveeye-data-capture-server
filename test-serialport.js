const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

let portMapper = {};
const getComList = () => {
  return new Promise((resolve, reject) => {
    SerialPort.list().then(ports => resolve(ports), err => reject(err));
  });
};

const init = async () => {
  const comList = await getComList();
  console.log(`Detected ${comList.length} ports on the device.\n`);
  for (let idx = 0; idx < comList.length; idx++) {
    setupPort(comList[idx].comName);
    setupParser(comList[idx].comName);
    readPort(comList[idx].comName);
  }
};

const setupPort = portName => {
  console.log(`Setting up port ${portName}.`);
  portMapper[portName] = new SerialPort(portName, {
    baudRate: 9600,
    autoOpen: false,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    xon: true,
    xoff: true
  });
};

const setupParser = portName => {
  console.log(
    `Setting up parser delimiter (/r /n) on ${portName} for reading.`
  );
  let parser = new Readline({
    delimiter: "\r\n"
  });
  portMapper[portName].pipe(parser);
};

const readPort = portName => {
  portMapper[portName].open(err => {
    if (err) {
      console.log(
        `${new Date()}::Error While Opening Port ${portName}:: ${err}`
      );
    }
  });

  console.log(`Setting up listner on ${portName} to reading data\n`);
  portMapper[portName].on("data", data => {
    console.log(`${portName}::${data.toString()}`);
  });
};

init();
