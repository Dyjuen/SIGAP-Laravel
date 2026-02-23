import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

export default function CommentModal({
    isOpen,
    onClose,
    onSave,
    title = 'Catatan Revisi',
    initialValue = '',
    isReadOnly = false,
    isPastNote = false,
    isPengusul = false
}) {
    const [note, setNote] = React.useState(initialValue);

    React.useEffect(() => {
        setNote(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    // Red for active revision notes, Yellow for past notes
    const headerClass = (isPastNote && !isPengusul)
        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
        : "bg-gradient-to-r from-red-500 to-red-600";

    const titleText = (isPastNote && !isPengusul) ? `${title} (Catatan Lama)` : title;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className={`px-6 py-4 flex items-center justify-between text-white ${headerClass}`}>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {titleText}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <textarea
                            className={`w-full h-40 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-0 transition-all resize-none p-4
                                ${isPastNote ? 'focus:border-yellow-400' : 'focus:border-red-400'}
                                disabled:opacity-80 disabled:cursor-not-allowed`}
                            placeholder="Mulai ketik catatan revisi di sini..."
                            value={note || ''}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isReadOnly}
                            autoFocus
                        />
                        {isPastNote && !isPengusul && (
                            <p className="mt-3 text-sm text-yellow-600 font-medium bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                Ini adalah catatan revisi dari siklus sebelumnya. Anda dapat memperbaruinya untuk meminta revisi lanjutan, atau membiarkannya jika sudah diperbaiki.
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            {isReadOnly ? 'Tutup' : 'Batal'}
                        </button>

                        {!isReadOnly && (
                            <button
                                onClick={() => {
                                    onSave(note);
                                    onClose();
                                }}
                                className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg transition-all hover:-translate-y-0.5
                                    ${isPastNote ? 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-yellow-500/30' : 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30'}`}
                            >
                                <Save size={18} /> Simpan Catatan
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
