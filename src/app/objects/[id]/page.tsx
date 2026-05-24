"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Maximize2,
    BedDouble,
    Layers,
    Hammer,
    Wallet,
    Calendar,
    User,
    Phone,
    MessageCircle,
    Share2,
    Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data (should be fetched from DB in a real app)
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
        description: "Premium klassdagi turar-joy majmuasi. Mirabad Avenue - bu poytaxt markazidagi eng nufuzli manzillardan biri. Xonadon yuqori sifatli materiallar bilan ta'mirlangan, panoramik derazalar va keng balkon mavjud.",
        owner: "Abdulla Inomov",
        ownerPhone: "+998 90 123 45 67",
        images: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"
        ]
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
        description: "Tashkent City markazida zamonaviy xonadon. Ajoyib manzara, rivojlangan infratuzilma va yuqori darajadagi xavfsizlik.",
        owner: "Malika Azimova",
        ownerPhone: "+998 91 111 22 33",
        images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"]
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
        description: "Yakkasaray tumanidagi hashamatli hovli uslubidagi xonadon. Barcha sharoitlarga ega, mebel va maishiy texnika bilan jihozlangan.",
        owner: "Olim Toshkentov",
        ownerPhone: "+998 93 999 88 77",
        images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000&auto=format&fit=crop"]
    }
];

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const object = objectsData.find(obj => obj.id === Number(params.id));

    if (!object) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-500">Obyekt topilmadi</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold">Orqaga qaytish</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                >
                    <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:border-blue-100 shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Orqaga qaytish</span>
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-400">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        Tahrirlash
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images & Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                        <img
                            src={object.images[0]}
                            alt={object.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute top-6 left-6">
                            <span className="px-4 py-2 bg-blue-600/90 backdrop-blur-md text-white font-bold rounded-xl text-sm uppercase tracking-wider">
                                {object.status}
                            </span>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl text-white">
                                <h1 className="text-3xl font-bold font-outfit">{object.name}</h1>
                                <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {object.address}, {object.district} tumani
                                </div>
                            </div>
                            <div className="bg-blue-600 p-4 rounded-2xl text-white font-bold text-2xl shadow-xl">
                                {object.price}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="text-xl font-bold mb-6">Asosiy xususiyatlar</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Maydon</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Maximize2 className="w-5 h-5 text-blue-500" />
                                    {object.area}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Xonalar</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <BedDouble className="w-5 h-5 text-blue-500" />
                                    {object.rooms} ta
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Qavat</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Layers className="w-5 h-5 text-blue-500" />
                                    {object.floor}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Ta'mir</p>
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <Hammer className="w-5 h-5 text-blue-500" />
                                    {object.repair}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-gray-100">
                            <h3 className="text-xl font-bold mb-4">Tavsif</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {object.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="glass-card p-6 bg-blue-600 text-white border-none shadow-blue-600/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs text-white/70 font-medium">Egasi (Proprietor)</p>
                                <p className="text-lg font-bold">{object.owner}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all border border-transparent active:scale-95">
                                <Phone className="w-4 h-4" />
                                Qo'ng'iroq qilish
                            </button>
                            <button className="w-full py-3 bg-blue-500/50 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-400/30 hover:bg-blue-500/70 transition-all active:scale-95">
                                <MessageCircle className="w-4 h-4" />
                                Telegram yuborish
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4">Obyekt tarixi</h3>
                        <div className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-blue-100 space-y-4">
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                                    <p className="text-xs font-bold text-gray-900">Obyekt bazaga qo'shildi</p>
                                    <p className="text-[10px] text-gray-400">15 May, 2024 • Admin</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                    <p className="text-xs font-bold text-gray-900">Narx o'zgartirildi: $680,000 -&gt; $650,000</p>
                                    <p className="text-[10px] text-gray-400">20 May, 2024 • Asilbek</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
