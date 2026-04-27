import React from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle, MessageSquare } from 'lucide-react';

export default function KegiatanApprovalTable({ pendingKegiatan, isWadir, onOpenApproveModal, handlePreviewPdf, previewLoadingId }) {
    return (
        <div className="bg-white/70 backdrop-blur-md overflow-hidden sm:rounded-2xl border border-gray-100/60 shadow-sm relative">
            <div className="p-6 border-b border-gray-100/80">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-amber-100/80 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-amber-600" />
                    </span>
                    Persetujuan Kegiatan Menunggu Anda
                </h3>
            </div>

            {pendingKegiatan.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100/80">
                        <thead className="bg-gray-50/80 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kegiatan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pengusul</th>
                                {isWadir && <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan PPK</th>}
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Diajukan</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/40 divide-y divide-gray-50/50">
                            {pendingKegiatan.map((kegiatan) => {
                                const priorCatatan = isWadir ? kegiatan.approvals?.find(a => a.approval_level === 'PPK')?.catatan : null;

                                return (
                                    <tr key={kegiatan.kegiatan_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">{kegiatan.kak.nama_kegiatan}</div>
                                            <div className="text-xs text-gray-500 mt-1">{kegiatan.kak.tipe_kegiatan?.nama_tipe}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {kegiatan.kak.pengusul?.nama_lengkap}
                                        </td>
                                        {isWadir && (
                                            <td className="px-6 py-4 whitespace-normal text-sm">
                                                {priorCatatan ? (
                                                    <span className="inline-flex items-start gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                        <span>{priorCatatan}</span>
                                                    </span>
                                                ) : <span className="text-gray-400 italic">-</span>}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {new Date(kegiatan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                {/* Lihat Detail */}
                                                <Link
                                                    href={route('kegiatan.show', kegiatan.kegiatan_id)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-cyan-600 border border-cyan-200 bg-white hover:bg-cyan-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Lihat Detail Kegiatan"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                
                                                {/* Preview PDF */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', kegiatan.kak_id), kegiatan.kak_id)}
                                                    disabled={previewLoadingId === kegiatan.kak_id}
                                                    className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
                                                        previewLoadingId === kegiatan.kak_id 
                                                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                            : 'text-violet-600 border-violet-200 bg-white hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-sm'
                                                    }`}
                                                    title="Preview KAK (PDF)"
                                                >
                                                    {previewLoadingId === kegiatan.kak_id ? (
                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                    )}
                                                </button>

                                                {/* Download PDF */}
                                                <a
                                                    href={route('kak.pdf.download', kegiatan.kak_id)}
                                                    className="flex items-center justify-center p-2 rounded-lg transition-all text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Download KAK (PDF)"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </a>

                                                {/* Setujui Button */}
                                                <button
                                                    onClick={() => onOpenApproveModal(kegiatan)}
                                                    className="flex items-center justify-center gap-1.5 px-3 p-2 rounded-lg transition-all text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                    title="Setujui Kegiatan"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm font-bold">Setujui</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Tidak ada kegiatan</h3>
                    <p className="mt-1 text-sm text-gray-500">Tidak ada kegiatan yang perlu persetujuan Anda saat ini.</p>
                </div>
            )}
        </div>
    );
}
