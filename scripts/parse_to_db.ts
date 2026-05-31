import fs from 'fs';
import path from 'path';

// Fayllarni o'qish
const rawData = JSON.parse(fs.readFileSync('telegram_raw.json', 'utf8'));
const dbPath = path.join('src', 'lib', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Noyob ID yaratuvchi yordamchi funksiya
const generateId = () => Math.random().toString(36).substr(2, 9);

let newObjects = 0;
let newLeads = 0;
let newOwners = 0;

// Dublikatlarni tekshirish uchun Set (telefon + description)
const seenObjects = new Set();
for (const obj of db.objects) {
  const existingOwner = db.owners.find((o: any) => o.id === obj.ownerId);
  const existingPhone = existingOwner ? existingOwner.phone.replace(/\s+/g,'') : 'no_phone';
  seenObjects.add(`${existingPhone}_${obj.description.trim()}`);
}

for (let i = 0; i < rawData.length; i++) {
  const msg = rawData[i];
  const text = msg.text || '';
  
  // 1. Kvartira (Object) qidirish
  if (text.includes('🏡') || text.includes('ЖК:') || text.includes('Район:')) {
    const nameMatch = text.match(/ЖК\s*:?\s*#?([^\n]+)/i);
    const districtMatch = text.match(/Район\s*:?\s*#?([^\n]+)/i);
    const priceMatch = text.match(/Цена\s*:?\s*#?(\d+)/i);
    const areaMatch = text.match(/Площадь\s*:?\s*(\d+)/i);
    const roomsMatch = text.match(/комн?а?т?\s*:?\s*(\d+)/i);
    
    // Telefon raqamini o'zidan yoki oldingi/keyingi xabardan izlash
    let phoneMatch = text.match(/\+998\d{9}/);
    let ownerName = "Noma'lum mulkdor";
    
    if (!phoneMatch && i > 0) {
      phoneMatch = rawData[i-1].text?.match(/\+998\d{9}/);
    }
    if (!phoneMatch && i + 1 < rawData.length) {
      phoneMatch = rawData[i+1].text?.match(/\+998\d{9}/);
    }
    
    let phone = phoneMatch ? phoneMatch[0] : null;
    
    // Dublikat tekshiruvi: raqam + description bir xilligini aniqlash
    const currentPhone = phone ? phone.replace(/\s+/g,'') : 'no_phone';
    const uniqueKey = `${currentPhone}_${text.trim()}`;
    
    if (seenObjects.has(uniqueKey)) {
      continue; // Raqam va description 100% bir xil bo'lsa, o'tkazib yuboramiz
    }
    seenObjects.add(uniqueKey);
    
    // Mulkdor (Owner) ni tekshirish yoki yaratish
    let ownerId = null;
    if (phone) {
      let owner = db.owners.find((o: any) => o.phone.replace(/\s+/g,'') === phone);
      if (!owner) {
        owner = {
          id: generateId(),
          name: ownerName,
          phone: phone,
          email: "",
          telegram: "",
          notes: "Telegram guruhdan avtomatik qo'shildi",
          createdAt: new Date(msg.date * 1000).toISOString()
        };
        db.owners.push(owner);
        newOwners++;
      }
      ownerId = owner.id;
    }
    
    const obj = {
      id: generateId(),
      name: nameMatch ? nameMatch[1].trim() : "Yangi Kvartira",
      district: districtMatch ? districtMatch[1].trim() : "Noma'lum",
      address: districtMatch ? districtMatch[1].trim() : "",
      price: priceMatch ? parseInt(priceMatch[1]) : 0,
      rooms: roomsMatch ? parseInt(roomsMatch[1]) : 0,
      area: areaMatch ? parseInt(areaMatch[1]) : 0,
      floor: "-",
      repair: "-",
      status: "bo'sh",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
      description: text,
      ownerId: ownerId || "1",
      createdAt: new Date(msg.date * 1000).toISOString()
    };
    
    db.objects.push(obj);
    newObjects++;
  }
  
  // 2. Mijoz (Lead) qidirish
  if (text.includes('ФИО:') || text.includes('Имя:')) {
     const nameMatch = text.match(/(?:ФИО|Имя)\s*:?\s*([^\n]+)/i);
     const phoneMatch = text.match(/\+998\d{9}/);
     
     if (nameMatch || phoneMatch) {
       const lead = {
         id: generateId(),
         name: nameMatch ? nameMatch[1].trim() : "Yangi Mijoz",
         phone: phoneMatch ? phoneMatch[0] : "",
         source: "Telegram",
         type: "ijara",
         budget: 0,
         rooms: 0,
         status: "yangi",
         agent: "Asilbek",
         date: new Date(msg.date * 1000).toISOString().split('T')[0]
       };
       db.leads.push(lead);
       newLeads++;
     }
  }
}

// Yangilangan bazani saqlash
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Baza muvaffaqiyatli yangilandi!`);
console.log(`✅ Yangi obyektlar (uylar): ${newObjects} ta`);
console.log(`✅ Yangi lidlar (mijozlar): ${newLeads} ta`);
console.log(`✅ Yangi egalar (owners): ${newOwners} ta`);
