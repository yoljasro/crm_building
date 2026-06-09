import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
import fs from "fs";

const apiId = 2040;
const apiHash = "b18441a1ff607e10a989891a5462e627";
const stringSession = new StringSession("");

const GROUP_NAME = "база Comfort_Home_Agency";
const OUTPUT_FILE = "telegram_raw.json";
const BOT_TOKEN = "8917186069:AAGynaOv_sZ-7nXCpIOXy-TxHin3axAfz6A";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Telegram file_id dan CDN URL yasash
const getPhotoUrl = (fileId: string): string => {
  return `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
};

(async () => {
  console.log("=== Telegram Guruhdan Ma'lumot + Rasmlar Tortib Olish ===\n");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📲 Telefon raqamingizni kiriting: "),
    password: async () => await input.text("🔒 2FA parolingiz (Enter = yo'q): "),
    phoneCode: async () => await input.text("✉️ Telegram kodini kiriting: "),
    onError: (err) => console.log("Xato:", err.message),
  });
  console.log("✅ Ulashildi\n");

  const dialogs = await client.getDialogs({ limit: 200 });
  const group = dialogs.find((d) => d.title === GROUP_NAME);
  if (!group) {
    console.error(`❌ "${GROUP_NAME}" guruhi topilmadi!`);
    process.exit(1);
  }
  console.log(`✅ Guruh topildi: "${GROUP_NAME}"\n`);

  // Barcha topiclarni yuklash
  console.log("📂 Topiclar yuklanmoqda...");
  const allTopics: any[] = [];
  let offsetTopic = 0;
  while (true) {
    const result: any = await client.invoke(
      new Api.channels.GetForumTopics({
        channel: group.entity,
        offsetDate: 0,
        offsetId: 0,
        offsetTopic,
        limit: 100,
      })
    );
    if (!("topics" in result) || result.topics.length === 0) break;
    for (const t of result.topics) {
      if (t.className === "ForumTopic") allTopics.push(t);
    }
    if (result.topics.length < 100) break;
    offsetTopic = result.topics[result.topics.length - 1].id;
    await sleep(1000);
  }
  console.log(`✅ ${allTopics.length} ta topic topildi\n`);

  const allMessages: any[] = [];
  let totalCount = 0;

  for (const topic of allTopics) {
    console.log(`⏳ Topic: "${topic.title}" (id: ${topic.id})`);
    let offsetId = 0;
    let topicCount = 0;

    while (true) {
      const res: any = await client.invoke(
        new Api.messages.GetReplies({
          peer: group.entity,
          msgId: topic.id,
          offsetId,
          offsetDate: 0,
          addOffset: 0,
          limit: 100,
          maxId: 0,
          minId: 0,
          hash: BigInt(0) as any,
        })
      );

      if (!("messages" in res) || res.messages.length === 0) break;
      const msgs = res.messages.filter((m: any) => m.className === "Message");
      if (msgs.length === 0) break;

      for (const m of msgs) {
        // Rasmlarni file_id bilan saqlash
        const photos: string[] = [];

        if (m.media) {
          // Photo
          if (m.media.className === "MessageMediaPhoto" && m.media.photo) {
            const photo = m.media.photo;
            // Eng katta o'lchamdagi rasmni olish
            const sizes = photo.sizes || [];
            const largest = sizes[sizes.length - 1];
            if (largest && photo.id) {
              // file_id formatini yasash
              const fileId = `${photo.id}_${photo.accessHash}`;
              photos.push(fileId);
            }
          }
          // Document (video, gif)
          if (m.media.className === "MessageMediaDocument" && m.media.document) {
            const doc = m.media.document;
            if (doc.mimeType?.startsWith("image/") || doc.mimeType?.startsWith("video/")) {
              photos.push(`doc_${doc.id}_${doc.accessHash}`);
            }
          }
        }

        allMessages.push({
          id: m.id,
          topicId: topic.id,
          topicTitle: topic.title,
          text: m.message || "",
          date: m.date,
          senderId: m.fromId?.userId?.toString() || null,
          groupedId: m.groupedId?.toString() || null,
          hasMedia: !!m.media,
          photos,  // ← file_id lar
        });
      }

      topicCount += msgs.length;
      offsetId = msgs[msgs.length - 1].id;
      if (msgs.length < 100) break;
      await sleep(500);
    }

    totalCount += topicCount;
    console.log(`   ✅ ${topicCount} ta xabar`);
  }

  // Xronologik tartib
  allMessages.sort((a, b) => a.date - b.date);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allMessages, null, 2));
  console.log(`\n🎉 Jami ${totalCount} ta xabar saqlandi → ${OUTPUT_FILE}`);
  console.log(`Endi: npx tsx scripts/parse_to_db.ts`);

  process.exit(0);
})();
