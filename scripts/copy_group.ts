import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const apiId = 2040;
const apiHash = "b18441a1ff607e10a989891a5462e627";
const stringSession = new StringSession("");

const OLD_GROUP_NAME = "база Comfort_Home_Agency";
const NEW_GROUP_NAME = "Квартиры новая группа";

// Mapping of old topic titles → new topic titles (adjust as needed)
const TOPIC_MAPPING: Record<string, string> = {
  "3х комнотные": "3х комнатные",
  "4х комнотные": "4х комнатные",
  "Таш Сити 1-2": "Таш Сити 1-2(done)",
  "NRG 4 и более": "NRG 4 и более(done)"
};

// Path to checkpoint file – stores last processed message id per old topic
const CHECKPOINT_FILE = path.join(__dirname, "copy_progress.json");
type Checkpoint = Record<string, number>; // topicId -> lastOffsetId

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadCheckpoint = (): Checkpoint => {
  try {
    const data = fs.readFileSync(CHECKPOINT_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const saveCheckpoint = (cp: Checkpoint) => {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
};

(async () => {
  console.log("=== Telegram Group Full Forward (with checkpoint) ===");

  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => await input.text("📲 Telefon raqamingizni kiriting: "),
    password: async () => await input.text("🔒 2FA parolingiz (agar yo'q bo'lsa Enter): "),
    phoneCode: async () => await input.text("✉️ Telegram kodini kiriting: "),
    onError: (err) => console.log("Xato:", err.message)
  });
  console.log("✅ Ulashildi");

  const dialogs = await client.getDialogs();
  const oldGroup = dialogs.find(d => d.title === OLD_GROUP_NAME);
  const newGroup = dialogs.find(d => d.title === NEW_GROUP_NAME);
  if (!oldGroup || !newGroup) {
    console.error("❌ Guruhlardan biri topilmadi", { old: !!oldGroup, new: !!newGroup });
    process.exit(1);
  }

  // Fetch topics from both groups
  const fetchTopics = async (entity: any) => {
    const result = await client.invoke(new Api.channels.GetForumTopics({
      channel: entity,
      offsetDate: 0,
      offsetId: 0,
      offsetTopic: 0,
      limit: 200
    }));
    const map: Record<string, number> = {};
    if ("topics" in result) {
      for (const t of result.topics) {
        if (t.className === "ForumTopic") {
          map[t.title] = t.id;
        }
      }
    }
    return map;
  };

  const newTopicsMap = await fetchTopics(newGroup.entity);
  const oldTopicsResult = await client.invoke(new Api.channels.GetForumTopics({
    channel: oldGroup.entity,
    offsetDate: 0,
    offsetId: 0,
    offsetTopic: 0,
    limit: 200
  }));
  const oldTopics: any[] = [];
  if ("topics" in oldTopicsResult) {
    for (const t of oldTopicsResult.topics) {
      if (t.className === "ForumTopic") oldTopics.push(t);
    }
  }

  console.log(`🗂️ Old: ${oldTopics.length} tema, New: ${Object.keys(newTopicsMap).length} tema`);

  const checkpoint = loadCheckpoint();

  for (const oldTopic of oldTopics) {
    const targetTitle = TOPIC_MAPPING[oldTopic.title] || oldTopic.title;
    const targetId = newTopicsMap[targetTitle];
    if (!targetId) {
      console.warn(`⚠️ Target tema "${targetTitle}" topilmadi – o'tkazilmoqda`);
      continue;
    }

    console.log(`\n⏳ Tema "${oldTopic.title}" → "${targetTitle}" ko'chirilmoqda`);
    let offsetId = checkpoint[oldTopic.id] ?? 0;
    let fetchedAny = true;
    while (fetchedAny) {
      const msgsRes = await client.invoke(new Api.messages.GetReplies({
        peer: oldGroup.entity,
        msgId: oldTopic.id,
        offsetId,
        offsetDate: 0,
        addOffset: 0,
        limit: 200,
        maxId: 0,
        minId: 0,
        hash: BigInt(0) as any
      }));
      if (!("messages" in msgsRes) || msgsRes.messages.length === 0) break;
      const msgs = msgsRes.messages.filter((m: any) => m.className === "Message" || m.className === "MessageService");
      if (msgs.length === 0) break;

      // Reverse to keep chronological order
      const ordered = msgs.reverse();

      // Forward in batches, grouping albums
      let i = 0;
      while (i < ordered.length) {
        const cur = ordered[i];
        if (cur.className === "MessageService") { i++; continue; }
        const ids: number[] = [cur.id];
        const rnd: bigint[] = [BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))];
        const curAny = cur as any;
        if (curAny.groupedId) {
          let j = i + 1;
          while (j < ordered.length && (ordered[j] as any).groupedId?.toString() === curAny.groupedId.toString()) {
            ids.push(ordered[j].id);
            rnd.push(BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
            j++;
          }
          i = j;
        } else {
          i++;
        }
        // retry loop for flood wait
        let sent = false;
        while (!sent) {
          try {
            await client.invoke(new Api.messages.ForwardMessages({
              fromPeer: oldGroup.entity,
              id: ids,
              toPeer: newGroup.entity,
              topMsgId: targetId,
              randomId: rnd as any
            }));
            await sleep(10000); // 10 sec safe delay – no flood
            sent = true;
          } catch (e: any) {
            console.error(`❌ Xabar (${ids.join(',')}) yuborishda xato: ${e.message}`);
            if (e.message && e.message.includes('FLOOD')) {
              const m = e.message.match(/A wait of (\d+) seconds is required/);
              const wait = m && m[1] ? parseInt(m[1], 10) : 60;
              console.log(`⏳ Flood wait ${wait}s – kutyapmiz`);
              await sleep((wait + 5) * 1000);
            } else {
              sent = true; // boshqa xatolik – davom etamiz
            }
          }
        }
      }

      // update checkpoint after each batch
      offsetId = ordered[ordered.length - 1].id;
      checkpoint[oldTopic.id] = offsetId;
      saveCheckpoint(checkpoint);
    }
    console.log(`✅ Tema "${oldTopic.title}" yakunlandi`);
  }

  console.log("\n🎉 Barcha ma'lumotlar muvaffaqiyatli ko'chirildi!");
  process.exit(0);
})();
