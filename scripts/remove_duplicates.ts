import fs from 'fs';
import path from 'path';

const dbPath = path.join('src', 'lib', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const initialObjectsCount = db.objects.length;
const initialLeadsCount = db.leads.length;

// 1. Obyektlar (uylar) dagi dublikatlarni o'chirish
// Rieltorlar odatda bir xil e'lonni qayta-qayta tashlaydi, shuning uchun matnini (description) tekshiramiz.
const uniqueObjects = [];
const seenDescriptions = new Set();

for (const obj of db.objects) {
  // Matndagi bo'shliq va belgilarni olib tashlab, kichik harfga o'tkazamiz
  const normalizedDesc = obj.description ? obj.description.replace(/[\s\n\r#_]+/g, '').toLowerCase() : obj.id;
  
  if (!seenDescriptions.has(normalizedDesc)) {
    seenDescriptions.add(normalizedDesc);
    uniqueObjects.push(obj);
  }
}
db.objects = uniqueObjects;

// 2. Lidlar (mijozlar) dagi dublikatlarni o'chirish
// Telefon raqami bir xil bo'lgan mijozlarni faqat bittasini qoldiramiz
const uniqueLeads = [];
const seenPhones = new Set();

for (const lead of db.leads) {
  const phone = lead.phone ? lead.phone.replace(/\s+/g, '') : null;
  
  if (!phone || !seenPhones.has(phone)) {
    if (phone) seenPhones.add(phone);
    uniqueLeads.push(lead);
  }
}
db.leads = uniqueLeads;

// Saqlash
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Deduplication (Dublikatlarni tozalash) yakunlandi!`);
console.log(`Obyektlar: ${initialObjectsCount} tadan -> ${db.objects.length} taga tushdi (-${initialObjectsCount - db.objects.length} ta takroriy e'lon o'chirildi)`);
console.log(`Lidlar: ${initialLeadsCount} tadan -> ${db.leads.length} taga tushdi (-${initialLeadsCount - db.leads.length} ta takroriy mijoz o'chirildi)`);
