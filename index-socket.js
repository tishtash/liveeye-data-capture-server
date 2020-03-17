const Server = require("socket.io");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const io = new Server(8000, { path: "/data" });
let socketReference = null;
let logOnce = true;
let portRefMapper = {};
console.log(`${new Date()}::Server Started`);

const getComList = () => {
  return new Promise((resolve, reject) => {
    SerialPort.list().then(ports => resolve(ports), err => reject(err));
  });
};

io.on("connection", function(socket) {
  if (socketReference !== null) {
    console.log(
      `An existing connection is alive ${socketReference.id}. Killing the connection`
    );
    socketReference.disconnect(true);
  }
  console.log(`${new Date()}::A User Has Been Connected`);
  setSocket(socket);
  socket.on("disconnect", function(reason) {
    console.log(`${new Date()}::User Disconnected`);
    console.log(`Reason:: ${reason}`);
    socket.disconnect(true);
    Object.keys(portRefMapper).map(portName => {
      if (portRefMapper[portName].isOpen) {
        portRefMapper[portName].close();
      }
    });
    socketReference = null;
    logOnce = true;
  });

  comPortSetup(socket);
});

const setSocket = socket => {
  console.log(`${new Date()}::Setting Socket - ${socket.id}`);
  socketReference = socket;
};

const getSocket = () => socketReference;

const comPortSetup = async socketRef => {
  try {
    // let comList = [{}, { comName: "Data-1" }, { comName: "Data-2" }];
    let comList = await getComList();

    for (let idx = 1; idx < comList.length; idx++) {
      console.log(comList[idx].comName);
      // socketRef.emit("Connection-List", comList[idx].comName);
      io.to(`${socketRef.id}`).emit(("Connection-List", comList[idx].comName));
      // emitDummyData(comList[idx].comName);
      let portRef = getPortObj(comList[idx].comName);
      portRefMapper[comList[idx].comName] = portRef;
      readPort(portRef, comList[idx].comName);
    }
  } catch (err) {
    console.log(`${new Date()}::${err}`);
  }
};

const getPortObj = portName => {
  let portRef = new SerialPort(portName, {
    baudRate: 9600,
    autoOpen: true,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    xon: true,
    xoff: true
  });
  return portRef;
};

const readPort = (portRef, portName) => {
  // portRef.open(err => {
  //   if (err) {
  //     console.log(`${new Date()}::Error Opening Port::${err}`);
  //   }
  // });

  // setupParser(portName);

  portRef.on("data", data => {
    if (data) {
      const socketObj = getSocket();
      if (socketObj !== null) {
        if (logOnce) {
          console.log(`${new Date()}::Received Socket ID::${socketObj.id}`);
          logOnce = false;
        }
        io.to(`${socketObj.id}`).emit((`${portName}`, data));
        // socketObj.emit(portName, data);
      }
    }
  });

  portRef.on("error", err => {
    console.log(`${new Date()}::Error Event Received On Port::${err}`);
  });

  portRef.on("close", closeData => {
    console.log(`${new Date()}::Close Event Received On Port::${closeData}`);
  });
};

const setupParser = portName => {
  const parser = new Readline({
    delimiter: "\r\n"
  });
  portName.pipe(parser);
  return parser;
};

const emitDummyData = portName => {
  const socketObj = getSocket();
  console.log(`${new Date()}::Received Socket ID::${socketObj.id}`);
  setInterval(() => socketObj.emit(portName, `Testing - ${portName}`), 3000);
};
