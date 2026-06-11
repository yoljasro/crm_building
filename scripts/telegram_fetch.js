// telegram_fetch.js
// GramJS (MTProto) orqali Telegram ma'lumotlarini olish scripti.
// NOTE: apiId, apiHash va phoneNumber ni <my.telegram.org> dan olingan ma'lumot bilan to'ldiring.

const { TelegramClient } = require("telegram/dist");
const { StringSession } = require("telegram/dist/sessions");
const input = require("input"); // npm i input
const fs = require("fs");
const path = require("path");

// -------------------------------------------------
// 1️⃣ CONFIGURATION – o'zingizga moslang
// -------------------------------------------------
const apiId = 36946167;               // << my.telegram.org -→ API development tools
const apiHash = "20a2529a580808d69728860ad78dfa68"; // << my.telegram.org -→ API development tools
const phoneNumber = "+998935667888"; // << Telegram telefon raqamingiz
// Agar ma'lum bir kanal / guruhdan ma'lumot olishni istasangiz,
// uning username ("@mygroup") yoki ID ("-1001234567890") ni quyidagi
// `targetEntity` konstantasiga kiriting.
const targetEntity = "Chanel Switcher"; // short name: switch
// -------------------------------------------------

// Session faylini davomiy saqlash uchun.
const SESSION_FILE = path.resolve("telegram.session");
let savedSession = "";
if (fs.existsSync(SESSION_FILE)) {
  savedSession = fs.readFileSync(SESSION_FILE, "utf-8");
}
const stringSession = new StringSession(savedSession);

(async () => {
  console.log("🔹 Telegram clientini ishga tushurilmoqda…");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => phoneNumber,
    // Telegram ilovasi yoki SMS orqali kelgan kodni shu yerga kiriting.
    phoneCode: async () => {
      console.log("\n📩 Telegram sizga tasdiqlash kodini (SMS yoki Telegram app) yuboradi.");
      return await input.text("🔐 Kodingizni kiriting: ");
    },
    // Agar ikki bosqichli parol (2FA) o‘rnatilgan bo‘lsa, uni shu yerga kiriting.
    password: async () => await input.text("🔑 2‑bosqichli parol (agar bo‘lsa): "),
    // Xatolik yuz berganda console ga chiqarish.
    onError: (err) => {
      console.error("❌ Xato:", err);
      process.exit(1);
    },
  });

  console.log("✅ Kirish muvaffaqiyatli!");
  // Sessionni saqlash – keyingi ishga tushirishda yana kod so‘ralmaydi.
  fs.writeFileSync(SESSION_FILE, client.session.save());
  console.log("💾 Session fayli telegram.session sifatida saqlandi.");

  // -------------------------------------------------
  // 2️⃣ TARGET chat (kanal / guruh) obyektini olish
  // -------------------------------------------------
  console.log(`\n🔎 ${targetEntity} ob'ektini yuklayapmiz…`);
  let chat;
  try {
    chat = await client.getEntity(targetEntity);
  } catch (e) {
    console.error("❗️ TargetEntity topilmadi. Username yoki ID ni tekshiring.", e);
    process.exit(1);
  }

  // -------------------------------------------------
  // 3️⃣ Xabarlarni olish (limiti 2000 – kerak bo‘lsa oshiring)
  // -------------------------------------------------
  console.log("⏬ Xabarlar yuklanmoqda…");
  const rawMessages = await client.getMessages(chat, { limit: 2000 });

  // -------------------------------------------------
  // 4️⃣ Xabarlarni JSON formatiga o‘zgartirish → telegram_raw.json
  // -------------------------------------------------
  const result = [];
  for (const m of rawMessages) {
    // Media (rasmlar) uchun file_id ni olish
    const photos = [];
    if (m.media && m.media.photo) {
      // GramJS Photo obyektida fileId mavjud
      const fileId = m.media.photo ?? null; // photo obj itself is file id in GramJS
      if (fileId) photos.push(fileId);
    }
    // grouped messages (albom) – GramJS da `groupedId` yo‘q, lekin `groupedId` may be in `message.groupedId`
    const groupedId = m.groupedId || null;
    const topicTitle = m.replyTo?.replyToMsgId ? "" : ""; // placeholder – GramJS API da topic title yo‘q, lekin siz `chat.title` yoki `message.message` dan olingan info qo‘shishingiz mumkin.

    result.push({
      id: m.id,
      date: Math.floor(m.date.getTime() / 1000), // Unix timestamp
      from_id: m.sender?.id ?? null,
      text: m.message || "",
      photos,
      groupedId,
      topicTitle,
    });
  }

  const outPath = path.resolve("telegram_raw.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n✅ ${result.length} ta xabar ${outPath} ga yozildi.`);

  await client.disconnect();
  process.exit(0);
})();
