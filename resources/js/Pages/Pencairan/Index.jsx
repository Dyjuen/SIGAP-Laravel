import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Wallet,
    Search,
    Building2,
    User,
    Calendar,
    MessageSquare,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';
import clsx from 'clsx';

export default function Index({ auth, kegiatans }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(null); // stores kegiatan_id being processed

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatInputRupiah = (value) => {
        if (!value) return '';
        const number = value.toString().replace(/[^0-9]/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    };

    const parseRupiah = (formattedValue) => {
        if (!formattedValue) return 0;
        return parseFloat(formattedValue.replace(/[^0-9]/g, '')) || 0;
    };

    const filteredKegiatans = useMemo(() => {
        return kegiatans.filter((item) => {
            const query = searchQuery.toLowerCase();
            return (
                item.nama_kegiatan.toLowerCase().includes(query) ||
                (item.pelaksana_manual || '').toLowerCase().includes(query) ||
                (item.penanggung_jawab_manual || '').toLowerCase().includes(query)
            );
        });
    }, [kegiatans, searchQuery]);

    const handleCairkan = async (item) => {
        const sisaDana = item.sisa_dana;

        const { value: nominal } = await Swal.fire({
            title: '<span class="text-xl font-black text-slate-800">Masukkan Nominal Pencairan</span>',
            html: `
                <div class="flex flex-col items-center gap-6 py-4">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium border border-cyan-100">
                        <span class="text-slate-500">Sisa saldo:</span>
                        <span class="font-bold">${formatCurrency(sisaDana)}</span>
                    </div>
                    <div class="w-full max-w-[280px]">
                        <input id="swal-input-nominal" 
                               class="w-full text-center text-3xl font-black text-slate-800 bg-transparent border-b-4 border-slate-100 focus:border-cyan-500 focus:outline-none py-2 transition-all" 
                               placeholder="Rp 0"
                               autocomplete="off">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Lanjut',
            cancelButtonText: 'Batal',
            padding: '2rem',
            customClass: {
                popup: 'rounded-3xl border-none shadow-2xl',
                confirmButton: 'rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-wider',
                cancelButton: 'rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-wider'
            },
            didOpen: () => {
                const input = document.getElementById('swal-input-nominal');
                input.focus();
                input.addEventListener('input', (e) => {
                    const numeric = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = formatInputRupiah(numeric);
                });

                // Also handle enter key explicitly if needed, but Swal handles it on button
            },
            preConfirm: () => {
                const rawValue = document.getElementById('swal-input-nominal').value;
                const value = parseRupiah(rawValue);
                if (!value || value <= 0) {
                    Swal.showValidationMessage('Nominal harus lebih dari 0');
                    return false;
                }
                if (value > sisaDana) {
                    Swal.showValidationMessage('Nominal melebihi sisa dana tersedia');
                    return false;
                }
                return value;
            }
        });

        if (!nominal) return;

        const confirm = await Swal.fire({
            title: 'Konfirmasi Pencairan',
            text: `Anda yakin ingin mencairkan ${formatCurrency(nominal)} untuk kegiatan "${item.nama_kegiatan}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Cairkan',
            cancelButtonText: 'Batal',
        });

        if (confirm.isConfirmed) {
            setProcessing(item.kegiatan_id);
            router.post(route('pencairan.store', item.kegiatan_id), {
                nominal_pencairan: nominal
            }, {
                onSuccess: () => {
                    Swal.fire('Berhasil!', 'Dana berhasil dicairkan.', 'success');
                    setProcessing(null);
                },
                onError: (errors) => {
                    const message = typeof errors === 'string' ? errors : (errors.nominal_pencairan ? errors.nominal_pencairan[0] : 'Gagal mencairkan dana.');
                    Swal.fire('Error', message, 'error');
                    setProcessing(null);
                }
            });
        }
    };

    const handleSelesai = async (item) => {
        const confirm = await Swal.fire({
            title: 'Selesaikan Pencairan?',
            text: 'Tindakan ini akan mengunci proses pencairan dan memulai tahap LPJ.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Selesaikan',
            cancelButtonText: 'Batal',
        });

        if (confirm.isConfirmed) {
            setProcessing(item.kegiatan_id);
            router.post(route('pencairan.selesai', item.kegiatan_id), {}, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Tahap pencairan selesai, LPJ dapat segera diunggah.',
                        icon: 'success',
                        customClass: {
                            popup: 'rounded-3xl border-none shadow-2xl',
                            confirmButton: 'rounded-xl px-8 py-3 bg-emerald-600 text-sm font-bold uppercase'
                        }
                    });
                    setProcessing(null);
                },
                onError: (errors) => {
                    Swal.fire({
                        title: 'Error',
                        text: errors.message || 'Gagal menyelesaikan proses.',
                        icon: 'error',
                        customClass: {
                            popup: 'rounded-3xl border-none'
                        }
                    });
                    setProcessing(null);
                }
            });
        }
    };

    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <PageHeader
                        title="Pencairan Dana"
                        description="Pantau dan kelola pencairan dana kegiatan yang sedang berjalan"
                    />
                }
            >
                <Head title="Pencairan Dana" />

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Search Bar */}
                    <div className="relative group max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-cyan-500 transition-all sm:text-sm shadow-sm"
                            placeholder="Cari nama kegiatan, pelaksana, atau PJ..."
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
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Anggaran</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Pencairan</th>
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
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                            <div className="flex items-center gap-1">
                                                                <Building2 size={12} className="text-slate-400" />
                                                                {item.pelaksana_manual || '-'}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User size={12} className="text-slate-400" />
                                                                {item.penanggung_jawab_manual || '-'}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-cyan-600 font-medium">
                                                                <Calendar size={12} />
                                                                Cair Aktif
                                                            </div>
                                                        </div>
                                                        {item.catatan_wadir2 && (
                                                            <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 flex items-start gap-1.5 shadow-sm">
                                                                <MessageSquare size={12} className="mt-0.5 shrink-0" />
                                                                <div>
                                                                    <span className="font-bold uppercase tracking-tighter mr-1 text-[10px]">Wadir 2:</span>
                                                                    {item.catatan_wadir2}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-slate-500">Total:</span>
                                                            <span className="font-bold text-slate-900">{formatCurrency(item.total_anggaran_diusulkan)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-emerald-600">Dicairkan:</span>
                                                            <span className="font-bold text-emerald-600">{formatCurrency(item.dana_dicairkan)}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(100, (item.dana_dicairkan / item.total_anggaran_diusulkan) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sisa Dana</span>
                                                                <span className={clsx(
                                                                    "text-sm font-bold",
                                                                    item.sisa_dana > 0 ? "text-cyan-600" : "text-slate-400"
                                                                )}>
                                                                    {formatCurrency(item.sisa_dana)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {item.sisa_dana === 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 self-start">
                                                                <CheckCircle2 size={10} />
                                                                Lunas
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button
                                                            onClick={() => handleCairkan(item)}
                                                            disabled={processing === item.kegiatan_id || item.sisa_dana <= 0}
                                                            className={clsx(
                                                                "group relative inline-flex items-center justify-center p-2.5 rounded-xl transition-all shadow-sm active:scale-95",
                                                                item.sisa_dana > 0
                                                                    ? "bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white shadow-cyan-100"
                                                                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                            )}
                                                        >
                                                            {processing === item.kegiatan_id ? (
                                                                <Loader2 size={20} className="animate-spin" />
                                                            ) : (
                                                                <Banknote size={20} />
                                                            )}
                                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-50 border border-slate-700">
                                                                Tambah Pencairan
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleSelesai(item)}
                                                            disabled={processing === item.kegiatan_id}
                                                            className="group relative inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100 active:scale-95"
                                                        >
                                                            {processing === item.kegiatan_id ? (
                                                                <Loader2 size={20} className="animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 size={20} />
                                                            )}
                                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg z-50 border border-slate-700">
                                                                Selesaikan Pencairan
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                        <Banknote size={32} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">Tidak ada kegiatan yang menunggu pencairan dana.</p>
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
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </>
    );
}
