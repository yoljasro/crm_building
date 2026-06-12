import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = '8917186069:AAGynaOv_sZ-7nXCpIOXy-TxHin3axAfz6A';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const pendingShares = {};

// Read database
function readDB() {
    const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (error) {
        console.error("DB reading error:", error);
        return { objects: [] };
    }
}

function stripPhonesAndContacts(text) {
    if (!text) return "";
    
    // 1. Remove Telegram links and usernames
    const tmeRegex = /(https?:\/\/)?t\.me\/[a-zA-Z0-9_]+/gi;
    const usernameRegex = /@[a-zA-Z0-9_]+/g;
    
    // 2. Remove standard Uzbek phone formats (e.g. +998901234567, 998 90 123 4567, etc.)
    const uzbPhoneRegex = /\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g;
    
    // 3. Remove 9-digit local phone formats (e.g. (90) 123-45-67, 90 123 45 67, 901234567)
    const localPhoneRegex = /\(?\b(33|50|77|88|90|91|93|94|95|97|98|99)\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g;

    // 4. General phone label and number matches (e.g. Tel: +998901234567, etc.)
    const phoneLabelRegex = /(?:tel|phone|номер|тел|алоqa|kontact|murojaat|aloqa|svyaz|call|contact|tg)[\s:]*\+?[\d\s()-]{6,20}/gi;

    let cleaned = text;
    cleaned = cleaned.replace(tmeRegex, "");
    cleaned = cleaned.replace(usernameRegex, "");
    cleaned = cleaned.replace(uzbPhoneRegex, "");
    cleaned = cleaned.replace(localPhoneRegex, "");
    cleaned = cleaned.replace(phoneLabelRegex, "");

    // 5. Line-by-line validation to strip any remaining contact mentions
    cleaned = cleaned.split("\n")
      .filter(line => {
        const l = line.toLowerCase().trim();
        if (l.includes("tel:") || l.includes("telefon:") || l.includes("номер") || l.includes("алоқа") || l.includes("murojaat") || l.includes("aloqa") || l.includes("lichka") || l.includes("tg:") || l.includes("telegram")) {
            return false;
        }
        
        // Discard line if it has 7 or more digits (typical of a phone number)
        const digits = line.replace(/[^\d]/g, '');
        if (digits.length >= 7) {
            return false;
        }
        return true;
      })
      .join("\n");

    return cleaned.trim();
}

function resolveImageSource(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return { type: 'url', value: url };
    }
    const cleanUrl = url.split('?')[0];
    const localPath = path.join(process.cwd(), 'public', cleanUrl);
    if (fs.existsSync(localPath)) {
        return { type: 'file', value: localPath };
    }
    const origin = "http://159.223.105.135";
    return { type: 'url', value: `${origin}${url.startsWith("/") ? "" : "/"}${url}` };
}

async function sendObjectToChat(chatId, objId) {
    const db = readDB();
    const obj = db.objects.find(o => o.id === objId);
    if (!obj) {
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: `❌ Obyekt topilmadi: ${objId}` })
        });
        return;
    }

    const rawPaths = [];
    if (obj.image) rawPaths.push(obj.image);
    if (obj.images && Array.isArray(obj.images)) {
        obj.images.forEach(img => {
            if (img) rawPaths.push(img);
        });
    }

    const uniquePaths = Array.from(new Set(rawPaths));
    const resolvedSources = uniquePaths.map(resolveImageSource).filter(Boolean).slice(0, 10);

    const cleanDesc = stripPhonesAndContacts(obj.description);
    const districtTag = obj.district.replace(/\s+/g, '');

    const caption = `🏢 <b>IJARA / АРЕНДА KVARTIRA</b>\n\n📍 Tuman (Район): ${obj.district}\n🛣 Manzil: ${obj.address}\n🛏 Xonalar soni: ${obj.rooms} xona\n📐 Maydoni (Площадь): ${obj.area} m²\n🏢 Qavati: ${obj.floor}\n🛠 Ta'miri (Ремонт): ${obj.repair}\n💵 Oylik to'lov (Цена): $${(obj.price ?? 0).toLocaleString()} / oy\n\n📝 <b>Tavsif:</b> ${cleanDesc || "Barcha sharoitlarga ega shinam xonadon ijaraga beriladi."}\n\n📞 <b>Aloqa (Контакты):</b> +998 90 123 45 67 (CRM Operator)\n✍️ <b>Telegram:</b> @rent_crm_operator\n#ijara #tashkent #apartment #${districtTag.toLowerCase()}`;

    try {
        let res;
        if (resolvedSources.length === 0) {
            res = await fetch(`${API_URL}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: 'HTML' })
            });
        } else if (resolvedSources.length === 1) {
            const src = resolvedSources[0];
            if (src.type === 'file') {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', caption);
                formData.append('parse_mode', 'HTML');
                
                const fileBuffer = fs.readFileSync(src.value);
                const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
                formData.append('photo', blob, 'photo.jpg');
                
                res = await fetch(`${API_URL}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                res = await fetch(`${API_URL}/sendPhoto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, photo: src.value, caption: caption, parse_mode: 'HTML' })
                });
            }
        } else {
            const formData = new FormData();
            formData.append('chat_id', chatId);
            
            const media = [];
            resolvedSources.forEach((src, idx) => {
                const attachName = `photo_${idx}`;
                if (src.type === 'file') {
                    media.push({
                        type: 'photo',
                        media: `attach://${attachName}`,
                        caption: idx === 0 ? caption : undefined,
                        parse_mode: idx === 0 ? 'HTML' : undefined
                    });
                    const fileBuffer = fs.readFileSync(src.value);
                    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
                    formData.append(attachName, blob, `${attachName}.jpg`);
                } else {
                    media.push({
                        type: 'photo',
                        media: src.value,
                        caption: idx === 0 ? caption : undefined,
                        parse_mode: idx === 0 ? 'HTML' : undefined
                    });
                }
            });
            
            formData.append('media', JSON.stringify(media));
            
            res = await fetch(`${API_URL}/sendMediaGroup`, {
                method: 'POST',
                body: formData
            });
        }
        const json = await res.json();
        if (!json.ok) {
            throw new Error(json.description || "Telegram API Error");
        }
    } catch (e) {
        console.error("Error sending object to Telegram:", e);
        throw e;
    }
}

