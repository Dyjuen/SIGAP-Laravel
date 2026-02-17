import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';

// Manual debounce to avoid lodash dependency
function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);

    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

export default function LogsIndex({ auth, logs, roles, filters }) {
    const [filterState, setFilterState] = useState({
        role: filters.role || '',
        log_type: filters.log_type || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const [processing, setProcessing] = useState(false); // Track processing state

    // Use custom debounce hook
    const debouncedApplyFilters = useDebounce((newFilters) => {
        setProcessing(true);
        router.get(route('admin.logs.index'), newFilters, {
            preserveState: true,
            replace: true,
            onFinish: () => setProcessing(false),
        });
    }, 500);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filterState, [key]: value };
        setFilterState(newFilters);
        debouncedApplyFilters(newFilters);
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'Admin': return 'bg-purple-100 text-purple-800';
            case 'Verifikator': return 'bg-blue-100 text-blue-800';
            case 'Pengusul': return 'bg-green-100 text-green-800';
            case 'PPK': return 'bg-orange-100 text-orange-800';
            case 'Wadir': return 'bg-indigo-100 text-indigo-800';
            case 'Bendahara': return 'bg-amber-100 text-amber-800';
            case 'Rektorat': return 'bg-red-100 text-red-800';
            case 'System': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'KAK_STATUS':
                return (
                    <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                );
            case 'KEGIATAN_STATUS':
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                );
            case 'KAK_APPROVAL':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case 'KEGIATAN_APPROVAL':
                return (
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                );
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Riwayat Pengguna</h2>}
        >
            <Head title="Riwayat Pengguna" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Info */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pengguna</h1>
                        <p className="mt-1 text-sm text-gray-500">Pantau seluruh kegiatan yang tercatat dalam sistem</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Peran</label>
                                <select
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition"
                                    value={filterState.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                >
                                    <option value="">Semua Peran</option>
                                    {roles.map(role => (
                                        <option key={role.role_id} value={role.nama_role}>{role.nama_role}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Log Type Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Riwayat</label>
                                <select
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition"
                                    value={filterState.log_type}
                                    onChange={(e) => handleFilterChange('log_type', e.target.value)}
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="KAK_STATUS">Perubahan Status KAK</option>
                                    <option value="KEGIATAN_STATUS">Perubahan Status Kegiatan</option>
                                    <option value="KAK_APPROVAL">Approval KAK</option>
                                    <option value="KEGIATAN_APPROVAL">Approval Kegiatan</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition"
                                        value={filterState.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    />
                                    <span className="text-gray-400 font-medium">→</span>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition"
                                        value={filterState.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Timeline / List */}
                    <div className="space-y-4">
                        {processing && (
                            <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <span className="text-gray-500">Memuat data...</span>
                            </div>
                        )}

                        {!processing && logs.data.length > 0 ? (
                            logs.data.map((log, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-cyan-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 p-3 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors">
                                            {getLogIcon(log.log_type)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <p className="text-gray-900 font-medium text-lg leading-snug">
                                                    {log.description}
                                                </p>
                                                <span className="text-sm text-gray-500 whitespace-nowrap self-start md:self-auto">
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide uppercase ${getRoleBadgeClass(log.user_role)}`}>
                                                    {log.user_role}
                                                </span>
                                                <span className="font-semibold text-gray-700">
                                                    {log.user_name}
                                                </span>
                                            </div>

                                            {log.catatan && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 text-gray-600 text-sm italic">
                                                    "{log.catatan}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !processing && (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Tidak ada riwayat ditemukan</h3>
                                    <p className="mt-1 text-gray-500">Coba ubah filter pencarian anda</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Pagination */}
                    {!processing && logs.data.length > 0 && (
                        <div className="mt-8 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Menampilkan <span className="font-medium">{logs.from}</span> sampai <span className="font-medium">{logs.to}</span> dari <span className="font-medium">{logs.total}</span> hasil
                            </p>
                            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                {logs.links.map((link, key) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            if (link.url) {
                                                setProcessing(true);
                                                router.get(link.url, filterState, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    onFinish: () => setProcessing(false)
                                                });
                                            }
                                        }}
                                        disabled={!link.url}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                            ${link.active
                                                ? 'z-10 bg-cyan-50 border-cyan-500 text-cyan-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }
                                            ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                            ${key === 0 ? 'rounded-l-md' : ''}
                                            ${key === logs.links.length - 1 ? 'rounded-r-md' : ''}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
