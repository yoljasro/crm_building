import { TelegramClient } from 'telegram/index.js';
import { StringSession } from 'telegram/sessions/index.js';
import { Logger } from 'telegram/extensions/index.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Load env variables
const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH as string;
const phone = process.env.TELEGRAM_PHONE as string;

// Session file (will be created automatically)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionFile = path.resolve(__dirname, '../.telegram.session');
let sessionString = '';
if (existsSync(sessionFile)) {
  sessionString = readFileSync(sessionFile, 'utf8');
}
const stringSession = new StringSession(sessionString);

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    // minimal logging
    logger: new Logger('error'),
  });

  await client.start({
    phoneNumber: async () => phone,
    // The following callbacks are optional – they will be called only if needed
    phoneCode: async () => {
      console.log('Telegram kodini telefoningizga yuborildi…');
      // Read from stdin – user must type the code
      const code = await new Promise<string>((resolve) => {
        process.stdout.write('Kodni kiriting: ');
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      });
      return code;
    },
    password: async () => {
      if (process.env.TELEGRAM_PASSWORD) return process.env.TELEGRAM_PASSWORD;
      // If 2FA is enabled but no password env variable, ask user
      const pwd = await new Promise<string>((resolve) => {
        process.stdout.write('2FA parolini kiriting: ');
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
      });
      return pwd;
    },
    onError: (err) => console.error('Telegram client error:', err),
  });

  // Save session for next runs
  writeFileSync(sessionFile, client.session.save());

  // ----------
  // 1️⃣ Identify the target group (replace with your actual group title or ID)
  // You can put the exact numeric chatId here if you know it.
  const targetTitle = 'Comfort_Home_Agency'; // updated group name
  const dialogs = await client.getDialogs({});
  const chat = dialogs.find((d) => d.title?.toString() === targetTitle);
  if (!chat) {
    console.error('Guruh topilmadi – title:', targetTitle);
    process.exit(1);
  }
  const chatId = chat.id;
  console.log('Guruh topildi, chatId =', chatId.toString());

  // 2️⃣ Fetch all messages (Telegram limits to 100 per request). We'll paginate.
  const allMessages: any[] = [];
  let offsetId = 0;
  while (true) {
    const msgs = await client.getMessages(chatId, {
      limit: 100,
      offsetId,
    });
    if (!msgs.length) break;
    allMessages.push(...msgs);
    offsetId = msgs[msgs.length - 1].id;
    console.log(`Fetched ${allMessages.length} messages…`);
    // Small delay to avoid hitting flood wait
    await new Promise((r) => setTimeout(r, 200));
  }

  // 3️⃣ Serialize raw relevant fields to JSON file
  const raw = allMessages.map((m) => ({
    id: m.id,
    message: m.message?.toString() || '',
    media: m.media ? {
      className: m.media.className,
      // For photos, .photo has a .photoId (fileReference) – we keep the full object for later download
      raw: m.media,
    } : null,
    date: m.date?.toISOString(),
    senderId: m.senderId?.toString(),
  }));

  const outPath = path.resolve(__dirname, '../rawMessages.json');
  writeFileSync(outPath, JSON.stringify(raw, null, 2), 'utf8');
  console.log('Barcha xabarlar saqlandi ->', outPath);
})();
