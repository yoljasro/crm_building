import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== CONFIG =====================
const apiId = 2040;
const apiHash = "b18441a1ff607e10a989891a5462e627";
const stringSession = new StringSession("");

const OLD_GROUP_NAME = "база Comfort_Home_Agency";
const NEW_GROUP_NAME = "Квартиры новая группа";

const CHECKPOINT_FILE = path.join(__dirname, "copy_progress.json");
type Checkpoint = Record<string, number>;
// ==================================================

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const loadCheckpoint = (): Checkpoint => {
  try { return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf8")); }
  catch { return {}; }
};
const saveCheckpoint = (cp: Checkpoint) => {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
};

// Telefon raqamni xabar matnidan olish
const extractPhone = (text: string): string => {
  const match = text.match(/\+?998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/);
  if (match) return match[0].replace(/\s+/g, "");
  // Oddiy raqam formatlar ham (9 raqam)
  const match2 = text.match(/\b9\d{8}\b/);
  return match2 ? match2[0] : "";
};

// Matnni normallashtirish — bo'shliq, emoji, harflar farqini olib tashlash
const normalizeText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")         // Ko'p bo'shliqlarni birga
    .replace(/[^\w\d\u0400-\u04FF\u0600-\u06FF+]/g, " ") // Faqat harf/raqam/kirill/arab
    .trim()
    .toLowerCase();
};

// Duplicate key: telefon + normalangan matn
const getDuplicateKey = (text: string): string | null => {
  const phone = extractPhone(text);
  const normalized = normalizeText(text);
  if (!phone || !normalized) return null;
  return `${phone}__${normalized}`;
};

