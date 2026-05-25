"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    User,
    Phone,
    Mail,
    Send,
    FileText,
    Building2,
    X,
    Trash2,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  telegram: string;
  notes: string;
  createdAt: string;
}

interface RentalObject {
  id: string;
  name: string;
  ownerId: string;
  price: number;
  status: string;
}

export default function OwnersPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [objects, setObjects] = useState<RentalObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        telegram: "",
        notes: ""
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const ownerRes = await fetch('/api/owners');
            const ownerJson = await ownerRes.json();
            if (ownerJson.success) {
                setOwners(ownerJson.data);
            }

            const objRes = await fetch('/api/objects');
            const objJson = await objRes.json();
            if (objJson.success) {
                setObjects(objJson.data);
            }
        } catch (error) {
            console.error("Mulkdorlarni yuklashda xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtered owners
    const filteredOwners = owners.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.phone.includes(searchTerm) ||
        owner.telegram.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/owners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsAddModalOpen(false);
                setForm({
                    name: "",
                    phone: "",
                    email: "",
                    telegram: "",
                    notes: ""
                });
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Mulkdor qo'shishda xatolik:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu mulkdorni o'chirmoqchisiz?")) return;

        try {
            const res = await fetch('/api/owners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Mulkdorni o'chirishda xatolik:", error);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* ADD OWNER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Yangi mulkdor qo'shish
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ism va Familiya</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masalan: Abdulla Inomov"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefon raqami</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masalan: +998 90 123 45 67"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.phone}
                                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (ixtiyoriy)</label>
                                <input
                                    type="email"
                                    placeholder="Masalan: abdulla@gmail.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.email}
                                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telegram username (ixtiyoriy)</label>
                                <input
                                    type="text"
                                    placeholder="Masalan: @abdulla_inomov"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.telegram}
                                    onChange={(e) => setForm(prev => ({ ...prev, telegram: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qo'shimcha izoh</label>
                                <textarea
                                    rows={3}
                                    placeholder="Mulkdor haqida qo'shimcha ma'lumotlar..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    value={form.notes}
                                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                />
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
                                    Qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Mulkdorlar (Sohiblar) Bazasi</h1>
                    <p className="text-gray-500">Obyekt egalari kontaktlari va ularning loyihadagi mulklari</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Mulkdor qo'shish
                </button>
            </div>

            {/* SEARCH */}
            <div className="glass-card p-4 bg-white/70 border border-gray-100 shadow-sm rounded-3xl">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Mulkdor ismi, telefon raqami yoki telegrami bo'yicha qidirish..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* LIST */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Mulkdorlar yuklanmoqda...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOwners.map(owner => {
                        const ownerObjects = objects.filter(o => o.ownerId === owner.id);
                        return (
                            <div key={owner.id} className="glass-card bg-white border border-gray-100 shadow-sm rounded-3xl p-6 hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg font-outfit leading-tight">{owner.name}</h3>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    Qo'shilgan sana: {new Date(owner.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(owner.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="O'chirish"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-gray-50 text-sm">
                                        <div className="flex items-center gap-2.5 text-gray-600">
                                            <Phone className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold">{owner.phone}</span>
                                        </div>
                                        {owner.email && (
                                            <div className="flex items-center gap-2.5 text-gray-600">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                <span className="truncate">{owner.email}</span>
                                            </div>
                                        )}
                                        {owner.telegram && (
                                            <div className="flex items-center gap-2.5 text-gray-600">
                                                <Send className="w-4 h-4 text-blue-500" />
                                                <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                                                    {owner.telegram}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {owner.notes && (
                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 leading-relaxed">
                                            <p className="font-bold text-[10px] uppercase text-gray-400 tracking-wider mb-1">Izoh:</p>
                                            {owner.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-50 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                            Mulklar soni:
                                        </span>
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
                                            {ownerObjects.length} ta
                                        </span>
                                    </div>

                                    {ownerObjects.length > 0 && (
                                        <div className="space-y-1">
                                            {ownerObjects.slice(0, 2).map(o => (
                                                <div key={o.id} className="flex justify-between items-center text-xs p-2 bg-gray-50/50 rounded-xl border border-gray-100">
                                                    <span className="text-gray-600 font-medium truncate max-w-[150px]">{o.name}</span>
                                                    <span className="font-black text-gray-900">${o.price}/oy</span>
                                                </div>
                                            ))}
                                            {ownerObjects.length > 2 && (
                                                <p className="text-[10px] text-center text-gray-400 font-bold">
                                                    + yana {ownerObjects.length - 2} ta mulk...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredOwners.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <User className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-bold tracking-tight text-sm">Hech qanday mulkdor topilmadi</p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Qidiruvni tozalash
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
