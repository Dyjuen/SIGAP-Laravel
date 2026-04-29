import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CustomSwal from '@/Utils/CustomSwal';
import KakToolbar from './Components/KakToolbar';
import KakTable from './Components/KakTable';
import KakPagination from './Components/KakPagination';
import KakPreviewModal from './Components/KakPreviewModal';
import { renderToString } from 'react-dom/server';
import { Send, Rocket, Trash2 } from 'lucide-react';

export default function KakIndex({ auth, kaks, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_id || '');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [previewLoadingId, setPreviewLoadingId] = useState(null);
    const [detailLoadingId, setDetailLoadingId] = useState(null);

    const handleViewDetail = (id) => {
        setDetailLoadingId(id);
        router.get(route('kak.show', id), {}, {
            onFinish: () => setDetailLoadingId(null)
        });
    };



    const handleSubmitKak = (item) => {
        CustomSwal.fire({
            title: 'Kirim KAK?',
            text: 'KAK akan dikirim ke Verifikator untuk direview.',
            iconHtml: renderToString(<div className="p-3 bg-cyan-50 text-cyan-500 rounded-full"><Send className="w-8 h-8" /></div>),
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('kak.submit', item.kak_id), {}, {
                    onSuccess: () => CustomSwal.fire({ 
                        title: 'Terkirim!', 
                        text: 'KAK berhasil dikirim ke Verifikator.', 
                        iconHtml: renderToString(<div className="p-3 bg-cyan-50 text-cyan-500 rounded-full animate-[bounce_1s_infinite]"><Rocket className="w-10 h-10" /></div>),
                        showConfirmButton: false,
                        timer: 2000
                    })
                });
            }
        });
    };

    const handleResubmitKak = (item) => {
        CustomSwal.fire({
            title: 'Kirim Hasil Revisi?',
            text: 'KAK akan dikirim kembali ke Verifikator untuk direview ulang.',
            iconHtml: renderToString(<div className="p-3 bg-orange-50 text-orange-500 rounded-full"><Send className="w-8 h-8" /></div>),
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('kak.resubmit', item.kak_id), {}, {
                    onSuccess: () => CustomSwal.fire({ 
                        title: 'Terkirim!', 
                        text: 'Hasil revisi KAK berhasil dikirim ke Verifikator.', 
                        iconHtml: renderToString(<div className="p-3 bg-orange-50 text-orange-500 rounded-full animate-[bounce_1s_infinite]"><Rocket className="w-10 h-10" /></div>),
                        showConfirmButton: false,
                        timer: 2000
                    })
                });
            }
        });
    };

    const handleRejectKak = (item) => {
        CustomSwal.fire({
            title: 'Tolak KAK?',
            html: '<textarea id="catatan-tolak" class="w-full rounded-xl border-gray-200 text-sm focus:border-red-400 focus:ring-0 min-h-[100px] p-3" placeholder="Masukkan alasan penolakan di sini..."></textarea>',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: false,
            showDenyButton: true,
            denyButtonText: 'Ya, Tolak!',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const catatan = CustomSwal.getPopup().querySelector('#catatan-tolak').value;
                if (!catatan) {
                    CustomSwal.showValidationMessage('Alasan penolakan wajib diisi');
                }
                return { catatan: catatan };
            }
        }).then((result) => {
            if (result.isDenied) {
                router.post(route('kak.reject', item.kak_id), { catatan: result.value.catatan }, {
                    onSuccess: () => CustomSwal.fire({ title: 'Ditolak!', text: 'KAK berhasil ditolak.', icon: 'success' })
                });
            }
        });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get(route('kak.index'), { search: searchTerm, status_id: statusFilter }, { preserveState: true, replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        router.get(route('kak.index'), { search: searchTerm, status_id: e.target.value }, { preserveState: true, replace: true });
    };

    const handlePreviewPdf = async (e, url, kak_id) => {
        e.preventDefault();
        setPreviewLoadingId(kak_id);
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Network error');

            const payload = await response.json();
            if (!payload?.base64) throw new Error('Invalid preview payload');

            const byteCharacters = atob(payload.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([new Uint8Array(byteNumbers)], { type: payload.mimeType || 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(blobUrl);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Error previewing PDF:', error);
            CustomSwal.fire({ title: 'Gagal preview', text: 'PDF tidak bisa ditampilkan saat ini.', icon: 'error' });
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const closePreviewPdf = () => {
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
        setIsPreviewOpen(false);
    };

    const confirmDelete = (item) => {
        CustomSwal.fire({
            title: 'Hapus KAK?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            iconHtml: renderToString(<div className="p-3 bg-red-50 text-red-500 rounded-full"><Trash2 className="w-8 h-8" /></div>),
            showCancelButton: true,
            showConfirmButton: false,
            showDenyButton: true,
            denyButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isDenied) {
                router.delete(route('kak.destroy', item.kak_id), {
                    onSuccess: () => CustomSwal.fire({ title: 'Terhapus!', text: 'KAK berhasil dihapus.', icon: 'success' })
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Daftar KAK" />

            <div className="pt-4 pb-8 sm:py-8 relative min-h-screen">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[95%]">
                    <PageHeader 
                        title="Daftar Usulan Kegiatan (KAK)" 
                        description="Kelola dan pantau seluruh daftar usulan Kerangka Acuan Kerja (KAK) secara terpusat." 
                    />
                    
                    <KakToolbar 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        statusFilter={statusFilter} 
                        handleStatusChange={handleStatusChange} 
                        auth={auth} 
                    />

                    <div className="relative z-10">
                        <KakTable 
                        kaks={kaks} 
                        auth={auth} 
                        handlePreviewPdf={handlePreviewPdf}
                        handleRejectKak={handleRejectKak}
                        handleSubmitKak={handleSubmitKak}
                        handleResubmitKak={handleResubmitKak}
                        confirmDelete={confirmDelete}
                        previewLoadingId={previewLoadingId}
                        detailLoadingId={detailLoadingId}
                        handleViewDetail={handleViewDetail}
                    />
                    </div>

                    <KakPagination kaks={kaks} />
                </div>
            </div>

            <KakPreviewModal 
                isOpen={isPreviewOpen} 
                blobUrl={previewBlobUrl} 
                onClose={closePreviewPdf} 
            />
        </AuthenticatedLayout>
    );
}
