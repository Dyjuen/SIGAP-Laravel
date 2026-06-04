import React, { useState, useEffect, useCallback, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import Swal from 'sweetalert2';

import KegiatanPengusulTable from './Components/KegiatanPengusulTable';
import KegiatanApprovalTable from './Components/KegiatanApprovalTable';
import KegiatanSubmitModal from './Components/KegiatanSubmitModal';
import KegiatanApproveModal from './Components/KegiatanApproveModal';
import KakPreviewModal from '../Kak/Components/KakPreviewModal'; // Reusing Kak's PDF Modal

function debounce(func, wait) {
    let timeout;
    const executedFunction = function (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
    executedFunction.cancel = function () {
        clearTimeout(timeout);
    };
    return executedFunction;
}

export default function Index({ auth, approvedKaks, pendingKegiatan, filters }) {
    const role = auth.user?.role_id; // 3: Pengusul, 4: PPK, 5: Wadir
    const isPengusul = role === 3;
    const isPpk = role === 4;
    const isWadir = role === 5;

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('kegiatan.index'),
                { search: query },
                { preserveState: true, preserveScroll: true }
            );
        }, 300),
        []
    );

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        performSearch(searchQuery);
        return () => performSearch.cancel();
    }, [searchQuery, performSearch]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // Form for Pengusul Submit
    const { data: submitData, setData: setSubmitData, post: postSubmit, processing: submitProcessing, reset: resetSubmit, errors: submitErrors } = useForm({
        kak_id: '',
        penanggung_jawab_manual: '',
        pelaksana_manual: '',
        surat_pengantar: null,
    });

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedKak, setSelectedKak] = useState(null);

    // Form for PPK/Wadir Approve
    const { data: approveData, setData: setApproveData, post: postApprove, processing: approveProcessing, reset: resetApprove } = useForm({
        catatan: '',
    });

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedKegiatan, setSelectedKegiatan] = useState(null);
    
    // Preview State
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [previewLoadingId, setPreviewLoadingId] = useState(null);

    // Handlers for Pengusul
    const openSubmitModal = (kak) => {
        setSelectedKak(kak);
        setSubmitData('kak_id', kak.kak_id);
        setShowSubmitModal(true);
    };

    const closeSubmitModal = () => {
        setShowSubmitModal(false);
        setSelectedKak(null);
        resetSubmit();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        postSubmit(route('kegiatan.store'), {
            onSuccess: () => {
                closeSubmitModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Kegiatan berhasil diajukan',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
        });
    };

    const handlePreviewPdf = async (e, url, kakId) => {
        e.preventDefault();
        setPreviewLoadingId(kakId);

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Network error');

            const payload = await response.json();
            if (!payload?.base64) {
                throw new Error('Invalid preview payload');
            }

            const byteCharacters = atob(payload.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([new Uint8Array(byteNumbers)], {
                type: payload.mimeType || 'application/pdf',
            });
            const blobUrl = URL.createObjectURL(blob);

            if (previewBlobUrl) {
                URL.revokeObjectURL(previewBlobUrl);
            }

            setPreviewBlobUrl(blobUrl);
        } catch (error) {
            console.error('Error previewing PDF:', error);
            Swal.fire('Gagal preview', 'PDF tidak bisa ditampilkan saat ini.', 'error');
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const closePreviewPdf = () => {
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
        }
        setPreviewBlobUrl(null);
    };

    // Handlers for PPK/Wadir Approval
    const openApproveModal = (kegiatan) => {
        setSelectedKegiatan(kegiatan);
        setShowApproveModal(true);
    };

    const closeApproveModal = () => {
        setShowApproveModal(false);
        setSelectedKegiatan(null);
        resetApprove();
    };

    const handleApprove = (e) => {
        e.preventDefault();
        postApprove(route('kegiatan.approve', selectedKegiatan.kegiatan_id), {
            onSuccess: () => {
                closeApproveModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Disetujui',
                    text: 'Kegiatan berhasil disetujui',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kegiatan" />

            <div className="py-8 relative min-h-screen">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[95%] space-y-8">
                    <PageHeader 
                        title="Manajemen Kegiatan" 
                        description="Proses, setujui, dan kelola usulan kegiatan yang diajukan dengan mudah." 
                    />

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/40 backdrop-blur-md p-4 rounded-[28px] border border-white shadow-sm">
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                                <Search size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-11 py-3.5 bg-white/80 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm"
                                placeholder="Cari usulan kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                                    onClick={handleClearSearch}
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* SECTION for Pengusul: Submit Kegiatan */}
                    {isPengusul && (
                        <KegiatanPengusulTable
                            approvedKaks={approvedKaks}
                            onOpenSubmitModal={openSubmitModal}
                            handlePreviewPdf={handlePreviewPdf}
                            previewLoadingId={previewLoadingId}
                        />
                    )}

                    {/* SECTION for PPK/Wadir: Approve Kegiatan */}
                    {(isPpk || isWadir) && (
                        <KegiatanApprovalTable
                            pendingKegiatan={pendingKegiatan}
                            isWadir={isWadir}
                            onOpenApproveModal={openApproveModal}
                            handlePreviewPdf={handlePreviewPdf}
                            previewLoadingId={previewLoadingId}
                        />
                    )}
                </div>
            </div>

            <KegiatanSubmitModal 
                isOpen={showSubmitModal}
                onClose={closeSubmitModal}
                selectedKak={selectedKak}
                data={submitData}
                setData={setSubmitData}
                onSubmit={handleSubmit}
                processing={submitProcessing}
                errors={submitErrors}
            />

            <KegiatanApproveModal
                isOpen={showApproveModal}
                onClose={closeApproveModal}
                selectedKegiatan={selectedKegiatan}
                data={approveData}
                setData={setApproveData}
                onSubmit={handleApprove}
                processing={approveProcessing}
            />

            <KakPreviewModal 
                isOpen={!!previewBlobUrl} 
                blobUrl={previewBlobUrl} 
                onClose={closePreviewPdf} 
            />
            
        </AuthenticatedLayout>
    );
}
