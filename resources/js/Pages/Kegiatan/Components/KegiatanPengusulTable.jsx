import React from 'react';
import { Upload } from 'lucide-react';

export default function KegiatanPengusulTable({ approvedKaks, onOpenSubmitModal, handlePreviewPdf, previewLoadingId }) {
    return (
        <div className="bg-white/70 backdrop-blur-md overflow-hidden sm:rounded-2xl border border-gray-100/60 shadow-sm relative">
            <div className="p-6 border-b border-gray-100/80">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-blue-100/80 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    KAK yang siap diajukan menjadi Kegiatan
                </h3>
            </div>

            {approvedKaks.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100/80">
                        <thead className="bg-gray-50/80 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama KAK</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sumber Dana</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/40 divide-y divide-gray-50/50">
                            {approvedKaks.map((kak) => (
                                <tr key={kak.kak_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">{kak.nama_kegiatan}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-md font-medium">{kak.tipe_kegiatan?.nama_tipe}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 font-medium">{kak.mata_anggaran?.nama_sumber_dana}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {/* Preview PDF */}
                                            <button
                                                type="button"
                                                onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', kak.kak_id), kak.kak_id)}
                                                disabled={previewLoadingId === kak.kak_id}
                                                className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
                                                    previewLoadingId === kak.kak_id 
                                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                        : 'text-violet-600 border-violet-200 bg-white hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-sm'
                                                }`}
                                                title="Preview KAK (PDF)"
                                            >
                                                {previewLoadingId === kak.kak_id ? (
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
                                                href={route('kak.pdf.download', kak.kak_id)}
                                                className="flex items-center justify-center p-2 rounded-lg transition-all text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                title="Download KAK (PDF)"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </a>

                                            {/* Ajukan Button */}
                                            <button
                                                onClick={() => onOpenSubmitModal(kak)}
                                                className="flex items-center justify-center gap-1.5 px-3 p-2 rounded-lg transition-all text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm"
                                                title="Ajukan Menjadi Kegiatan"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm font-bold">Ajukan</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada KAK</h3>
                    <p className="mt-1 text-sm text-gray-500">Tidak ada KAK yang siap diajukan saat ini.</p>
                </div>
            )}
        </div>
    );
}
