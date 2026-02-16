import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Import router from @inertiajs/react
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function UserManagementIndex({ auth, users, roles }) {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filteredUsers, setFilteredUsers] = useState(users);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form Hooks
    const { data: addData, setData: setAddData, post: postAdd, processing: processingAdd, errors: errorsAdd, reset: resetAdd, clearErrors: clearErrorsAdd } = useForm({
        nama_lengkap: '',
        username: '',
        email: '',
        role_id: '',
        password: '',
        password_confirmation: '',
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: processingEdit, errors: errorsEdit, reset: resetEdit, clearErrors: clearErrorsEdit } = useForm({
        nama_lengkap: '',
        email: '',
        role_id: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Effect for Search
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const results = users.filter(user =>
            user.nama_lengkap?.toLowerCase().includes(lowerTerm) ||
            user.username?.toLowerCase().includes(lowerTerm) ||
            user.email?.toLowerCase().includes(lowerTerm) ||
            user.role?.toLowerCase().includes(lowerTerm)
        );
        setFilteredUsers(results);
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, users]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Handlers
    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('admin.users.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Akun berhasil ditambahkan',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditData({
            nama_lengkap: user.nama_lengkap,
            email: user.email,
            role_id: user.role_id,
            new_password: '', // Optional
            new_password_confirmation: ''
        });
        clearErrorsEdit();
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        // If password is provided, handle change password concurrently or just warn user
        // The implementation plan had separate endpoints, but here we can try to do profile update.
        // If password fields are filled, we might need a separate call or specific logic.
        // For simplicity and matching the native flow which separated them or allowed both, 
        // let's stick to updating profile first.
        // Wait, native had 'Update Profile' and 'Change Password' as separate actions or potentially combined.
        // My controller has separate methods. 
        // Let's call update profile. If password is set, call change password.

        // 1. Update Profile
        putEdit(route('admin.users.update', editingUser.user_id), {
            onSuccess: () => {
                // 2. If password is set, Change Password
                if (editData.new_password) {
                    router.put(route('admin.users.change-password', editingUser.user_id), {
                        new_password: editData.new_password,
                        new_password_confirmation: editData.new_password_confirmation
                    }, {
                        onSuccess: () => {
                            closeEditModal();
                        },
                        onError: (errors) => {
                            // Map errors to editData errors if possible, or just show toast
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal Mengubah Password',
                                text: Object.values(errors).flat().join('\n')
                            });
                        }
                    });
                } else {
                    closeEditModal();
                }
            },
            // On error of profile update, it stays open with errors
        });
    };

    // Helper to close and success message for Edit
    const closeEditModal = () => {
        setShowEditModal(false);
        resetEdit();
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Profil berhasil diperbarui',
            timer: 1500,
            showConfirmButton: false
        });
    }


    const handleDelete = (user) => {
        Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Data pengguna akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.destroy', user.user_id), {
                    onSuccess: () => {
                        Swal.fire(
                            'Terhapus!',
                            'Data pengguna berhasil dihapus.',
                            'success'
                        )
                    }
                });
            }
        })
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Akun</h2>}
        >
            <Head title="Manajemen Akun" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-fade-in-down">
                        <div className="w-full md:w-1/3 relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="w-full py-2.5 pl-10 pr-4 rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition duration-200"
                                placeholder="Cari akun..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                clearErrorsAdd();
                                resetAdd();
                                setShowAddModal(true);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Tambah Akun
                        </button>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No.</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Peran</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((user, index) => (
                                            <tr key={user.user_id} className="hover:bg-gray-50/80 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{user.nama_lengkap}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                                            user.role === 'Verifikator' ? 'bg-blue-100 text-blue-800' :
                                                                user.role === 'Pengusul' ? 'bg-green-100 text-green-800' :
                                                                    user.role === 'PPK' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition mr-2"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                                                        title="Hapus"
                                                        disabled={user.user_id === auth.user.id}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                Tidak ada data pengguna ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} entri
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        &laquo;
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition ${currentPage === i + 1
                                                    ? 'bg-cyan-500 text-white shadow-md'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        &raquo;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Akun */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-bold text-white relative flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                    Tambah Akun Baru
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-white hover:text-gray-200 focus:outline-none">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="px-6 py-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                            placeholder="Masukkan nama lengkap"
                                            value={addData.nama_lengkap}
                                            onChange={e => setAddData('nama_lengkap', e.target.value)}
                                        />
                                    </div>
                                    {errorsAdd.nama_lengkap && <p className="mt-1 text-xs text-red-500">{errorsAdd.nama_lengkap}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                            placeholder="Username"
                                            value={addData.username}
                                            onChange={e => setAddData('username', e.target.value)}
                                        />
                                        {errorsAdd.username && <p className="mt-1 text-xs text-red-500">{errorsAdd.username}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Peran <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                            value={addData.role_id}
                                            onChange={e => setAddData('role_id', e.target.value)}
                                        >
                                            <option value="">Pilih Peran</option>
                                            {roles.map(role => (
                                                <option key={role.role_id} value={role.role_id}>{role.nama_role}</option>
                                            ))}
                                        </select>
                                        {errorsAdd.role_id && <p className="mt-1 text-xs text-red-500">{errorsAdd.role_id}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        placeholder="contoh@email.com"
                                        value={addData.email}
                                        onChange={e => setAddData('email', e.target.value)}
                                    />
                                    {errorsAdd.email && <p className="mt-1 text-xs text-red-500">{errorsAdd.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        placeholder="Min. 8 karakter"
                                        value={addData.password}
                                        onChange={e => setAddData('password', e.target.value)}
                                    />
                                    {errorsAdd.password && <p className="mt-1 text-xs text-red-500">{errorsAdd.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password <span className="text-red-500">*</span></label>
                                    <input
                                        type="password"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        placeholder="Ulangi password"
                                        value={addData.password_confirmation}
                                        onChange={e => setAddData('password_confirmation', e.target.value)}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingAdd}
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-md transform hover:-translate-y-0.5 transition disabled:opacity-50"
                                    >
                                        {processingAdd ? 'Menyimpan...' : 'Simpan Akun'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Profil */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-bold text-white relative flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Edit Profil: {editingUser.username}
                                </h3>
                                <button onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-200 focus:outline-none">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="px-6 py-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        value={editData.nama_lengkap}
                                        onChange={e => setEditData('nama_lengkap', e.target.value)}
                                    />
                                    {errorsEdit.nama_lengkap && <p className="mt-1 text-xs text-red-500">{errorsEdit.nama_lengkap}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        value={editData.email}
                                        onChange={e => setEditData('email', e.target.value)}
                                    />
                                    {errorsEdit.email && <p className="mt-1 text-xs text-red-500">{errorsEdit.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Peran <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                        value={editData.role_id}
                                        onChange={e => setEditData('role_id', e.target.value)}
                                    >
                                        {roles.map(role => (
                                            <option key={role.role_id} value={role.role_id}>{role.nama_role}</option>
                                        ))}
                                    </select>
                                    {errorsEdit.role_id && <p className="mt-1 text-xs text-red-500">{errorsEdit.role_id}</p>}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Ubah Password (Opsional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Password Baru</label>
                                            <input
                                                type="password"
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                                placeholder="Kosongkan jika tetap"
                                                value={editData.new_password}
                                                onChange={e => setEditData('new_password', e.target.value)}
                                            />
                                            {errorsEdit.new_password && <p className="mt-1 text-xs text-red-500">{errorsEdit.new_password}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Konfirmasi Password</label>
                                            <input
                                                type="password"
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-2.5"
                                                placeholder="Ulangi password baru"
                                                value={editData.new_password_confirmation}
                                                onChange={e => setEditData('new_password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingEdit}
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium shadow-md transform hover:-translate-y-0.5 transition disabled:opacity-50"
                                    >
                                        {processingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
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
