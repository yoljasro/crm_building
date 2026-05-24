"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Home,
    UserCircle2,
    Users,
    Target,
    Handshake,
    PhoneCall,
    MessageSquare,
    Bot,
    ClipboardCheck,
    Calendar,
    Users2,
    BarChart3,
    Wallet,
    Settings,
    MoreVertical,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Home, label: "Obyektlar", href: "/objects" },
    { icon: UserCircle2, label: "Egalari", href: "/owners" },
    { icon: Users, label: "Kontaktlar", href: "/contacts" },
    { icon: Target, label: "Lidlar", href: "/leads" },
    { icon: Handshake, label: "Bitimlar", href: "/deals" },
    { icon: PhoneCall, label: "Qo'ng'iroqlar", href: "/calls", count: 28 },
    { icon: MessageSquare, label: "Xabarlar", href: "/messages" },
    { icon: Bot, label: "AI Agent", href: "/ai-agent", badge: "Beta", activeColor: "text-blue-400" },
    { icon: ClipboardCheck, label: "Vazifalar", href: "/tasks" },
    { icon: Calendar, label: "Kalendar", href: "/calendar" },
    { icon: Users2, label: "Xodimlar", href: "/employees" },
    { icon: BarChart3, label: "Hisobotlar", href: "/reports" },
    { icon: Wallet, label: "Moliyaviy", href: "/finance" },
    { icon: Settings, label: "Sozlamalar", href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-sidebar-bg text-sidebar-fg h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 border-b-2 border-r-2 border-white rounded-br-md" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">  CRM</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn(
                                    "w-5 h-5",
                                    isActive ? "text-blue-400" : "text-sidebar-fg group-hover:text-white"
                                )} />
                                <span>{item.label}</span>
                            </div>

                            {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full font-bold uppercase tracking-wider">
                                    {item.badge}
                                </span>
                            )}

                            {item.count && (
                                <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded-md text-[10px] font-bold">
                                    {item.count}
                                </span>
                            )}

                            {isActive && (
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl overflow-hidden relative border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20" />
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Admin</p>
                        <p className="text-[11px] text-sidebar-fg truncate">Super Admin</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-sidebar-fg group-hover:text-white transition-colors" />
                </div>
            </div>
        </aside>
    );
}
