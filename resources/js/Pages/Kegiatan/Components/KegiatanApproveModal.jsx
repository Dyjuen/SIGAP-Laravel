import React, { useEffect, useRef } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function KegiatanApproveModal({
    isOpen,
    onClose,
    selectedKegiatan,
    data,
    setData,
    onSubmit,
    processing
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

    if (!isOpen || !selectedKegiatan) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-4 flex items-center justify-center transition-opacity duration-300 animate-in fade-in"
            onMouseDown={handleBackdropMouseDown}
        >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 animate-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Setujui Kegiatan</h3>
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
                    <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <p className="text-sm text-emerald-800 font-medium mb-1">Kegiatan yang akan disetujui:</p>
                        <p className="text-base text-emerald-900 font-bold">{selectedKegiatan.kak.nama_kegiatan}</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Catatan Tambahan (Boleh Kosong)</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors resize-none"
                                value={data.catatan}
                                onChange={e => setData('catatan', e.target.value)}
                                placeholder="Tambahkan pesan, catatan, atau instruksi untuk tahapan selanjutnya jika ada..."
                            />
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
                                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Konfirmasi Persetujuan
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
