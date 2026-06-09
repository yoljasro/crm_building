import fs from "fs";
import path from "path";
import https from "https";

const BOT_TOKEN = "8917186069:AAGynaOv_sZ-7nXCpIOXy-TxHin3axAfz6A";
const rawData: any[] = JSON.parse(fs.readFileSync("telegram_raw.json", "utf8"));
const dbPath = path.join("src", "lib", "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const generateId = () => Math.random().toString(36).substr(2, 9);

// Bot API orqali file path olish
const getBotFileUrl = async (fileId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.ok && json.result?.file_path) {
            resolve(`https://api.telegram.org/file/bot${BOT_TOKEN}/${json.result.file_path}`);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
};

const extractPhone = (text: string): string | null => {
  const patterns = [
    /\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/,
    /998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/,
    /\b0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b/,
    /\b9[0-9]{8}\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].replace(/\s+/g, "").replace(/^0/, "+998").replace(/^(?!998|\+998)9/, "+9989");
  }
  return null;
};

const getStatusFromTopic = (topicTitle: string): string => {
  const t = topicTitle.toLowerCase();
  if (t.includes("занят") || t.includes("band") || t.includes("done")) return "band";
  return "bo'sh";
};

const parseObject = (text: string) => {
  const jkMatch = text.match(/ЖК\s*:?\s*#?([^\n]+)/i);
  const districtMatch = text.match(/Район\s*:?\s*#?([^\n]+)/i);
  const priceMatch = text.match(/Цена\s*:?\s*#?([\d\s]+)\s*\$?/i);
  const areaMatch = text.match(/Площадь\s*:?\s*([\d.]+)/i);
  const roomsMatch =
    text.match(/[Кк]ол[- ]?во\s*[кк]ом[^:]*:\s*(\d+)/i) ||
    text.match(/[кК]омнат\s*:?\s*(\d+)/i) ||
    text.match(/(\d+)[- ]?[хx]он/i);
  const floorMatch = text.match(/[Ээ]таж\s*:?\s*([^\n]+)/i);
  const repairMatch =
    text.match(/[Рр]емонт\s*:?\s*([^\n]+)/i) ||
    text.match(/[Тт]ип\s*[дд]ома\s*:?\s*([^\n]+)/i);

  return {
    name: jkMatch ? jkMatch[1].trim().replace(/^[:#\s]+/, "") : null,
    district: districtMatch ? districtMatch[1].trim() : null,
    price: priceMatch ? parseInt(priceMatch[1].replace(/\s+/g, "")) : 0,
    area: areaMatch ? parseFloat(areaMatch[1]) : 0,
    rooms: roomsMatch ? parseInt(roomsMatch[1]) : 0,
    floor: floorMatch ? floorMatch[1].trim() : "-",
    repair: repairMatch ? repairMatch[1].trim() : "-",
  };
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop";

// Duplicate Set
const seenKeys = new Set<string>();
for (const obj of db.objects) {
  const owner = db.owners.find((o: any) => o.id === obj.ownerId);
  const phone = owner?.phone || "no_phone";
  seenKeys.add(`${phone}__${(obj.description || "").trim()}`);
}

const ownerByPhone = new Map<string, any>();
for (const o of db.owners) {
  ownerByPhone.set(o.phone.replace(/\s+/g, ""), o);
}

// Album guruhlarini yig'ish
const albumGroups = new Map<string, any[]>();
for (const msg of rawData) {
  if (msg.groupedId) {
    if (!albumGroups.has(msg.groupedId)) albumGroups.set(msg.groupedId, []);
    albumGroups.get(msg.groupedId)!.push(msg);
  }
}
const processedAlbums = new Set<string>();

let newObjects = 0;
let newOwners = 0;
let newLeads = 0;
let skipped = 0;

(async () => {
  console.log("⏳ Parse qilinmoqda...\n");

  for (let i = 0; i < rawData.length; i++) {
    const msg = rawData[i];
    const topicTitle = msg.topicTitle || "";

    // Album bo'lsa
    let fullText = msg.text || "";
    let allPhotos: string[] = msg.photos || [];

    if (msg.groupedId) {
      if (processedAlbums.has(msg.groupedId)) continue;
      processedAlbums.add(msg.groupedId);
      const albumMsgs = albumGroups.get(msg.groupedId) || [];
      fullText = albumMsgs.map((m) => m.text).filter(Boolean).join("\n").trim();
      allPhotos = albumMsgs.flatMap((m) => m.photos || []);
    }

    const isObjectMsg =
      fullText.includes("🏡") ||
      fullText.includes("ЖК") ||
      fullText.includes("Район") ||
      fullText.includes("Цена") ||
      fullText.includes("комнат");

    if (isObjectMsg) {
      let phone = extractPhone(fullText);
      if (!phone) {
        for (let j = i + 1; j <= i + 3 && j < rawData.length; j++) {
          const p = extractPhone(rawData[j].text || "");
          if (p) { phone = p; break; }
        }
      }
      if (!phone) {
        for (let j = i - 1; j >= i - 3 && j >= 0; j--) {
          const p = extractPhone(rawData[j].text || "");
          if (p) { phone = p; break; }
        }
      }

      const cleanPhone = phone ? phone.replace(/\s+/g, "") : "no_phone";
      const dupKey = `${cleanPhone}__${fullText.trim()}`;
      if (seenKeys.has(dupKey)) { skipped++; continue; }
      seenKeys.add(dupKey);

      // Owner
      let owner = phone ? ownerByPhone.get(cleanPhone) : null;
      if (!owner && phone) {
        owner = {
          id: generateId(),
          name: "Noma'lum mulkdor",
          phone: cleanPhone,
          email: "",
          telegram: "",
          notes: `Telegram: ${topicTitle}`,
          createdAt: new Date(msg.date * 1000).toISOString(),
        };
        db.owners.push(owner);
        ownerByPhone.set(cleanPhone, owner);
        newOwners++;
      }

      // Rasmlarni Bot API orqali URL ga aylantirish
      let imageUrl = PLACEHOLDER;
      const imageUrls: string[] = [];

      if (allPhotos.length > 0) {
        // Birinchi rasmni asosiy rasm sifatida olamiz
        const firstUrl = await getBotFileUrl(allPhotos[0]);
        if (firstUrl) {
          imageUrl = firstUrl;
          imageUrls.push(firstUrl);
        }
        // Qolgan rasmlar
        for (let p = 1; p < Math.min(allPhotos.length, 10); p++) {
          const url = await getBotFileUrl(allPhotos[p]);
          if (url) imageUrls.push(url);
        }
      }

      const parsed = parseObject(fullText);
      const status = getStatusFromTopic(topicTitle);

      const obj = {
        id: generateId(),
        name: parsed.name || "Kvartira",
        district: parsed.district || "Noma'lum",
        address: parsed.district || "",
        price: parsed.price,
        rooms: parsed.rooms,
        area: parsed.area,
        floor: parsed.floor,
        repair: parsed.repair,
        status,
        topicTitle,
        image: imageUrl,           // ← Asosiy rasm (Telegram CDN)
        images: imageUrls,         // ← Barcha rasmlar
        description: fullText,
        ownerId: owner?.id || "",
        createdAt: new Date(msg.date * 1000).toISOString(),
      };

      db.objects.push(obj);
      newObjects++;

      if (newObjects % 100 === 0) {
        console.log(`   ${newObjects} ta obyekt qo'shildi...`);
        // Har 100 tadan bir bora saqlab boramiz
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      }
    }

    // Lead
    if (fullText.includes("ФИО:") || fullText.includes("Имя:") || fullText.includes("Клиент:")) {
      const nameMatch = fullText.match(/(?:ФИО|Имя|Клиент)\s*:?\s*([^\n]+)/i);
      const phone = extractPhone(fullText);
      const lead = {
        id: generateId(),
        name: nameMatch ? nameMatch[1].trim() : "Yangi Mijoz",
        phone: phone || "",
        source: "Telegram",
        type: "ijara",
        budget: 0,
        rooms: 0,
        status: "yangi",
        agent: "",
        topicTitle,
        date: new Date(msg.date * 1000).toISOString().split("T")[0],
      };
      db.leads.push(lead);
      newLeads++;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  console.log("\n🎉 Baza muvaffaqiyatli yangilandi!");
  console.log(`✅ Yangi obyektlar : ${newObjects} ta`);
  console.log(`✅ Yangi egalar    : ${newOwners} ta`);
  console.log(`✅ Yangi lidlar    : ${newLeads} ta`);
  console.log(`⏭️  Duplicate skip : ${skipped} ta`);
})();
