"use client";

import React, { useState, useEffect } from 'react';
import {
    Phone,
    PhoneCall,
    PhoneMissed,
    PhoneForwarded,
    Plus,
    Search,
    User,
    Clock,
    Calendar,
    MessageSquare,
    X,
    Filter,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
}

interface Owner {
  id: string;
  name: string;
}

interface CallLog {
  id: string;
  leadId?: string;
  ownerId?: string;
  operator: string;
  duration: number; // in seconds
  status: "javob_berildi" | "javobsiz" | "band" | "xato";
  notes: string;
  date: string;
  audioUrl?: string;
}

export default function CallsPage() {
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Barchasi');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form input state
    const [form, setForm] = useState({
        targetType: "lead", // "lead" or "owner"
        targetId: "",
        operator: "Asilbek",
        durationMin: "",
        durationSec: "",
        status: "javob_berildi" as "javob_berildi" | "javobsiz" | "band",
        notes: ""
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const callRes = await fetch('/api/calls');
            const callJson = await callRes.json();
            if (callJson.success) {
                setCalls(callJson.data);
            }

            const leadRes = await fetch('/api/leads');
            const leadJson = await leadRes.json();
            if (leadJson.success) {
                setLeads(leadJson.data);
            }

            const ownerRes = await fetch('/api/owners');
            const ownerJson = await ownerRes.json();
            if (ownerJson.success) {
                setOwners(ownerJson.data);
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

    // Filter calls
    const filteredCalls = calls.filter(call => {
        // Resolve contact name for search
        let contactName = "Noma'lum";
        if (call.leadId) {
            contactName = leads.find(l => l.id === call.leadId)?.name || "Mijoz";
        } else if (call.ownerId) {
            contactName = owners.find(o => o.id === call.ownerId)?.name || "Mulkdor";
        }

        const matchesSearch = contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.notes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'Barchasi' || call.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const totalDuration = (Number(form.durationMin) * 60) + Number(form.durationSec || 0);
            const body: any = {
                operator: form.operator,
                duration: totalDuration,
                status: form.status,
                notes: form.notes
            };

            if (form.targetType === "lead") {
                body.leadId = form.targetId || undefined;
            } else {
                body.ownerId = form.targetId || undefined;
            }

            const res = await fetch('/api/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsAddModalOpen(false);
                setForm({
                    targetType: "lead",
                    targetId: "",
                    operator: "Asilbek",
                    durationMin: "",
                    durationSec: "",
                    status: "javob_berildi",
                    notes: ""
                });
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Qo'ng'iroqni saqlashda xatolik:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu qo'ng'iroq logini o'chirmoqchisiz?")) return;

        try {
            const res = await fetch('/api/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
            }
        } catch (error) {
            console.error("Xatolik:", error);
        }
    };

    // Format Duration Helper
    const formatDuration = (seconds: number) => {
        if (seconds === 0) return "0s";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    // Status Styling Helper
    const getStatusDetails = (status: "javob_berildi" | "javobsiz" | "band") => {
        switch (status) {
            case "javob_berildi":
                return {
                    label: "Javob berildi",
                    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
                    icon: PhoneCall
                };
            case "javobsiz":
                return {
                    label: "Javobsiz",
                    badgeClass: "bg-rose-50 text-rose-600 border border-rose-100",
                    icon: PhoneMissed
                };
            case "band":
                return {
                    label: "Band",
                    badgeClass: "bg-amber-50 text-amber-600 border border-amber-100",
                    icon: PhoneForwarded
                };
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* RECORD CALL MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <PhoneCall className="w-5 h-5 text-blue-600 animate-bounce" />
                                Qo'ng'iroq qayd etish
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kimga (Mijoz turi)</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.targetType}
                                        onChange={(e) => setForm(prev => ({ ...prev, targetType: e.target.value, targetId: "" }))}
                                    >
                                        <option value="lead">Lid / Mijoz</option>
                                        <option value="owner">Mulkdor / Sohib</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kontaktni tanlang</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.targetId}
                                        onChange={(e) => setForm(prev => ({ ...prev, targetId: e.target.value }))}
                                    >
                                        <option value="">-- Tanlang --</option>
                                        {form.targetType === "lead" ? (
                                            leads.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))
                                        ) : (
                                            owners.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operator</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20"
                                        value={form.operator}
                                        onChange={(e) => setForm(prev => ({ ...prev, operator: e.target.value }))}
                                    >
                                        <option value="Asilbek">Asilbek</option>
                                        <option value="Madina">Madina</option>
                                        <option value="Javlon">Javlon</option>
                                        <option value="Sevinch">Sevinch</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qo'ng'iroq statusi</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20"
                                        value={form.status}
                                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                                    >
                                        <option value="javob_berildi">Javob berildi</option>
                                        <option value="javobsiz">Javobsiz (Qizil)</option>
                                        <option value="band">Band (Kutish)</option>
                                    </select>
                                </div>
                            </div>

                            {form.status === "javob_berildi" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suhbat davomiyligi</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            required
                                            placeholder="Daqiqa"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            value={form.durationMin}
                                            onChange={(e) => setForm(prev => ({ ...prev, durationMin: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Soniya"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            value={form.durationSec}
                                            onChange={(e) => setForm(prev => ({ ...prev, durationSec: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suhbat izohi (Konsultatsiya tafsiloti)</label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Mijoz nima dedi? Qanday kelishuvga erishildi?..."
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
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Qo'ng'iroqlar Tarixi</h1>
                    <p className="text-gray-500">Mijozlar va mulkdorlar bilan amalga oshirilgan barcha suhbatlar jurnali</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Qo'ng'iroq qayd etish
                </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card bg-emerald-50/20 border border-emerald-500/10 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <PhoneCall className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Javob berilganlar</p>
                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                            {calls.filter(c => c.status === "javob_berildi").length} ta
                        </p>
                    </div>
                </div>
                <div className="glass-card bg-rose-50/20 border border-rose-500/10 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/10">
                        <PhoneMissed className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Javobsiz qolganlar</p>
                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                            {calls.filter(c => c.status === "javobsiz").length} ta
                        </p>
                    </div>
                </div>
                <div className="glass-card bg-amber-50/20 border border-amber-500/10 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                        <PhoneForwarded className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Band bo'lganlar</p>
                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                            {calls.filter(c => c.status === "band").length} ta
                        </p>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/70 border border-gray-100 shadow-sm rounded-3xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Mijoz ismi, operator yoki izoh bo'yicha qidirish..."
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
                        <option value="javob_berildi">Javob berildi</option>
                        <option value="javobsiz">Javobsiz</option>
                        <option value="band">Band</option>
                    </select>
                </div>
            </div>

            {/* LIST */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Qo'ng'iroqlar tarixi yuklanmoqda...</p>
                </div>
            ) : (
                <div className="glass-card bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-bold">Kontakt (Mijoz / Mulkdor)</th>
                                    <th className="px-6 py-4 font-bold">Operator</th>
                                    <th className="px-6 py-4 font-bold">Sana va Vaqt</th>
                                    <th className="px-6 py-4 font-bold">Davomiyligi</th>
                                    <th className="px-6 py-4 font-bold">Holati</th>
                                    <th className="px-6 py-4 font-bold">Suhbat Tafsilotlari (Izoh)</th>
                                    <th className="px-6 py-4 font-bold text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCalls.map((call) => {
                                    const statusInfo = getStatusDetails(call.status);
                                    const StatusIcon = statusInfo.icon;

                                    let contactName = "Noma'lum";
                                    let contactLabel = "";

                                    if (call.leadId) {
                                        contactName = leads.find(l => l.id === call.leadId)?.name || "Mijoz";
                                        contactLabel = "Mijoz (Lid)";
                                    } else if (call.ownerId) {
                                        contactName = owners.find(o => o.id === call.ownerId)?.name || "Mulkdor";
                                        contactLabel = "Mulkdor (Sohib)";
                                    }

                                    return (
                                        <tr key={call.id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                                                        <User className="w-4.5 h-4.5 text-blue-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{contactName}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{contactLabel}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 font-bold">{call.operator}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(call.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDuration(call.duration)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit",
                                                    statusInfo.badgeClass
                                                )}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                                                <div className="truncate" title={call.notes}>{call.notes}</div>
                                                {call.audioUrl && (
                                                    <div className="mt-2">
                                                        <audio controls src={call.audioUrl} className="h-8 w-full max-w-[200px]" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(call.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Logini o'chirish"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredCalls.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Phone className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold tracking-tight text-sm">Hech qanday qo'ng'iroq topilmadi</p>
                    <button
                        onClick={() => { setSearchTerm(""); setSelectedStatus("Barchasi"); }}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        Filtrni tozalash
                    </button>
                </div>
            )}
        </div>
    );
}
