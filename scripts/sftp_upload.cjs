const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const host = '159.223.105.135';
const port = 22;
const username = 'root';
const password = 'yoljasron1221Jas';

const localFile = process.argv[2];
const remoteFile = process.argv[3];

if (!localFile || !remoteFile) {
  console.error("Usage: node scripts/sftp_upload.js <localFile> <remoteFile>");
  process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established. Launching SFTP...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error("SFTP session failed:", err);
      conn.end();
      process.exit(1);
    }
    
    console.log(`Uploading ${localFile} to ${remoteFile}...`);
    const readStream = fs.createReadStream(localFile);
    const writeStream = sftp.createWriteStream(remoteFile);
    
    writeStream.on('close', () => {
      console.log(`Successfully uploaded ${localFile} to ${remoteFile}`);
      conn.end();
    });
    
    writeStream.on('error', (err) => {
      console.error("SFTP write stream error:", err);
      conn.end();
      process.exit(1);
    });
    
    readStream.on('error', (err) => {
      console.error("Local read stream error:", err);
      conn.end();
      process.exit(1);
    });
    
    readStream.pipe(writeStream);
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
}).connect({
  host,
  port,
  username,
  password,
  readyTimeout: 15000
});
