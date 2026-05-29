import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import input from "input";
import fs from "fs";

// Rasmiy bo'lmagan (Android) yoki ochiq Telegram Desktop API ID lari
const apiId = 2040;
const apiHash = "b18441a1ff607e10a989891a5462e627";
const stringSession = new StringSession(""); // Yangi sessiya boshlash

(async () => {
  console.log("=======================================");
  console.log("🚀 Telegram CRM Import Dasturi");
  console.log("=======================================\n");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📲 Telefon raqamingizni kiriting (masalan: +998901234567): "),
    password: async () => await input.text("🔒 2FA parolingiz (agar yo'q bo'lsa shunchaki Enter bosing): "),
    phoneCode: async () => await input.text("✉️ Telegramdan kelgan kodni kiriting: "),
    onError: (err) => console.log("Xato:", err.message),
  });

  console.log("\n✅ Siz Telegramga muvaffaqiyatli ulandingiz!");
  
  console.log("\n⏳ Chatlar ro'yxati yuklanmoqda...");
  const dialogs = await client.getDialogs();
  
  const groupName = "Квартиры новая группа";
  const targetGroup = dialogs.find(d => d.title === groupName);

  if (!targetGroup) {
    console.log(`\n❌ "${groupName}" guruhi topilmadi! Guruh nomi to'g'riligini tekshiring.`);
    process.exit(1);
  }

  console.log(`\n✅ "${groupName}" guruhi topildi! Xabarlar yuklanmoqda (bu biroz vaqt olishi mumkin)...`);
  
  // Barcha xabarlarni yuklab olish (Forumlarda hamma mavzular bitta guruhda bo'ladi)
  const messages = await client.getMessages(targetGroup.entity, {
    limit: 5000, // Oxirgi 5000 ta xabarni olish
  });

  console.log(`\n📊 Jami ${messages.length} ta xabar yuklandi. Ular tahlil qilinmoqda...`);

  // Xabarlarni qulay formatga o'tkazish
  const formattedMessages = messages
    .filter(m => m.message) // Faqat matni bor xabarlar
    .map(m => {
      return {
        id: m.id,
        text: m.message,
        date: m.date,
        senderId: m.senderId ? m.senderId.toString() : null,
        replyToMsgId: m.replyTo ? m.replyTo.replyToMsgId : null, // Topic (Mavzu) ID si shu bo'ladi
        hasMedia: !!m.media
      };
  });

  // Faylga saqlash
  fs.writeFileSync("telegram_raw.json", JSON.stringify(formattedMessages, null, 2));
  
  console.log(`\n🎉 Barcha ma'lumotlar muvaffaqiyatli tortib olindi!`);
  console.log(`📁 Fayl saqlandi: telegram_raw.json`);
  console.log(`\nEndi menga (AI ga) "Tayyor" deb xabar bering, maza qilib CRM ga joylaymiz!\n`);
  
  process.exit(0);
})();
