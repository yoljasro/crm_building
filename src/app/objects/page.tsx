"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    MapPin,
    Maximize2,
    BedDouble,
    Layers,
    Hammer,
    Filter,
    X,
    Building2,
    DollarSign,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive,
    ChevronLeft,
    ChevronRight,
    Share2,
    Check,
    PhoneCall,
    Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types from our db schema
interface Owner {
  id: string;
  name: string;
  phone: string;
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

const districts = ["Barchasi", "Mirabad", "Yakkasaray", "Tashkent City", "Shaykhantakhur", "Yunusabad", "Chilanzar", "Mirzo Ulugbek"];

export default function ObjectsPage() {
    // API data states
    // API data states
    const [objects, setObjects] = useState<RentalObject[]>([]);
    const [totalObjectsCount, setTotalObjectsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Image modal state
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [modalIndex, setModalIndex] = useState(0);

    // Open image modal with given image URLs
    const openModal = (imgs: string[]) => {
      setModalImages(imgs);
      setModalIndex(0);
      setIsImageModalOpen(true);
    };

    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filter states
    const [selectedDistrict, setSelectedDistrict] = useState("Barchasi");
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
        priceMin: "",
        priceMax: "",
        rooms: "",
        areaMin: "",
        areaMax: "",
        status: "Barchasi"
    });

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

