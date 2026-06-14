import React, { useState } from 'react';
import { Play, FileText, Download, ExternalLink, X, Maximize2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import clsx from 'clsx';

function getEmbedUrl(url) {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1]?.split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
        else if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}

export default function PanduanSection({ panduans = [], delay = 900 }) {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const videos = panduans.filter(p => p.tipe?.toLowerCase() === 'video');
    const documents = panduans.filter(p => p.tipe?.toLowerCase() === 'document');
    // Ensure component always renders. If no data, use dummy data to show the component exists.
    const hasData = panduans && panduans.length > 0;
    const displayVideos = hasData ? videos : [
        { id: 'v1', judul: 'Cara Mengajukan KAK Baru', tipe: 'video', path: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { id: 'v2', judul: 'Panduan Revisi KAK', tipe: 'video', path: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    ];
    
    const displayDocs = hasData ? documents : [
        { id: 'd1', judul: 'Manual Book SIGAP', tipe: 'document', path: '#' },
        { id: 'd2', judul: 'SOP Pengajuan Kegiatan', tipe: 'document', path: '#' }
    ];

    const openModal = (doc) => setSelectedDoc(doc);
    const closeModal = () => setSelectedDoc(null);

    const getDocUrl = (doc, stream = false) => {
        let url = doc.download_url || (doc.path.startsWith('http') ? doc.path : `/storage/${doc.path}`);
        if (stream && url.includes('/download')) {
            url += (url.includes('?') ? '&' : '?') + 'stream=1';
        }
        return url;
    };

    return (
        <div 
            className="space-y-6 animate-fade-in-up mt-8 pb-8" 
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Video Section */}
            {displayVideos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
                    <div className="px-6 pt-6 pb-2 border-b border-slate-50 mb-4">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Play size={20} className="text-cyan-500 fill-cyan-500" />
                            Video Panduan
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Tutorial visual penggunaan sistem SIGAP</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
{displayVideos.map((video) => (
                             <div key={video.id} className="group space-y-3 cursor-pointer">
                                 <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md group-hover:shadow-[0_8px_20px_rgba(6,81,237,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                                     {/* Get embed URL and add origin parameter for YouTube API client identification (fixes Error 153) */}
                                     let embedUrl = getEmbedUrl(video.path);
                                     if (embedUrl && embedUrl.includes('youtube.com/embed/')) {
                                         const origin = window.location.origin;
                                         embedUrl = embedUrl.includes('?') 
                                             ? `${embedUrl}&origin=${origin}` 
                                             : `${embedUrl}?origin=${origin}`;
                                     }
                                     <iframe
                                         src={embedUrl}
                                         title={video.judul}
                                         frameBorder="0"
                                         allowFullScreen
                                         className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                     />
                                 </div>
                                 <h4 className="font-bold text-slate-700 px-1 line-clamp-2 text-sm leading-tight group-hover:text-cyan-600 transition-colors">{video.judul}</h4>
                             </div>
                         ))}
                    </div>
                </div>
            )}

            {/* Document Section */}
            {displayDocs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
                    <div className="px-6 pt-6 pb-2 border-b border-slate-50 mb-4">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-cyan-500" />
                            Dokumen & Templat
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Klik untuk melihat detail atau mengunduh berkas</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                        {displayDocs.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => openModal(doc)}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-cyan-200 transition-all duration-300 group text-left w-full shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-3px_rgba(6,81,237,0.15)] hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm truncate group-hover:text-cyan-700 transition-colors">{doc.judul}</span>
                                </div>
                                <Maximize2 size={16} className="text-slate-300 group-hover:text-cyan-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal for Document Details */}
            <Modal show={!!selectedDoc} onClose={closeModal} maxWidth="2xl">
                {selectedDoc && (
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                                        {selectedDoc.judul}
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                        Pratinjau Dokumen
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Preview Area - Adjusted to match Lampiran Viewer style */}
                        <div className="bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
                            {selectedDoc.path?.toLowerCase().endsWith('.pdf') || selectedDoc.download_url ? (
                                <iframe
                                    src={getDocUrl(selectedDoc, true)}
                                    className="w-full h-[500px] border-none"
                                    title={selectedDoc.judul}
                                />
                            ) : (
                                <div className="p-8 flex flex-col items-center justify-center">
                                    <FileText size={64} className="text-slate-300 mb-4" />
                                    <p className="text-slate-500 text-center max-w-xs font-medium">
                                        Pratinjau tidak tersedia untuk tipe berkas ini. Silakan unduh untuk melihat isi dokumen.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <a
                                href={getDocUrl(selectedDoc, true)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <ExternalLink size={18} />
                                Buka di Tab Baru
                            </a>
                            <a
                                href={getDocUrl(selectedDoc)}
                                download
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm font-bold shadow-lg shadow-cyan-200 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Download size={18} />
                                Unduh Sekarang
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
