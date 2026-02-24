import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ClipboardCheck,
    FileText,
    CheckCircle,
    Clock,
    Eye,
    Upload,
    Search,
    MessageSquare
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, approvedKaks, pendingKegiatan }) {
    const role = auth.user?.role_id; // 3: Pengusul, 4: PPK, 5: Wadir
    const isPengusul = role === 3;
    const isPpk = role === 4;
    const isWadir = role === 5;

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

    // Helper components
    const StatusBadge = ({ name }) => {
        let color = 'bg-gray-100 text-gray-800';
        if (name === 'Draft') color = 'bg-gray-100 text-gray-800';
        else if (name === 'Review Verifikator' || name === 'Review PPK' || name === 'Review Wadir 2') color = 'bg-yellow-100 text-yellow-800';
        else if (name === 'Disetujui Verifikator') color = 'bg-green-100 text-green-800';
        else if (name === 'Revisi') color = 'bg-red-100 text-red-800';
        else if (name?.includes('Proses') || name?.includes('Dicairkan')) color = 'bg-blue-100 text-blue-800';
        else if (name === 'Selesai') color = 'bg-emerald-100 text-emerald-800';

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
                {name}
            </span>
        );
    };



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title="Manajemen Kegiatan" />}
        >
            <Head title="Kegiatan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* SECTION for Pengusul: Submit Kegiatan */}
                    {isPengusul && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    KAK yang siap diajukan menjadi Kegiatan
                                </h3>

                                {approvedKaks.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama KAK</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipe</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sumber Dana</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {approvedKaks.map((kak) => (
                                                    <tr key={kak.kak_id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{kak.nama_kegiatan}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{kak.tipe_kegiatan?.nama_tipe}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{kak.mata_anggaran?.nama_sumber_dana}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => openSubmitModal(kak)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                <Upload className="w-4 h-4" />
                                                                Ajukan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        Tidak ada KAK yang siap diajukan saat ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION for PPK/Wadir: Approve Kegiatan */}
                    {(isPpk || isWadir) && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-amber-500" />
                                    Persetujuan Kegiatan Menunggu Anda
                                </h3>

                                {pendingKegiatan.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kegiatan</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pengusul</th>
                                                    {isWadir && <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan PPK</th>}
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Diajukan</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {pendingKegiatan.map((kegiatan) => {
                                                    const priorCatatan = isWadir ? kegiatan.approvals?.find(a => a.approval_level === 'PPK')?.catatan : null;

                                                    return (
                                                        <tr key={kegiatan.kegiatan_id} className="hover:bg-slate-50">
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-slate-900">{kegiatan.kak.nama_kegiatan}</div>
                                                                <div className="text-xs text-slate-500">{kegiatan.kak.tipe_kegiatan?.nama_tipe}</div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{kegiatan.kak.pengusul?.nama_lengkap}</td>
                                                            {isWadir && (
                                                                <td className="px-4 py-4 whitespace-normal text-sm text-slate-500">
                                                                    {priorCatatan ? (
                                                                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                                            <MessageSquare className="w-3 h-3" />
                                                                            {priorCatatan}
                                                                        </span>
                                                                    ) : '-'}
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                {new Date(kegiatan.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex justify-end gap-2">
                                                                    <Link
                                                                        href={route('kegiatan.show', kegiatan.kegiatan_id)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => openApproveModal(kegiatan)}
                                                                        className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors shadow-sm"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Setujui
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
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p>Tidak ada kegiatan yang perlu persetujuan Anda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* Modal Pengajuan (Pengusul) */}
            {showSubmitModal && selectedKak && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={closeSubmitModal} />

                        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                            <h3 className="text-xl font-bold leading-6 text-slate-900 mb-6">Ajukan Kegiatan</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Penanggung Jawab</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={submitData.penanggung_jawab_manual}
                                        onChange={e => setSubmitData('penanggung_jawab_manual', e.target.value)}
                                        required
                                    />
                                    {submitErrors.penanggung_jawab_manual && <p className="mt-1 text-sm text-red-600">{submitErrors.penanggung_jawab_manual}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Pelaksana</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={submitData.pelaksana_manual}
                                        onChange={e => setSubmitData('pelaksana_manual', e.target.value)}
                                        required
                                    />
                                    {submitErrors.pelaksana_manual && <p className="mt-1 text-sm text-red-600">{submitErrors.pelaksana_manual}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Surat Pengantar (PDF/DOC)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={e => setSubmitData('surat_pengantar', e.target.files[0])}
                                        required
                                    />
                                    {submitErrors.surat_pengantar && <p className="mt-1 text-sm text-red-600">{submitErrors.surat_pengantar}</p>}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeSubmitModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitProcessing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitProcessing ? 'Memproses...' : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Ajukan Sekarang
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Approve (PPK/Wadir) */}
            {showApproveModal && selectedKegiatan && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={closeApproveModal} />

                        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                            <h3 className="text-xl font-bold leading-6 text-slate-900 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                Setujui Kegiatan
                            </h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium">
                                {selectedKegiatan.kak.nama_kegiatan}
                            </p>

                            <form onSubmit={handleApprove} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Catatan (Boleh Kosong)</label>
                                    <textarea
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                        value={approveData.catatan}
                                        onChange={e => setApproveData('catatan', e.target.value)}
                                        placeholder="Tambahkan catatan untuk tahapan selanjutnya jika ada..."
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeApproveModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={approveProcessing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {approveProcessing ? 'Menyimpan...' : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Setujui
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
