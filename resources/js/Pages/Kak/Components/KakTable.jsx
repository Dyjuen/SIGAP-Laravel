import { Link } from '@inertiajs/react';

export default function KakTable({
    kaks,
    auth,
    handlePreviewPdf,
    handleRejectKak,
    handleSubmitKak,
    handleResubmitKak,
    confirmDelete,
    previewLoadingId
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

    return (
        <div className="bg-white/70 backdrop-blur-md overflow-hidden sm:rounded-t-2xl border-x border-t border-gray-100/60 shadow-sm relative">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100/80">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kegiatan</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pengusul</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/40 divide-y divide-gray-50/50">
                        {kaks.data.length > 0 ? (
                            kaks.data.map((item) => (
                                <tr key={item.kak_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">{item.nama_kegiatan}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-md font-medium">{item.tipe_kegiatan?.nama_tipe}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(item.status_id, item.status?.nama_status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                        {item.pengusul?.nama_lengkap}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {/* Lihat Detail: Hidden for Verifikator */}
                                            {auth.user.role_id !== 2 && (
                                                <Link
                                                    href={route('kak.show', item.kak_id)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-cyan-600 border border-cyan-200 bg-white hover:bg-cyan-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Lihat Detail"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                            )}

                                            {/* PDF Preview */}
                                            <button
                                                type="button"
                                                onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', item.kak_id), item.kak_id)}
                                                disabled={previewLoadingId === item.kak_id}
                                                className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
                                                    previewLoadingId === item.kak_id 
                                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                        : 'text-violet-600 border-violet-200 bg-white hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-sm'
                                                }`}
                                                title="Preview PDF"
                                            >
                                                {previewLoadingId === item.kak_id ? (
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                )}
                                            </button>

                                            {/* PDF Download */}
                                            <a
                                                href={route('kak.pdf.download', item.kak_id)}
                                                className="flex items-center justify-center p-2 rounded-lg transition-all text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                title="Download PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </a>

                                            {/* Verifikator Actions */}
                                            {auth.user.role_id === 2 && item.status_id === 2 && (
                                                <>
                                                    <Link
                                                        href={route('kak.show', item.kak_id)}
                                                        className="flex items-center justify-center p-2 rounded-lg transition-all text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                        title="Review KAK"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRejectKak(item)}
                                                        className="flex items-center justify-center p-2 rounded-lg transition-all text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                        title="Tolak KAK"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </>
                                            )}

                                            {/* Pengusul Actions */}
                                            {auth.user.role_id === 3 && [1, 4, 5].includes(item.status_id) && item.pengusul_user_id === auth.user.id && (
                                                <Link
                                                    href={route('kak.edit', item.kak_id)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </Link>
                                            )}

                                            {auth.user.role_id === 3 && item.status_id === 1 && item.pengusul_user_id === auth.user.id && (
                                                <button
                                                    onClick={() => handleSubmitKak(item)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-cyan-600 border border-cyan-200 bg-white hover:bg-cyan-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Kirim ke Verifikator"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                </button>
                                            )}

                                            {auth.user.role_id === 3 && item.status_id === 5 && item.pengusul_user_id === auth.user.id && (
                                                <button
                                                    onClick={() => handleResubmitKak(item)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-amber-600 border border-amber-200 bg-white hover:bg-amber-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Kirim Kembali Hasil Revisi"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                </button>
                                            )}

                                            {auth.user.role_id === 3 && [1, 4].includes(item.status_id) && item.pengusul_user_id === auth.user.id && (
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 hover:-translate-y-0.5 hover:shadow-sm"
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
                            <tr>
                                <td colSpan="6" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                        <p className="text-base font-semibold text-gray-500">Tidak ada data KAK</p>
                                        <p className="text-sm mt-1">Coba sesuaikan pencarian atau filter status Anda.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
