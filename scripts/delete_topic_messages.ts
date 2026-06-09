import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
const __filename = new URL(import.meta.url).pathname;

// ===================== CONFIG =====================
const apiId = 2040;
const apiHash = "b18441a1ff607e10a989891a5462e627";
const stringSession = new StringSession("");

const GROUP_NAME = "Квартиры новая группа";
const TOPIC_TITLE = "Занятые ЖК Ташкент Сити"; // Faqat shu topicni tozalaymiz
// ==================================================

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

(async () => {
  console.log(`=== Topicni tozalash: "${TOPIC_TITLE}" ===\n`);

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📲 Telefon raqamingizni kiriting: "),
    password: async () => await input.text("🔒 2FA parolingiz (agar yo'q bo'lsa Enter): "),
    phoneCode: async () => await input.text("✉️ Telegram kodini kiriting: "),
    onError: (err) => console.log("Xato:", err.message),
  });
  console.log("✅ Ulashildi\n");

  // Guruhni topish
  const dialogs = await client.getDialogs({ limit: 200 });
  const group = dialogs.find((d) => d.title === GROUP_NAME);
  if (!group) {
    console.error(`❌ "${GROUP_NAME}" guruhi topilmadi!`);
    process.exit(1);
  }
  console.log(`✅ Guruh topildi: "${GROUP_NAME}"\n`);

  // Topiclarni yuklash
  const topicsRes: any = await client.invoke(
    new Api.channels.GetForumTopics({
      channel: group.entity,
      offsetDate: 0,
      offsetId: 0,
      offsetTopic: 0,
      limit: 200,
    })
  );

  const topic = topicsRes.topics?.find(
    (t: any) => t.className === "ForumTopic" && t.title === TOPIC_TITLE
  );

  if (!topic) {
    console.error(`❌ "${TOPIC_TITLE}" topici topilmadi!`);
    console.log("Mavjud topiclar:", topicsRes.topics?.map((t: any) => t.title).join(", "));
    process.exit(1);
  }

  console.log(`✅ Topic topildi: "${TOPIC_TITLE}" (id: ${topic.id})\n`);
  console.log("⏳ Xabarlar yuklanmoqda va o'chirilmoqda...\n");

  let totalDeleted = 0;
  let offsetId = 0;

  while (true) {
    // Topic ichidagi xabarlarni olish
    const msgsRes: any = await client.invoke(
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

    if (!("messages" in msgsRes) || msgsRes.messages.length === 0) break;

    const msgs = msgsRes.messages.filter((m: any) => m.className === "Message");
    if (msgs.length === 0) break;

    const ids = msgs.map((m: any) => m.id);

    // 100 ta gacha batch da o'chirish
    const batchSize = 100;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      try {
        await client.invoke(
          new Api.channels.DeleteMessages({
            channel: group.entity,
            id: batch,
          })
        );
        totalDeleted += batch.length;
        console.log(`   🗑️  ${totalDeleted} ta xabar o'chirildi...`);
        await sleep(1000);
      } catch (e: any) {
        const msg = e.message || "";
        if (msg.includes("FLOOD")) {
          const m = msg.match(/(\d+)/);
          const wait = m ? parseInt(m[1], 10) : 30;
          console.log(`   ⏳ Flood wait ${wait}s...`);
          await sleep((wait + 3) * 1000);
          // Qayta urinish
          await client.invoke(
            new Api.channels.DeleteMessages({
              channel: group.entity,
              id: batch,
            })
          );
          totalDeleted += batch.length;
        } else {
          console.warn(`   ⚠️ O'chirishda xato: ${msg}`);
        }
      }
    }

    // Keyingi batch uchun offset
    offsetId = msgs[msgs.length - 1].id;

    // Agar 100 dan kam kelsa — hammasi o'chirildi
    if (msgs.length < 100) break;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 TOZALASH YAKUNLANDI!`);
  console.log(`   🗑️  Jami o'chirildi: ${totalDeleted} ta xabar`);
  console.log(`   📌 Topic: "${TOPIC_TITLE}"`);
  console.log("=".repeat(50));

  process.exit(0);
})();
