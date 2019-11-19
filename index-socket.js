const Server = require("socket.io");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const io = new Server(8000, { path: "/data" });
let initialConnection = true;
console.log(`${new Date()}::Server Started`);

const getComList = () => {
  return new Promise((resolve, reject) => {
    SerialPort.list().then(ports => resolve(ports), err => reject(err));
  });
};

io.on("connection", function(socket) {
  console.log(`${new Date()}::A User Has Been Connected`);

  socket.on("disconnect", function() {
    console.log(`${new Date()}::User Disconnected`);
    initialConnection = false;
  });

  comPortSetup(socket);
});

const comPortSetup = async socketRef => {
  try {
    let comList = [{}, { comName: "Data-1" }, { comName: "Data-2" }];
    // let comList = await getComList();

    for (let idx = 1; idx < comList.length; idx++) {
      console.log(comList[idx].comName);
      socketRef.emit("Connection-List", comList[idx].comName);

      // setInterval(
      //   () =>
      //     socketRef.emit(
      //       comList[idx].comName,
      //       `Testing - ${comList[idx].comName}`
      //     ),
      //   3000
      // );

      if (initialConnection) {
        console.log(`${new Date()}::Opening a New Connection`);
        let portRef = getPortObj(comList[idx].comName);
        readPort(portRef, comList[idx].comName, socketRef);
      } else {
        console.log(`${new Date()}::Using Existing Connection`);
      }
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

const readPort = (portRef, portName, socket) => {
  // portRef.open(err => {
  //   if (err) {
  //     console.log(`${new Date()}::Error Opening Port::${err}`);
  //   }
  // });

  // setupParser(portName);

  portRef.on("data", data => {
    if (data) {
      socket.emit(portName, data);
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
