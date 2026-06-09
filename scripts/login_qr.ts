import 'dotenv/config';
import { TelegramClient } from 'telegram/index.js';
import { StringSession } from 'telegram/sessions/index.js';
import { Logger } from 'telegram/extensions/index.js';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import qrcode from 'qrcode-terminal';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionFile = path.resolve(__dirname, '../.telegram.session');

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH as string;

const stringSession = new StringSession('');
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
  logger: new Logger('error'),
});

(async () => {
  console.log('Ulanilmoqda (QR Kod orqali)...');
  await client.connect();

  await client.signInUserWithQrCode(
    { apiId, apiHash },
    {
      onError: (err) => console.log('Xatolik:', err),
      qrCode: async (code) => {
        const url = `tg://login?token=${Buffer.from(code.token).toString('base64url')}`;
        console.clear();
        console.log('\n\n======================================================');
        console.log('📱 TELEGRAM UCHUN QR KOD (AVTOMATIK ULANISH)');
        console.log('======================================================');
        console.log('1. Telefoningizda Telegram ilovasini oching.');
        console.log('2. Sozlamalar (Settings) -> Qurilmalar (Devices) ga kiring.');
        console.log('3. "Qurilmani ulash" (Link Desktop Device) ni bosing.');
        console.log('4. Kamerani ushbu QR kodga tuting:');
        console.log('\n');
        
        qrcode.generate(url, { small: true });
        
        console.log('\n(Eslatma: Ushbu QR kod har 30 soniyada yangilanib turadi)');
        console.log('======================================================\n');
      },
      password: async () => {
        return await new Promise<string>((resolve) => {
          process.stdout.write('Agar 2FA (ikki bosqichli) parolingiz bo\'lsa, shuni kiriting va Enter bosing: ');
          process.stdin.once('data', (data) => resolve(data.toString().trim()));
        });
      }
    }
  );

  console.log('\n✅ MUVAFFAQIYATLI ULANDI!');
  writeFileSync(sessionFile, client.session.save());
  console.log('✅ Sessiya saqlandi! Endi barcha skriptlarni ishlatishimiz mumkin.');
  process.exit(0);
})();
