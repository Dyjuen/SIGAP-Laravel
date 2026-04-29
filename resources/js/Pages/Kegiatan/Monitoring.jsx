import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, X, Inbox, ChevronLeft, ChevronRight, FileText, Tag } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { clsx } from 'clsx';
import KakPagination from '../Kak/Components/KakPagination'; // Reuse pagination styling from Kak

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

    // Debounced search function
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

    // Render stepper component for a single item (Desktop)
    const renderStepper = (item) => {
        const steps = [
            { number: "01", label: "Disetujui PPK", date: item.dates.accPPK },
            { number: "02", label: "Disetujui WD2", date: item.dates.accWD2 },
            { number: "03", label: "Uang Muka", date: item.dates.uangMuka },
            { number: "04", label: "LPJ", date: item.dates.lpj },
            { number: "05", label: "Setor Fisik LPJ", date: item.dates.setorFisik }
        ];

        return (
            <div className="stepper-wrapper">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    let stepClass = "pending";
                    let progressWidth = "0%";

                    if (stepNumber < item.status) {
                        stepClass = "completed";
                        progressWidth = "100%";
                    } else if (stepNumber === item.status) {
                        stepClass = "active";
                        progressWidth = "0%";
                    }

                    return (
                        <div key={index} className={`stepper-item ${stepClass}`}>
                            <div className="step-counter">
                                {stepClass === "completed" ? "✓" : step.number}
                            </div>
                            <div className="step-name" title={step.label}>{step.label}</div>
                            <div className="step-date">{step.date || "-"}</div>
                            {index < steps.length - 1 && (
                                <div className="progress-connector">
                                    <div className="progress">
                                        <div
                                            className={`progress-bar ${stepClass === 'completed' ? 'animated' : ''}`}
                                            style={{ width: progressWidth }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render vertical stepper for mobile
    const renderMobileStepper = (item) => {
        const steps = [
            { label: "Disetujui PPK", date: item.dates.accPPK },
            { label: "Disetujui WD2", date: item.dates.accWD2 },
            { label: "Uang Muka", date: item.dates.uangMuka },
            { label: "LPJ", date: item.dates.lpj },
            { label: "Setor Fisik LPJ", date: item.dates.setorFisik }
        ];

        return (
            <div className="space-y-4 mt-2">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < item.status;
                    const isActive = stepNumber === item.status;

                    return (
                        <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className={clsx(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10",
                                    isCompleted ? "bg-cyan-600 text-white shadow-sm shadow-cyan-200" : 
                                    isActive ? "bg-white border-2 border-cyan-500 text-cyan-500" : 
                                    "bg-gray-100 text-gray-400"
                                )}>
                                    {isCompleted ? "✓" : stepNumber}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={clsx(
                                        "w-0.5 h-full -my-1",
                                        isCompleted ? "bg-cyan-500" : "bg-gray-100"
                                    )}></div>
                                )}
                            </div>
                            <div className="pb-4">
                                <div className={clsx(
                                    "text-xs font-bold leading-none mb-1",
                                    isCompleted || isActive ? "text-gray-800" : "text-gray-400"
                                )}>
                                    {step.label}
                                </div>
                                <div className={clsx(
                                    "text-[10px]",
                                    isCompleted ? "text-cyan-600 font-medium" : "text-gray-300"
                                )}>
                                    {step.date || "Menunggu..."}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pemantauan Kegiatan" />

            <style>{`
            /* ========== GLOBAL Z-INDEX FIX ========== */
            /* Scrollbar Hiding */
            html, body {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            html::-webkit-scrollbar, body::-webkit-scrollbar {
                display: none;
            }

            .monitoring-kegiatan-page {
                min-height: 100vh;
                animation: fadeIn 0.4s ease-out;
            }

            /* Bootstrap Progress Stepper */
            .stepper-wrapper {
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                padding: 1.5rem 1rem;
                width: 100%;
                gap: 0.5rem;
            }

            .stepper-item {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1 1 0;
                max-width: calc(20% - 0.5rem);
                animation: fadeIn 0.5s ease-out backwards;
            }

            .step-counter {
                position: relative;
                z-index: 5;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #e2e8f0;
                margin-bottom: 0.5rem;
                font-weight: 700;
                font-size: 1.1rem;
                color: #94a3b8;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                flex-shrink: 0;
            }

            .stepper-item:hover .step-counter {
                transform: scale(1.15);
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
            }

            .stepper-item.completed .step-counter {
                background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
            }

            .stepper-item.active .step-counter {
                background: white;
                border: 3px solid #06b6d4;
                color: #06b6d4;
                animation: pulseBorder 2s ease-in-out infinite;
            }

            .step-name {
                text-align: center;
                font-size: 0.85rem;
                font-weight: 600;
                color: #94a3b8;
                margin-top: 0.25rem;
                transition: all 0.3s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                padding: 0 2px;
            }

            .step-date {
                text-align: center;
                font-size: 0.8rem;
                color: #cbd5e0;
                margin-top: 0.15rem;
                font-weight: 500;
            }

            .stepper-item.completed .step-name, .stepper-item.active .step-name {
                color: #475569;
                font-weight: 700;
            }
            .stepper-item.completed .step-date { color: #06b6d4; font-weight: 600; }

            .progress-connector {
                position: absolute;
                top: 25px; /* (50px / 2) */
                left: calc(50% + 25px); /* (50px / 2) */
                width: calc(100% - 50px);
                height: 4px;
                z-index: 1;
            }

            .progress-connector .progress {
                height: 100%;
                background-color: #e2e8f0;
                border-radius: 2px;
                width: 100%;
            }

            .progress-connector .progress-bar {
                background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
                transition: all 0.5s ease;
                border-radius: 2px;
                height: 100%;
                box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
            }

            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulseBorder { 0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.1); } }

            @media (max-width: 1200px) {
                .step-counter { width: 30px; height: 30px; font-size: 0.65rem; }
                .progress-connector { top: 15px; left: calc(50% + 15px); width: calc(100% - 30px); }
                .step-name { font-size: 0.55rem; }
                .step-date { font-size: 0.5rem; }
            }
            `}</style>

            <div className="py-8 relative min-h-screen monitoring-kegiatan-page">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Wide layout wrapper matching KAK */}
                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[95%] space-y-6">
                    <PageHeader 
                        title="Pemantauan Kegiatan" 
                        description="Pantau progress dan status kegiatan yang sedang berjalan secara terpusat." 
                    />
                    
                    {/* Toolbar Section (Search) */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40">
                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-10 py-2.5 border-gray-200 rounded-xl leading-5 bg-white/70 backdrop-blur-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 sm:text-sm transition-all shadow-sm hover:bg-white"
                                placeholder="Cari nama kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={handleClearSearch}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Table Content */}
                    <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white/70 backdrop-blur-md overflow-hidden sm:rounded-t-2xl border-x border-t border-gray-100/60 shadow-sm relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100/80">
                                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No.</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[300px]">Kegiatan</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status Pemantauan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/40 divide-y divide-gray-50/50">
                                        {kegiatans.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-16">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <Inbox className="w-12 h-12 text-gray-300" />
                                                        <h3 className="text-lg font-bold text-gray-600">Tidak ada data kegiatan</h3>
                                                        <p className="text-sm text-gray-500 font-medium">Belum ada kegiatan yang sesuai dengan pencarian Anda</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            kegiatans.data.map((item, index) => {
                                                const globalIndex = (kegiatans.current_page - 1) * kegiatans.per_page + index + 1;
                                                return (
                                                    <tr key={item.kegiatan_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className="text-sm font-bold text-gray-500 group-hover:text-cyan-600 transition-colors">{globalIndex}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors mb-1">{item.nama_kegiatan}</div>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                Pengusul
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {renderStepper(item)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {kegiatans.data.length === 0 ? (
                                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-10 text-center border border-dashed border-gray-200">
                                    <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 font-medium text-sm">Tidak ada data kegiatan</p>
                                </div>
                            ) : (
                                kegiatans.data.map((item) => (
                                    <div key={item.kegiatan_id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 opacity-50"></div>
                                        
                                        <div className="mb-4">
                                            <div className="text-sm font-bold text-gray-900 mb-1 leading-tight">{item.nama_kegiatan}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <Tag className="w-3 h-3" />
                                                Pengusul
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-50 pt-4">
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">Progress Kegiatan</div>
                                            {renderMobileStepper(item)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Content Wrapper */}
                        <div className="bg-white/70 backdrop-blur-md overflow-hidden rounded-b-2xl border-x border-b border-gray-100/60 shadow-sm animate-in fade-in duration-500">
                            <KakPagination links={kegiatans.links} from={kegiatans.from} to={kegiatans.to} total={kegiatans.total} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
