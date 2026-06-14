import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, Link } from '@inertiajs/react';

// Icons per type — consistent, no color variation
const TYPE_ICONS = {
    roles: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    'mata-anggaran': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'kategori-belanja': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    satuan: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
    ),
    'tipe-kegiatan': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
    'kegiatan-status': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    iku: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
};

const TYPE_DESCS = {
    roles: 'Kelola hak akses dan peran pengguna sistem.',
    'mata-anggaran': 'Sumber dana, pagu anggaran, dan kode anggaran.',
    'kategori-belanja': 'Kategori dan kode belanja dalam RAB kegiatan.',
    satuan: 'Satuan ukur yang digunakan dalam anggaran.',
    'tipe-kegiatan': 'Klasifikasi dan tipe kegiatan yang tersedia.',
    'kegiatan-status': 'Status alur kerja kegiatan dalam sistem.',
    iku: 'Indikator kinerja utama yang diukur tiap kegiatan.',
};

const DEFAULT_ICON = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);

export default function Index({ auth, types }) {
    const typeList = Object.values(types || {});

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <PageHeader
                    title="Master Data"
                    description="Kelola data referensi sistem SIGAP secara terpusat"
                />
            }
        >
            <Head title="Master Data" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Count label */}
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-gray-700">{typeList.length + 1}</span> tipe data master
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Hanya Baca = tidak bisa diubah
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Dynamic type cards */}
                        {typeList.map((type) => (
                            <Link
                                key={type.key}
                                href={route('admin.master.resource.index', type.key)}
                                className="group flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200"
                            >
                                {/* Icon box */}
                                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-100 transition-colors duration-200">
                                    {TYPE_ICONS[type.key] ?? DEFAULT_ICON}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200">
                                            {type.title}
                                        </h5>
                                        {type.readonly && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Hanya Baca
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                        {TYPE_DESCS[type.key] ?? `Kelola data ${type.title}.`}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 self-center text-gray-200 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}

                        {/* SPK Card */}
                        <Link
                            href={route('admin.spk.index')}
                            className="group flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200"
                        >
                            <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-cyan-50 text-cyan-600 rounded-xl group-hover:bg-cyan-100 transition-colors duration-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200">
                                        Manajemen SPK
                                    </h5>
                                    <span className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full">DSS</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                    Bobot kriteria, konstrain nilai, dan evaluasi kinerja kegiatan.
                                </p>
                            </div>
                            <div className="flex-shrink-0 self-center text-gray-200 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
