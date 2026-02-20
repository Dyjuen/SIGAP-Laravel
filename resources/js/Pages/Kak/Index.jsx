import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function KakIndex({ auth, kaks, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_id || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(route('kak.index'), { search: searchTerm, status_id: statusFilter }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle status filter change
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        router.get(route('kak.index'), { search: searchTerm, status_id: e.target.value }, { preserveState: true, replace: true });
    };

    const handleDelete = (item) => {
        Swal.fire({
            title: 'Hapus KAK?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('kak.destroy', item.kak_id), {
                    onSuccess: () => Swal.fire('Terhapus!', 'KAK berhasil dihapus.', 'success')
                });
            }
        });
    };

    const getStatusBadge = (statusId, statusName) => {
        const colors = {
            1: 'bg-gray-100 text-gray-800',  // Draft
            2: 'bg-yellow-100 text-yellow-800', // Review
            3: 'bg-green-100 text-green-800', // Disetujui
            4: 'bg-red-100 text-red-800',    // Ditolak
            5: 'bg-orange-100 text-orange-800' // Revisi
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[statusId] || 'bg-gray-100'}`}>
                {statusName}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Daftar Usulan Kegiatan (KAK)</h2>}
        >
            <Head title="Daftar KAK" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="w-full md:w-2/3 flex gap-4">
                            <div className="w-full md:w-1/2 relative">
                                <input
                                    type="text"
                                    className="w-full py-2.5 pl-4 pr-10 rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    placeholder="Cari kegiatan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <select
                                    className="w-full py-2.5 px-4 rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="1">Draft</option>
                                    <option value="2">Review</option>
                                    <option value="3">Disetujui</option>
                                    <option value="4">Ditolak</option>
                                    <option value="5">Revisi</option>
                                </select>
                            </div>
                        </div>

                        {/* Only Pengusul (Role 3) can create */}
                        {auth.user.role_id === 3 && (
                            <Link
                                href={route('kak.create')}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Buat KAK Baru
                            </Link>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kegiatan</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tipe</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pengusul</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {kaks.data.length > 0 ? (
                                        kaks.data.map((item, index) => (
                                            <tr key={item.kak_id} className="hover:bg-gray-50/80 transition">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{item.nama_kegiatan}</div>
                                                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{item.deskripsi_kegiatan}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.tipe_kegiatan?.nama_tipe_kegiatan}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(item.status_id, item.status?.nama_status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.pengusul?.nama_lengkap}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={route('kak.show', item.kak_id)}
                                                            className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition"
                                                            title="Lihat Detail"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </Link>

                                                        {/* Edit: Draft (1), Rejected (4), Revisi (5) only for owner */}
                                                        {auth.user.role_id === 3 && [1, 4, 5].includes(item.status_id) && item.pengusul_user_id === auth.user.user_id && (
                                                            <Link
                                                                href={route('kak.edit', item.kak_id)}
                                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </Link>
                                                        )}

                                                        {/* Delete: Draft (1), Rejected (4) only for owner */}
                                                        {auth.user.role_id === 3 && [1, 4].includes(item.status_id) && item.pengusul_user_id === auth.user.user_id && (
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Tidak ada data KAK.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Menampilkan {kaks.from} sampai {kaks.to} dari {kaks.total} data
                            </div>
                            <div className="flex gap-2">
                                {kaks.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveState
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
