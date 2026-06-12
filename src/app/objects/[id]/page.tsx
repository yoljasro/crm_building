"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Maximize2,
    BedDouble,
    Layers,
    Hammer,
    User,
    Phone,
    MessageCircle,
    Share2,
    Heart,
    Copy,
    Check,
    Send,
    Edit2,
    Info,
    Calendar,
    Save,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegram?: string;
}

interface RentalObject {
  id: string;
  name: string;
  district: string;
  address: string;
  price: number;
  rooms: number;
  area: number;
  floor: string;
  repair: string;
  status: "bo'sh" | "band" | "bo'shaydi" | "arxiv";
  image: string;
  images?: string[];
  description: string;
  ownerId: string;
  createdAt: string;
}

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [object, setObject] = useState<RentalObject | null>(null);
    const [owner, setOwner] = useState<Owner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'olx' | 'telegram' | 'joy'>('telegram');
    const [copied, setCopied] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<"bo'sh" | "band" | "bo'shaydi" | "arxiv">("bo'sh");
    const [selectedImage, setSelectedImage] = useState<string>('');

    // Telegram share modal states
    const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
    const [telegramChatId, setTelegramChatId] = useState("");
    const [isSendingTelegram, setIsSendingTelegram] = useState(false);

    // Load saved Telegram Chat ID from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('crm_tg_chat_id');
            if (saved) setTelegramChatId(saved);
            else setTelegramChatId('@rent_crm_operator');
        }
    }, []);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const objRes = await fetch(`/api/objects?id=${params.id}`);
            const objJson = await objRes.json();
            if (objJson.success) {
                const foundObj = objJson.data;
                if (foundObj) {
                    setObject(foundObj);
                    setNewStatus(foundObj.status);
                    setSelectedImage(foundObj.image);

                    // Fetch owner details
                    const ownerRes = await fetch('/api/owners');
                    const ownerJson = await ownerRes.json();
                    if (ownerJson.success) {
                        const foundOwner = ownerJson.data.find((ow: any) => ow.id === foundObj.ownerId);
                        setOwner(foundOwner || null);
                    }
                }
            }
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [params.id]);

    const handleSendDirectTelegram = async () => {
        if (!object) return;
        if (!telegramChatId) {
            alert("Iltimos, Telegram chat ID yoki guruh usernamini kiriting!");
            return;
        }
        setIsSendingTelegram(true);
        try {
            const res = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    objectIds: [object.id],
                    chatId: telegramChatId
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Muvaffaqiyatli yuborildi! ✅");
                localStorage.setItem('crm_tg_chat_id', telegramChatId);
                setIsTelegramModalOpen(false);
            } else {
                alert("Xatolik yuz berdi: " + json.error);
            }
        } catch (error) {
            console.error("Telegramga yuborishda xatolik:", error);
            alert("Tizim xatosi!");
        } finally {
            setIsSendingTelegram(false);
        }
    };

    const handleShareTelegramLink = () => {
        if (!object) return;
        try {
            const cleanDesc = object.description
                ? object.description
                    .replace(/\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '')
                    .replace(/(?:tel|phone|номер|тел|алоqa|контакты)[\s:]*\+?\d[\s\d-]{7,15}/gi, '')
                    .replace(/t\.me\/\/\+?998\d+/g, '')
                    .trim()
                : "";

            const header = `🏢 IJARA / АРЕНДА KVARTIRA`;
            const specs = `
📍 Tuman (Район): ${object.district}
🛣 Manzil: ${object.address}
🛏 Xonalar soni: ${object.rooms} xona
📐 Maydoni (Площадь): ${object.area} m²
🏢 Qavati: ${object.floor}
🛠 Ta'miri (Ремонт): ${object.repair}
💵 Oylik to'lov (Цена): $${(object.price ?? 0).toLocaleString()} / oy
`;
            const text = `🏢 *${header}* 🏢
${specs}
📝 *Tavsif:* ${cleanDesc || "Barcha sharoitlarga ega shinam xonadon ijaraga beriladi."}

📞 *Aloqa (Контакты):* +998 90 123 45 67 (CRM Operator)
✍️ *Telegram:* @rent_crm_operator
🔗 *Batafsil ma'lumot:* ${window.location.origin}/objects/${object.id}
#ijara #tashkent #apartment #${object.district.replace(/\s+/g, '').toLowerCase()}`;

            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
            window.open(shareUrl, '_blank');
            localStorage.setItem('crm_tg_chat_id', telegramChatId);
            setIsTelegramModalOpen(false);
        } catch (error) {
            console.error("Ssilka tayyorlashda xatolik:", error);
        }
    };

    const handleSaveStatus = async () => {
        if (!object) return;
        try {
            const res = await fetch('/api/objects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: object.id, status: newStatus })
            });
            const json = await res.json();
            if (json.success) {
                setObject(prev => prev ? { ...prev, status: newStatus } : null);
                setIsEditingStatus(false);
            }
        } catch (error) {
            console.error("Statusni yangilashda xatolik:", error);
        }
    };

    // Text Generators
    const generateAdText = (platform: 'olx' | 'telegram' | 'joy') => {
        if (!object) return "";

        const districtTag = object.district.replace(/\s+/g, '');
        const header = `🏢 IJARA / АРЕНДА KVARTIRA`;
        const specs = `
📍 Tuman (Район): ${object.district}
🛣 Manzil: ${object.address}
🛏 Xonalar soni: ${object.rooms} xona
📐 Maydoni (Площадь): ${object.area} m²
🏢 Qavati: ${object.floor}
🛠 Ta'miri (Ремонт): ${object.repair}
💵 Oylik to'lov (Цена): $${object?.price ? object.price.toLocaleString() : "N/A"} / oy
`;

        const footer = `
📞 Aloqa (Контакты): +998 90 123 45 67 (CRM Operator)
✍️ Telegram: @rent_crm_operator
#ijara #tashkent #apartment #${districtTag.toLowerCase()}`;

        if (platform === 'telegram') {
            return `✨ **${header}** ✨
${specs}
📝 **Tavsif:** ${object.description || "Barcha sharoitlarga ega shinam xonadon ijaraga beriladi. Barcha maishiy texnikalar va mebellar mavjud."}
${footer}`;
        }

        if (platform === 'olx') {
            return `Kvartira ijaraga beriladi / Сдается квартира!
    
Xususiyatlari:
- Tuman: ${object.district}
- Manzil: ${object.address}
- Xonalar soni: ${object.rooms}
- Maydoni: ${object.area} kv.m
- Qavat: ${object.floor}
- Ta'miri: ${object.repair}

Narxi: $${object?.price ? object.price.toLocaleString() : "N/A"} oyiga.

Qo'shimcha ma'lumot:
${object.description || "Uylarning barcha sharoitlari bor. Jihozlangan va yashash uchun tayyor. Qo'shimcha savollar bo'lsa telefon qiling."}

Telefon: +998 90 123 45 67 (Operator)`;
        }

        // joy.uz
        return `Ijara Obyekti: ${object.name}
        
Joylashuvi: Toshkent shahar, ${object.district} tumani, ${object.address}
Ijara narxi: $${object?.price ? object.price.toLocaleString() : "N/A"} / oyiga

Kvartira parametrlari:
- Xonalar: ${object.rooms} xonali
- Kvadratura: ${object.area} m²
- Qavatligi: ${object.floor}-qavat
- Holati: ${object.repair}

Batafsil tavsif:
${object.description || "Xonadon uzoq muddatga ijaraga beriladi. Mebel va jihozlar yangi, yashash uchun to'liq sharoit qilingan."}

Murojaat uchun: +998 90 123 45 67
Telegram: @rent_crm_operator`;
    };

    const handleCopy = () => {
        const text = generateAdText(activeTab);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Obyekt ma'lumotlari yuklanmoqda...</p>
            </div>
        );
    }

    if (!object) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Info className="w-12 h-12 text-red-500" />
                <p className="text-gray-600 font-bold">Afsuski, obyekt topilmadi.</p>
                <button onClick={() => router.back()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
                    Orqaga qaytish
                </button>
            </div>
        );
    }

    // Status Styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "bo'sh":
                return "bg-emerald-500 text-white shadow-emerald-500/20";
            case "band":
                return "bg-rose-500 text-white shadow-rose-500/20";
            case "bo'shaydi":
                return "bg-amber-500 text-white shadow-amber-500/20";
            case "arxiv":
                return "bg-slate-500 text-white shadow-slate-500/20";
            default:
                return "bg-blue-600 text-white";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                >
                    <div className="p-2 bg-white rounded-2xl border border-gray-100 group-hover:border-blue-100 shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Orqaga qaytish</span>
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsTelegramModalOpen(true)}
                        className="p-2.5 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors text-blue-600 cursor-pointer shadow-sm hover:border-blue-200"
                        title="Telegramda ulashish"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* DETAILS MAIN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images & Main Specifications */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Hero & Gallery */}
                    <div className="space-y-4">
                        <div className="relative h-[420px] rounded-[32px] overflow-hidden shadow-2xl group bg-gray-100 border border-gray-100">
                            <img
                                src={selectedImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"}
                                alt={object.name}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                            <div className="absolute top-6 left-6">
                                <span className={cn(
                                    "px-4.5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 backdrop-blur-md",
                                    getStatusStyle(object.status)
                                )}>
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    {object.status === "bo'sh" ? "Bo'sh (Свободно)" :
                                     object.status === "band" ? "Band (Заняto)" :
                                     object.status === "bo'shaydi" ? "Bo'shaydi (Освобождается)" : "Arxiv (Архив)"}
                                </span>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="bg-black/50 backdrop-blur-md p-6 rounded-[24px] text-white max-w-lg border border-white/10 shadow-lg">
                                    <span className="text-[10px] bg-blue-600 px-2.5 py-1 rounded-lg uppercase font-black tracking-widest inline-block mb-2">
                                        Ijara Obyekti
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-black font-outfit leading-tight">{object.name}</h1>
                                    <div className="flex items-center gap-2 text-white/80 text-xs mt-2">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                        {object.address}, {object.district} tumani
                                    </div>
                                </div>
                                <div className="bg-blue-600 p-5 rounded-[24px] text-white font-black text-2xl shadow-md">
                                    ${object?.price ? object.price.toLocaleString() : "N/A"} <span className="text-xs font-normal">/ oy</span>
                                </div>
                            </div>
                        </div>

                        {/* Image Carousel/Gallery thumbnails */}
                        {object.images && object.images.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto py-2 px-1 no-scrollbar">
                                {object.images.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={cn(
                                            "w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 active:scale-95 shadow-sm",
                                            selectedImage === imgUrl ? "border-blue-600 ring-2 ring-blue-500/20" : "border-transparent hover:border-gray-300"
                                        )}
                                    >
                                        <img src={imgUrl} alt="gallery" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Features Card */}
                    <div className="glass-card bg-white border border-gray-100 shadow-sm p-8 rounded-[32px] space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 font-outfit flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" />
                            Obyekt Xususiyatlari
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1.5 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Maydon</p>
                                <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
                                    <Maximize2 className="w-4.5 h-4.5 text-blue-500" />
                                    {object.area} m²
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Xonalar</p>
                                <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
                                    <BedDouble className="w-4.5 h-4.5 text-blue-500" />
                                    {object.rooms} ta
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Qavat</p>
                                <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
                                    <Layers className="w-4.5 h-4.5 text-blue-500" />
                                    {object.floor} qavat
                                </div>
                            </div>
                            <div className="space-y-1.5 p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Ta'mir</p>
                                <div className="flex items-center gap-2 text-gray-900 font-black text-sm line-clamp-1">
                                    <Hammer className="w-4.5 h-4.5 text-blue-500" />
                                    {object.repair}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 text-sm mb-2">Batafsil Tavsif:</h4>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {object.description || "Ushbu ijara obyektining barcha qulayliklari mavjud. Yangi mebel va maishiy texnikalar bilan jihozlangan. Oila yoki ofis xodimlari uchun juda qulay."}
                            </p>
                        </div>
                    </div>

                    {/* AD TEXT GENERATOR */}
                    <div className="glass-card bg-white border border-gray-100 shadow-sm p-8 rounded-[32px] space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 font-outfit flex items-center gap-2">
                                    <Send className="w-5 h-5 text-blue-600 animate-pulse" />
                                    E'lon Tayyorlash & Kopirayting
                                </h3>
                                <p className="text-gray-400 text-xs mt-0.5">E'lon matnini avtomatik generatsiya qilish</p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                                {(['telegram', 'olx', 'joy'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all",
                                            activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <pre className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs text-gray-700 leading-relaxed font-sans overflow-x-auto whitespace-pre-wrap max-h-80 min-h-[160px]">
                                {generateAdText(activeTab)}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "absolute top-4 right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95",
                                    copied ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Nusxa olindi!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                                        Nusxalash
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Update & Owner Sidebar */}
                <div className="space-y-8">
                    {/* Status Controller Card */}
                    <div className="glass-card bg-white border border-gray-100 shadow-sm p-6 rounded-[32px] space-y-4">
                        <h3 className="font-bold text-gray-900 text-sm font-outfit">Obyekt statusini boshqarish</h3>
                        {isEditingStatus ? (
                            <div className="space-y-3">
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as any)}
                                >
                                    <option value="bo'sh">Bo'sh (Свободно)</option>
                                    <option value="band">Band (Занято)</option>
                                    <option value="bo'shaydi">Bo'shaydi (Освобождается)</option>
                                    <option value="arxiv">Arxiv (Архив)</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingStatus(false)}
                                        className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleSaveStatus}
                                        className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        Saqlash
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingStatus(true)}
                                className="w-full py-3 border border-dashed border-gray-200 text-blue-600 hover:bg-blue-50 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-97"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Statusni o'zgartirish
                            </button>
                        )}
                    </div>

                    {/* Owner Card */}
                    <div className="glass-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl rounded-[32px] space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-[20px] flex items-center justify-center backdrop-blur-md border border-white/10">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Obyekt Egasi (Sohibi)</p>
                                <p className="text-lg font-black font-outfit leading-tight">{owner ? owner.name : "Abdulla Inomov"}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                onClick={() => alert(`Sohibga qo'ng'iroq qilinmoqda: ${owner ? owner.phone : '+998 90 123 45 67'}`)}
                                className="w-full py-3 bg-white text-blue-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all border border-transparent active:scale-95 text-xs shadow-md"
                            >
                                <Phone className="w-4 h-4" />
                                Qo'ng'iroq qilish
                            </button>
                            <button
                                onClick={() => window.open(`https://t.me/${(owner?.telegram || '@abdulla_inomov').replace('@', '')}`, '_blank')}
                                className="w-full py-3 bg-blue-500/40 text-white font-black rounded-2xl flex items-center justify-center gap-2 border border-blue-400/30 hover:bg-blue-500/60 transition-all active:scale-95 text-xs"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Telegram yozish
                            </button>
                        </div>
                    </div>

                    {/* Object History */}
                    <div className="glass-card bg-white border border-gray-100 shadow-sm p-6 rounded-[32px] space-y-4">
                        <h3 className="font-bold text-gray-900 text-sm font-outfit">Obyekt Tarixi</h3>
                        <div className="relative pl-5 border-l-2 border-blue-100 space-y-5 py-1 text-xs">
                            <div className="relative">
                                <div className="absolute -left-[26px] top-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                <p className="font-bold text-gray-900">Obyekt tizimga qo'shildi</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(object.createdAt).toLocaleDateString()} • Asilbek
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[26px] top-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                <p className="font-bold text-gray-900">Narx yangilandi: ${object?.price ? object.price.toLocaleString() : "N/A"}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Avtomatik sinxronizatsiya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Telegram Share Modal */}
            {isTelegramModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <Send className="w-5 h-5 text-blue-600 animate-pulse" />
                                Telegramda ulashish
                            </h2>
                            <button
                                onClick={() => setIsTelegramModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-bold"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-gray-600">
                                    Telegram Chat/Kanal ID yoki Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masalan: @rent_crm_operator yoki -100..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                />
                                <span className="text-[10px] text-gray-400 block mt-1 leading-normal">
                                    Mijoz chat ID'sini kiritishingiz mumkin (agar u botni ishga tushirgan bo'lsa), yoki guruh/kanal username'ini.
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={handleSendDirectTelegram}
                                    disabled={isSendingTelegram}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-50 text-xs shadow-lg shadow-blue-600/20 cursor-pointer"
                                >
                                    {isSendingTelegram ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Bot orqali rasmlar bilan to'g'ridan-to'g'ri yuborish
                                </button>

                                <button
                                    onClick={handleShareTelegramLink}
                                    disabled={isSendingTelegram}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-50 text-xs cursor-pointer"
                                >
                                    <Share2 className="w-4 h-4 text-blue-600" />
                                    Share Link (Ssilka orqali yuborish)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
