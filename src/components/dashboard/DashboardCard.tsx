import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: LucideIcon;
    iconColor: string;
    subtitle: string;
}

export function DashboardCard({ title, value, change, isPositive, icon: Icon, iconColor, subtitle }: DashboardCardProps) {
    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconColor)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={cn(
                    "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                    isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change}
                </div>
                <span className="text-xs text-gray-400">{subtitle}</span>
            </div>
        </div>
    );
}
