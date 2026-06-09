import 'dotenv/config';
import { TelegramClient } from 'telegram/index.js';
import { StringSession } from 'telegram/sessions/index.js';
import { Logger } from 'telegram/extensions/index.js';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionFile = path.resolve(__dirname, '../.telegram.session');

let sessionString = '';
if (existsSync(sessionFile)) {
  sessionString = readFileSync(sessionFile, 'utf8');
}

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH as string;
const phone = process.env.TELEGRAM_PHONE as string;

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
  logger: new Logger('info'), // Log info to see if SMS is sent
});

(async () => {
  console.log('Ulanilmoqda...');
  await client.start({
    phoneNumber: async () => phone,
    phoneCode: async () => {
      return await new Promise<string>((resolve) => {
        process.stdout.write('Telegram (yoki SMS) ga kelgan 5 xonali kodni kiriting: ');
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      });
    },
    password: async () => {
      return await new Promise<string>((resolve) => {
        process.stdout.write('2FA Parolni kiriting: ');
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      });
    },
    onError: (err) => console.log('Xatolik:', err),
  });

  console.log('Muvaffaqiyatli ulandi!');
  writeFileSync(sessionFile, client.session.save());
  console.log('Sessiya saqlandi. Dasturni to\'xtatishingiz mumkin.');
  process.exit(0);
})();
