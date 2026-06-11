const { Client } = require('ssh2');

const host = '159.223.105.135';
const port = 22;
const username = 'root';
const password = 'yoljasron1221Jas';

const command = process.argv.slice(2).join(' ');

if (!command) {
  console.error("Please provide a command");
  process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
  conn.exec(command, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
  // Agar 22-port ishlamasa, 3000 bilan sinab ko'ramiz
  if (port === 22 && err.level === 'client-timeout') {
      console.log("Trying port 3000...");
      const conn2 = new Client();
      // ... retry logic (lekin hozircha oddiy tutamiz)
  }
}).connect({
  host: host,
  port: port,
  username: username,
  password: password,
  readyTimeout: 10000
});
