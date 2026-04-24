import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router, useForm } from '@inertiajs/react';
import {
    FileCheck, Upload, Trash2, MessageCircle, FileText, CheckCircle2, AlertCircle, ChevronLeft, Save, X, Plus, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import clsx from 'clsx';

export default function Form({ auth, kegiatan, anggaran, lampiran, satuans }) {
    const isPengusul = auth.user.role_id === 3;
    const isBendahara = auth.user.role_id === 6;
    const isAdmin = auth.user.role_id === 1;

    // Status mapping
    // 10: Menunggu LPJ
    // 11: Review LPJ
    // 12: LPJ Direvisi
    // 13: Setor Fisik
    // 14: Selesai
    const status = kegiatan.kak?.status_id;
    const isEditingPengusul = isPengusul && (status === 10 || status === 12);
    const isReviewingBendahara = (isBendahara || isAdmin) && status === 11;
    const isSetorFisik = (isBendahara || isAdmin) && status === 13;

    const formatInputCurrency = (value) => {
        if (value === null || value === undefined || value === '') return '';
        const numberString = value.toString().replace(/\D/g, '');
        if (!numberString) return '';
        return 'Rp ' + parseInt(numberString, 10).toLocaleString('id-ID');
    };

    const parseDbCurrency = (val) => {
        if (val === null || val === undefined || val === '') return '';
        return Math.round(parseFloat(val)).toString();
    };

    // Initialize Form
    const initialRealisasi = {};
    anggaran.forEach(item => {
        initialRealisasi[item.anggaran_id] = {
            volume1: item.realisasi_volume1 ?? item.volume1 ?? '',
            satuan1_id: item.realisasi_satuan1_id ?? item.satuan1_id ?? '',
            volume2: item.realisasi_volume2 ?? item.volume2 ?? '',
            satuan2_id: item.realisasi_satuan2_id ?? item.satuan2_id ?? '',
            volume3: item.realisasi_volume3 ?? item.volume3 ?? '',
            satuan3_id: item.realisasi_satuan3_id ?? item.satuan3_id ?? '',
            harga_satuan: parseDbCurrency(item.realisasi_harga_satuan ?? item.harga_satuan ?? ''),
            jumlah: item.realisasi_jumlah ?? 0,
        };
    });

    const { data, setData, post, processing, errors, progress } = useForm({
        realisasi: initialRealisasi,
        bukti: {}, // { anggaran_id: [File1, File2] }
        files_to_delete: [], // Array of lampiran_id to be archived during resubmit
        catatan_umum: '',
        lampiran_comments: [], // { id: lampiran_id, catatan_reviewer: string }
        anggaran_comments: [], // { id: anggaran_id, catatan_reviewer: string }
    });

    const [activeTab, setActiveTab] = useState(0); // 0: Form, 1: Review/Riwayat
    const [commentModalConfig, setCommentModalConfig] = useState(null); // { type: 'lampiran'|'anggaran', id: number, title: string }
    const [commentText, setCommentText] = useState('');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleRealisasiChange = (anggaranId, field, value) => {
        if (!isEditingPengusul) return;
        
        let finalValue = value;
        if (field === 'harga_satuan') {
            finalValue = value.replace(/\D/g, '');
        }

        setData('realisasi', {
            ...data.realisasi,
            [anggaranId]: {
                ...data.realisasi[anggaranId],
                [field]: finalValue
            }
        });
    };

    const handleFileChange = (anggaranId, e) => {
        const files = Array.from(e.target.files);
        setData('bukti', {
            ...data.bukti,
            [anggaranId]: [...(data.bukti[anggaranId] || []), ...files]
        });
    };

    const removeNewFile = (anggaranId, index) => {
        const newFiles = [...(data.bukti[anggaranId] || [])];
        newFiles.splice(index, 1);
        setData('bukti', {
            ...data.bukti,
            [anggaranId]: newFiles
        });
    };

    const removeExistingFile = (lampiranId) => {
        Swal.fire({
            title: 'Hapus Bukti?',
            text: 'Bukti akan dihapus saat Anda menyimpan/mengirim LPJ.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Hapus'
        }).then((result) => {
            if (result.isConfirmed) {
                setData('files_to_delete', [...data.files_to_delete, lampiranId]);
            }
        });
    };

    // Form Submissions
    const submitLpj = (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: status === 12 ? 'Submit Ulang LPJ?' : 'Submit LPJ?',
            text: 'Pastikan semua realisasi dan bukti telah diisi dengan benar.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            confirmButtonText: 'Ya, Submit'
        }).then((result) => {
            if (result.isConfirmed) {
                const url = status === 12 
                    ? route('lpj.resubmit', kegiatan.kegiatan_id) 
                    : route('lpj.submit', kegiatan.kegiatan_id);
                
                post(url, {
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (errs) => {
                        Swal.fire('Error', errs.message || 'Gagal mengirim LPJ', 'error');
                    }
                });
            }
        });
    };

    const approveLpj = () => {
        Swal.fire({
            title: 'Setujui LPJ?',
            text: 'LPJ akan dilanjutkan ke tahap Setor Fisik Dokumen.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Setujui'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('lpj.approve', kegiatan.kegiatan_id), {}, {
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (e) => Swal.fire('Error', e.message, 'error')
                });
            }
        });
    };

    const reviseLpj = () => {
        Swal.fire({
            title: 'Revisi LPJ',
            input: 'textarea',
            inputLabel: 'Catatan Umum Revisi',
            inputPlaceholder: 'Masukkan catatan umum untuk Pengusul...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Kirim Revisi',
            preConfirm: (catatan) => {
                if (!catatan) Swal.showValidationMessage('Catatan umum wajib diisi');
                return catatan;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('lpj.revise', kegiatan.kegiatan_id), {
                    transform: (formData) => ({
                        ...formData,
                        catatan_umum: result.value
                    }),
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (e) => Swal.fire('Error', e.message, 'error')
                });
            }
        });
    };

    const completeLpj = () => {
        Swal.fire({
            title: 'Selesaikan LPJ?',
            text: 'Konfirmasi bahwa bukti fisik telah diterima dan LPJ dinyatakan Selesai.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Selesai (Bukti Fisik Diterima)'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('lpj.complete', kegiatan.kegiatan_id), {}, {
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (e) => Swal.fire('Error', e.message, 'error')
                });
            }
        });
    };

    const saveComment = () => {
        if (!commentModalConfig) return;
        
        if (commentModalConfig.type === 'lampiran') {
            const existing = data.lampiran_comments.find(c => c.id === commentModalConfig.id);
            let newComments = [...data.lampiran_comments];
            if (existing) {
                existing.catatan_reviewer = commentText;
            } else {
                newComments.push({
                    id: commentModalConfig.id,
                    catatan_reviewer: commentText
                });
            }
            setData('lampiran_comments', newComments);
        } else if (commentModalConfig.type === 'anggaran') {
            const existing = data.anggaran_comments.find(c => c.id === commentModalConfig.id);
            let newComments = [...data.anggaran_comments];
            if (existing) {
                existing.catatan_reviewer = commentText;
            } else {
                newComments.push({
                    id: commentModalConfig.id,
                    catatan_reviewer: commentText
                });
            }
            setData('anggaran_comments', newComments);
        }
        
        setCommentModalConfig(null);
    };

    const getCommentForLampiran = (lampiranId) => {
        // Check local state first, then DB
        const local = data.lampiran_comments.find(c => c.id === lampiranId);
        if (local) return local.catatan_reviewer;
        const dbLampiran = lampiran.find(l => l.lampiran_id === lampiranId);
        return dbLampiran?.catatan_reviewer || '';
    };

    const getCommentForAnggaran = (anggaranId) => {
        const local = data.anggaran_comments.find(c => c.id === anggaranId);
        if (local) return local.catatan_reviewer;
        const dbAnggaran = anggaran.find(a => a.anggaran_id === anggaranId);
        return dbAnggaran?.catatan_verifikator || '';
    };

    const calculateRowTotal = (item) => {
        const v1 = parseFloat(item.volume1) || 0;
        const v2 = parseFloat(item.volume2) || 1; // Default to 1 for multiplier effect
        const v3 = parseFloat(item.volume3) || 1;
        const price = parseFloat(item.harga_satuan) || 0;
        return v1 * v2 * v3 * price;
    };

    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.visit(route('lpj.index'))} className="p-2 rounded-full hover:bg-slate-200 transition-colors bg-white shadow-sm">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </button>
                        <PageHeader
                            title="Laporan Pertanggungjawaban (LPJ)"
                            description={kegiatan.nama_kegiatan}
                        />
                    </div>
                }
            >
                <Head title={`LPJ - ${kegiatan.nama_kegiatan}`} />

                <div className="max-w-7xl mx-auto space-y-6 form-lpj-page pb-20">
                    


                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden main-step-content active border-hover-draw">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-6">Formulir Realisasi LPJ</h3>
                            
                            <form onSubmit={submitLpj} className="space-y-8">
                                <div className="hidden md:block overflow-x-auto overflow-y-hidden rounded-xl border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Uraian</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Diusulkan</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 1</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 2</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 3</th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Harga Satuan (Real)</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Total (Real)</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {anggaran.map((item, idx) => {
                                                const realisasiItem = data.realisasi[item.anggaran_id] || {};
                                                const attachedFiles = lampiran.filter(l => l.anggaran_id === item.anggaran_id && l.status_lampiran !== 'archived' && !data.files_to_delete.includes(l.lampiran_id));
                                                const newFiles = data.bukti[item.anggaran_id] || [];
                                                
                                                return (
                                                    <React.Fragment key={item.anggaran_id}>
                                                        <tr className="text-sm bg-white hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 align-top font-bold text-slate-800 w-48 border-r border-slate-100">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-cyan-100 text-cyan-700 font-bold text-[10px] shrink-0 mt-0.5">{idx + 1}</span>
                                                                    <span>{item.uraian}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 align-top text-right text-slate-600 font-semibold whitespace-nowrap border-r border-slate-100">
                                                                {formatCurrency(item.jumlah_diusulkan)}
                                                            </td>
                                                            {/* Vol 1 */}
                                                            <td className="px-1 py-2 align-top border-r border-slate-100/50">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.volume1} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume1', e.target.value)} disabled={!isEditingPengusul} min="0" placeholder="1" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.satuan1_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan1_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                    <option value="">-</option>
                                                                    {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Vol 2 */}
                                                            <td className="px-1 py-2 align-top border-r border-slate-100/50">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.volume2} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume2', e.target.value)} disabled={!isEditingPengusul} placeholder="-" min="0" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.satuan2_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan2_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                    <option value="">-</option>
                                                                    {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Vol 3 */}
                                                            <td className="px-1 py-2 align-top border-r border-slate-100/50">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.volume3} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume3', e.target.value)} disabled={!isEditingPengusul} placeholder="-" min="0" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.satuan3_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan3_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                    <option value="">-</option>
                                                                    {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Harga */}
                                                            <td className="px-2 py-2 align-top border-r border-slate-100">
                                                                <input type="text" className="w-full rounded-lg border-gray-200 text-xs py-2 text-right focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={realisasiItem.harga_satuan ? formatInputCurrency(realisasiItem.harga_satuan) : ''} onChange={e => handleRealisasiChange(item.anggaran_id, 'harga_satuan', e.target.value)} disabled={!isEditingPengusul} placeholder="Rp 0" />
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-bold text-gray-700 bg-cyan-50/30 align-top whitespace-nowrap">
                                                                <div className="py-2">{formatCurrency(calculateRowTotal(realisasiItem))}</div>
                                                            </td>
                                                            <td className="px-2 py-3 align-top text-center border-l border-slate-100">
                                                                {(() => {
                                                                    const comment = getCommentForAnggaran(item.anggaran_id);
                                                                    return (
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setCommentModalConfig({
                                                                                    type: 'anggaran',
                                                                                    id: item.anggaran_id,
                                                                                    title: `Item Anggaran: ${item.uraian}`
                                                                                });
                                                                                setCommentText(comment);
                                                                            }}
                                                                            className={clsx("lampiran-comment-btn mx-auto", comment ? "has-comment" : "")}
                                                                            title="Catatan Revisi Item"
                                                                        >
                                                                            <MessageCircle size={14} />
                                                                        </button>
                                                                    );
                                                                })()}
                                                            </td>
                                                        </tr>
                                                        {/* Bukti Dokumen Row */}
                                                        <tr className="bg-slate-50/50 border-b-2 border-b-slate-200">
                                                            <td colSpan="11" className="px-4 py-4 pb-6">
                                                                <div className="p-4 bg-white rounded-xl border-2 border-slate-100 hover:border-cyan-300 transition-colors shadow-sm md:ml-12">
                                                                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                                                        <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                                            <FileCheck size={16} className="text-cyan-600" /> Bukti Dokumen
                                                                        </h5>
                                                                        {isEditingPengusul && (
                                                                            <div>
                                                                                <label className="btn-add-lampiran cursor-pointer text-xs flex items-center gap-1 shadow-sm">
                                                                                    <Plus size={14} /> Tambah Bukti
                                                                                    <input type="file" className="hidden" multiple onChange={(e) => handleFileChange(item.anggaran_id, e)} />
                                                                                </label>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {attachedFiles.length === 0 && newFiles.length === 0 && (
                                                                            <div className="text-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 font-medium">Belum ada bukti yang diunggah untuk item ini.</div>
                                                                        )}

                                                                        {/* Existing Files */}
                                                                        {attachedFiles.map(file => {
                                                                            const comment = getCommentForLampiran(file.lampiran_id);
                                                                            return (
                                                                                <div key={file.lampiran_id} className={clsx("lampiran-item flex justify-between items-center p-3 rounded-lg border", comment ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white shadow-sm")}>
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", comment ? "bg-red-100 text-red-600" : "bg-cyan-50 text-cyan-600")}>
                                                                                            <FileText size={20} />
                                                                                        </div>
                                                                                        <div>
                                                                                            <a href={file.path_file_disimpan} target="_blank" rel="noreferrer" className="text-sm font-bold text-cyan-700 hover:text-cyan-500 hover:underline transition-colors">
                                                                                                {file.nama_file_asli}
                                                                                            </a>
                                                                                            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Diunggah pada {new Date(file.created_at).toLocaleDateString()}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {/* Comment Button (Bendahara & Pengusul) */}
                                                                                        <button 
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setCommentModalConfig({
                                                                                                    type: 'lampiran',
                                                                                                    id: file.lampiran_id,
                                                                                                    title: `Dokumen: ${file.nama_file_asli}`
                                                                                                });
                                                                                                setCommentText(comment);
                                                                                            }}
                                                                                            className={clsx("lampiran-comment-btn", comment ? "has-comment" : "")}
                                                                                            title="Catatan Revisi"
                                                                                        >
                                                                                            <MessageCircle size={16} />
                                                                                        </button>

                                                                                        {isEditingPengusul && (
                                                                                            <button type="button" onClick={() => removeExistingFile(file.lampiran_id)} className="btn-delete-lampiran" title="Hapus Dokumen">
                                                                                                <Trash2 size={16} />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {/* New Files (Pengusul only) */}
                                                                        {newFiles.map((file, idx) => (
                                                                            <div key={`new-${idx}`} className="lampiran-item pending-lampiran flex justify-between items-center p-3 rounded-lg border border-blue-200 bg-blue-50/50 shadow-sm">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                                                        <Upload size={20} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-bold text-slate-700">{file.name}</div>
                                                                                        <div className="text-[11px] text-blue-500 mt-0.5 font-medium flex items-center gap-1">
                                                                                            <span className="relative flex h-2 w-2">
                                                                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                                                            </span>
                                                                                            Siap diunggah ({(file.size/1024).toFixed(1)} KB)
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <button type="button" onClick={() => removeNewFile(item.anggaran_id, idx)} className="btn-cancel-upload" title="Batal Unggah">
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {errors.message && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                        {errors.message}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="action-buttons border-t-4 border-cyan-500 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/80 p-6 rounded-b-2xl">
                                    <div className="text-sm text-slate-500 italic">
                                        Pastikan data realisasi dan dokumen pendukung sesuai.
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-end w-full md:w-auto">
                                        {isEditingPengusul && (
                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                className="btn-primary-action bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200 disabled:opacity-50"
                                            >
                                                {processing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                                <span>{status === 12 ? 'Submit Ulang LPJ' : 'Submit LPJ'}</span>
                                            </button>
                                        )}

                                        {isReviewingBendahara && (
                                            <>
                                                <button 
                                                    type="button" 
                                                    onClick={reviseLpj}
                                                    disabled={processing}
                                                    className="btn-primary-action btn-revise"
                                                >
                                                    <AlertCircle size={20} /> <span>Kembalikan untuk Revisi</span>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={approveLpj}
                                                    disabled={processing}
                                                    className="btn-primary-action bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                                >
                                                    <CheckCircle2 size={20} /> <span>Setujui LPJ Digital</span>
                                                </button>
                                            </>
                                        )}

                                        {isSetorFisik && (
                                            <button 
                                                type="button" 
                                                onClick={completeLpj}
                                                disabled={processing}
                                                className="btn-primary-action bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                            >
                                                <CheckCircle2 size={20} /> <span>LPJ Selesai (Bukti Fisik Diterima)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Comment Modal */}
                {commentModalConfig && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in-up">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 flex justify-between items-center text-white">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <MessageCircle size={24} /> Catatan Revisi {commentModalConfig.type === 'lampiran' ? 'Dokumen' : 'Item'}
                                </h3>
                                <button onClick={() => setCommentModalConfig(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-md border border-white/30">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 text-sm font-semibold text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-cyan-600">{commentModalConfig.title}</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Catatan Reviewer:</label>
                                    <textarea
                                        className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-0 transition-colors h-32 resize-none"
                                        placeholder={isReviewingBendahara ? "Masukkan catatan..." : "Belum ada catatan."}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={!isReviewingBendahara}
                                    />
                                </div>
                                
                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setCommentModalConfig(null)} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                                        Tutup
                                    </button>
                                    {isReviewingBendahara && (
                                        <button onClick={saveComment} className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors flex items-center gap-2">
                                            <Save size={18} /> Simpan Catatan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-in-up { animation: slide-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                
                .form-control-custom {
                    padding: 0.625rem 0.875rem;
                    border: 2px solid #E5E7EB;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                    outline: none;
                    background: #FFFFFF;
                }
                .form-control-custom:focus {
                    border-color: #00BCD4;
                    box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
                }
                .form-control-custom:disabled {
                    background: #F3F4F6;
                    color: #9CA3AF;
                    cursor: not-allowed;
                }

                .btn-add-lampiran {
                    background: linear-gradient(135deg, #00BCD4, #0097A7);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .btn-add-lampiran:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
                }

                .lampiran-comment-btn {
                    width: 32px;
                    height: 32px;
                    background: #E0F7FA;
                    color: #00BCD4;
                    border: 2px solid #B2EBF2;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .lampiran-comment-btn:hover {
                    background: #00BCD4;
                    color: white;
                    transform: scale(1.1);
                }
                .lampiran-comment-btn.has-comment {
                    background: #FEE2E2;
                    color: #EF4444;
                    border-color: #FCA5A5;
                    animation: pulse-comment 2s infinite;
                }
                @keyframes pulse-comment {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                }

                .btn-delete-lampiran, .btn-cancel-upload {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #EF4444;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .btn-delete-lampiran:hover, .btn-cancel-upload:hover {
                    background: linear-gradient(135deg, #F87171, #DC2626);
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                }

                /* Border Hover Draw Animation */
                .border-hover-draw {
                    position: relative;
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .border-hover-draw:hover {
                    transform: translateY(-4px) scale(1.005);
                }
                .border-hover-draw::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 16px;
                    padding: 2px;
                    background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .border-hover-draw:hover::before {
                    opacity: 1;
                }
                .row-with-comment:hover {
                    border-color: #00BCD4;
                    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
                    transform: translateY(-2px);
                }

                .btn-primary-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.625rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 0.875rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    border: none;
                    cursor: pointer;
                }
                .btn-primary-action:hover {
                    transform: translateY(-2px);
                }
                .btn-primary-action:active {
                    transform: translateY(0);
                }
                .btn-revise {
                    background: #ef4444;
                    color: white;
                    shadow-lg shadow-red-200;
                }
                .btn-revise:hover {
                    background: #dc2626;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .action-buttons span {
                    line-height: 1;
                }
            `}} />
        </>
    );
}
