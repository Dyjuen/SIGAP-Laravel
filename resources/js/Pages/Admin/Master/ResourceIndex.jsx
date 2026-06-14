import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, Link, useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useState, useEffect } from 'react';

// Smart cell renderer matching the site's neutral/cyan palette
function CellValue({ value, fieldName }) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-gray-300 italic text-xs">—</span>;
    }
    if (typeof value === 'boolean' || value === 1 || value === 0) {
        const active = value === true || value === 1;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                active
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-500' : 'bg-gray-400'}`} />
                {active ? 'Aktif' : 'Tidak Aktif'}
            </span>
        );
    }
    if (fieldName === 'total_pagu') {
        return (
            <span className="font-mono text-sm font-semibold text-gray-800">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
            </span>
        );
    }
    if (fieldName === 'tahun_anggaran') {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                {value}
            </span>
        );
    }
    if (fieldName?.startsWith('kode') || fieldName === 'kode') {
        return (
            <span className="inline-flex items-center font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                {value}
            </span>
        );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
}

export default function ResourceIndex({ auth, type, title, readonly, primaryKey, fields, items, filters }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        if (!isModalOpen) {
            const initialData = {};
            fields.forEach(field => initialData[field.name] = '');
            setData(initialData);
            clearErrors();
        }
    }, [isModalOpen, fields]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentItemId(null);
        const initialData = {};
        fields.forEach(field => initialData[field.name] = '');
        setData(initialData);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditMode(true);
        setCurrentItemId(item[primaryKey]);
        const formData = {};
        fields.forEach(field => formData[field.name] = item[field.name]);
        setData(formData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('admin.master.update', { type, id: currentItemId }), { onSuccess: closeModal });
        } else {
            post(route('admin.master.store', type), { onSuccess: closeModal });
        }
    };

    const handleDelete = (item) => {
        const label = fields.find(f => f.type === 'text');
        const name = label ? item[label.name] : 'item ini';
        if (confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
            router.delete(route('admin.master.destroy', { type, id: item[primaryKey] }));
        }
    };

    // Sync searchTerm with filters or type change
    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [type, filters.search]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(route('admin.master.resource.index', type), { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.master.resource.index', type), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('admin.master.resource.index', type), {}, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title={title} />}
        >
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-5">

                    {/* ── Banner Card ─────────────────────────── */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 shadow-lg">
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                        <div className="absolute -bottom-8 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                {/* Breadcrumb */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Link
                                        href={route('admin.master.index')}
                                        className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium transition"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Master Data
                                    </Link>
                                    <span className="text-white/40 text-xs">/</span>
                                    <span className="text-white/80 text-xs font-medium">{title}</span>
                                </div>

                                <h1 className="text-xl font-bold text-white">{title}</h1>
                                <p className="text-white/70 text-sm mt-0.5 flex items-center gap-2">
                                    {items.total} entri tersimpan
                                    {readonly && (
                                        <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Hanya Baca
                                        </span>
                                    )}
                                </p>
                            </div>

                            {!readonly && (
                                <button
                                    onClick={openCreateModal}
                                    className="flex-shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold py-2.5 px-5 rounded-xl border border-white/30 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah {title}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Search Bar ──────────────────────────── */}
                    <form onSubmit={handleSearch} className="relative w-full">
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition"
                                placeholder={`Cari ${title}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-2.5 flex items-center text-gray-300 hover:text-gray-500"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>

                    {/* ── Table Card ─────────────────────────── */}
                    <div className="bg-white shadow-xl sm:rounded-2xl border border-gray-100 overflow-hidden">

                        {/* Table header info bar */}
                        {filters.search && (
                            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-cyan-50/50">
                                <p className="text-xs text-gray-500">
                                    Hasil pencarian untuk <span className="font-semibold text-cyan-700">"{filters.search}"</span> · {items.total} ditemukan
                                </p>
                                <button
                                    onClick={clearSearch}
                                    className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 transition"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Hapus filter
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">No.</th>
                                        {fields.map((field) => (
                                            <th key={field.name} className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {field.label}
                                            </th>
                                        ))}
                                        {!readonly && (
                                            <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {items.data.length > 0 ? (
                                        items.data.map((item, index) => (
                                            <tr key={index} className="group hover:bg-gray-50/80 transition-colors duration-150">
                                                {/* Row number */}
                                                <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                    {(items.current_page - 1) * items.per_page + index + 1}
                                                </td>

                                                {/* Cells */}
                                                {fields.map((field, fi) => (
                                                    <td key={field.name} className="px-6 py-4 whitespace-nowrap">
                                                        {fi === 0 && typeof item[field.name] === 'string' ? (
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                                                                <span className="text-sm font-semibold text-gray-900">{item[field.name]}</span>
                                                            </div>
                                                        ) : (
                                                            <CellValue value={item[field.name]} fieldName={field.name} />
                                                        )}
                                                    </td>
                                                ))}

                                                {/* Actions — visible on row hover */}
                                                {!readonly && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={fields.length + (readonly ? 1 : 2)} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-gray-400">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                                        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-500">Tidak ada data ditemukan</p>
                                                    <p className="text-xs text-gray-400">
                                                        {filters.search
                                                            ? `Tidak ada hasil untuk "${filters.search}"`
                                                            : 'Belum ada data yang tersimpan'}
                                                    </p>
                                                    {!readonly && !filters.search && (
                                                        <button
                                                            onClick={openCreateModal}
                                                            className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold underline underline-offset-2 transition"
                                                        >
                                                            + Tambah data pertama
                                                        </button>
                                                    )}
                                                    {filters.search && (
                                                        <button onClick={clearSearch} className="text-xs text-gray-500 hover:text-gray-700 font-semibold underline underline-offset-2 transition">
                                                            Hapus pencarian
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {items.data.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-sm text-gray-500">
                                    Menampilkan {items.from}–{items.to} dari {items.total} entri
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {items.links.map((link, key) =>
                                        link.url ? (
                                            <Link
                                                key={key}
                                                href={link.url}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-cyan-500 text-white shadow-md'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={key}
                                                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-300 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Modal ──────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} aria-hidden="true" />
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">

                            {/* Gradient header — cyan-to-blue, matching the site */}
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-5 flex items-center justify-between">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    {isEditMode ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit {title}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Tambah {title} Baru
                                        </>
                                    )}
                                </h3>
                                <button onClick={closeModal} className="text-white/80 hover:text-white focus:outline-none transition">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form body */}
                            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                                {fields.map((field) => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-bold text-gray-700 mb-1.5">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>

                                        {field.type === 'boolean' ? (
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={!!data[field.name]}
                                                        onChange={(e) => setData(field.name, e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-cyan-500 transition-colors" />
                                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                                                </div>
                                                <span className="text-sm text-gray-600">{data[field.name] ? 'Aktif' : 'Tidak Aktif'}</span>
                                            </label>
                                        ) : (
                                            <input
                                                id={field.name}
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5 text-sm transition"
                                                value={data[field.name] ?? ''}
                                                onChange={(e) => setData(field.name, e.target.value)}
                                                required={field.required}
                                                maxLength={field.maxLength}
                                                placeholder={`Masukkan ${field.label.toLowerCase()}`}
                                            />
                                        )}
                                        <InputError message={errors[field.name]} className="mt-1.5" />
                                    </div>
                                ))}

                                <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-md transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                                    >
                                        {processing ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