// Yangi topicdan barcha mavjud xabarlarni yuklab, duplicate Set ini yaratadi
const loadExistingKeys = async (
  client: TelegramClient,
  entity: any,
  topicId: number
): Promise<Set<string>> => {
  const keys = new Set<string>();
  let offsetId = 0;

  console.log(`   📥 Mavjud xabarlar tekshirilmoqda (duplicate oldini olish)...`);
  while (true) {
    const res: any = await client.invoke(
      new Api.messages.GetReplies({
        peer: entity,
        msgId: topicId,
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
    for (const m of res.messages) {
      if (m.className === "Message") {
        const text = (m as any).message || "";
        const key = getDuplicateKey(text);
        if (key) keys.add(key);
      }
    }
    if (res.messages.length < 100) break;
    offsetId = res.messages[res.messages.length - 1].id;
    await sleep(500);
  }
  console.log(`   ✅ ${keys.size} ta unikal xabar topildi`);
  return keys;
};

// Topiclarni yuklash
const fetchAllTopics = async (
  client: TelegramClient,
  entity: any
): Promise<{ map: Record<string, number>; list: any[] }> => {
  const map: Record<string, number> = {};
  const list: any[] = [];
  let offsetTopic = 0;
  while (true) {
    const result: any = await client.invoke(
      new Api.channels.GetForumTopics({
        channel: entity,
        offsetDate: 0,
        offsetId: 0,
        offsetTopic,
        limit: 100,
      })
    );
    if (!("topics" in result) || result.topics.length === 0) break;
    for (const t of result.topics) {
      if (t.className === "ForumTopic") {
        map[t.title] = t.id;
        list.push(t);
      }
    }
    if (result.topics.length < 100) break;
    offsetTopic = result.topics[result.topics.length - 1].id;
    await sleep(1000);
  }
  return { map, list };
};

// Topic yaratish
const createTopic = async (
  client: TelegramClient,
  entity: any,
  title: string
): Promise<number> => {
  const result: any = await client.invoke(
    new Api.channels.CreateForumTopic({
      channel: entity,
      title,
      randomId: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) as any,
    })
  );
  const updates = result.updates || [];
  for (const upd of updates) {
    if (upd.className === "UpdateMessageID") return upd.id;
    if (upd.id) return upd.id;
  }
  await sleep(2000);
  const { map } = await fetchAllTopics(client, entity);
  return map[title] ?? 0;
};

(async () => {
  console.log("=== Telegram 1:1 Copy — Duplicate: telefon + matn tekshiruvi ===\n");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("📲 Telefon raqamingizni kiriting: "),
    password: async () => await input.text("🔒 2FA parolingiz (agar yo'q bo'lsa Enter): "),
    phoneCode: async () => await input.text("✉️ Telegram kodini kiriting: "),
    onError: (err) => console.log("Xato:", err.message),
  });
  console.log("✅ Telegram ga ulashildi\n");

  const dialogs = await client.getDialogs({ limit: 200 });
  const oldGroup = dialogs.find((d) => d.title === OLD_GROUP_NAME);
  const newGroup = dialogs.find((d) => d.title === NEW_GROUP_NAME);

  if (!oldGroup || !newGroup) {
    console.error("❌ Guruhlardan biri topilmadi!");
    process.exit(1);
  }
  console.log(`✅ Eski: "${OLD_GROUP_NAME}"`);
  console.log(`✅ Yangi: "${NEW_GROUP_NAME}"\n`);

  console.log("📂 Topiclar yuklanmoqda...");
  const { list: oldTopics } = await fetchAllTopics(client, oldGroup.entity);
  let { map: newTopicsMap } = await fetchAllTopics(client, newGroup.entity);
  console.log(`   Eski: ${oldTopics.length} ta | Yangi: ${Object.keys(newTopicsMap).length} ta\n`);

  const checkpoint = loadCheckpoint();
  let totalForwarded = 0;
  let totalDuplicates = 0;
  let totalSkipped = 0;

  for (const oldTopic of oldTopics) {
    const topicTitle = oldTopic.title;

    // Topic yo'q bo'lsa yaratamiz
    if (!newTopicsMap[topicTitle]) {
      console.log(`📝 Topic yaratilmoqda: "${topicTitle}"`);
      const newId = await createTopic(client, newGroup.entity, topicTitle);
      if (!newId) {
        console.warn(`⚠️ "${topicTitle}" yaratib bo'lmadi – o'tkazilmoqda`);
        continue;
      }
      newTopicsMap[topicTitle] = newId;
      console.log(`   ✅ Yaratildi (id: ${newId})`);
      await sleep(2000);
    }

    const targetTopicId = newTopicsMap[topicTitle];
    const checkKey = String(oldTopic.id);
    let offsetId = checkpoint[checkKey] ?? 0;

    console.log(`\n⏳ Topic: "${topicTitle}" (${oldTopic.id} → ${targetTopicId})`);

    // Yangi topicda mavjud xabarlarni yuklaymiz
    const existingKeys = await loadExistingKeys(client, newGroup.entity, targetTopicId);

    if (offsetId > 0) {
      console.log(`   ↪️  Checkpoint: msg id ${offsetId} dan davom`);
    }

    let batchCount = 0;
    let topicDuplicates = 0;

    while (true) {
      const msgsRes: any = await client.invoke(
        new Api.messages.GetReplies({
          peer: oldGroup.entity,
          msgId: oldTopic.id,
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
      const msgs = msgsRes.messages.filter(
        (m: any) => m.className === "Message" || m.className === "MessageService"
      );
      if (msgs.length === 0) break;

      const ordered = [...msgs].reverse();

      let i = 0;
      while (i < ordered.length) {
        const cur = ordered[i] as any;

        if (cur.className === "MessageService") { i++; continue; }

        // Album yig'ish
        const albumMsgs: any[] = [cur];
        if (cur.groupedId) {
          let j = i + 1;
          while (
            j < ordered.length &&
            (ordered[j] as any).groupedId?.toString() === cur.groupedId.toString()
          ) {
            albumMsgs.push(ordered[j]);
            j++;
          }
          i = j;
        } else {
          i++;
        }

        // Albomdan matn topamiz (odatda birinchi yoki matn bor xabarda)
        const textMsg = albumMsgs.find((m) => (m.message || "").trim().length > 0);
        const text = textMsg ? (textMsg.message || "") : "";
        const dupKey = getDuplicateKey(text);

        // DUPLICATE TEKSHIRUVI: telefon + matn ikkalasi bir xil bo'lsa o'tkazib yuboramiz
        if (dupKey && existingKeys.has(dupKey)) {
          topicDuplicates += albumMsgs.length;
          totalDuplicates += albumMsgs.length;
          continue;
        }

        // Forward qilish
        const ids = albumMsgs.map((m) => m.id);
        const rnd = albumMsgs.map(() =>
          BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
        );

        let sent = false;
        let attempts = 0;
        while (!sent && attempts < 3) {
          attempts++;
          try {
            await client.invoke(
              new Api.messages.ForwardMessages({
                fromPeer: oldGroup.entity,
                id: ids,
                toPeer: newGroup.entity,
                topMsgId: targetTopicId,
                randomId: rnd as any,
                dropAuthor: false,
              })
            );
            // Yuborilgandan keyin shu xabarni ham existing ga qo'shamiz
            if (dupKey) existingKeys.add(dupKey);
            totalForwarded += ids.length;
            batchCount += ids.length;
            await sleep(3000);
            sent = true;
          } catch (e: any) {
            const msg = e.message || "";
            if (msg.includes("FLOOD_WAIT") || msg.includes("FLOOD")) {
              const m = msg.match(/(\d+)/);
              const wait = m ? parseInt(m[1], 10) : 60;
              console.log(`   ⏳ Flood wait ${wait}s...`);
              await sleep((wait + 5) * 1000);
            } else if (msg.includes("ALREADY_SENT") || msg.includes("MESSAGE_ID_INVALID")) {
              totalSkipped += ids.length;
              sent = true;
            } else {
              console.warn(`   ⚠️ Xato [${attempts}/3]: ${msg}`);
              await sleep(3000);
              if (attempts >= 3) sent = true;
            }
          }
        }
      }

      // Checkpoint saqlash
      const lastId = ordered[ordered.length - 1]?.id;
      if (lastId) {
        offsetId = lastId;
        checkpoint[checkKey] = lastId;
        saveCheckpoint(checkpoint);
      }

      if (msgs.length < 100) break;
    }

    console.log(`   ✅ "${topicTitle}" — ${batchCount} yuborildi | ${topicDuplicates} duplicate o'tkazildi`);
  }

  console.log("\n" + "=".repeat(55));
  console.log(`🎉 KO'CHIRISH YAKUNLANDI!`);
  console.log(`   ✅ Yuborildi  : ${totalForwarded} ta xabar`);
  console.log(`   🔁 Duplicate  : ${totalDuplicates} ta (telefon+matn bir xil — o'tkazildi)`);
  console.log(`   ⏭️  API skip   : ${totalSkipped} ta`);
  console.log("=".repeat(55));

  process.exit(0);
})();
