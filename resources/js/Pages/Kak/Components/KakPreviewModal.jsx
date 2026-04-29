import { useEffect, useRef } from 'react';

export default function KakPreviewModal({ isOpen, blobUrl, onClose }) {
    const modalRef = useRef(null);

    // Handle escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Handle click outside to close
    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !blobUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md p-2 sm:p-4 md:p-8 flex items-center justify-center transition-opacity duration-300 animate-in fade-in"
            onMouseDown={handleBackdropMouseDown}
        >
            <div 
                className="h-[90vh] w-[95vw] md:w-[70vw] max-w-none bg-white/95 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 animate-in zoom-in-95"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-base font-bold text-gray-800">Preview Dokumen KAK</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        title="Tutup Preview (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100/50 relative">
                    {/* Loading placeholder just in case iframe is slow */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <svg className="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-medium text-gray-500 animate-pulse">Memuat dokumen...</span>
                        </div>
                    </div>
                    
                    <iframe
                        src={blobUrl}
                        title="Preview PDF"
                        className="w-full h-full border-none shadow-inner bg-transparent"
                    />
                </div>
            </div>
        </div>
    );
}
