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
    Eye
} from 'lucide-react';
import clsx from 'clsx';

import Swal from 'sweetalert2';

export default function Index({ auth, kegiatans, flash }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(null);

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
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <PageHeader
                        title="Laporan Pertanggungjawaban (LPJ)"
                        description="Kelola dan pantau pengumpulan serta review Laporan Pertanggungjawaban"
                    />
                }
            >
                <Head title="LPJ" />

                <div className="max-w-7xl mx-auto space-y-6">
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

                    {/* Table Section */}
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">No.</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detail Kegiatan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Anggaran & Pencairan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status LPJ</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredKegiatans.length > 0 ? (
                                        filteredKegiatans.map((item, index) => (
                                            <tr key={item.kegiatan_id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                                            {item.nama_kegiatan}
                                                        </span>
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
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                                                        item.status_id === 10 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        item.status_id === 11 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        item.status_id === 12 ? "bg-red-50 text-red-700 border-red-200" :
                                                        item.status_id === 13 ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                        item.status_id === 14 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        "bg-slate-50 text-slate-700 border-slate-200"
                                                    )}>
                                                        {item.status_nama}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center">
                                                        {auth.user.role === 'Bendahara' && item.status_id === 13 ? (
                                                            <button
                                                                onClick={() => completeLpj(item)}
                                                                disabled={processing === item.kegiatan_id}
                                                                className="group relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 text-xs font-bold"
                                                            >
                                                                {processing === item.kegiatan_id ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 size={16} />
                                                                )}
                                                                <span>LPJ Selesai (Bukti Fisik Diterima)</span>
                                                            </button>
                                                        ) : !(auth.user.role === 'Bendahara' && item.status_id === 10) ? (
                                                            <button
                                                                onClick={() => handleAction(item)}
                                                                disabled={processing === item.kegiatan_id}
                                                                className="group relative inline-flex items-center justify-center p-2.5 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all shadow-sm active:scale-95 border border-cyan-100 hover:border-cyan-600"
                                                            >
                                                                {processing === item.kegiatan_id ? (
                                                                    <Loader2 size={20} className="animate-spin" />
                                                                ) : (
                                                                    (() => {
                                                                        const isPengusul = auth.user.role_id === 3 || auth.user.role === 'Pengusul';
                                                                        const isBendahara = auth.user.role_id === 6 || auth.user.role === 'Bendahara';
                                                                        
                                                                        if (isPengusul && item.status_id === 11) return <Eye size={20} />;
                                                                        if (isBendahara && item.status_id === 12) return <Eye size={20} />;
                                                                        
                                                                        return <FileCheck size={20} />;
                                                                    })()
                                                                )}
                                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-50 border border-slate-700">
                                                                    Lihat LPJ
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">Belum disubmit</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                        <FileCheck size={32} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">Tidak ada kegiatan dalam tahap LPJ.</p>
                                                    {searchQuery && (
                                                        <button
                                                            onClick={() => setSearchQuery('')}
                                                            className="text-cyan-600 text-sm font-bold hover:underline"
                                                        >
                                                            Bersihkan pencarian
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