async function handleSharedTarget(operatorChatId, targetChatId, forceDM = false) {
    const objIds = pendingShares[operatorChatId];
    if (!objIds || objIds.length === 0) {
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: "❌ Faol ulashish so'rovi topilmadi. Iltimos, CRM saytidan qaytadan ulashish tugmasini bosing.",
                reply_markup: { remove_keyboard: true }
            })
        });
        return;
    }

    if (forceDM) {
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: `📥 Obyektlar o'zingizga yuborilmoqda... (${objIds.length} ta obyekt)`,
                reply_markup: { remove_keyboard: true }
            })
        });
        for (const id of objIds) {
            try {
                await sendObjectToChat(operatorChatId, id);
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.error("Self send failed:", e);
            }
        }
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: `✅ Barcha obyektlar yuborildi. Endi bu xabarlarni kerakli mijozga Forward (Переслать) qilishingiz mumkin!`
            })
        });
        delete pendingShares[operatorChatId];
        return;
    }

    await fetch(`${API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: operatorChatId,
            text: `⏳ Tanlangan chatga yuborilmoqda...`,
            reply_markup: { remove_keyboard: true }
        })
    });

    try {
        for (const id of objIds) {
            await sendObjectToChat(targetChatId, id);
            await new Promise(r => setTimeout(r, 1000));
        }

        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: `✅ Barcha obyektlar tanlangan chatga muvaffaqiyatli yuborildi!`
            })
        });
        delete pendingShares[operatorChatId];
    } catch (error) {
        console.error("Direct share failed, falling back to DM:", error);

        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: `⚠️ Tanlangan chatga to'g'ridan-to'g'ri yuborib bo'lmadi (foydalanuvchi botni boshlamagan yoki bot guruhda yo'q).\n\n📥 Obyektlarni o'zingizga yuboraman. Ularni kerakli chatga forward (переслать) qilishingiz mumkin:`
            })
        });

        for (const id of objIds) {
            try {
                await sendObjectToChat(operatorChatId, id);
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.error("Fallback send failed:", e);
            }
        }

        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: operatorChatId,
                text: `✅ Barcha obyektlar o'zingizga yuborildi. Endi ularni forward qilishingiz mumkin!`
            })
        });
        delete pendingShares[operatorChatId];
    }
}

async function handleUpdate(update) {
    if (!update.message) return;
    const chatId = update.message.chat.id;
    const text = update.message.text;

    if (update.message.users_shared && update.message.users_shared.users && update.message.users_shared.users.length > 0) {
        const targetChatId = update.message.users_shared.users[0].user_id;
        await handleSharedTarget(chatId, targetChatId);
        return;
    }
    if (update.message.chat_shared) {
        const targetChatId = update.message.chat_shared.chat_id;
        await handleSharedTarget(chatId, targetChatId);
        return;
    }
    if (update.message.user_shared) {
        const targetChatId = update.message.user_shared.user_id;
        await handleSharedTarget(chatId, targetChatId);
        return;
    }

    if (text === "📥 O'zimga yuborish (DM)") {
        await handleSharedTarget(chatId, chatId, true);
        return;
    }

    if (text && text.startsWith('/start ')) {
        const payload = text.split(' ')[1]; // "obj_123-obj_456"
        const objIds = payload.split('-');
        
        pendingShares[chatId] = objIds;
        
        await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: `🗂 <b>Obyektlar tanlandi:</b> ${objIds.length} ta uyni ulashishga tayyor.\n\nUshbu obyektlarni kimga yubormoqchisiz? Quyidagi tugmalardan birini bosing va chatni tanlang:`,
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: "👤 Mijozni tanlash",
                                request_users: {
                                    request_id: 1,
                                    user_is_bot: false,
                                    max_quantity: 1
                                }
                            }
                        ],
                        [
                            {
                                text: "👥 Guruhni tanlash",
                                request_chat: {
                                    request_id: 2,
                                    chat_is_channel: false
                                }
                            },
                            {
                                text: "📣 Kanalni tanlash",
                                request_chat: {
                                    request_id: 3,
                                    chat_is_channel: true
                                }
                            }
                        ],
                        [
                            {
                                text: "📥 O'zimga yuborish (DM)"
                            }
                        ]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            })
        });
    }
}

let lastUpdateId = 0;

async function poll() {
    try {
        const res = await fetch(`${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const json = await res.json();
        
        if (json.ok && json.result.length > 0) {
            for (const update of json.result) {
                lastUpdateId = update.update_id;
                await handleUpdate(update);
            }
        }
    } catch (e) {
        console.error("Polling error:", e.message);
    }
    // Loop
    setTimeout(poll, 1000);
}

console.log("🚀 Telegram CRM Bot Ishga Tushdi!");
poll();
