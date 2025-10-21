const { SerialPort } = require('serialport');  // ← note the destructuring
const { ReadlineParser } = require('@serialport/parser-readline');

const portPath = process.env.USB_PORT || '/dev/ttyUSB0'; // your working modem port
const modem = new SerialPort({ path: portPath, baudRate: 115200 });
const parser = modem.pipe(new ReadlineParser({ delimiter: '\r\n' }));


let responseBuffer = '';
parser.on('data', (data) => {
  console.log('Modem response:', data);
  responseBuffer += data + '\n';
});


function sendCommand(cmd) {
  return new Promise((resolve) => {
    responseBuffer = '';
    modem.write(cmd + '\r');
    setTimeout(() => resolve(responseBuffer), 1000);
  });
}

exports.sendSMS = async (to, message) => {
  await sendCommand('AT+CMGF=1');
  await sendCommand('AT+CSCA="+99365999996"'); // optional: set SMSC

  return new Promise((resolve, reject) => {
    modem.write(`AT+CMGS="${to}"\r`);
    setTimeout(() => {
      modem.write(message);
      modem.write(Buffer.from([0x1A])); // Ctrl+Z
    }, 1000);

    parser.once('data', (data) => {
      if (data.includes('+CMGS')) {
        resolve('SMS sent successfully');
      } else {
        reject(new Error('Failed: ' + data));
      }
    });
  });
}

exports.getMessages = async () => {
    await sendCommand('AT+CMGF=1');
    await sendCommand('AT+CPMS="SM","SM","SM"');
    const response = await sendCommand('AT+CMGL="ALL"');
    
    const messages = [];

    const regex = /\+CMGL: (\d+),"([^"]+)","([^"]+)",,"([^"]+)"\s+([\s\S]*?)(?=\+CMGL:|\r?\nOK)/g;
    let match;
    while ((match = regex.exec(response)) !== null) {
        messages.push({
            index: parseInt(match[1]),
            status: match[2],
            from: match[3],
            date: match[4],
            text: match[5].trim()
        });
    }
    // remove all messages from modem
    if (messages.length > 0) {
      await sendCommand('AT+CMGD=1,4');
    }
    return messages;
}