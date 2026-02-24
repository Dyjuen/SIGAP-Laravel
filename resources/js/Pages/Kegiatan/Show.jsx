import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    Download,
    CheckCircle,
    MapPin,
    Target,
    Activity,
    ClipboardList,
    Eye,
    X,
    Calculator,
    ExternalLink
} from 'lucide-react';

export default function Show({ auth, kegiatan }) {
    const { kak } = kegiatan;
    const [showDocModal, setShowDocModal] = React.useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('kegiatan.index')}
                        className="p-2 bg-white text-slate-500 hover:text-cyan-600 rounded-full transition-colors border border-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        Detail Kegiatan
                    </h2>
                </div>
            }
        >
            <Head title={`Detail Kegiatan - ${kak.nama_kegiatan}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100 p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">{kak.nama_kegiatan}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 font-medium">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        {kak.tipe_kegiatan?.nama_tipe}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 font-medium">
                                        <Activity className="w-4 h-4" />
                                        {kak.mata_anggaran?.nama_sumber_dana}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: KAK Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" />
                                        Informasi KAK
                                    </h3>

                                    <dl className="grid grid-cols-1 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4 text-slate-400" />
                                                Pengusul
                                            </dt>
                                            <dd className="text-base font-semibold text-slate-900">{kak.pengusul?.nama_lengkap}</dd>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                Waktu Pelaksanaan KAK
                                            </dt>
                                            <dd className="text-base font-semibold text-slate-900">
                                                {formatDate(kak.tanggal_mulai)} <span className="text-slate-400 mx-2">s/d</span> {formatDate(kak.tanggal_selesai)}
                                            </dd>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                Lokasi
                                            </dt>
                                            <dd className="text-base font-semibold text-slate-900">{kak.lokasi || '-'}</dd>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                                <Target className="w-4 h-4 text-slate-400" />
                                                IKU Sasaran
                                            </dt>
                                            <dd className="text-base font-semibold text-slate-900 line-clamp-2">{kak.ikus?.map(i => i.iku?.nama_iku).filter(Boolean).join(', ') || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Right Column: Kegiatan Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Informasi Pelaksanaan Kegiatan
                                    </h3>

                                    <dl className="grid grid-cols-1 gap-4">
                                        <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
                                            <dt className="text-sm font-medium text-cyan-800 flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4 text-cyan-500" />
                                                Penanggung Jawab
                                            </dt>
                                            <dd className="text-base font-semibold text-cyan-950">{kegiatan.penanggung_jawab_manual}</dd>
                                        </div>

                                        <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100">
                                            <dt className="text-sm font-medium text-cyan-800 flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4 text-cyan-500" />
                                                Pelaksana
                                            </dt>
                                            <dd className="text-base font-semibold text-cyan-950">{kegiatan.pelaksana_manual}</dd>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                Surat Pengantar
                                            </dt>
                                            <dd>
                                                {kegiatan.surat_pengantar_path ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setShowDocModal(true)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-100 rounded-lg text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition-colors shadow-sm"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Lihat Dokumen
                                                        </button>
                                                        <a
                                                            href={`/storage/${kegiatan.surat_pengantar_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            download
                                                            className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-cyan-600 transition-colors shadow-sm"
                                                            title="Unduh file PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Tidak ada dokumen</span>
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RAB Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-cyan-500" />
                                Rincian Anggaran Biaya (RAB)
                            </h3>
                            <Link
                                href={route('kak.show', kak.kak_id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-cyan-600 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Lihat Form KAK Lengkap
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uraian</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga Satuan</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {(!kak.anggaran || kak.anggaran.length === 0) ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                                                Belum ada rincian anggaran.
                                            </td>
                                        </tr>
                                    ) : (
                                        Object.entries(
                                            kak.anggaran.reduce((acc, curr) => {
                                                const catName = curr.kategori_belanja?.nama || 'Tanpa Kategori';
                                                if (!acc[catName]) acc[catName] = [];
                                                acc[catName].push(curr);
                                                return acc;
                                            }, {})
                                        ).map(([catName, items], idx) => (
                                            <React.Fragment key={idx}>
                                                <tr className="bg-slate-50/50">
                                                    <td colSpan={4} className="px-6 py-3 font-bold text-sm text-slate-700 border-l-4 border-cyan-400">
                                                        {catName}
                                                    </td>
                                                </tr>
                                                {items.map(item => (
                                                    <tr key={item.anggaran_id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-slate-900">{item.uraian}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600 text-center">
                                                            <span>{item.volume1} {item.satuan1?.nama_satuan}</span>
                                                            {item.volume2 > 0 && <span> x {item.volume2} {item.satuan2?.nama_satuan || ''}</span>}
                                                            {item.volume3 > 0 && <span> x {item.volume3} {item.satuan3?.nama_satuan || ''}</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600 text-right font-medium font-mono">{formatCurrency(item.harga_satuan)}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-900 text-right font-bold font-mono">{formatCurrency(item.jumlah_diusulkan)}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-white text-slate-800 border-t border-slate-200">
                                    <tr>
                                        <th colSpan="3" className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Total Usulan KAK</th>
                                        <th className="px-6 py-4 text-right text-base font-bold text-cyan-600 font-mono">
                                            {formatCurrency(kak.anggaran?.reduce((sum, item) => sum + Number(item.jumlah_diusulkan || 0), 0))}
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Document Viewer Modal */}
            {showDocModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-500" />
                                Surat Pengantar - {kak.nama_kegiatan}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/storage/${kegiatan.surat_pengantar_path}`}
                                    download
                                    className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                    title="Unduh"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => setShowDocModal(false)}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 relative">
                            <iframe
                                src={`/storage/${kegiatan.surat_pengantar_path}#view=FitH`}
                                className="absolute inset-0 w-full h-full border-0"
                                title="Document Viewer"
                            />
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
