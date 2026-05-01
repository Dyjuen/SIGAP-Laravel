import React, { useState, useEffect, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, X, Inbox, ChevronLeft, ChevronRight, FileText, Tag, CheckCircle2, Clock, Circle, ArrowRight, Plus } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { clsx } from 'clsx';
import KakPagination from '../Kak/Components/KakPagination';

function debounce(func, wait) {
    let timeout;
    const executedFunction = function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    executedFunction.cancel = function () {
        clearTimeout(timeout);
    };
    return executedFunction;
}

export default function Monitoring({ auth, kegiatans, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('kegiatan.monitoring'),
                { search: query },
                { preserveState: true, preserveScroll: true }
            );
        }, 300),
        []
    );

    useEffect(() => {
        performSearch(searchQuery);
        return () => performSearch.cancel();
    }, [searchQuery, performSearch]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const steps = [
        { id: 1, label: "PPK", dateKey: "accPPK" },
        { id: 2, label: "Wadir 2", dateKey: "accWD2" },
        { id: 3, label: "Pencairan", dateKey: "uangMuka" },
        { id: 4, label: "LPJ", dateKey: "lpj" },
        { id: 5, label: "Selesai", dateKey: "setorFisik" }
    ];

    const renderStepper = (item, isMobileView = false) => {
        return (
            <div className={clsx(
                "flex items-center w-full px-2",
                isMobileView ? "min-w-[400px] py-2" : "min-w-[500px] py-4"
            )}>
                {steps.map((step, index) => {
                    const isCompleted = step.id < item.status;
                    const isActive = step.id === item.status;
                    const isLast = index === steps.length - 1;
                    const date = item.dates[step.dateKey];

                    return (
                        <React.Fragment key={step.id}>
                            <div className="relative flex flex-col items-center group flex-1">
                                {/* Step Circle */}
                                <div className={clsx(
                                    "rounded-lg flex items-center justify-center transition-all duration-500 z-10",
                                    isMobileView ? "w-7 h-7" : "w-8 h-8 sm:w-10 sm:h-10 sm:rounded-xl",
                                    isCompleted ? "bg-cyan-500 text-white shadow-lg shadow-cyan-100 scale-105" :
                                    isActive ? "bg-white border-[3px] border-cyan-500 text-cyan-500 shadow-xl shadow-cyan-50 scale-110" :
                                    "bg-slate-50 text-slate-300 border border-slate-100"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={isMobileView ? 14 : 16} className="sm:size-5" strokeWidth={3} /> : 
                                     isActive ? <Clock size={isMobileView ? 14 : 16} className="sm:size-5 animate-spin-slow" strokeWidth={3} /> : 
                                     <Circle size={isMobileView ? 12 : 14} className="sm:size-4" strokeWidth={3} />}
                                </div>

                                {/* Step Label */}
                                <div className={clsx(
                                    "absolute flex flex-col items-center w-24",
                                    isMobileView ? "top-9" : "top-12"
                                )}>
                                    <span className={clsx(
                                        "font-black uppercase tracking-[0.05em] text-center transition-colors duration-300",
                                        isMobileView ? "text-[8px]" : "text-[10px]",
                                        isCompleted || isActive ? "text-slate-700" : "text-slate-300"
                                    )}>
                                        {step.label}
                                    </span>
                                    {date && (
                                        <span className={clsx(
                                            "font-black text-cyan-600 mt-1 bg-cyan-50/80 px-2 py-0.5 rounded-md border border-cyan-100/50 backdrop-blur-sm",
                                            isMobileView ? "text-[7px]" : "text-[9px]"
                                        )}>
                                            {date}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Line */}
                                {!isLast && (
                                    <div className={clsx(
                                        "absolute bg-slate-100 z-0 overflow-hidden rounded-full",
                                        isMobileView ? "left-[calc(50%+14px)] top-3.5 w-[calc(100%-28px)] h-[2px]" : "left-[calc(50%+16px)] sm:left-[calc(50%+20px)] top-4 sm:top-5 w-[calc(100%-32px)] sm:w-[calc(100%-40px)] h-[3px]"
                                    )}>
                                        <div 
                                            className={clsx(
                                                "h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-1000 ease-out",
                                                isCompleted ? "w-full" : "w-0"
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <PageHeader 
                    title="Pemantauan Kegiatan" 
                    description="Pantau setiap tahapan usulan Anda hingga selesai secara transparan." 
                />
            }
        >
            <Head title="Pemantauan Kegiatan" />

            <div className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                        <div className="relative w-full sm:w-96 group min-w-0">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                                <Search size={18} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all shadow-sm"
                                placeholder="Cari nama kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                                    onClick={handleClearSearch}
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                        
                        {auth.user.role_id === 3 && (
                            <Link
                                href={route('kak.create')}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00bcd4] text-white rounded-xl font-black text-sm hover:bg-cyan-500 transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>Usulan Baru</span>
                            </Link>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 animate-fade-in-up">
                        {/* Mobile View: Cards */}
                        <div className="md:hidden space-y-4">
                            {kegiatans.data.length === 0 ? (
                                <div className="bg-white rounded-[24px] p-10 text-center border border-slate-100 shadow-sm">
                                    <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold text-sm">Belum Ada Kegiatan</p>
                                </div>
                            ) : (
                                kegiatans.data.map((item, index) => (
                                    <div key={item.kegiatan_id} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                                                {(kegiatans.current_page - 1) * kegiatans.per_page + index + 1}
                                            </div>
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="text-[15px] font-black text-slate-800 leading-tight break-words">
                                                    {item.nama_kegiatan}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 text-[8px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest">
                                                        #{item.kegiatan_id}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-50 text-[8px] font-black text-cyan-600 border border-cyan-100 uppercase tracking-widest">
                                                        Aktif
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto pb-8 pt-2">
                                            {renderStepper(item, true)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto max-w-full">
                                <table className="w-full text-left border-collapse min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 sm:w-20 text-center">No.</th>
                                            <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px] sm:min-w-[250px] md:w-[400px]">Detail Kegiatan</th>
                                            <th className="px-4 sm:px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress Alur Kerja</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {kegiatans.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-24 px-10">
                                                    <div className="max-w-md mx-auto flex flex-col items-center gap-6">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                                            <Inbox size={32} strokeWidth={1.5} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Belum Ada Kegiatan</h3>
                                                            <p className="text-slate-400 font-bold text-xs leading-relaxed text-center">
                                                                Sepertinya Anda belum memiliki usulan kegiatan yang aktif.
                                                            </p>
                                                        </div>
                                                        {auth.user.role_id === 3 && (
                                                            <Link
                                                                href={route('kak.create')}
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-lg font-black text-xs hover:bg-cyan-600 transition-all shadow-sm"
                                                            >
                                                                Buat Usulan KAK <ArrowRight size={14} strokeWidth={3} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            kegiatans.data.map((item, index) => {
                                                const globalIndex = (kegiatans.current_page - 1) * kegiatans.per_page + index + 1;
                                                return (
                                                    <tr key={item.kegiatan_id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                                        <td className="px-4 sm:px-6 py-6 sm:py-8 whitespace-nowrap text-center">
                                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 transition-all duration-300 shadow-sm mx-auto">
                                                                {globalIndex < 10 ? `0${globalIndex}` : globalIndex}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-6 sm:py-8">
                                                            <div className="space-y-2">
                                                                <div className="text-sm sm:text-[15px] font-black text-slate-800 leading-tight group-hover:text-cyan-600 transition-colors duration-300">
                                                                    {item.nama_kegiatan}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 border border-slate-200 uppercase tracking-widest group-hover:bg-white transition-colors">
                                                                        <Tag size={10} strokeWidth={3} /> #{item.kegiatan_id}
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-[9px] font-black text-cyan-600 border border-cyan-100 uppercase tracking-widest">
                                                                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
                                                                        Aktif
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-6 sm:py-8">
                                                            <div className="bg-white/50 rounded-xl p-1 border border-transparent group-hover:border-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                                                                {renderStepper(item)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Area */}
                        {kegiatans.total > kegiatans.per_page && (
                            <div className="bg-white/50 rounded-[24px] px-8 py-5 border border-slate-100 shadow-sm">
                                <KakPagination links={kegiatans.links} from={kegiatans.from} to={kegiatans.to} total={kegiatans.total} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        opacity: 0;
                        animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .animate-spin-slow {
                        animation: spin 3s linear infinite;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `
            }} />
        </AuthenticatedLayout>
    );
}
