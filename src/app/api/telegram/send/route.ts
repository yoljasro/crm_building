import { NextRequest, NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

const BOT_TOKEN = '8917186069:AAGynaOv_sZ-7nXCpIOXy-TxHin3axAfz6A';

function stripPhonesAndContacts(text: string): string {
  if (!text) return "";
  
  // 1. Uzbek phone numbers: +998 90 123 45 67, 998901234567, 901234567, etc.
  const uzbPhoneRegex = /\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g;
  
  // 2. Match t.me/ links containing phone numbers
  const tmePhoneRegex = /t\.me\/\/\+?998\d+/g;
  
  // 3. Match general phone numbers (e.g. 9-digit numbers)
  const phoneLabelRegex = /(?:tel|phone|номер|тел|алоqa|контакты)[\s:]*\+?\d[\s\d-]{7,15}/gi;
  
  let cleaned = text.replace(uzbPhoneRegex, "");
  cleaned = cleaned.replace(phoneLabelRegex, "");
  cleaned = cleaned.replace(tmePhoneRegex, "");
  
  // Clean up lines that contain telephone labels or numbers
  cleaned = cleaned.split("\n")
    .filter(line => {
      const l = line.toLowerCase().trim();
      // If the line (stripped of non-digits) has 7 or more digits, it's likely a phone number
      const digits = line.replace(/[^\d+]/g, '');
      if (digits.length >= 7) {
        return false;
      }
      if (l.includes("tel:") || l.includes("telefon:") || l.includes("номер тел") || l.includes("алоқа") || l.includes("murojaat")) {
        return false;
      }
      return true;
    })
    .join("\n");
  
  return cleaned.trim();
}

function getAbsoluteImageUrl(url: string, origin: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function POST(req: NextRequest) {
  try {
    const { objectIds, chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ success: false, error: "Telegram chat ID yoki username kiritilishi shart" }, { status: 400 });
    }
    if (!objectIds || !Array.isArray(objectIds) || objectIds.length === 0) {
      return NextResponse.json({ success: false, error: "Obyekt ID lari topilmadi" }, { status: 400 });
    }

    const db = readDB();
    const origin = req.nextUrl.origin || "http://159.223.105.135:3000";

    const results = [];

    for (const objId of objectIds) {
      const obj = db.objects.find(o => o.id === objId);
      if (!obj) continue;

      // Prepare images list (up to 10 images as per Telegram limits)
      const imageUrls: string[] = [];
      if (obj.image) {
        imageUrls.push(getAbsoluteImageUrl(obj.image, origin));
      }
      if (obj.images && Array.isArray(obj.images)) {
        obj.images.forEach(img => {
          if (img) imageUrls.push(getAbsoluteImageUrl(img, origin));
        });
      }

      // Limit to 10 unique photos
      const finalImages = Array.from(new Set(imageUrls)).slice(0, 10);

      // Prepare description/caption text
      const cleanDesc = stripPhonesAndContacts(obj.description);
      const districtTag = obj.district.replace(/\s+/g, '');

      const caption = `🏢 <b>IJARA / АРЕНДА KVARTIRA</b>

📍 Tuman (Район): ${obj.district}
🛣 Manzil: ${obj.address}
🛏 Xonalar soni: ${obj.rooms} xona
📐 Maydoni (Площадь): ${obj.area} m²
🏢 Qavati: ${obj.floor}
🛠 Ta'miri (Ремонт): ${obj.repair}
💵 Oylik to'lov (Цена): $${(obj.price ?? 0).toLocaleString()} / oy

📝 <b>Tavsif:</b> ${cleanDesc || "Barcha sharoitlarga ega shinam xonadon ijaraga beriladi."}

📞 <b>Aloqa (Контакты):</b> +998 90 123 45 67 (CRM Operator)
✍️ <b>Telegram:</b> @rent_crm_operator
#ijara #tashkent #apartment #${districtTag.toLowerCase()}`;

      // Send to Telegram
      if (finalImages.length === 0) {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: caption,
            parse_mode: 'HTML'
          })
        });
        const resJson = await response.json();
        results.push({ objectId: objId, success: resJson.ok, response: resJson });
      } else if (finalImages.length === 1) {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: finalImages[0],
            caption: caption,
            parse_mode: 'HTML'
          })
        });
        const resJson = await response.json();
        results.push({ objectId: objId, success: resJson.ok, response: resJson });
      } else {
        const media = finalImages.map((img, idx) => ({
          type: 'photo',
          media: img,
          caption: idx === 0 ? caption : undefined,
          parse_mode: idx === 0 ? 'HTML' : undefined
        }));

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            media: media
          })
        });
        const resJson = await response.json();
        results.push({ objectId: objId, success: resJson.ok, response: resJson });
      }
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      const desc = failed[0].response?.description || "Noma'lum Telegram xatoligi";
      return NextResponse.json({
        success: false,
        error: `Telegram xatosi: "${desc}". Bot (@crm_building_bot) ushbu chat/guruhga qo'shilganligini, admin huquqlari berilganligini yoki chat manzili to'g'riligini tekshiring.`
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
