"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

export function AIAssistantPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
        { role: 'ai', content: "Hello! I'm your Project Camp AI. I can help you break down projects, suggest tasks, or analyze risks. How can I help today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // Wait, we don't have the exact AI chat route configured in axios yet, let's just make a direct call
            const res = await axios.post('http://localhost:8000/api/v1/ai/chat', 
                { prompt: userMsg },
                { withCredentials: true }
            );
            
            setMessages(prev => [...prev, { role: 'ai', content: res.data.data?.reply || res.data.data }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my neural network right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-slate-800 transition-all z-50 group"
                >
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Zap className="w-6 h-6 text-yellow-400 relative z-10" fill="currentColor" />
                </button>
            )}

            {/* Chat Panel */}
            <div className={`fixed bottom-8 right-8 w-96 bg-white border border-slate-200/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[24px] z-50 overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="bg-slate-900 p-4 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-[30px]" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Project AI</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white relative z-10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-slate-900 text-white'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />}
                            </div>
                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                                <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI to break down a task..."
                            className="h-12 rounded-full bg-slate-50 border-slate-200 pr-12 focus:border-slate-900 font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-1.5 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
