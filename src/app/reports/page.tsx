"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    PhoneCall,
    CheckSquare,
    Users,
    Building2,
    Clock,
    User,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RentalObject {
  id: string;
  status: "bo'sh" | "band" | "bo'shaydi" | "arxiv";
}

interface Lead {
  id: string;
  source: string;
  status: string;
}

interface CallLog {
  id: string;
  operator: string;
  duration: number;
  status: "javob_berildi" | "javobsiz" | "band";
}

interface Task {
  id: string;
  operator: string;
  status: "kutilmoqda" | "bajarilmoqda" | "bajarildi" | "arxiv";
}

export default function ReportsPage() {
    const [objects, setObjects] = useState<RentalObject[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [calls, setCalls] = useState<CallLog[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const objRes = await fetch('/api/objects');
            const objJson = await objRes.json();
            if (objJson.success) setObjects(objJson.data);

            const leadRes = await fetch('/api/leads');
            const leadJson = await leadRes.json();
            if (leadJson.success) setLeads(leadJson.data);

            const callRes = await fetch('/api/calls');
            const callJson = await callRes.json();
            if (callJson.success) setCalls(callJson.data);

            const taskRes = await fetch('/api/tasks');
            const taskJson = await taskRes.json();
            if (taskJson.success) setTasks(taskJson.data);
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // COMPUTED METRICS

    // 1. Objects Status Distribution
    const totalObjects = objects.length;
    const freeObjects = objects.filter(o => o.status === "bo'sh").length;
    const occupiedObjects = objects.filter(o => o.status === "band").length;
    const freeingObjects = objects.filter(o => o.status === "bo'shaydi").length;
    const archivedObjects = objects.filter(o => o.status === "arxiv").length;

    const freePercentage = totalObjects > 0 ? Math.round((freeObjects / totalObjects) * 100) : 0;
    const occupiedPercentage = totalObjects > 0 ? Math.round((occupiedObjects / totalObjects) * 100) : 0;
    const freeingPercentage = totalObjects > 0 ? Math.round((freeingObjects / totalObjects) * 100) : 0;
    const archivedPercentage = totalObjects > 0 ? Math.round((archivedObjects / totalObjects) * 100) : 0;

    // 2. Leads Source Distribution
    const totalLeads = leads.length;
    const sourceCounts = leads.reduce((acc: any, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
    }, {});

    // 3. Operator Stats League Table
    // Operators list
    const operators = ["Asilbek", "Madina", "Javlon", "Sevinch"];
    const operatorStats = operators.map(op => {
        const opCalls = calls.filter(c => c.operator === op);
        const opAnsweredCalls = opCalls.filter(c => c.status === "javob_berildi");
        const opTotalDuration = opCalls.reduce((sum, c) => sum + c.duration, 0);

        const opTasks = tasks.filter(t => t.operator === op);
        const opCompletedTasks = opTasks.filter(t => t.status === "bajarildi");
        const taskCompletionRate = opTasks.length > 0 ? Math.round((opCompletedTasks.length / opTasks.length) * 100) : 0;

        return {
            name: op,
            totalCalls: opCalls.length,
            answeredCalls: opAnsweredCalls.length,
            durationFormatted: Math.round(opTotalDuration / 60) + " min",
            totalTasks: opTasks.length,
            completedTasks: opCompletedTasks.length,
            taskCompletionRate
        };
    }).sort((a, b) => b.totalCalls - a.totalCalls);

    // Call conversion metrics
    const totalCallsCount = calls.length;
    const answeredCallsCount = calls.filter(c => c.status === "javob_berildi").length;
    const callSuccessRate = totalCallsCount > 0 ? Math.round((answeredCallsCount / totalCallsCount) * 100) : 0;

    // Task success metrics
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === "bajarildi").length;
    const taskSuccessRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return (
        <div className="space-y-8 pb-12">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-600 animate-pulse" />
                        Tahlil va Hisobotlar
                    </h1>
                    <p className="text-gray-500">Broker va operatorlar faoliyati, qo'ng'iroqlar konversiyasi va vazifalar bajarilishi samaradorligi</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 font-bold">Hisobotlar hisoblanmoqda...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* STATS OVERVIEW CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mulk Statusi (Bo'shlar)</p>
                                <p className="text-3xl font-black text-gray-900">{freeObjects} ta</p>
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {freePercentage}% jami obyektlardan
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Qo'ng'iroqlar unumdorligi</p>
                                <p className="text-3xl font-black text-gray-900">{callSuccessRate}%</p>
                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    {answeredCallsCount} ta muvaffaqiyatli suhbat
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <PhoneCall className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vazifalar bajarilishi</p>
                                <p className="text-3xl font-black text-gray-900">{taskSuccessRate}%</p>
                                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    {completedTasksCount} ta bajarilgan vazifa
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <CheckSquare className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jami kelgan lidlar</p>
                                <p className="text-3xl font-black text-gray-900">{totalLeads} ta</p>
                                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Yangi mijozlar oqimi
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* CHART 1: OBJECT STATUS DISTRIBUTION */}
                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm space-y-6 lg:col-span-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base font-outfit">Ijara obyektlari holati taqsimoti</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Barcha ijara uylarining hozirgi holati va bandligi foizda</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                            Bo'sh (Свободно)
                                        </span>
                                        <span>{freeObjects} ta ({freePercentage}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${freePercentage}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                                            Band (Занято)
                                        </span>
                                        <span>{occupiedObjects} ta ({occupiedPercentage}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${occupiedPercentage}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                            Bo'shaydi (Освобождается)
                                        </span>
                                        <span>{freeingObjects} ta ({freeingPercentage}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${freeingPercentage}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                                            Arxiv (Архив)
                                        </span>
                                        <span>{archivedObjects} ta ({archivedPercentage}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400 rounded-full transition-all duration-1000" style={{ width: `${archivedPercentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHART 2: LEAD SOURCES */}
                        <div className="glass-card bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base font-outfit">Lid kelish manbalari</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Mijozlar qayerlardan murojaat qilishayotganligi tahlili</p>
                            </div>

                            <div className="space-y-4">
                                {Object.keys(sourceCounts).map(source => {
                                    const count = sourceCounts[source];
                                    const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                                    let color = "bg-blue-500";
                                    if (source === "Telegram") color = "bg-sky-500";
                                    if (source === "Instagram") color = "bg-pink-500";
                                    if (source === "WhatsApp") color = "bg-emerald-500";
                                    if (source === "AI Agent") color = "bg-indigo-600 animate-pulse";

                                    return (
                                        <div key={source} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                                                <span>{source}</span>
                                                <span>{count} ta ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* OPERATOR LEAGUE TABLE */}
                    <div className="glass-card bg-white border border-gray-100 p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base font-outfit">Operator va Brokerlar samaradorlik reytingi</h3>
                            <p className="text-gray-400 text-xs mt-0.5">Xodimlarning qo'ng'iroqlari soni, suhbat vaqti va yuklangan vazifalarni yakunlash foizlari</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                        <th className="pb-4 font-bold">Xodim</th>
                                        <th className="pb-4 font-bold">Jami qo'ng'iroqlar</th>
                                        <th className="pb-4 font-bold">Muvaffaqiyatli (Javob)</th>
                                        <th className="pb-4 font-bold">Suhbat vaqti (Jami)</th>
                                        <th className="pb-4 font-bold">Yuklangan vazifalar</th>
                                        <th className="pb-4 font-bold">Vazifa bajarilishi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {operatorStats.map((op, i) => (
                                        <tr key={op.name} className="group hover:bg-gray-50/20 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{op.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-700 font-medium">
                                                {op.totalCalls} ta qo'ng'iroq
                                            </td>
                                            <td className="py-4 text-sm text-emerald-600 font-bold">
                                                {op.answeredCalls} ta ({op.totalCalls > 0 ? Math.round((op.answeredCalls / op.totalCalls) * 100) : 0}%)
                                            </td>
                                            <td className="py-4 text-sm text-gray-600 font-bold flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {op.durationFormatted}
                                            </td>
                                            <td className="py-4 text-sm text-gray-700 font-medium">
                                                {op.totalTasks} ta yuklangan
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${op.taskCompletionRate}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900">{op.taskCompletionRate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
