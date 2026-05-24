"use client";

import React, { useState } from 'react';
import { Bot, Paperclip, SendHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIAgentPanel() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Assalomu alaykum! Men sizga premium ko\'chmas mulk obyektlarini topishda va mijozlar bilan ishlashda yordam beraman. Nima qila olaman?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');

        // Placeholder response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Buni tekshirib ko\'raman. Tashkent City va Mirabad tumanlaridan mos variantlarni qidiryapman...'
            }]);
        }, 1000);
    };

    return (
        <div className="w-80 flex flex-col gap-6 fixed right-8 top-24 bottom-8 z-30">
            <div className="glass-card flex-1 flex flex-col overflow-hidden border-blue-100/50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">AI Agent</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <p className="text-[10px] text-white/70">Online</p>
                            </div>
                        </div>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide bg-gray-50/30">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex gap-3",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center shadow-sm">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                            )}
                            <div className={cn(
                                "p-3 rounded-2xl text-sm max-w-[85%]",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10"
                                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Xabar yozing..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all focus:bg-white"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                            <SendHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card p-4 bg-white/80">
                <h4 className="font-bold text-sm mb-3">Tavsiya etilgan</h4>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-900 line-clamp-1">Mirabad Avenue - 4 xona</p>
                    <p className="text-[10px] text-blue-600 mt-0.5">$2,200 / oy • Ijaraga</p>
                    <button className="w-full mt-2 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all">
                        Mijozga yuborish
                    </button>
                </div>
            </div>
        </div>
    );
}
