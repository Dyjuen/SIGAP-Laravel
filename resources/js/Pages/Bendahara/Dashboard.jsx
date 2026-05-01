import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PanduanSection from '@/Components/PanduanSection';
import { Head, Link } from '@inertiajs/react';
import {
    Clock,
    CheckCircle2,
    Wallet,
    DollarSign,
    FileCheck2,
    Eye,
    FileText,
    Download,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Play,
    Banknote,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Counter Animation Hook ───────────────────────────────────────────────────
function useCounterAnimation(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        if (target === 0) {
            setCount(0);
            return;
        }
        let start = 0;
        const increment = target / (duration / 16);
        const animate = () => {
            start += increment;
            if (start < target) {
                setCount(Math.floor(start));
                animRef.current = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };
        const timer = setTimeout(() => {
            animRef.current = requestAnimationFrame(animate);
        }, 300);
        return () => {
            clearTimeout(timer);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [target, duration]);

    return count;
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ label, title, value, unit, isCurrency, isActive, onClick, delay = 0 }) {
    const animatedValue = useCounterAnimation(isCurrency ? 0 : (value || 0));

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(amount);

    return (
        <div
            onClick={onClick}
            className={clsx(
                'relative overflow-hidden rounded-[24px] p-6 sm:p-8 transition-all duration-500 cursor-pointer group min-h-[180px] flex flex-col justify-between',
                'animate-fade-in-up',
                isActive
                    ? 'bg-[#00bcd4] text-white shadow-lg shadow-cyan-200/50 scale-[1.02]'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-cyan-100/30 hover:-translate-y-2'
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative z-10">
                <span className={clsx(
                    'text-[12px] uppercase font-black tracking-widest opacity-80',
                    isActive ? 'text-cyan-50' : 'text-cyan-500'
                )}>
                    {label}
                </span>
                <h4 className={clsx(
                    'text-lg sm:text-xl font-black mt-1 leading-tight',
                    isActive ? 'text-white' : 'text-slate-800'
                )}>
                    {title}
                </h4>
            </div>

            <div className="relative z-10 flex items-baseline gap-2 mt-auto">
                <span className={clsx(
                    'font-black tracking-tighter transition-all duration-300 group-hover:scale-105',
                    isCurrency ? 'text-xl sm:text-2xl' : 'text-4xl sm:text-6xl',
                    isActive ? 'text-white' : 'text-slate-800'
                )}>
                    {isCurrency ? formatCurrency(value) : animatedValue}
                </span>
                {unit && (
                    <span className={clsx(
                        'text-sm font-black uppercase opacity-60 ml-1',
                        isActive ? 'text-cyan-50' : 'text-slate-400'
                    )}>
                        {unit}
                    </span>
                )}
            </div>

            {/* Background Number / Icon Decoration */}
            <div className={clsx(
                "absolute -right-4 top-1/2 -translate-y-1/2 text-[150px] font-black opacity-[0.06] group-hover:scale-110 transition-transform duration-700 pointer-events-none select-none leading-none",
                isActive ? 'text-white' : 'text-slate-900'
            )}>
                {isCurrency ? 'Rp' : value}
            </div>
        </div>
    );
}

// ─── Status Badge Component ──────────────────────────────────────────────────
function StatusBadge({ status }) {
    const config = {
        waiting: { label: 'MENUNGGU', className: 'bg-amber-50 text-amber-700 border-amber-200' },
        disbursed: { label: 'DICAIRKAN', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        lpj_submitted: { label: 'VERIFIKASI LPJ', className: 'bg-blue-50 text-blue-700 border-blue-200' },
        lpj_waiting: { label: 'MENUNGGU LPJ', className: 'bg-slate-50 text-slate-500 border-slate-200' },
    };
    const c = config[status] || config.waiting;
    return (
        <span className={clsx('inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider', c.className)}>
            {c.label}
        </span>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BendaharaDashboard({ auth, kegiatans = [], stats = {}, panduans = [] }) {
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ── Filtering ──
    const filteredKegiatans = useMemo(() => {
        if (filter === 'all') return kegiatans;
        return kegiatans.filter((k) => k.status === filter);
    }, [kegiatans, filter]);

    // Reset page on filter change
    useEffect(() => setCurrentPage(1), [filter]);

    // ── Pagination ──
    const totalPages = Math.ceil(filteredKegiatans.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredKegiatans.slice(start, start + itemsPerPage);
    }, [filteredKegiatans, currentPage]);

    const startEntry = filteredKegiatans.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, filteredKegiatans.length);

    // ── Pagination numbers ──
    const pageNumbers = useMemo(() => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(amount || 0);

    const handleFilterClick = useCallback((filterValue) => {
        setFilter(prev => prev === filterValue ? 'all' : filterValue);
    }, []);

    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <PageHeader
                        title="Dashboard Bendahara"
                        description="Monitoring Pencairan & LPJ"
                    />
                }
            >
                <Head title="Dashboard Bendahara" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <StatCard
                            label="Pencairan"
                            title="Menunggu"
                            value={stats.waiting_count}
                            unit="Kegiatan"
                            isActive={filter === 'waiting'}
                            onClick={() => handleFilterClick('waiting')}
                            delay={100}
                        />
                        <StatCard
                            label="Pencairan"
                            title="Sudah Dicairkan"
                            value={stats.disbursed_count}
                            unit="Kegiatan"
                            isActive={filter === 'disbursed'}
                            onClick={() => handleFilterClick('disbursed')}
                            delay={200}
                        />
                        <StatCard
                            label="Total Anggaran"
                            title="Dicairkan"
                            value={stats.total_disbursed_amount}
                            isCurrency
                            delay={300}
                        />
                        <StatCard
                            label="Total Anggaran"
                            title="Belum Dicairkan"
                            value={stats.total_undisbursed_amount}
                            isCurrency
                            delay={400}
                        />
                        <StatCard
                            label="LPJ"
                            title="Perlu Verifikasi"
                            value={stats.lpj_count}
                            unit="LPJ"
                            isActive={filter === 'lpj_submitted'}
                            onClick={() => handleFilterClick('lpj_submitted')}
                            delay={500}
                        />
                    </div>

                    {/* ── Data Table Card ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 pt-6 pb-4">
                            <h3 className="text-xl font-black text-slate-800">
                                Kegiatan Siap Dicairkan
                            </h3>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 focus:outline-none focus:border-cyan-500 transition-all hover:border-cyan-300 cursor-pointer bg-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="waiting">Menunggu Pencairan</option>
                                <option value="disbursed">Sudah Dicairkan</option>
                                <option value="lpj_submitted">LPJ Diajukan</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto md:overflow-visible min-h-[150px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-y border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">No</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kegiatan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pengusul</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uang Diminta</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Uang Dicairkan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((kegiatan, index) => {
                                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                            return (
                                                <tr
                                                    key={kegiatan.kegiatan_id}
                                                    className="hover:bg-slate-50/80 transition-all duration-300 group animate-fade-in-up"
                                                    style={{ animationDelay: `${700 + index * 80}ms` }}
                                                >
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-sm group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                                                            {globalIndex}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-900">{kegiatan.nama_kegiatan}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-700">{kegiatan.pelaksana_manual || '-'}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{kegiatan.pengusul_nama}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-cyan-600">{formatCurrency(kegiatan.total_anggaran_diusulkan)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-emerald-600">{formatCurrency(kegiatan.dana_dicairkan)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <StatusBadge status={kegiatan.status} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {kegiatan.status === 'waiting' && (
                                                                <Link
                                                                    href={route('pencairan.index')}
                                                                    className="group/btn relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-sm shadow-violet-200 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5 transition-all active:scale-95"
                                                                    title="Cairkan Dana"
                                                                >
                                                                    <CreditCard size={15} />
                                                                </Link>
                                                            )}
                                                            {kegiatan.status === 'lpj_submitted' && (
                                                                <Link
                                                                    href={route('kegiatan.show', kegiatan.kegiatan_id)}
                                                                    className="group/btn relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-sm shadow-cyan-200 hover:shadow-lg hover:shadow-cyan-200 hover:-translate-y-0.5 transition-all active:scale-95"
                                                                    title="Verifikasi LPJ"
                                                                >
                                                                    <FileCheck2 size={15} />
                                                                </Link>
                                                            )}
                                                            <Link
                                                                href={route('kegiatan.show', kegiatan.kegiatan_id)}
                                                                className="group/btn relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm shadow-orange-200 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all active:scale-95"
                                                                title="Detail"
                                                            >
                                                                <Eye size={15} />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                        <Banknote size={32} />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">Tidak ada data kegiatan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredKegiatans.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                                <span className="text-sm text-slate-500">
                                    Menampilkan <strong>{startEntry}</strong> sampai <strong>{endEntry}</strong> dari <strong>{filteredKegiatans.length}</strong> entri
                                </span>
                                <div className="flex items-center gap-1">
                                    <PaginationButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                        <ChevronsLeft size={14} />
                                    </PaginationButton>
                                    <PaginationButton onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                                        <ChevronLeft size={14} />
                                    </PaginationButton>
                                    {pageNumbers.map((num) => (
                                        <PaginationButton
                                            key={num}
                                            onClick={() => setCurrentPage(num)}
                                            isActive={num === currentPage}
                                        >
                                            {num}
                                        </PaginationButton>
                                    ))}
                                    <PaginationButton onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                                        <ChevronRight size={14} />
                                    </PaginationButton>
                                    <PaginationButton onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                                        <ChevronsRight size={14} />
                                    </PaginationButton>
                                </div>
                            </div>
                        )}
                    </div>

                    <PanduanSection panduans={panduans} />
                </div>
            </AuthenticatedLayout>

            {/* ── Animations CSS ── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        opacity: 0;
                        animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `
            }} />
        </>
    );
}

// ─── Pagination Button ────────────────────────────────────────────────────────
function PaginationButton({ children, isActive, disabled, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                    ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-200 scale-110'
                    : disabled
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600 hover:-translate-y-0.5'
            )}
        >
            {children}
        </button>
    );
}
