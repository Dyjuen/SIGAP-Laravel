import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, X, Inbox, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { clsx } from 'clsx';

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

    // Render stepper component for a single item
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title="Pemantauan Kegiatan" description="Pantau progress dan status kegiatan yang sedang berjalan" />}
        >
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
                padding: 1rem;
                animation: fadeIn 0.4s ease-out;
            }
            @media (min-width: 1024px) {
                .monitoring-kegiatan-page {
                    padding: 2rem;
                }
            }

            /* ========== HEADER STYLES REMOVED IN FAVOR OF PAGEHEADER COMPONENT ========== */

            /* ========================================== */
            /* SEARCH BAR STYLES */
            /* ========================================== */
            .search-section {
                margin-bottom: 1.5rem;
                opacity: 0;
                animation: slideInLeft 0.6s ease-out forwards;
                animation-delay: 0.1s;
            }

            .search-container {
                position: relative;
                max-width: 500px;
            }

            .search-input {
                width: 100%;
                padding: 0.875rem 1rem 0.875rem 3rem;
                border: 2px solid #E5E7EB;
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            .search-input:focus {
                outline: none;
                border-color: #03C9D7;
                box-shadow: 0 0 0 4px rgba(3, 201, 215, 0.1);
            }

            /* Card container */
            .card-datatable {
                background: white;
                border-radius: 18px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                overflow: hidden;
                animation: scaleIn 0.5s ease-out backwards;
                animation-delay: 0.1s;
                border: 1px solid #f1f5f9;
            }

            /* Enhanced row hover effect */
            .table-row-custom {
                transition: all 0.3s ease;
                position: relative;
                border-left: 3px solid transparent;
                animation: slideInRight 0.5s ease-out backwards;
                background: white;
            }

            .table-row-custom::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 0;
                height: 100%;
                background: linear-gradient(90deg, rgba(3, 201, 215, 0.05) 0%, transparent 100%);
                transition: width 0.3s ease;
                z-index: 0;
                border-top-left-radius: 12px;
                border-bottom-left-radius: 12px;
            }

            .table-row-custom:hover::before {
                width: 100%;
            }

            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `.table-row-custom:nth-child(${i}) { animation-delay: ${0.2 + (i * 0.05)}s !important; }`).join('\n')}

            .table-row-custom:hover {
                transform: translateX(4px);
                box-shadow: 0 4px 12px rgba(3, 201, 215, 0.1);
                z-index: 10;
            }

            .table-cell-custom {
                padding: 1.25rem 1rem;
                vertical-align: middle;
                border-top: 1px solid #f1f5f9;
                border-bottom: 1px solid #f1f5f9;
                position: relative;
                z-index: 1;
                background: white;
            }
            .table-cell-custom:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
            .table-cell-custom:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

            .index-number {
                font-weight: 600;
                color: #475569;
                font-size: 0.95rem;
                display: inline-block;
                transition: all 0.3s ease;
            }
            tr:hover .index-number { color: #03C9D7; transform: scale(1.1); }

            .activity-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
                transition: all 0.3s ease;
            }
            tr:hover .activity-name { color: #03C9D7; transform: translateX(4px); }

            .activity-name-sub {
                font-size: 0.75rem;
                color: #94a3b8;
                transition: all 0.3s ease;
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
                box-shadow: 0 4px 12px rgba(3, 201, 215, 0.2);
            }

            .stepper-item.completed .step-counter {
                background: linear-gradient(135deg, #03C9D7 0%, #02b3c4 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(3, 201, 215, 0.3);
            }

            .stepper-item.active .step-counter {
                background: white;
                border: 3px solid #03C9D7;
                color: #03C9D7;
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
            .stepper-item.completed .step-date { color: #03C9D7; font-weight: 600; }

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
                background: linear-gradient(90deg, #03C9D7 0%, #02b3c4 100%);
                transition: all 0.5s ease;
                border-radius: 2px;
                height: 100%;
                box-shadow: 0 2px 8px rgba(3, 201, 215, 0.3);
            }

            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulseBorder { 0%, 100% { box-shadow: 0 0 0 0 rgba(3, 201, 215, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(3, 201, 215, 0.1); } }

            @media (max-width: 1200px) {
                .step-counter { width: 30px; height: 30px; font-size: 0.65rem; }
                .progress-connector { top: 15px; left: calc(50% + 15px); width: calc(100% - 30px); }
                .step-name { font-size: 0.55rem; }
                .step-date { font-size: 0.5rem; }
            }
            `}</style>

            <div className="monitoring-kegiatan-page max-w-7xl mx-auto">
                {/* Header Section (Now handled by Layout) */}

                {/* Search Section */}
                <div className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Cari nama kegiatan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        {searchQuery && (
                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                onClick={handleClearSearch}
                                title="Clear search"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="card-datatable">
                    <div className="overflow-x-auto px-4 lg:px-6 pt-4 pb-2">
                        <table className="w-full min-w-[950px] border-separate" style={{ borderSpacing: '0 0.75rem' }}>
                            <thead>
                                <tr>
                                    <th className="w-20 text-center px-4 py-4 text-slate-500 font-semibold text-sm whitespace-nowrap">No.</th>
                                    <th className="w-[300px] text-left px-4 py-4 text-slate-500 font-semibold text-sm whitespace-nowrap">Nama Kegiatan</th>
                                    <th className="text-center px-4 py-4 text-slate-500 font-semibold text-sm whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kegiatans.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Inbox className="w-16 h-16 text-slate-300 animate-bounce" />
                                                <h3 className="text-lg font-semibold text-slate-600">Tidak ada data kegiatan</h3>
                                                <p className="text-sm">Belum ada kegiatan yang sesuai dengan pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    kegiatans.data.map((item, index) => {
                                        const globalIndex = (kegiatans.current_page - 1) * kegiatans.per_page + index + 1;
                                        return (
                                            <tr key={item.kegiatan_id} className="table-row-custom shadow-sm">
                                                <td className="table-cell-custom text-center">
                                                    <span className="index-number">{globalIndex}</span>
                                                </td>
                                                <td className="table-cell-custom">
                                                    <div className="activity-name">{item.nama_kegiatan}</div>
                                                    <div className="activity-name-sub">Pengusul</div>
                                                </td>
                                                <td className="table-cell-custom">
                                                    {renderStepper(item)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {kegiatans.total > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-100 mt-2 p-5 bg-white">
                            <div className="text-sm text-slate-500">
                                Menampilkan <span className="font-medium text-cyan-600">{kegiatans.from}</span> sampai <span className="font-medium text-cyan-600">{kegiatans.to}</span> dari <span className="font-medium text-slate-700">{kegiatans.total}</span> entri
                            </div>
                            <div className="flex gap-2">
                                {kegiatans.links.map((link, index) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    return (
                                        <button
                                            key={index}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                            className={clsx(
                                                "min-w-[36px] h-[36px] flex items-center justify-center px-3 rounded-md text-sm transition-all shadow-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50",
                                                !link.url ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200 shadow-none" :
                                                    link.active ? "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600" :
                                                        "bg-white text-slate-600 hover:text-cyan-600 hover:border-cyan-300 border-slate-200 hover:bg-cyan-50"
                                            )}
                                        >
                                            {isPrevious ? <ChevronLeft size={16} /> : isNext ? <ChevronRight size={16} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
