"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    MessageSquare,
    ChevronDown,
    Download,
    X,
    User,
    Trash2,
    CheckCircle2,
    PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  type: string; // "ijara", "sotuv"
  budget: number;
  rooms: number;
  status: "yangi" | "jarayonda" | "qiziqish_bor" | "kutishda" | "arxiv";
  agent: string;
  date: string;
}

const sources = ["Telegram", "Instagram", "WhatsApp", "AI Agent", "Website", "Tavsiya", "Boshqa"];
const statuses = [
    { value: "yangi", label: "Yangi", badgeClass: "bg-blue-50 text-blue-600 border border-blue-100" },
    { value: "jarayonda", label: "Jarayonda", badgeClass: "bg-amber-50 text-amber-600 border border-amber-100" },
    { value: "qiziqish_bor", label: "Qiziqish bor", badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    { value: "kutishda", label: "Kutishda", badgeClass: "bg-purple-50 text-purple-600 border border-purple-100" },
    { value: "arxiv", label: "Arxiv", badgeClass: "bg-slate-50 text-slate-600 border border-slate-100" }
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Barchasi');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form inputs
    const [form, setForm] = useState({
        name: "",
        phone: "",
        source: "Telegram",
        type: "ijara",
        budget: "",
        rooms: "2",
        status: "yangi" as "yangi" | "jarayonda" | "qiziqish_bor" | "kutishda" | "arxiv",
        agent: "Asilbek"
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/leads');
            const json = await res.json();
            if (json.success) {
                setLeads(json.data);
            }
        } catch (error) {
            console.error("Lidlarni yuklashda xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.agent.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'Barchasi' || lead.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    budget: Number(form.budget),
                    rooms: Number(form.rooms)
                })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsAddModalOpen(false);
                setForm({
                    name: "",
                    phone: "",
                    source: "Telegram",
                    type: "ijara",
                    budget: "",
                    rooms: "2",
                    status: "yangi",
                    agent: "Asilbek"
                });
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Lid qo'shishda xatolik:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu lid/mijozni o'chirmoqchisiz?")) return;

        try {
            const res = await fetch('/api/leads', {
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
            console.error("Lidni o'chirishda xatolik:", error);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: any) => {
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
            }
        } catch (error) {
            console.error("Lid statusini o'zgartirishda xatolik:", error);
        }
    };

    const handleCall = async (targetId: string, phone: string, name: string) => {
        const managerId = 12; // Example fixed manager ID for demo
        if (!confirm(`${name} (${phone}) raqamiga qo'ng'iroq yuborilsinmi?`)) return;

        try {
            const res = await fetch('/api/agent/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    managerId,
                    phone,
                    targetId,
                    targetModel: 'lead'
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
            {/* ADD LEAD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Yangi lid (mijoz) qo'shish
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
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mijoz Ismi</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masalan: Aliyor Bekov"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manba</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.source}
                                        onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))}
                                    >
                                        {sources.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Turi</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.type}
                                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="ijara">Ijaraga olish</option>
                                        <option value="sotib_olish">Sotib olish</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Maksimal Budjet ($)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Masalan: 1200"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.budget}
                                        onChange={(e) => setForm(prev => ({ ...prev, budget: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Minimal Xonalar soni</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.rooms}
                                        onChange={(e) => setForm(prev => ({ ...prev, rooms: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mas'ul xodim (Agent)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.agent}
                                        onChange={(e) => setForm(prev => ({ ...prev, agent: e.target.value }))}
                                    >
                                        <option value="Asilbek">Asilbek</option>
                                        <option value="Madina">Madina</option>
                                        <option value="Javlon">Javlon</option>
                                        <option value="Sevinch">Sevinch</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Holati (Status)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.status}
                                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                                    >
                                        <option value="yangi">Yangi</option>
                                        <option value="jarayonda">Jarayonda</option>
                                        <option value="qiziqish_bor">Qiziqish bor</option>
                                        <option value="kutishda">Kutishda</option>
                                        <option value="arxiv">Arxiv</option>
                                    </select>
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

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Lidlar va Mijozlar Bazasi</h1>
                    <p className="text-gray-500">Mijozlar oqimi, ijaraga yoki sotib olishga bo'lgan talablar boshqaruvi</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi lid qo'shish
                    </button>
                </div>
            </div>

            {/* FILTERS */}
            <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/70 border border-gray-100 shadow-sm rounded-3xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Mijoz ismi, telefoni yoki agent ismi bo'yicha qidirish..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all flex-1 md:flex-none"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="Barchasi">Barcha statuslar</option>
                        <option value="yangi">Yangi</option>
                        <option value="jarayonda">Jarayonda</option>
                        <option value="qiziqish_bor">Qiziqish bor</option>
                        <option value="kutishda">Kutishda</option>
                        <option value="arxiv">Arxiv</option>
                    </select>
                </div>
            </div>

            {/* LEADS TABLE */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Lidlar yuklanmoqda...</p>
                </div>
            ) : (
                <div className="glass-card bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-bold">Mijoz</th>
                                    <th className="px-6 py-4 font-bold">Manba</th>
                                    <th className="px-6 py-4 font-bold">Talab turi / Xona</th>
                                    <th className="px-6 py-4 font-bold">Budjet</th>
                                    <th className="px-6 py-4 font-bold">Mas'ul Agent</th>
                                    <th className="px-6 py-4 font-bold">Holati</th>
                                    <th className="px-6 py-4 font-bold text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLeads.map((lead) => {
                                    const currentStatusObj = statuses.find(s => s.value === lead.status);
                                    return (
                                        <tr key={lead.id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                                                    <span className="text-xs text-gray-500">{lead.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className="font-bold text-blue-600">
                                                    {lead.type === "ijara" ? "Ijaraga" : "Sotib olish"}
                                                </span>
                                                <span className="text-xs text-gray-400 block mt-0.5">{lead.rooms} xonali</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-gray-900">
                                                ${lead.budget.toLocaleString()} {lead.type === "ijara" ? "/ oy" : ""}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                        {lead.agent[0]}
                                                    </div>
                                                    <span className="text-sm text-gray-700 font-bold">{lead.agent}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer",
                                                        currentStatusObj?.badgeClass
                                                    )}
                                                    value={lead.status}
                                                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                >
                                                    {statuses.map(st => (
                                                        <option key={st.value} value={st.value} className="text-gray-800 bg-white">
                                                            {st.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleCall(lead.id, lead.phone, lead.name)}
                                                        className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-lg shadow-green-500/20"
                                                        title="Qo'ng'iroq (Agent orqali)"
                                                    >
                                                        <PhoneCall className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`https://t.me/${lead.phone.replace(/[\s+]/g, '')}`, '_blank')}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Telegram"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="O'chirish"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-bold">
                        <span>Jami {filteredLeads.length} ta faol mijoz (lid) ko'rsatilmoqda</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mr-2">Rent CRM</span>
                        </div>
                    </div>
                </div>
            )}

            {filteredLeads.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <User className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold tracking-tight text-sm font-outfit">Hech qanday lid/mijoz topilmadi</p>
                    <button
                        onClick={() => { setSearchTerm(""); setSelectedStatus("Barchasi"); }}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        Tozalash
                    </button>
                </div>
            )}
        </div>
    );
}
