import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router } from '@inertiajs/react';
import {
    FileCheck,
    Search,
    Building2,
    Calendar,
    ChevronRight,
    Loader2,
    X,
    FileText,
    CheckCircle2,
    Eye,
    MoreVertical,
    DollarSign,
    Target
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import clsx from 'clsx';

import Swal from 'sweetalert2';

const getTimerInfo = (deadlineStr, statusId) => {
    if (!deadlineStr) {
        return {
            text: '-',
            badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
            dotClass: 'bg-slate-400'
        };
    }

    const deadline = new Date(deadlineStr);
    const now = new Date();

    if (statusId >= 13) {
        return {
            text: 'Selesai',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dotClass: 'bg-emerald-500'
        };
    }

    const diffTime = deadline - now;
    if (diffTime > 0) {
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
            return {
                text: `${diffDays} hari ${diffHours} jam`,
                badgeClass: diffDays <= 3 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200',
                dotClass: diffDays <= 3 ? 'bg-amber-500' : 'bg-blue-500'
            };
        } else {
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            return {
                text: `${diffHours} jam ${diffMinutes} menit`,
                badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                dotClass: 'bg-amber-500'
            };
        }
    } else {
        const overdueTime = now - deadline;
        const overdueDays = Math.floor(overdueTime / (1000 * 60 * 60 * 24));
        
        if (overdueDays > 0) {
            return {
                text: `Terlambat ${overdueDays} hari`,
                badgeClass: 'bg-red-50 text-red-700 border-red-200',
                dotClass: 'bg-red-500'
            };
        } else {
            const overdueHours = Math.floor((overdueTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            return {
                text: overdueHours > 0 ? `Terlambat ${overdueHours} jam` : 'Terlambat',
                badgeClass: 'bg-red-50 text-red-700 border-red-200',
                dotClass: 'bg-red-500'
            };
        }
    }
};

export default function Index({ auth, kegiatans, flash }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(prev => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonColor: '#0891b2',
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'Error',
                text: flash.error,
                icon: 'error',
                confirmButtonColor: '#ef4444',
            });
        }
    }, [flash]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredKegiatans = useMemo(() => {
        return kegiatans.filter((item) => {
            const query = searchQuery.toLowerCase();
            return (
                item.nama_kegiatan.toLowerCase().includes(query) ||
                (item.status_nama || '').toLowerCase().includes(query)
            );
        });
    }, [kegiatans, searchQuery]);

    const handleAction = (item) => {
        setProcessing(item.kegiatan_id);
        router.get(route('lpj.review', item.kegiatan_id));
    };

    const ActionMenu = ({ item }) => {
        return (
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center justify-center w-9 h-9 rounded-xl transition-all text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-100 bg-white">
                        <MoreVertical size={18} />
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-slate-100 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden">
                        <div className="px-1 py-1">
                            {/* Action based on status */}
                            {auth.user.role === 'Bendahara' && item.status_id === 13 ? (
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => completeLpj(item)}
                                            disabled={processing === item.kegiatan_id}
                                            className={clsx(
                                                "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                                active ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                                            )}
                                        >
                                            {processing === item.kegiatan_id ? (
                                                <Loader2 size={16} className="mr-3 animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={16} className="mr-3 text-emerald-500" />
                                            )}
                                            Selesaikan LPJ
                                        </button>
                                    )}
                                </Menu.Item>
                            ) : !(auth.user.role === 'Bendahara' && item.status_id === 10) ? (
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => handleAction(item)}
                                            disabled={processing === item.kegiatan_id}
                                            className={clsx(
                                                "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                                active ? "bg-cyan-50 text-cyan-700" : "text-slate-700"
                                            )}
                                        >
                                            {processing === item.kegiatan_id ? (
                                                <Loader2 size={16} className="mr-3 animate-spin" />
                                            ) : (
                                                <FileCheck size={16} className="mr-3 text-cyan-500" />
                                            )}
                                            Lihat / Review LPJ
                                        </button>
                                    )}
                                </Menu.Item>
                            ) : null}
                        </div>
                        <div className="px-1 py-1">
                             <Menu.Item>
                                {({ active }) => (
                                    <div className={clsx(
                                        "flex items-center px-3 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider"
                                    )}>
                                        Informasi Tambahan
                                    </div>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <div className="px-3 py-2 space-y-1">
                                        <div className="text-[10px] text-slate-500 flex justify-between">
                                            <span>ID Kegiatan:</span>
                                            <span className="font-bold">#{item.kegiatan_id}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex justify-between">
                                            <span>Tipe:</span>
                                            <span className="font-bold">{item.tipe_nama || '-'}</span>
                                        </div>
                                    </div>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        );
    };

    const completeLpj = (item) => {
        Swal.fire({
            title: 'Selesaikan LPJ?',
            text: 'Konfirmasi bahwa bukti fisik telah diterima dan LPJ dinyatakan Selesai.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Selesai (Bukti Fisik Diterima)'
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(item.kegiatan_id);
                router.post(route('lpj.complete', item.kegiatan_id), {}, {
                    onSuccess: () => {
                        setProcessing(null);
                        // Success message handled by Index flash props
                    },
                    onError: (e) => {
                        setProcessing(null);
                        Swal.fire('Error', e.message, 'error')
                    }
                });
            }
        });
    };

    return (
        <>
            <AuthenticatedLayout user={auth.user}>
                <Head title="LPJ" />

                <div className="py-8 relative min-h-screen">
                    {/* Decorative background blobs */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[95%] space-y-6">
                        <PageHeader
                            title="Laporan Pertanggungjawaban (LPJ)"
                            description="Kelola dan pantau pengumpulan serta review Laporan Pertanggungjawaban"
                        />

                        {/* Search Bar */}
                        <div className="relative group max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-cyan-500 transition-all sm:text-sm shadow-sm"
                            placeholder="Cari nama kegiatan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-500 text-slate-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="overflow-x-auto md:overflow-visible min-h-[150px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">No.</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detail Kegiatan</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Anggaran & Pencairan</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deadline LPJ</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status LPJ</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredKegiatans.length > 0 ? (
                                            filteredKegiatans.map((item, index) => (
                                                <tr key={item.kegiatan_id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm group-hover:bg-cyan-100 group-hover:text-cyan-700 transition-colors">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight">
                                                            {item.nama_kegiatan}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2 text-[11px]">
                                                                <span className="text-slate-500 min-w-[90px]">Total Anggaran:</span>
                                                                <span className="font-bold text-slate-900">{formatCurrency(item.total_anggaran_diusulkan)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px]">
                                                                <span className="text-emerald-600 min-w-[90px]">Total Dicairkan:</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(item.dana_dicairkan)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {item.tgl_batas_lpj 
                                                                    ? new Date(item.tgl_batas_lpj).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                                                    : '-'}
                                                            </span>
                                                            {item.tgl_batas_lpj && (() => {
                                                                const timer = getTimerInfo(item.tgl_batas_lpj, item.status_id);
                                                                return (
                                                                    <span className={clsx(
                                                                        "inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider",
                                                                        timer.badgeClass
                                                                    )}>
                                                                        <div className={clsx("w-1.5 h-1.5 rounded-full", timer.dotClass)}></div>
                                                                        {timer.text}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={clsx(
                                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                                            item.status_id === 10 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            item.status_id === 11 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                            item.status_id === 12 ? "bg-red-50 text-red-700 border-red-200" :
                                                            item.status_id === 13 ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            item.status_id === 14 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                            "bg-slate-50 text-slate-700 border-slate-200"
                                                        )}>
                                                            <div className={clsx(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                item.status_id === 10 ? "bg-amber-500" :
                                                                item.status_id === 11 ? "bg-blue-500" :
                                                                item.status_id === 12 ? "bg-red-500" :
                                                                item.status_id === 13 ? "bg-purple-500" :
                                                                item.status_id === 14 ? "bg-emerald-500" :
                                                                "bg-slate-500"
                                                            )}></div>
                                                            {item.status_nama}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <ActionMenu item={item} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                                        <FileCheck size={48} className="opacity-20" />
                                                        <p className="font-medium">Tidak ada kegiatan dalam tahap LPJ.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredKegiatans.length > 0 ? (
                                filteredKegiatans.map((item) => (
                                    <div key={item.kegiatan_id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 opacity-50"></div>
                                        
                                        <div className="flex justify-between items-start gap-3 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 leading-tight mb-1 truncate">{item.nama_kegiatan}</div>
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-tighter",
                                                    item.status_id === 10 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    item.status_id === 11 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                    item.status_id === 12 ? "bg-red-50 text-red-700 border-red-200" :
                                                    item.status_id === 13 ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                    item.status_id === 14 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                                )}>
                                                    {item.status_nama}
                                                </span>
                                            </div>
                                            <ActionMenu item={item} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-50">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Anggaran</div>
                                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                                    <DollarSign size={12} className="text-slate-400" />
                                                    {formatCurrency(item.total_anggaran_diusulkan)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Dicairkan</div>
                                                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                                    {formatCurrency(item.dana_dicairkan)}
                                                </div>
                                            </div>
                                        </div>

                                        {item.tgl_batas_lpj && (
                                            <div className="py-2.5 border-t border-slate-50 flex items-center justify-between text-xs">
                                                <span className="text-slate-500 font-medium">Deadline LPJ:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700">
                                                        {new Date(item.tgl_batas_lpj).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    {(() => {
                                                        const timer = getTimerInfo(item.tgl_batas_lpj, item.status_id);
                                                        return (
                                                            <span className={clsx(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider",
                                                                timer.badgeClass
                                                            )}>
                                                                {timer.text}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={12} />
                                                <span className="font-medium truncate max-w-[150px]">Laporan Pertanggungjawaban</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-bold text-slate-500">
                                                #{item.kegiatan_id}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-10 text-center border border-dashed border-slate-200">
                                    <FileCheck size={32} className="opacity-10 mx-auto mb-2 text-slate-400" />
                                    <p className="text-slate-500 font-medium text-sm">Tidak ada kegiatan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </AuthenticatedLayout>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}} />
        </>
    );
}
