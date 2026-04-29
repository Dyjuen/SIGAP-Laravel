import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    MoreHorizontal,
    Eye,
    FileText,
    Download,
    Edit2,
    Send,
    RefreshCw,
    Trash2,
    XCircle,
    User,
    Calendar,
    Tag
} from 'lucide-react';

export default function KakTable({
    kaks,
    auth,
    handlePreviewPdf,
    handleRejectKak,
    handleSubmitKak,
    handleResubmitKak,
    confirmDelete,
    previewLoadingId,
    detailLoadingId,
    handleViewDetail
}) {
    const getStatusBadge = (statusId, statusName) => {
        const colors = {
            1: 'bg-gray-50 text-gray-700 border-gray-400',  // Draft
            2: 'bg-amber-50 text-amber-700 border-amber-400', // Review
            3: 'bg-emerald-50 text-emerald-700 border-emerald-400', // Disetujui
            4: 'bg-rose-50 text-rose-700 border-rose-400',    // Ditolak
            5: 'bg-orange-50 text-orange-700 border-orange-400' // Revisi
        };
        const dotColors = {
            1: 'bg-gray-500',
            2: 'bg-amber-500',
            3: 'bg-emerald-500',
            4: 'bg-rose-500',
            5: 'bg-orange-500'
        };
        const colorClass = colors[statusId] || 'bg-gray-50 text-gray-700 border-gray-400';
        const dotColor = dotColors[statusId] || 'bg-gray-500';
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${colorClass} shadow-sm inline-flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                {statusName}
            </span>
        );
    };

    const ActionMenu = ({ item }) => {
        return (
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center justify-center w-9 h-9 rounded-xl transition-all text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 border border-gray-100 bg-white hover:shadow-sm">
                        <MoreHorizontal className="w-5 h-5" />
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:outline-none overflow-hidden">
                        <div className="px-1 py-1">

                            {/* PDF Preview */}
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', item.kak_id), item.kak_id)}
                                        disabled={previewLoadingId === item.kak_id}
                                        className={`${active ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                                            } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50`}
                                    >
                                        <FileText className={`mr-3 h-4 w-4 ${active ? 'text-violet-600' : 'text-gray-400'}`} />
                                        {previewLoadingId === item.kak_id ? 'Loading...' : 'Preview PDF'}
                                    </button>
                                )}
                            </Menu.Item>

                            {/* PDF Download */}
                            <Menu.Item>
                                {({ active }) => (
                                    <a
                                        href={route('kak.pdf.download', item.kak_id)}
                                        className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                                            } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                    >
                                        <Download className={`mr-3 h-4 w-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                        Download PDF
                                    </a>
                                )}
                            </Menu.Item>
                        </div>

                        {/* Role Based Actions */}
                        <div className="px-1 py-1">
                            {/* Verifikator */}
                            {auth.user.role_id === 2 && item.status_id === 2 && (
                                <>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href={route('kak.show', item.kak_id)}
                                                className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                                                    } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                            >
                                                <RefreshCw className={`mr-3 h-4 w-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                Review KAK
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleRejectKak(item)}
                                                className={`${active ? 'bg-rose-50 text-rose-700' : 'text-gray-700'
                                                    } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                            >
                                                <XCircle className={`mr-3 h-4 w-4 ${active ? 'text-rose-600' : 'text-gray-400'}`} />
                                                Tolak KAK
                                            </button>
                                        )}
                                    </Menu.Item>
                                </>
                            )}

                            {/* Pengusul - Edit/Submit */}
                            {auth.user.role_id === 3 && item.pengusul_user_id === auth.user.id && (
                                <>
                                    {[1, 4, 5].includes(item.status_id) && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    href={route('kak.edit', item.kak_id)}
                                                    className={`${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                                >
                                                    <Edit2 className={`mr-3 h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    Ubah / Edit
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {item.status_id === 1 && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleSubmitKak(item)}
                                                    className={`${active ? 'bg-cyan-50 text-cyan-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                                >
                                                    <Send className={`mr-3 h-4 w-4 ${active ? 'text-cyan-600' : 'text-gray-400'}`} />
                                                    Kirim Usulan
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {item.status_id === 5 && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleResubmitKak(item)}
                                                    className={`${active ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                                >
                                                    <RefreshCw className={`mr-3 h-4 w-4 ${active ? 'text-amber-600' : 'text-gray-400'}`} />
                                                    Kirim Ulang
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {[1, 4].includes(item.status_id) && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    className={`${active ? 'bg-rose-50 text-rose-700' : 'text-gray-700'
                                                        } group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors`}
                                                >
                                                    <Trash2 className={`mr-3 h-4 w-4 ${active ? 'text-rose-600' : 'text-gray-400'}`} />
                                                    Hapus
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </>
                            )}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        );
    };

    return (
        <div className="space-y-6">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/70 backdrop-blur-md sm:rounded-2xl border border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100/80">
                        <thead className="bg-gray-50/80 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kegiatan</th>
                                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pengusul</th>
                                <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/40 divide-y divide-gray-50/50">
                            {kaks.data.length > 0 ? (
                                kaks.data.map((item, index) => (
                                    <tr key={item.kak_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group relative" style={{ zIndex: kaks.data.length - index }}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors max-w-xs truncate" title={item.nama_kegiatan}>{item.nama_kegiatan}</div>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-md font-medium">{item.tipe_kegiatan?.nama_tipe}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(item.status_id, item.status?.nama_status)}
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {item.pengusul?.nama_lengkap}
                                        </td>
                                        <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <ActionMenu item={item} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            <p className="text-base font-semibold text-gray-500">Tidak ada data KAK</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4 pb-8">
                {kaks.data.length > 0 ? (
                    kaks.data.map((item, index) => (
                        <div key={item.kak_id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100/60 relative group" style={{ zIndex: kaks.data.length - index }}>
                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 mb-1 leading-tight">{item.nama_kegiatan}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <Tag className="w-3.5 h-3.5" />
                                        {item.tipe_kegiatan?.nama_tipe}
                                    </div>
                                </div>
                                <div className="ml-3 shrink-0">
                                    {getStatusBadge(item.status_id, item.status?.nama_status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5 border-t border-b border-gray-50 py-3">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Pengusul</div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold truncate">
                                        <User className="w-3.5 h-3.5 text-cyan-500" />
                                        {item.pengusul?.nama_lengkap}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Tanggal</div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                                        <Calendar className="w-3.5 h-3.5 text-violet-500" />
                                        {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handleViewDetail(item.kak_id)}
                                    disabled={detailLoadingId === item.kak_id}
                                    className="flex-1 mr-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-100 hover:bg-cyan-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {detailLoadingId === item.kak_id ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                    {detailLoadingId === item.kak_id ? 'Mohon Tunggu...' : 'Lihat Detail Usulan'}
                                </button>
                                <ActionMenu item={item} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-10 text-center border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium text-sm">Tidak ada data usulan KAK</p>
                    </div>
                )}

            </div>
        </div>
    );
}
