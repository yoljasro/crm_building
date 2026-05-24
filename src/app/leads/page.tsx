"use client";

import React, { useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    MessageSquare,
    ChevronDown,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const leadsData = [
    { id: 1, name: "Aliyor Bekov", phone: "+998 90 123 45 67", source: "Telegram", type: "Sotib olish", budget: "$200,000", status: "Yangi", agent: "Asilbek", date: "23 May, 2024" },
    { id: 2, name: "Feruza G'ulomova", phone: "+998 91 222 33 44", source: "Instagram", type: "Ijaraga olish", budget: "$1,500 / oy", status: "Jarayonda", agent: "Madina", date: "22 May, 2024" },
    { id: 3, name: "Javlon Sodiqov", phone: "+998 93 444 55 66", source: "AI Agent", type: "Sotish", budget: "$350,000", status: "Qiziqish bor", agent: "Javlon", date: "22 May, 2024" },
    { id: 4, name: "Nilufar Orifova", phone: "+998 94 777 88 99", source: "WhatsApp", type: "Sotib olish", budget: "$120,000", status: "Yangi", agent: "Sevinch", date: "21 May, 2024" },
    { id: 5, name: "Akbar Alimov", phone: "+998 90 987 65 43", source: "Website", type: "Ijaraga berish", budget: "$2,000 / oy", status: "Kutishda", agent: "Madina", date: "20 May, 2024" },
];

export default function LeadsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Lidlar (Mijozlar)</h1>
                    <p className="text-gray-500">Barcha kelib tushgan lidlar bazasi</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Eksport
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <Plus className="w-4 h-4" />
                        Yangi lid qo'shish
                    </button>
                </div>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Ism, telefon yoki agent bo'yicha qidirish..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtr
                    </button>
                    <button className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors flex-1 md:flex-none min-w-[140px]">
                        Holati
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold">Mijoz</th>
                                <th className="px-6 py-4 font-semibold">Manba</th>
                                <th className="px-6 py-4 font-semibold">Turi</th>
                                <th className="px-6 py-4 font-semibold">Budjet</th>
                                <th className="px-6 py-4 font-semibold">Mas'ul</th>
                                <th className="px-6 py-4 font-semibold">Holati</th>
                                <th className="px-6 py-4 font-semibold">Sana</th>
                                <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leadsData.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                                            <span className="text-xs text-gray-500">{lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{lead.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{lead.budget}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                {lead.agent[0]}
                                            </div>
                                            <span className="text-sm text-gray-600">{lead.agent}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                                            lead.status === "Yangi" ? "bg-blue-100 text-blue-600" :
                                                lead.status === "Jarayonda" ? "bg-orange-100 text-orange-600" :
                                                    lead.status === "Qiziqish bor" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{lead.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>Jami {leadsData.length} ta lid ko'rsatilmoqda</span>
                    <div className="flex items-center gap-2">
                        <button disabled className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed">Ortga</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Oldinga</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
