"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive,
    X,
    Trash2,
    ClipboardCheck,
    CheckSquare,
    Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "kutilmoqda" | "bajarilmoqda" | "bajarildi" | "arxiv";
  operator: string;
  date: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Barchasi');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form input state
    const [form, setForm] = useState({
        title: "",
        description: "",
        deadline: new Date().toISOString().split('T')[0],
        operator: "Asilbek",
        status: "kutilmoqda" as "kutilmoqda" | "bajarilmoqda" | "bajarildi" | "arxiv"
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/tasks');
            const json = await res.json();
            if (json.success) {
                setTasks(json.data);
            }
        } catch (error) {
            console.error("Vazifalarni yuklashda xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.operator.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'Barchasi' || task.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsAddModalOpen(false);
                setForm({
                    title: "",
                    description: "",
                    deadline: new Date().toISOString().split('T')[0],
                    operator: "Asilbek",
                    status: "kutilmoqda"
                });
            } else {
                alert("Xatolik: " + json.error);
            }
        } catch (error) {
            console.error("Vazifa qo'shishda xatolik:", error);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: any) => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            const json = await res.json();
            if (json.success) {
                await fetchData();
            }
        } catch (error) {
            console.error("Xatolik:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu vazifani o'chirmoqchisiz?")) return;

        try {
            const res = await fetch('/api/tasks', {
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

    // Helper for status styling
    const getStatusDetails = (status: "kutilmoqda" | "bajarilmoqda" | "bajarildi" | "arxiv") => {
        switch (status) {
            case "kutilmoqda":
                return {
                    label: "Kutilmoqda",
                    badgeClass: "bg-blue-50 text-blue-600 border border-blue-100",
                    icon: AlertCircle
                };
            case "bajarilmoqda":
                return {
                    label: "Bajarilmoqda",
                    badgeClass: "bg-amber-50 text-amber-600 border border-amber-100",
                    icon: Clock
                };
            case "bajarildi":
                return {
                    label: "Bajarildi",
                    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100 line-through text-opacity-80",
                    icon: CheckCircle2
                };
            case "arxiv":
                return {
                    label: "Arxiv",
                    badgeClass: "bg-slate-50 text-slate-600 border border-slate-100",
                    icon: Archive
                };
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* ADD TASK MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600 animate-bounce" />
                                Yangi vazifa yuklash
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
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vazifa nomi</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Masalan: Mirabad uyi kalitlarini olish"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.title}
                                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tavsif (Batafsil ko'rsatmalar)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Vazifa bajarilishi bo'yicha operatorga beriladigan ko'rsatmalar..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Muddat (Deadline)</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.deadline}
                                        onChange={(e) => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mas'ul Operator</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={form.operator}
                                        onChange={(e) => setForm(prev => ({ ...prev, operator: e.target.value }))}
                                    >
                                        <option value="Asilbek">Asilbek</option>
                                        <option value="Madina">Madina</option>
                                        <option value="Javlon">Javlon</option>
                                        <option value="Sevinch">Sevinch</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Boshlang'ich status</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={form.status}
                                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                                >
                                    <option value="kutilmoqda">Kutilmoqda</option>
                                    <option value="bajarilmoqda">Bajarilmoqda</option>
                                    <option value="bajarildi">Bajarildi</option>
                                    <option value="arxiv">Arxiv</option>
                                </select>
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
                                    Vazifa yuklash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Operator Vazifalari</h1>
                    <p className="text-gray-500">Mijozlar bilan ishlash, shartnoma va uchrashuvlarni rejalashtirish checklisti</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Vazifa qo'shish
                </button>
            </div>

            {/* QUICK METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="glass-card bg-blue-50/20 border border-blue-500/10 p-5 rounded-3xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jami vazifalar</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{tasks.length} ta</p>
                </div>
                <div className="glass-card bg-emerald-50/20 border border-emerald-500/10 p-5 rounded-3xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bajarilganlar</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">
                        {tasks.filter(t => t.status === "bajarildi").length} ta
                    </p>
                </div>
                <div className="glass-card bg-amber-50/20 border border-amber-500/10 p-5 rounded-3xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jarayondagilar</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                        {tasks.filter(t => t.status === "bajarilmoqda").length} ta
                    </p>
                </div>
                <div className="glass-card bg-rose-50/20 border border-rose-500/10 p-5 rounded-3xl">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Kutilayotganlar</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">
                        {tasks.filter(t => t.status === "kutilmoqda").length} ta
                    </p>
                </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-white/70 border border-gray-100 shadow-sm rounded-3xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Vazifa nomi, mas'ul xodim yoki tavsif bo'yicha qidirish..."
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
                        <option value="Barchasi">Barcha vazifalar</option>
                        <option value="kutilmoqda">Kutilayotganlar</option>
                        <option value="bajarilmoqda">Jarayondagilar</option>
                        <option value="bajarildi">Bajarilganlar</option>
                        <option value="arxiv">Arxivdagilar</option>
                    </select>
                </div>
            </div>

            {/* LIST GRID */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Vazifalar yuklanmoqda...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTasks.map((task) => {
                        const statusInfo = getStatusDetails(task.status);
                        const StatusIcon = statusInfo.icon;
                        const isDone = task.status === "bajarildi";

                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "glass-card bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative overflow-hidden",
                                    isDone && "bg-gray-50/50 border-gray-200/50 shadow-none hover:shadow-none"
                                )}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(task.id, isDone ? "kutilmoqda" : "bajarildi")}
                                            className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            {isDone ? (
                                                <CheckSquare className="w-5.5 h-5.5 text-emerald-600" />
                                            ) : (
                                                <Square className="w-5.5 h-5.5" />
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <h3 className={cn(
                                                "font-bold text-gray-900 text-base font-outfit leading-snug",
                                                isDone && "line-through text-gray-400 text-opacity-80"
                                            )}>
                                                {task.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                                            title="Vazifani o'chirish"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {task.description && (
                                        <p className={cn(
                                            "text-xs text-gray-500 leading-relaxed pl-8",
                                            isDone && "text-gray-400/70"
                                        )}>
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-50 space-y-3 pl-8">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                            Mas'ul:
                                        </span>
                                        <span className="text-gray-900">{task.operator}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                                            Muddati:
                                        </span>
                                        <span className={cn(
                                            "text-red-500",
                                            isDone && "text-gray-400"
                                        )}>
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <StatusIcon className="w-3.5 h-3.5 text-blue-600" />
                                            Holati:
                                        </span>
                                        <select
                                            className={cn(
                                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase outline-none cursor-pointer border",
                                                statusInfo.badgeClass
                                            )}
                                            value={task.status}
                                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                        >
                                            <option value="kutilmoqda" className="text-gray-800 bg-white">Kutilmoqda</option>
                                            <option value="bajarilmoqda" className="text-gray-800 bg-white">Bajarilmoqda</option>
                                            <option value="bajarildi" className="text-gray-800 bg-white">Bajarildi</option>
                                            <option value="arxiv" className="text-gray-800 bg-white">Arxiv</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredTasks.length === 0 && !isLoading && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <ClipboardCheck className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-bold tracking-tight text-sm">Vazifalar topilmadi</p>
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedStatus("Barchasi"); }}
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
