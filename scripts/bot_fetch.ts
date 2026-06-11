import https from 'https';
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = '8917186069:AAGynaOv_sZ-7nXCpIOXy-TxHin3axAfz6A'; // existing token

// Fetch updates (messages) from the bot
function getUpdates(offset = 0): Promise<any> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Recursive fetch to collect all messages and write to telegram_raw.json
(async () => {
  console.log('=== Bot fetch: collecting messages ===');
  const messages: any[] = [];
  let offset = 0;
  while (true) {
    const result = await getUpdates(offset);
    if (!result.ok) {
      console.error('Error fetching updates', result);
      break;
    }
    const updates = result.result;
    if (updates.length === 0) break;
    for (const upd of updates) {
      if (upd.message) {
        const m = upd.message;
        const photos: string[] = [];
        if (m.photo) {
          // get the biggest size file_id
          const biggest = m.photo[m.photo.length - 1];
          if (biggest.file_id) photos.push(biggest.file_id);
        }
        if (m.document && (m.document.mime_type?.startsWith('image/') || m.document.mime_type?.startsWith('video/'))) {
          photos.push(m.document.file_id);
        }
        messages.push({
          id: m.message_id,
          chatId: m.chat.id,
          text: m.text || '',
          date: m.date,
          fromId: m.from?.id?.toString() || null,
          photos,
        });
      }
      offset = Math.max(offset, upd.update_id + 1);
    }
  }
  const outPath = path.join('telegram_raw.json');
  fs.writeFileSync(outPath, JSON.stringify(messages, null, 2));
  console.log(`Saved ${messages.length} messages to ${outPath}`);
})();
