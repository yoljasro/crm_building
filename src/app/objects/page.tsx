"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    MapPin,
    Maximize2,
    BedDouble,
    Layers,
    Hammer,
    DollarSign,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const districts = ["Barchasi", "Mirabad", "Yakkasaray", "Tashkent City", "Shaykhantakhur", "Yunusabad"];

const objectsData = [
    {
        id: 1,
        name: "Mirabad Avenue",
        district: "Mirabad",
        address: "Mirabad ko'chasi, 12",
        price: "$650,000",
        rooms: 3,
        area: "120 m²",
        floor: "8-qavat",
        repair: "Yangi ta'mir",
        status: "Sotuvda",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "City Palace Apartment",
        district: "Tashkent City",
        address: "Tashkent City, 4-blok",
        price: "$450,000",
        rooms: 2,
        area: "85 m²",
        floor: "12-qavat",
        repair: "Dizaynerlik",
        status: "Sotuvda",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Premium Residence",
        district: "Yakkasaray",
        address: "Shota Rustaveli ko'chasi",
        price: "$2,500 / oy",
        rooms: 4,
        area: "160 m²",
        floor: "3-qavat",
        repair: "Lux",
        status: "Ijaraga",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop"
    }
];

export default function ObjectsPage() {
    const [selectedDistrict, setSelectedDistrict] = useState("Barchasi");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredObjects = objectsData.filter(obj => {
        const matchesDistrict = selectedDistrict === "Barchasi" || obj.district === selectedDistrict;
        const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDistrict && matchesSearch;
    });

    console.log("Current District:", selectedDistrict);
    console.log("Search Query:", searchQuery);
    console.log("Filtered Count:", filteredObjects.length);

    return (
        <div className="space-y-8">
            {/* Modals Placeholder */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-4">Yangi obyekt qo'shish</h2>
                        <p className="text-gray-500 mb-6">Ushbu modul hozirda ishlab chiqilmoqda (Phase 2 Backend integratsiyasi kutilmoqda).</p>
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            )}

            {isFilterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-4">Filtrlar</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Narx diapazoni</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="text" placeholder="Dan" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm" />
                                    <input type="text" placeholder="Gacha" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Maydoni (m²)</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="text" placeholder="Min" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm" />
                                    <input type="text" placeholder="Max" className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm" />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl"
                        >
                            Qidirish
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Obyektlar</h1>
                    <p className="text-gray-500">Ko'chmas mulk obyeklari bazasi</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Yangi obyekt qo'shish
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* District Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {districts.map(district => (
                        <button
                            key={district}
                            onClick={() => setSelectedDistrict(district)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                                selectedDistrict === district
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "bg-white text-gray-600 border border-gray-100 hover:border-blue-200"
                            )}
                        >
                            {district}
                        </button>
                    ))}
                </div>

                <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Manzil, narx yoki nomi bo'yicha qidirish..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtrlar
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredObjects.map(object => (
                    <Link key={object.id} href={`/objects/${object.id}`} className="block">
                        <div className="glass-card group animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={object.image}
                                    alt={object.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white",
                                        object.status === "Sotuvda" ? "bg-emerald-500/80 backdrop-blur-md" : "bg-blue-500/80 backdrop-blur-md"
                                    )}>
                                        {object.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                    <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white font-bold text-sm">
                                        {object.price}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{object.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {object.address}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Maximize2 className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700">{object.area}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <BedDouble className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700">{object.rooms} xona</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700">{object.floor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Hammer className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700">{object.repair}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                JS
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                            +3
                                        </div>
                                    </div>
                                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                        Batafsil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {filteredObjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium tracking-tight">Hech qanday obyekt topilmadi</p>
                    <button
                        onClick={() => { setSearchQuery(""); setSelectedDistrict("Barchasi"); }}
                        className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                    >
                        Filtrlarni tozalash
                    </button>
                </div>
            )}
        </div>
    );
}
