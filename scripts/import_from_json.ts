import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../src/lib/db.json');

// Eksport qilingan papkani qabul qilamiz (terminaldan yoki default "export" papkasi)
let exportDir = process.argv[2];
if (!exportDir) {
  console.log("Diqqat: Eksport papkasi ko'rsatilmagan, standart joriy papkadagi 'export' ni qidiramiz...");
  exportDir = path.resolve(__dirname, '../export');
} else {
  exportDir = path.resolve(exportDir);
}

const resultJsonPath = path.join(exportDir, 'result.json');

if (!fs.existsSync(resultJsonPath)) {
  console.log('🔎 result.json not found, attempting to parse HTML export...');
  const parseScript = path.resolve(__dirname, 'parse_html.ts');
  try {
    const execSync = require('child_process').execSync;
    execSync(`node ${parseScript} "${exportDir}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ HTML parsing failed. Ensure cheerio is installed and HTML export is present.');
    process.exit(1);
  }
  if (!fs.existsSync(resultJsonPath)) {
    console.error(`❌ Still no result.json after HTML parsing.`);
    process.exit(1);
  }
}

console.log(`✅ result.json topildi. O'qish boshlandi...`);
const data = JSON.parse(fs.readFileSync(resultJsonPath, 'utf8'));
const messages = data.messages || [];

// Matnni tozalash funksiyasi (Telegram JSON da text ba'zida array bo'ladi)
function extractText(textObj: any): string {
  if (typeof textObj === 'string') return textObj;
  if (Array.isArray(textObj)) {
    return textObj.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item && typeof item.text === 'string') return item.text;
      return '';
    }).join('');
  }
  return '';
}

function normalizeDistrict(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/mirzo[\s-]*ulugbek(ski)?/i, 'Mirzo‑Ulug‘bek')
    .replace(/samarkand(ski)?/i, 'Samarkand');
}

function parseRoomInfo(text: string) {
  const lines = text.split('\n').map(l => l.trim());
  const obj: any = {};
  const roomLine = lines.find(l => /kom|komnat|kol-vo|room/i.test(l));
  if (roomLine) {
    const numbers = roomLine.match(/\d+/g);
    if (numbers) obj.rooms = numbers.join('/');
  }
  const floorLine = lines.find(l => /etaj|floor|qavat/i.test(l));
  if (floorLine) {
    const f = floorLine.match(/\d+/);
    obj.floor = f ? f[0] : '-';
  }
  const repairLine = lines.find(l => /remont|ta\'mir/i.test(l));
  if (repairLine) {
    const r = repairLine.match(/(yangi|old|renov|new|old|avtorski|yevro|euro|evro)/i);
    obj.repair = r ? r[0] : '-';
  }
  const districtLine = lines.find(l => /tuman|district|rayon/i.test(l));
  if (districtLine) {
    const parts = districtLine.split(':');
    obj.district = normalizeDistrict(parts[1] || districtLine);
  }
  const priceLine = lines.find(l => /sum|price|narx/i.test(l));
  if (priceLine) {
    const p = priceLine.replace(/[^\d]/g, '');
    obj.price = p || '-';
  }
  const phoneLine = lines.find(l => /tel|phone|raqam/i.test(l));
  if (phoneLine) {
    const ph = phoneLine.replace(/[^\d+]/g, '');
    obj.ownerPhone = ph || '-';
  }
  return obj;
}

const objects: any[] = [];
let mediaCopiedCount = 0;

// Oldingi DB ni o'qiymiz (agar bo'lsa)
let db: any = { objects: [] };
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

messages.forEach((msg: any) => {
  if (msg.type !== 'message') return;
  
  const rawText = extractText(msg.text);
  if (!rawText.trim() && !msg.photo) return;

  const parsed = parseRoomInfo(rawText);
  // keep even if parseRoomInfo empty

  const objId = `obj_${msg.id}`;
  const outDir = path.resolve(__dirname, '../public/images', objId); // Rasmlarni public ga qo'yamiz (Next.js qulayligi uchun)
  const imagesUrls: string[] = [];

  // Rasmlarni ko'chirish
  if (msg.photo) {
    // msg.photo odatda "photos/photo_1@...jpg" shaklida bo'ladi
    const sourcePhotoPath = path.join(exportDir, msg.photo);
    if (fs.existsSync(sourcePhotoPath)) {
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const fileName = path.basename(msg.photo);
      const destPhotoPath = path.join(outDir, fileName);
      fs.copyFileSync(sourcePhotoPath, destPhotoPath);
      imagesUrls.push(`/images/${objId}/${fileName}`);
      mediaCopiedCount++;
    }
  }

  objects.push({
    id: objId,
    description: rawText,
    ...parsed,
    images: imagesUrls,
    date: msg.date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

db.objects = objects;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Barcha ma'lumotlar tahlil qilindi!`);
console.log(`- Jami e'lonlar soni: ${objects.length}`);
console.log(`- Ko'chirilgan rasmlar soni: ${mediaCopiedCount}`);
console.log(`- Natija ${dbPath} fayliga saqlandi.`);
