import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Resolve paths relative to this script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawPath = path.resolve(__dirname, '../rawMessages.json');
const dbPath = path.resolve(__dirname, '../src/lib/db.json');

if (!existsSync(rawPath)) {
  console.error('rawMessages.json topilmadi – avval fetch_group.ts ni ishga tushiring');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
const db = JSON.parse(readFileSync(dbPath, 'utf8'));

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
    const r = repairLine.match(/(yangi|old|renov|new|old)/i);
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
raw.forEach((msg: any) => {
  const parsed = parseRoomInfo(msg.message);
  if (Object.keys(parsed).length === 0) return;
  const mediaIds: string[] = [];
  if (msg.media && msg.media.raw) {
    const media = msg.media.raw;
    if (media.photo && media.photo.id) mediaIds.push(String(media.photo.id));
    if (media.document && media.document.id) mediaIds.push(String(media.document.id));
  }
  objects.push({
    id: `obj_${msg.id}`,
    description: msg.message,
    ...parsed,
    rawMediaIds: mediaIds,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

db.objects = objects;
writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`✅ ${objects.length} obyekt db.json ga yozildi`);
