import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  const cmd = process.argv.slice(2).join(' ') || 'ls -la';
  console.log(`Running on server: ${cmd}`);
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error(err);
      conn.end();
      return;
    }
    stream.on('close', (code, signal) => {
      console.log(`\nProcess exited with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
}).connect({
  host: '159.223.105.135',
  port: 22,
  username: 'root',
  password: 'yoljasron1221Jas'
});
