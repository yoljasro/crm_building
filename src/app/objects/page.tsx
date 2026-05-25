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
    Archive
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
  description: string;
  ownerId: string;
  createdAt: string;
}

const districts = ["Barchasi", "Mirabad", "Yakkasaray", "Tashkent City", "Shaykhantakhur", "Yunusabad", "Chilanzar", "Mirzo Ulugbek"];

export default function ObjectsPage() {
    // API data states
    const [objects, setObjects] = useState<RentalObject[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [selectedDistrict, setSelectedDistrict] = useState("Barchasi");
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
            const objRes = await fetch('/api/objects');
            const objJson = await objRes.json();
            if (objJson.success) {
                setObjects(objJson.data);
            }

            const ownerRes = await fetch('/api/owners');
            const ownerJson = await ownerRes.json();
            if (ownerJson.success) {
                setOwners(ownerJson.data);
                if (ownerJson.data.length > 0) {
                    setAddObjectForm(prev => ({ ...prev, ownerId: ownerJson.data[0].id }));
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
    }, []);

    // Filter logic
    const filteredObjects = objects.filter(obj => {
        // District filter
        const matchesDistrict = selectedDistrict === "Barchasi" || obj.district === selectedDistrict;

        // Search query filter (name or address)
        const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.address.toLowerCase().includes(searchQuery.toLowerCase());

        // Price Min filter
        const matchesPriceMin = appliedFilters.priceMin === "" || obj.price >= Number(appliedFilters.priceMin);

        // Price Max filter
        const matchesPriceMax = appliedFilters.priceMax === "" || obj.price <= Number(appliedFilters.priceMax);

        // Rooms filter
        const matchesRooms = appliedFilters.rooms === "" || obj.rooms === Number(appliedFilters.rooms);

        // Area Min filter
        const matchesAreaMin = appliedFilters.areaMin === "" || obj.area >= Number(appliedFilters.areaMin);

        // Area Max filter
        const matchesAreaMax = appliedFilters.areaMax === "" || obj.area <= Number(appliedFilters.areaMax);

        // Status filter
        const matchesStatus = appliedFilters.status === "Barchasi" || obj.status === appliedFilters.status;

        return matchesDistrict && matchesSearch && matchesPriceMin && matchesPriceMax && matchesRooms && matchesAreaMin && matchesAreaMax && matchesStatus;
    });

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
                // Refresh list and close modal
                await fetchData();
                setIsAddModalOpen(false);
                // Reset form
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
        setSearchQuery("");
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
                                        <option value="band">Band (Занято)</option>
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
                                        <option value="band">Band (Занято)</option>
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
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

            {/* RESULTS GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Obyektlar yuklanmoqda...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredObjects.map(object => {
                            const statusInfo = getStatusDetails(object.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                                <Link key={object.id} href={`/objects/${object.id}`} className="block group">
                                    <div className="glass-card bg-white border border-gray-100 shadow-sm group hover:shadow-xl rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-300">
                                        <div className="relative h-56 overflow-hidden bg-gray-100">
                                            <img
                                                src={object.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"}
                                                alt={object.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Status Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md",
                                                    statusInfo.badgeClass
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dotClass)} />
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            {/* Price Badge */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <span className="px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white font-black text-base shadow-sm">
                                                    ${object.price.toLocaleString()} / oy
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-outfit">
                                                    {object.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                    {object.address}, {object.district}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 py-1">
                                                <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                                                    <Maximize2 className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-gray-700">{object.area} m²</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                                                    <BedDouble className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-gray-700">{object.rooms} xona</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                                                    <Layers className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-gray-700">{object.floor} qavat</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl">
                                                    <Hammer className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-gray-700 line-clamp-1">{object.repair}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-bold">
                                                        {owners.find(o => o.id === object.ownerId)?.name || "Mulkdor"}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                    Batafsil &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {filteredObjects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
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
                </>
            )}
        </div>
    );
}
