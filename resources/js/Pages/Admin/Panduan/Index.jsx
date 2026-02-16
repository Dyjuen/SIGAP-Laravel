import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Import router
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function PanduanIndex({ auth, panduan, roles }) {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(panduan);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Forms
    const { data: addData, setData: setAddData, post: postAdd, processing: processingAdd, errors: errorsAdd, reset: resetAdd, clearErrors: clearErrorsAdd } = useForm({
        judul_panduan: '',
        tipe_media: 'document', // document | video
        path_media: '', // for video url
        file: null, // for document upload
        target_role_id: '',
    });

    const { data: editData, setData: setEditData, post: postEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit, clearErrors: clearErrorsEdit } = useForm({
        _method: 'PUT', // For file upload spoofing
        judul_panduan: '',
        tipe_media: 'document',
        path_media: '',
        file: null,
        target_role_id: '',
    });

    // Search Logic
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const results = panduan.filter(item =>
            item.judul_panduan?.toLowerCase().includes(lowerTerm) ||
            item.role_name?.toLowerCase().includes(lowerTerm) ||
            item.tipe_media?.toLowerCase().includes(lowerTerm)
        );
        setFilteredData(results);
        setCurrentPage(1);
    }, [searchTerm, panduan]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handlers
    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('admin.panduan.store'), {
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Panduan berhasil ditambahkan', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setEditData({
            _method: 'PUT',
            judul_panduan: item.judul_panduan,
            tipe_media: item.tipe_media,
            path_media: item.tipe_media === 'video' ? item.path_media : '',
            file: null,
            target_role_id: item.target_role_id || '',
        });
        clearErrorsEdit();
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        postEdit(route('admin.panduan.update', editingItem.panduan_id), {
            forceFormData: true,
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Panduan berhasil diperbarui', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDelete = (item) => {
        Swal.fire({
            title: 'Hapus Panduan?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.panduan.destroy', item.panduan_id), {
                    onSuccess: () => Swal.fire('Terhapus!', 'Panduan berhasil dihapus.', 'success')
                });
            }
        })
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Panduan</h2>}
        >
            <Head title="Manajemen Panduan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="w-full md:w-1/3 relative">
                            <input
                                type="text"
                                className="w-full py-2.5 pl-4 pr-10 rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                                placeholder="Cari panduan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { clearErrorsAdd(); resetAdd(); setShowAddModal(true); }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Panduan
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">No.</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Judul Panduan</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tipe</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Target Peran</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <tr key={item.panduan_id} className="hover:bg-gray-50/80 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.judul_panduan}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.tipe_media === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {item.tipe_media === 'video' ? 'Video' : 'Dokumen'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.role_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <a
                                                        href={item.download_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition mr-2 inline-block"
                                                        title="Download / Lihat"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    </a>
                                                    <button onClick={() => openEditModal(item)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-2" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Hapus">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Tidak ada data panduan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination (Simple) */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded disabled:opacity-50">&laquo;</button>
                                <span className="px-3 py-1 text-gray-600">Halaman {currentPage} dari {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded disabled:opacity-50">&raquo;</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full z-10">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Tambah Panduan</h3>
                            <button onClick={() => setShowAddModal(false)}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Panduan <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                    value={addData.judul_panduan} onChange={e => setAddData('judul_panduan', e.target.value)} />
                                {errorsAdd.judul_panduan && <p className="text-xs text-red-500 mt-1">{errorsAdd.judul_panduan}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Target Peran</label>
                                <select className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                    value={addData.target_role_id} onChange={e => setAddData('target_role_id', e.target.value)}>
                                    <option value="">Semua (Publik)</option>
                                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.nama_role}</option>)}
                                </select>
                                {errorsAdd.target_role_id && <p className="text-xs text-red-500 mt-1">{errorsAdd.target_role_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Media <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipe_media" value="document" checked={addData.tipe_media === 'document'} onChange={e => setAddData('tipe_media', 'document')} className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Dokumen (PDF/Word)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipe_media" value="video" checked={addData.tipe_media === 'video'} onChange={e => setAddData('tipe_media', 'video')} className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Video (YouTube)</span>
                                    </label>
                                </div>
                                {errorsAdd.tipe_media && <p className="text-xs text-red-500 mt-1">{errorsAdd.tipe_media}</p>}
                            </div>

                            {addData.tipe_media === 'video' ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">URL Video (YouTube) <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                        placeholder="https://youtube.com/..."
                                        value={addData.path_media} onChange={e => setAddData('path_media', e.target.value)} />
                                    {errorsAdd.path_media && <p className="text-xs text-red-500 mt-1">{errorsAdd.path_media}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload File <span className="text-red-500">*</span></label>
                                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                        onChange={e => setAddData('file', e.target.files[0])} />
                                    {errorsAdd.file && <p className="text-xs text-red-500 mt-1">{errorsAdd.file}</p>}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={processingAdd} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50">
                                    {processingAdd ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full z-10">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Edit Panduan</h3>
                            <button onClick={() => setShowEditModal(false)}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Panduan <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                    value={editData.judul_panduan} onChange={e => setEditData('judul_panduan', e.target.value)} />
                                {errorsEdit.judul_panduan && <p className="text-xs text-red-500 mt-1">{errorsEdit.judul_panduan}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Target Peran</label>
                                <select className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                    value={editData.target_role_id} onChange={e => setEditData('target_role_id', e.target.value)}>
                                    <option value="">Semua (Publik)</option>
                                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.nama_role}</option>)}
                                </select>
                                {errorsEdit.target_role_id && <p className="text-xs text-red-500 mt-1">{errorsEdit.target_role_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Media <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipe_media_edit" value="document" checked={editData.tipe_media === 'document'} onChange={e => setEditData('tipe_media', 'document')} className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Dokumen (PDF/Word)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tipe_media_edit" value="video" checked={editData.tipe_media === 'video'} onChange={e => setEditData('tipe_media', 'video')} className="text-cyan-500 focus:ring-cyan-500" />
                                        <span>Video (YouTube)</span>
                                    </label>
                                </div>
                            </div>

                            {editData.tipe_media === 'video' ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">URL Video (YouTube) <span className="text-red-500">*</span></label>
                                    <input type="text" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 py-2.5"
                                        placeholder="https://youtube.com/..."
                                        value={editData.path_media} onChange={e => setEditData('path_media', e.target.value)} />
                                    {errorsEdit.path_media && <p className="text-xs text-red-500 mt-1">{errorsEdit.path_media}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ganti File (Opsional)</label>
                                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                        onChange={e => setEditData('file', e.target.files[0])} />
                                    <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengganti file.</p>
                                    {errorsEdit.file && <p className="text-xs text-red-500 mt-1">{errorsEdit.file}</p>}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={processingEdit} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50">
                                    {processingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
