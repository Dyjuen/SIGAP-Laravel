import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const QUICK_ACTIONS = [
    'Apa itu LPJ?',
    'Apa itu KAK?',
    'Perbedaan LPJ & KAK',
    'Syarat LPJ',
    'Format KAK',
];

export default function Chatbot() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen]           = useState(false);
    const [isClosing, setIsClosing]     = useState(false);
    const [messages, setMessages]       = useState([]);
    const [input, setInput]             = useState('');
    const [isTyping, setIsTyping]       = useState(false);
    const messagesEndRef                = useRef(null);
    const inputRef                      = useRef(null);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('sigap_chat_history');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            setMessages([
                { sender: 'bot', text: 'Halo! Saya asisten LPJ & KAK. Bagaimana saya bisa membantu Anda hari ini?' }
            ]);
        }
    }, []);

    // Save to localStorage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('sigap_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const open = () => {
        setIsClosing(false);
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const close = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const toggle = () => (isOpen ? close() : open());

    const callApi = async (prompt) => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        const res = await fetch('/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ message: prompt }),
        });
        
        if (res.status === 429) {
            throw new Error('Terlalu banyak permintaan (Limit API). Mohon tunggu sebentar.');
        }
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.reply;
    };

    const sendMessage = async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || isTyping) return;
        
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setIsTyping(true);
        
        try {
            const reply = await callApi(msg);
            setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
        } catch (err) {
            const errorMsg = err.message.includes('Limit API') 
                ? err.message 
                : 'Terjadi kesalahan saat menghubungi asisten. Silakan coba lagi.';
            setMessages(prev => [...prev, { sender: 'bot', text: errorMsg }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearHistory = () => {
        if (confirm('Hapus semua riwayat percakapan?')) {
            const initial = [{ sender: 'bot', text: 'Halo! Saya asisten LPJ & KAK. Bagaimana saya bisa membantu Anda hari ini?' }];
            setMessages(initial);
            localStorage.setItem('sigap_chat_history', JSON.stringify(initial));
        }
    };

    const chatboxVisible = isOpen || isClosing;

    return (
        <>
            {/* ── Chatbox ── */}
            {chatboxVisible && (
                <div
                    className="fixed bottom-24 right-6 w-[380px] max-w-[92vw] h-[550px] max-h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9999] transition-all duration-300"
                    style={{
                        opacity: isOpen && !isClosing ? 1 : 0,
                        transform: isOpen && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#33C8DA] to-[#2BA9B8] text-white shadow-md flex-shrink-0">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            GITA (Gateway Informasi &amp; Tanya Administrasi)
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={clearHistory}
                                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                title="Bersihkan"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                </svg>
                            </button>
                            <button
                                onClick={close}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 flex-wrap px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        {QUICK_ACTIONS.map((q) => (
                            <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-[#33C8DA] hover:border-slate-300 transition-all whitespace-nowrap flex-shrink-0"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 [&::-webkit-scrollbar]:hidden"
                        style={{
                            backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                        }}
                    >
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[80%] px-4 py-3 rounded-[18px] text-sm leading-relaxed shadow-sm animate-[fadeIn_0.3s_ease] ${
                                    m.sender === 'user'
                                        ? 'self-end bg-gradient-to-br from-[#33C8DA] to-[#2BA9B8] text-white rounded-br-[5px]'
                                        : 'self-start bg-gray-50 text-gray-700 border border-gray-200 rounded-bl-[5px]'
                                }`}
                            >
                                {m.text}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="self-start bg-gray-50 border border-gray-200 px-4 py-3 rounded-[18px] rounded-bl-[5px] flex items-center gap-1.5 text-gray-500 text-sm italic">
                                <span className="text-xs">GITA berpikir</span>
                                {[0, 0.2, 0.4].map((d, i) => (
                                    <span
                                        key={i}
                                        className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${d}s` }}
                                    />
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Tulis pesan Anda..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm outline-none focus:border-[#33C8DA] focus:ring-2 focus:ring-[#33C8DA]/20 transition-all"
                            maxLength={1000}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isTyping || !input.trim()}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#33C8DA] to-[#2BA9B8] text-white shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Floating Bubble ── */}
            <button
                onClick={toggle}
                className={`fixed ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-[#33C8DA] to-[#2BA9B8] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </button>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
