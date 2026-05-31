import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { clsx } from 'clsx';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function NotificationBell() {
    const { auth } = usePage().props;
    const notifications = auth.user?.unread_notifications || [];
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const prevNotifIds = useRef(new Set());

    // Toast logic
    useEffect(() => {
        if (notifications.length > 0) {
            notifications.forEach(notif => {
                if (!prevNotifIds.current.has(notif.notifikasi_id)) {
                    // This is a new notification we haven't toasted yet
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        showCloseButton: true,
                        timer: 5000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer);
                            toast.addEventListener('mouseleave', Swal.resumeTimer);
                        }
                    });

                    Toast.fire({
                        icon: 'info',
                        title: 'Notifikasi Baru',
                        text: notif.pesan
                    }).then(async (result) => {
                        if (result.dismiss === Swal.DismissReason.close) {
                            try {
                                await axios.post(route('notifications.read', notif.notifikasi_id));
                                router.reload({ only: ['auth'] });
                            } catch (error) {
                                console.error('Failed to mark notification as read:', error);
                            }
                        }
                    });

                    prevNotifIds.current.add(notif.notifikasi_id);
                }
            });
        }
        
        // Clean up old IDs if they are no longer in the unread list (e.g. they were marked as read elsewhere)
        // Actually, we want to keep them in prevNotifIds to avoid re-toasting if they somehow reappear
    }, [notifications]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (notif) => {
        try {
            await axios.post(route('notifications.read', notif.notifikasi_id));
            setIsOpen(false);
            
            // Reload the auth data specifically
            router.reload({ only: ['auth'] });

            if (notif.link_tujuan) {
                router.visit(notif.link_tujuan);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(route('notifications.read-all'));
            setIsOpen(false);
            router.reload({ only: ['auth'] });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    if (!auth.user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-200"
            >
                <Bell size={24} />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white text-[10px] text-white font-bold items-center justify-center">
                            {notifications.length}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            Notifikasi
                            {notifications.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600 text-[10px] uppercase tracking-wider">
                                    {notifications.length} Baru
                                </span>
                            )}
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-12 text-center flex flex-col items-center gap-3">
                                <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                                    <Bell size={32} />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Tidak ada notifikasi baru</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.notifikasi_id}
                                        onClick={() => handleMarkAsRead(notif)}
                                        className="px-4 py-4 hover:bg-slate-50 cursor-pointer transition-colors group relative"
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
                                                    {notif.pesan}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <span className="text-[10px] text-cyan-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 uppercase tracking-widest">
                                                        Lihat <Check size={10} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors uppercase tracking-widest"
                            >
                                Tandai Semua Dibaca
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
