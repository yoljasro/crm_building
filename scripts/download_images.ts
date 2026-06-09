import { TelegramClient } from 'telegram/index.js';
import { StringSession } from 'telegram/sessions/index.js';
import { Logger } from 'telegram/extensions/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Resolve __dirname in ES module context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env variables
const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH as string;
const phone = process.env.TELEGRAM_PHONE as string;

// Session handling (reuse same session file as fetch_group)
const sessionFile = path.resolve(__dirname, '../.telegram.session');
let sessionString = '';
if (existsSync(sessionFile)) {
  sessionString = readFileSync(sessionFile, 'utf8');
}
const stringSession = new StringSession(sessionString);

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    logger: new Logger('error'),
  });

  await client.start({
    phoneNumber: async () => phone,
    phoneCode: async () => {
      console.log('Kod kiritish kerak – terminalga kiriting:');
      const code = await new Promise<string>((resolve) => {
        process.stdout.write('Kodni kiriting: ');
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      });
      return code;
    },
    password: async () => process.env.TELEGRAM_PASSWORD || '',
    onError: (err) => console.error('Telegram client error:', err),
  });

  // Save session for subsequent runs
  writeFileSync(sessionFile, client.session.save());

  const rawPath = path.resolve(__dirname, '../rawMessages.json');
  const dbPath = path.resolve(__dirname, '../src/lib/db.json');
  if (!existsSync(rawPath) || !existsSync(dbPath)) {
    console.error('rawMessages.json yoki db.json topilmadi – avval fetch_group va parse_messages ni ishga tushiring');
    process.exit(1);
  }

  const rawMessages: any[] = JSON.parse(readFileSync(rawPath, 'utf8'));
  const db = JSON.parse(readFileSync(dbPath, 'utf8'));

  // Helper to find raw message by numeric id
  const findRawById = (id: number) => rawMessages.find((m) => m.id === id);

  for (const obj of db.objects) {
    const msgId = Number(obj.id.replace('obj_', ''));
    const rawMsg = findRawById(msgId);
    if (!rawMsg || !rawMsg.media || !rawMsg.media.raw) continue;
    const media = rawMsg.media.raw;
    const outDir = path.resolve(__dirname, '../images', obj.id);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    // Determine filename
    let filename = 'media';
    if (media.photo) {
      filename = `${media.photo.id}.jpg`;
    } else if (media.document) {
      // Try to get original file name from attributes
      const attr = media.document.attributes?.find((a: any) => a.fileName);
      filename = attr?.fileName || `${media.document.id}.bin`;
    } else {
      filename = `${media.id || 'media'}.bin`;
    }
    const outPath = path.join(outDir, filename);
    try {
      await client.downloadMedia(media, { outputFile: outPath });
      obj.images.push(outPath);
      console.log(`📥 ${obj.id} dan ${filename} yuklandi`);
      // Small delay to respect Telegram limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error(`❗ ${obj.id} uchun media yuklashda xato:`, e);
    }
  }

  // Write updated db back
  writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ ${db.objects.length} obyektlar yangilandi, tasvirlar saqlandi`);
})();
