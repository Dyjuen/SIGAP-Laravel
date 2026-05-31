import React, { useEffect, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

export default function KegiatanSubmitModal({
    isOpen,
    onClose,
    selectedKak,
    data,
    setData,
    onSubmit,
    processing,
    errors
}) {
    const modalRef = useRef(null);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !processing) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, processing, onClose]);

    // Handle backdrop click
    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget && !processing) {
            onClose();
        }
    };

    if (!isOpen || !selectedKak) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-4 flex items-center justify-center transition-opacity duration-300 animate-in fade-in"
            onMouseDown={handleBackdropMouseDown}
        >
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 animate-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Ajukan Kegiatan</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium mb-1">Kegiatan yang diajukan:</p>
                        <p className="text-base text-blue-900 font-bold">{selectedKak.nama_kegiatan}</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Penanggung Jawab</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                                value={data.penanggung_jawab_manual}
                                onChange={e => setData('penanggung_jawab_manual', e.target.value)}
                                required
                                placeholder="Masukkan nama penanggung jawab..."
                            />
                            {errors.penanggung_jawab_manual && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.penanggung_jawab_manual}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Pelaksana</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition-colors"
                                value={data.pelaksana_manual}
                                onChange={e => setData('pelaksana_manual', e.target.value)}
                                required
                                placeholder="Masukkan nama pelaksana..."
                            />
                            {errors.pelaksana_manual && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.pelaksana_manual}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Surat Pengantar (PDF/DOC/DOCX)</label>
                            {data.surat_pengantar ? (
                                <div className="mt-1 flex items-center justify-between p-4 bg-cyan-50/40 border border-cyan-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2.5 bg-cyan-100/80 text-cyan-600 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {data.surat_pengantar.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {data.surat_pengantar.size > 1024 * 1024 
                                                    ? `${(data.surat_pengantar.size / (1024 * 1024)).toFixed(1)} MB` 
                                                    : `${(data.surat_pengantar.size / 1024).toFixed(1)} KB`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('surat_pengantar', null)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus berkas"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-cyan-400 hover:bg-cyan-50/30 transition-colors relative group">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-cyan-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                                                <span>Unggah berkas</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    className="sr-only"
                                                    accept={".pdf,.doc,.docx"}
                                                    onChange={e => setData('surat_pengantar', e.target.files[0])}
                                                />
                                            </label>
                                            <p className="pl-1">atau seret dan lepas</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PDF, DOC hingga 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                            {errors.surat_pengantar && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.surat_pengantar}</p>}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Ajukan Kegiatan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