    // Reset page when filters change
    useEffect(() => { 
        setCurrentPage(1); 
    }, [selectedDistrict, searchQuery, appliedFilters]);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [localSearchQuery]);

    // Form inputs for modal filters
    const [filterForm, setFilterForm] = useState({
        priceMin: "",
        priceMax: "",
        rooms: "",
        areaMin: "",
        areaMax: "",
        status: "Barchasi"
    });

    // Add Object Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addObjectForm, setAddObjectForm] = useState({
        name: "",
        district: "Mirabad",
        address: "",
        price: "",
        rooms: "2",
        area: "",
        floor: "3/9",
        repair: "Euro",
        status: "bo'sh" as "bo'sh" | "band" | "bo'shaydi" | "arxiv",
        image: "",
        description: "",
        ownerId: ""
    });

    // Fetch objects and owners from API
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: String(currentPage),
                limit: String(pageSize),
                district: selectedDistrict,
                search: searchQuery,
                priceMin: appliedFilters.priceMin,
                priceMax: appliedFilters.priceMax,
                rooms: appliedFilters.rooms,
                areaMin: appliedFilters.areaMin,
                areaMax: appliedFilters.areaMax,
                status: appliedFilters.status
            });

            const objRes = await fetch(`/api/objects?${queryParams.toString()}`);
            const objJson = await objRes.json();
            if (objJson.success) {
                setObjects(objJson.data);
                setTotalObjectsCount(objJson.total);
            }

            if (owners.length === 0) {
                const ownerRes = await fetch('/api/owners');
                const ownerJson = await ownerRes.json();
                if (ownerJson.success) {
                    setOwners(ownerJson.data);
                    if (ownerJson.data.length > 0) {
                        setAddObjectForm(prev => ({ ...prev, ownerId: ownerJson.data[0].id }));
                    }
                }
            }
        } catch (error) {
            console.error("Ma'lumotlarni yuklashda xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, selectedDistrict, searchQuery, appliedFilters]);

    const paginatedObjects = objects;

    // Add new object submission
    const handleAddObject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/objects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...addObjectForm,
                    price: Number(addObjectForm.price),
                    rooms: Number(addObjectForm.rooms),
                    area: Number(addObjectForm.area),
                })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsAddModalOpen(false);
                setAddObjectForm({
                    name: "",
                    district: "Mirabad",
                    address: "",
                    price: "",
                    rooms: "2",
                    area: "",
                    floor: "3/9",
                    repair: "Euro",
                    status: "bo'sh",
                    image: "",
                    description: "",
                    ownerId: owners[0]?.id || "1"
                });
            } else {
                alert("Xatolik yuz berdi: " + json.error);
            }
        } catch (error) {
            console.error("Obyekt qo'shishda xatolik:", error);
        }
    };

    // Apply Filter modal inputs
    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilters(filterForm);
        setIsFilterModalOpen(false);
    };

    // Clear all filters
    const handleClearFilters = () => {
        const cleared = {
            priceMin: "",
            priceMax: "",
            rooms: "",
            areaMin: "",
            areaMax: "",
            status: "Barchasi"
        };
        setFilterForm(cleared);
        setAppliedFilters(cleared);
        setSelectedDistrict("Barchasi");
        setLocalSearchQuery("");
        setSearchQuery("");
    };

    // Selection helpers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleShareTelegram = () => {
        if (selectedIds.length === 0) return;
        
        if (selectedIds.length > 4) {
            alert("Bot orqali ulashishda bir vaqtning o'zida ko'pi bilan 4 ta uyni tanlash mumkin. Iltimos, ro'yxatni qisqartiring.");
            return;
        }

        // Redirect to Telegram bot
        const payload = selectedIds.join('-');
        const url = `https://t.me/crm_building_bot?start=${payload}`;
        window.open(url, '_blank');
        
        setSelectedIds([]);
    };

    const handleShareTelegramLink = async () => {
        try {
            setIsSendingTelegram(true);
            const res = await fetch(`/api/objects?ids=${selectedIds.join(',')}`);
            const json = await res.json();
            if (!json.success) {
                alert("Ma'lumotlarni yuklab bo'lmadi: " + json.error);
                return;
            }

            const selectedObjects: RentalObject[] = json.data;
            let text = `🏢 *Ijara Obyektlari bo'yicha takliflar:*\n\n`;
            
            selectedObjects.forEach((obj, idx) => {
                const statusDetails = getStatusDetails(obj.status);
                const cleanDesc = obj.description
                    ? obj.description
                        .replace(/\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '')
                        .replace(/(?:tel|phone|номер|тел|алоqa|контакты)[\s:]*\+?\d[\s\d-]{7,15}/gi, '')
                        .replace(/t\.me\/\/\+?998\d+/g, '')
                        .trim()
                    : "";
                
                text += `${idx + 1}️⃣ *${obj.name}*\n`;
                text += `📍 Manzil: ${obj.address}, ${obj.district}\n`;
                text += `💵 Ijara narxi: $${(obj.price ?? 0).toLocaleString()} / oy\n`;
                text += `📐 Maydoni: ${obj.area} m² | 🚪 Xonalar: ${obj.rooms} xona | 🏢 Qavati: ${obj.floor}\n`;
                text += `🔧 Ta'mirlanishi: ${obj.repair}\n`;
                text += `ℹ️ Status: ${statusDetails.label}\n`;
                if (cleanDesc) {
                    const desc = cleanDesc.length > 150 ? cleanDesc.substring(0, 150) + "..." : cleanDesc;
                    text += `📝 Tavsif: ${desc}\n`;
                }
                text += `🔗 Batafsil ma'lumot: ${window.location.origin}/objects/${obj.id}\n\n`;
            });

            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
            window.open(shareUrl, '_blank');
            localStorage.setItem('crm_tg_chat_id', telegramChatId);
            setIsTelegramModalOpen(false);
            setSelectedIds([]);
        } catch (error) {
            console.error("Ssilka tayyorlashda xatolik:", error);
            alert("Tizim xatosi!");
        } finally {
            setIsSendingTelegram(false);
        }
    };

    // Status Helper
    const getStatusDetails = (status: "bo'sh" | "band" | "bo'shaydi" | "arxiv") => {
        switch (status) {
            case "bo'sh":
                return {
                    label: "Bo'sh (Свободно)",
                    badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                    dotClass: "bg-emerald-500",
                    icon: CheckCircle2
                };
            case "band":
                return {
                    label: "Band (Занято)",
                    badgeClass: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
                    dotClass: "bg-rose-500",
                    icon: AlertCircle
                };
            case "bo'shaydi":
                return {
                    label: "Bo'shaydi (Освобождается)",
                    badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                    dotClass: "bg-amber-500",
                    icon: Clock
                };
            case "arxiv":
                return {
                    label: "Arxiv (Архив)",
                    badgeClass: "bg-slate-500/10 text-slate-600 border border-slate-500/20",
                    dotClass: "bg-slate-500",
                    icon: Archive
                };
            default:
                return {
                    label: status ?? "Noma'lum",
                    badgeClass: "bg-gray-500/10 text-gray-600 border border-gray-500/20",
                    dotClass: "bg-gray-400",
                    icon: Archive
                };
        }
    };

    const handleCall = async (ownerId: string) => {
        const owner = owners.find(o => o.id === ownerId);
        if (!owner) return;
        
        const managerId = 12; // Example fixed manager ID for demo
        if (!confirm(`${owner.name} (${owner.phone}) raqamiga qo'ng'iroq yuborilsinmi?`)) return;

        try {
            const res = await fetch('/api/agent/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    managerId,
                    phone: owner.phone,
                    targetId: owner.id,
                    targetModel: 'owner'
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Qo'ng'iroq buyrug'i Android Agent'ga yuborildi!");
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Qo'ng'iroq xatosi:", error);
            alert("Tarmoq xatosi!");
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* ADD OBJECT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Yangi ijara obyekti qo'shish
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddObject} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Obyekt nomi / TAVSIFI</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masalan: Mirabad Avenue Luxury Penthouse"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.name}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tuman</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.district}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, district: e.target.value }))}
                                    >
                                        {districts.filter(d => d !== "Barchasi").map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manzil (Ko'cha, uy)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masalan: Shota Rustaveli ko'chasi, 23-uy"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.address}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Oylik ijara narxi ($)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Masalan: 1500"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.price}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, price: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Xonalar soni</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="10"
                                        placeholder="Masalan: 3"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.rooms}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, rooms: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Maydoni (m²)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Masalan: 95"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.area}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, area: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qavati (Qavat/Jami)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masalan: 4/9"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.floor}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, floor: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ta'mirlanishi</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.repair}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, repair: e.target.value }))}
                                    >
                                        <option value="Euro">Euro ta'mir</option>
                                        <option value="Lux">Lux klass</option>
                                        <option value="Yangi ta'mir">Yangi ta'mir</option>
                                        <option value="O'rtacha">O'rtacha</option>
                                        <option value="Ta'mirsiz">Ta'mirsiz</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Obyekt statusi</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.status}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, status: e.target.value as any }))}
                                    >
                                        <option value="bo'sh">Bo'sh (Свободно)</option>
                                        <option value="band">Band (Заняto)</option>
                                        <option value="bo'shaydi">Bo'shaydi (Освобождается)</option>
                                        <option value="arxiv">Arxiv (Архив)</option>
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mulkdor (Sohibi)</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.ownerId}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, ownerId: e.target.value }))}
                                    >
                                        {owners.map(owner => (
                                            <option key={owner.id} value={owner.id}>{owner.name} ({owner.phone})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rasm Linki (URL)</label>
                                    <input
                                        type="url"
                                        placeholder="Bo'sh qoldirilsa, avtomatik chiroyli rasm qo'yiladi"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={addObjectForm.image}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, image: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qo'shimcha tafsilotlar (Tavsif)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Kvartira haqida batafsil ma'lumot (sharoitlar, yaqin joylar)..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                        value={addObjectForm.description}
                                        onChange={(e) => setAddObjectForm(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm active:scale-95"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FILTER MODAL */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-600" />
                                Kengaytirilgan filtrlar
                            </h2>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleApplyFilters} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ijara narxi (Budjet)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Dan ($)"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={filterForm.priceMin}
                                            onChange={(e) => setFilterForm(prev => ({ ...prev, priceMin: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Gacha ($)"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={filterForm.priceMax}
                                            onChange={(e) => setFilterForm(prev => ({ ...prev, priceMax: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Xonalar soni</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={filterForm.rooms}
                                        onChange={(e) => setFilterForm(prev => ({ ...prev, rooms: e.target.value }))}
                                    >
                                        <option value="">Farqi yo'q</option>
                                        <option value="1">1 xonali</option>
                                        <option value="2">2 xonali</option>
                                        <option value="3">3 xonali</option>
                                        <option value="4">4 xonali</option>
                                        <option value="5">5+ xonali</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Maydoni (m²)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min m²"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={filterForm.areaMin}
                                            onChange={(e) => setFilterForm(prev => ({ ...prev, areaMin: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max m²"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={filterForm.areaMax}
                                            onChange={(e) => setFilterForm(prev => ({ ...prev, areaMax: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Obyekt holati (Status)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        value={filterForm.status}
                                        onChange={(e) => setFilterForm(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="Barchasi">Barchasi</option>
                                        <option value="bo'sh">Bo'sh (Свободно)</option>
                                        <option value="band">Band (Заняto)</option>
                                        <option value="bo'shaydi">Bo'shaydi (Освобождается)</option>
                                        <option value="arxiv">Arxiv (Архив)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm active:scale-95"
                                >
                                    Tozalash
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    Filtrlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Ijara Obyektlari Bazasi</h1>
                    <p className="text-gray-500">Ko'chmas mulk obyeklari, ijara statuslari va egalari boshqaruvi</p>
                </div>
                <button
                    onClick={() => {
                        if (owners.length === 0) {
                            alert("Iltimos, avval egalari (mulkdorlar) bazasiga kamida bitta mulkdor qo'shing!");
                        } else {
                            setIsAddModalOpen(true);
                        }
                    }}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Obyekt qo'shish
                </button>
            </div>

            {/* FILTERS SECTION */}
            <div className="flex flex-col gap-6">
                {/* District Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {districts.map(district => (
                        <button
                            key={district}
                            onClick={() => setSelectedDistrict(district)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all",
                                selectedDistrict === district
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "bg-white text-gray-600 border border-gray-100 hover:border-blue-200"
                            )}
                        >
                            {district}
                        </button>
                    ))}
                </div>

                {/* Search & Filter Buttons */}
                <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/70 border border-gray-100 shadow-sm rounded-3xl">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nomi, ko'cha yoki manzil bo'yicha tezkor qidiruv..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {objects.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (selectedIds.length === objects.length) {
                                        setSelectedIds([]);
                                    } else {
                                        setSelectedIds(objects.map(o => o.id));
                                    }
                                }}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold border rounded-2xl transition-all w-full md:w-auto cursor-pointer",
                                    selectedIds.length > 0
                                        ? "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                                        : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <Share2 className="w-4 h-4 text-blue-600" />
                                {selectedIds.length === objects.length
                                    ? "Tanlovni bekor qilish"
                                    : "Barchasini tanlash"}
                            </button>
                        )}
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-colors w-full md:w-auto"
                        >
                            <Filter className="w-4 h-4 text-blue-600" />
                            Filtrlar
                            {(appliedFilters.priceMin || appliedFilters.priceMax || appliedFilters.rooms || appliedFilters.areaMin || appliedFilters.areaMax || appliedFilters.status !== "Barchasi") && (
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                            )}
                        </button>
                        {(appliedFilters.priceMin || appliedFilters.priceMax || appliedFilters.rooms || appliedFilters.areaMin || appliedFilters.areaMax || appliedFilters.status !== "Barchasi" || searchQuery || selectedDistrict !== "Barchasi") && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-colors whitespace-nowrap"
                            >
                                <X className="w-4 h-4" />
                                Tozalash
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* OBJECTS TABLE */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Obyektlar yuklanmoqda...</p>
                </div>
            ) : (
                <div className="glass-card bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-4 py-4 font-bold w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={paginatedObjects.length > 0 && paginatedObjects.every(o => selectedIds.includes(o.id))}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const newSelected = [...selectedIds];
                                                    paginatedObjects.forEach(o => {
                                                        if (!newSelected.includes(o.id)) {
                                                            newSelected.push(o.id);
                                                        }
                                                    });
                                                    setSelectedIds(newSelected);
                                                } else {
                                                    setSelectedIds(selectedIds.filter(id => !paginatedObjects.map(o => o.id).includes(id)));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-bold">Rasmlar</th>
                                    <th className="px-6 py-4 font-bold">Obyekt nomi / Manzili</th>
                                    <th className="px-6 py-4 font-bold">Narxi</th>
                                    <th className="px-6 py-4 font-bold">Xona / Maydoni</th>
                                    <th className="px-6 py-4 font-bold">Ta'mir / Qavat</th>
                                    <th className="px-6 py-4 font-bold">Mulkdor</th>
                                    <th className="px-6 py-4 font-bold">Holati</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedObjects.map(object => {
                                    const statusInfo = getStatusDetails(object.status);
                                    const isSelected = selectedIds.includes(object.id);
                                    return (
                                        <tr key={object.id} className={cn("group hover:bg-gray-50/30 transition-colors", isSelected && "bg-blue-50/10")}>
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(object.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <img 
                                                    src={object.images?.[0] ?? object.image ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"} 
                                                    alt="" 
                                                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                                                    onClick={() => openModal(object.images?.length ? object.images : [object.image ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"])} 
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/objects/${object.id}`} className="flex flex-col hover:text-blue-600 transition-colors">
                                                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 font-outfit line-clamp-1">{object.name}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-blue-500" />
                                                        {object.address}, {object.district}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-gray-900">
                                                ${(object.price ?? 0).toLocaleString()} / oy
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{object.rooms} xona</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{object.area} m²</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{object.repair}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{object.floor} qavat</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-bold whitespace-nowrap mr-2">
                                                        {owners.find(o => o.id === object.ownerId)?.name || "Mulkdor"}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCall(object.ownerId)}
                                                        className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-md shadow-green-500/20 opacity-0 group-hover:opacity-100"
                                                        title="Qo'ng'iroq (Agent orqali)"
                                                    >
                                                        <PhoneCall className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap",
                                                    statusInfo.badgeClass
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dotClass)} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalObjectsCount === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white border-t border-dashed border-gray-200">
                            <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-bold tracking-tight text-sm">Ushbu filtrlar bo'yicha hech qanday obyekt topilmadi</p>
                            <button
                                onClick={handleClearFilters}
                                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Filtrlarni tozalash
                            </button>
                        </div>
                    )}
                    
                    <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-bold">
                        <span>Jami {totalObjectsCount} ta obyekt topildi</span>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mr-2">Rent CRM</span>
                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p-1, 1))} 
                                    disabled={currentPage===1} 
                                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:hover:bg-white flex items-center gap-1 cursor-pointer"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Oldingi
                                </button>
                                <span className="text-sm px-2 text-gray-700">{currentPage} / {Math.max(1, Math.ceil(totalObjectsCount / pageSize))}</span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(p+1, Math.ceil(totalObjectsCount / pageSize)))} 
                                    disabled={currentPage===Math.ceil(totalObjectsCount / pageSize) || totalObjectsCount === 0} 
                                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors disabled:hover:bg-white flex items-center gap-1 cursor-pointer"
                                >
                                    Keyingi
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* FLOATING TELEGRAM SHARE BAR */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-3xl px-6 py-4 flex items-center justify-between gap-6 z-[90] animate-in slide-in-from-bottom-4 duration-300 max-w-lg w-[calc(100%-2rem)]">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanlangan</span>
                        <span className="text-sm font-black text-gray-900">{selectedIds.length} ta obyekt</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleShareTelegram}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            Telegramda ulashish
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            className="p-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer"
                            title="Tanlovni bekor qilish"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Image Carousel Modal */}
            {isImageModalOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                  <button
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center justify-center bg-gray-100 p-8 min-h-[300px]">
                    <img
                      src={modalImages[modalIndex] ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"}
                      alt={`Image ${modalIndex + 1}`}
                      className="max-w-full h-auto max-h-[70vh] object-contain rounded"
                    />
                  </div>
                  {modalImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setModalIndex((i) => (i === 0 ? modalImages.length - 1 : i - 1))
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2.5 hover:bg-white shadow transition-all active:scale-90"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setModalIndex((i) => (i === modalImages.length - 1 ? 0 : i + 1))
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2.5 hover:bg-white shadow transition-all active:scale-90"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  <div className="p-3 text-center text-xs text-gray-500 font-bold border-t border-gray-100 bg-white">
                      Rasm {modalIndex + 1} / {modalImages.length}
                  </div>
                </div>
              </div>
            )}


        </div>
    );
}
