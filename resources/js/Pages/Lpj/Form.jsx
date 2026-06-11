import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router, useForm } from '@inertiajs/react';
import {
    FileCheck, Upload, Trash2, MessageCircle, FileText, CheckCircle2, AlertCircle, ChevronLeft, Save, X, Plus, Loader2, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import Modal from '@/Components/Modal';

export default function Form({ auth, kegiatan, anggaran, lampiran, satuans, spk_config }) {
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
        lampiran_comments: [], // { id: lampiran_id, catatan_reviewer: string }
        anggaran_comments: [], // { id: anggaran_id, catatan_reviewer: string }
        spk_kesesuaian_waktu: kegiatan.spk_kesesuaian_waktu ?? '',
        spk_kesesuaian_output: kegiatan.spk_kesesuaian_output ?? '',
    });

    const [activeTab, setActiveTab] = useState(0); // 0: Form, 1: Review/Riwayat
    const [commentModalConfig, setCommentModalConfig] = useState(null); // { type: 'lampiran'|'anggaran', id: number, title: string }
    const [commentText, setCommentText] = useState('');
    const [viewerConfig, setViewerConfig] = useState(null); // { url: string, name: string }

    // SPK Config resolution with defensive defaults
    const config = spk_config || {
        weight_waktu: 25.00,
        weight_anggaran: 25.00,
        weight_output: 25.00,
        weight_lpj: 25.00,
        waktu_min: 50,
        waktu_max: 100,
        anggaran_min: 50,
        anggaran_max: 100,
        output_min: 0,
        output_max: 100,
        lpj_min: 50,
        lpj_max: 100,
        lpj_penalty_per_day: 5,
    };

    // Automatic SPK Calculations
    const totalBudget = anggaran.reduce((sum, item) => sum + parseFloat(item.jumlah_diusulkan || 0), 0);
    const totalRealization = Object.values(data.realisasi).reduce((sum, item) => {
        const v1 = parseFloat(item.volume1 || 0);
        const v2 = parseFloat(item.volume2 || 1);
        const v3 = parseFloat(item.volume3 || 1);
        const price = parseFloat(String(item.harga_satuan).replace(/[^0-9]/g, '') || 0);
        return sum + (v1 * v2 * v3 * price);
    }, 0);

    let predictedAnggaranScore = config.anggaran_max;
    if (totalBudget > 0) {
        const ratio = totalRealization / totalBudget;
        const diff = Math.abs(1 - ratio) * 100;
        predictedAnggaranScore = Math.max(config.anggaran_min, Math.min(config.anggaran_max, Math.round(config.anggaran_max - diff)));
    }

    let predictedLpjScore = config.lpj_max;
    if (kegiatan.lpj_submitted_at) {
        predictedLpjScore = kegiatan.spk_ketepatan_lpj;
    } else if (kegiatan.tgl_batas_lpj) {
        const deadline = new Date(kegiatan.tgl_batas_lpj);
        const now = new Date();
        if (now > deadline) {
            const diffTime = Math.abs(now - deadline);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            predictedLpjScore = Math.max(config.lpj_min, Math.min(config.lpj_max, config.lpj_max - (diffDays * config.lpj_penalty_per_day)));
        }
    }

    const isSubmitted = kegiatan.lpj_submitted_at !== null;
    const finalAnggaranScore = isSubmitted ? (kegiatan.spk_ketepatan_anggaran ?? config.anggaran_max) : predictedAnggaranScore;
    const finalLpjScore = isSubmitted ? (kegiatan.spk_ketepatan_lpj ?? config.lpj_max) : predictedLpjScore;
    const finalWaktuScore = isSubmitted ? (kegiatan.spk_kesesuaian_waktu ?? 0) : (data.spk_kesesuaian_waktu || 0);
    const finalOutputScore = isSubmitted ? (kegiatan.spk_kesesuaian_output ?? 0) : (data.spk_kesesuaian_output || 0);

    const commentInputRef = useRef(null);
    useEffect(() => {
        if (commentModalConfig && commentInputRef.current) {
            setTimeout(() => {
                commentInputRef.current.focus();
            }, 100);
        }
    }, [commentModalConfig]);



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
        console.log('submitLpj triggered');
        console.log('Current Form Data:', data);

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

                // forceFormData MUST be true — without it, Inertia serializes
                // the request as JSON, which silently drops all File objects.
                // Files only survive transmission inside multipart/form-data.
                post(url, {
                    forceFormData: true,
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (errs) => {
                        console.error('Validation Errors:', errs);
                        const errorCount = Object.keys(errs).length;
                        Swal.fire('Gagal', `Terdapat ${errorCount} kesalahan pada form. Silakan periksa pesan error di bawah.`, 'error');
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
            title: 'Kembalikan untuk Revisi?',
            text: 'Pastikan Anda telah memberikan catatan pada item anggaran atau dokumen yang perlu diperbaiki.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Kembalikan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('lpj.revise', kegiatan.kegiatan_id), {
                    onSuccess: () => {
                        // Success message handled by Index flash props
                    },
                    onError: (e) => Swal.fire('Error', e.message || 'Gagal mengirim revisi', 'error')
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
        if (!commentModalConfig || commentModalConfig.isArchived) return;

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
        const local = data.lampiran_comments.find(c => c.id === lampiranId);
        const dbLampiran = lampiran.find(l => l.lampiran_id === lampiranId);
        const dbText = dbLampiran?.catatan_reviewer || '';

        if (local) {
            return { text: local.catatan_reviewer, isOld: local.catatan_reviewer === dbText };
        }
        return { text: dbText, isOld: true };
    };

    const getCommentForAnggaran = (anggaranId) => {
        const local = data.anggaran_comments.find(c => c.id === anggaranId);
        const dbAnggaran = anggaran.find(a => a.anggaran_id === anggaranId);
        const dbText = dbAnggaran?.catatan_verifikator || '';

        if (local) {
            return { text: local.catatan_reviewer, isOld: local.catatan_reviewer === dbText };
        }
        return { text: dbText, isOld: true };
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
                                                {status !== 10 && (
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-12"></th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(
                                                anggaran.reduce((acc, curr) => {
                                                    const catId = curr.kategori_belanja_id;
                                                    if (!acc[catId]) {
                                                        acc[catId] = {
                                                            name: curr.kategori_belanja?.nama_kategori_belanja || 'Lainnya',
                                                            items: []
                                                        };
                                                    }
                                                    acc[catId].items.push(curr);
                                                    return acc;
                                                }, {})
                                            ).map(([catId, category]) => (
                                                <React.Fragment key={`cat-${catId}`}>
                                                    <tr className="bg-slate-50">
                                                        <td colSpan={status !== 10 ? 11 : 10} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wider border-y border-slate-200">
                                                            {category.name}
                                                        </td>
                                                    </tr>
                                                    {category.items.map((item, idx) => {
                                                        const realisasiItem = data.realisasi[item.anggaran_id] || {};
                                                        const attachedFiles = lampiran.filter(l => l.anggaran_id === item.anggaran_id);
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
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5">
                                                                            KAK: {item.volume1 ?? '-'}
                                                                        </div>
                                                                        <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.volume1} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume1', e.target.value)} disabled={!isEditingPengusul} min="0" placeholder="-" required />
                                                                    </td>
                                                                    <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5 truncate" title={item.satuan1?.nama_satuan ?? '-'}>
                                                                            KAK: {item.satuan1?.nama_satuan ?? '-'}
                                                                        </div>
                                                                        <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.satuan1_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan1_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                            <option value="">-</option>
                                                                            {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    {/* Vol 2 */}
                                                                    <td className="px-1 py-2 align-top border-r border-slate-100/50">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5">
                                                                            KAK: {item.volume2 ?? '-'}
                                                                        </div>
                                                                        <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.volume2} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume2', e.target.value)} disabled={!isEditingPengusul} placeholder="-" min="0" />
                                                                    </td>
                                                                    <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5 truncate" title={item.satuan2?.nama_satuan ?? '-'}>
                                                                            KAK: {item.satuan2?.nama_satuan ?? '-'}
                                                                        </div>
                                                                        <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.satuan2_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan2_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                            <option value="">-</option>
                                                                            {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    {/* Vol 3 */}
                                                                    <td className="px-1 py-2 align-top border-r border-slate-100/50">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5">
                                                                            KAK: {item.volume3 ?? '-'}
                                                                        </div>
                                                                        <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.volume3} onChange={e => handleRealisasiChange(item.anggaran_id, 'volume3', e.target.value)} disabled={!isEditingPengusul} placeholder="-" min="0" />
                                                                    </td>
                                                                    <td className="px-1 py-2 align-top border-r border-slate-100">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5 truncate" title={item.satuan3?.nama_satuan ?? '-'}>
                                                                            KAK: {item.satuan3?.nama_satuan ?? '-'}
                                                                        </div>
                                                                        <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.satuan3_id} onChange={e => handleRealisasiChange(item.anggaran_id, 'satuan3_id', e.target.value)} disabled={!isEditingPengusul}>
                                                                            <option value="">-</option>
                                                                            {satuans.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    {/* Harga */}
                                                                    <td className="px-2 py-2 align-top border-r border-slate-100">
                                                                        <div className="text-[10px] text-slate-500 mb-1 text-center font-semibold bg-slate-100 rounded py-0.5 truncate" title={formatCurrency(item.harga_satuan)}>
                                                                            KAK: {formatCurrency(item.harga_satuan)}
                                                                        </div>
                                                                        <input type="text" className="w-full rounded-lg border-gray-200 text-xs py-2 text-right focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                            value={realisasiItem.harga_satuan ? formatInputCurrency(realisasiItem.harga_satuan) : ''} onChange={e => handleRealisasiChange(item.anggaran_id, 'harga_satuan', e.target.value)} disabled={!isEditingPengusul} placeholder="Rp 0" required />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right font-bold text-gray-700 bg-cyan-50/30 align-top whitespace-nowrap">
                                                                        <div className="py-2">{formatCurrency(calculateRowTotal(realisasiItem))}</div>
                                                                    </td>
                                                                    {status !== 10 && (
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
                                                                                            setCommentText(comment.text);
                                                                                        }}
                                                                                        className={clsx("lampiran-comment-btn mx-auto", comment.text ? (isBendahara && comment.isOld ? "is-old-comment" : "has-comment") : "")}
                                                                                        title="Catatan Revisi Item"
                                                                                    >
                                                                                        <MessageCircle size={14} />
                                                                                    </button>
                                                                                );
                                                                            })()}
                                                                        </td>
                                                                    )}
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
                                                                                            <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleFileChange(item.anggaran_id, e)} />
                                                                                        </label>                                                                            </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                {attachedFiles.filter(l => l.status_lampiran !== 'archived' && !data.files_to_delete.includes(l.lampiran_id)).length === 0 && newFiles.length === 0 && (
                                                                                    <div className="text-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 font-medium">Belum ada bukti yang diunggah untuk item ini.</div>
                                                                                )}

                                                                                {/* Existing Files */}
                                                                                {attachedFiles.map(file => {
                                                                                    const comment = getCommentForLampiran(file.lampiran_id);
                                                                                    const isArchived = file.status_lampiran === 'archived' || data.files_to_delete.includes(file.lampiran_id);

                                                                                    return (
                                                                                        <div key={file.lampiran_id} className={clsx("lampiran-item flex justify-between items-center p-3 rounded-lg border", comment ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white shadow-sm", isArchived && "opacity-50 grayscale bg-slate-100")}>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", comment ? "bg-red-100 text-red-600" : "bg-cyan-50 text-cyan-600")}>
                                                                                                    <FileText size={20} />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => setViewerConfig({ url: file.path_file_disimpan, name: file.nama_file_asli })}
                                                                                                            className={clsx("text-sm font-bold text-cyan-700 hover:text-cyan-500 hover:underline transition-colors", isArchived && "line-through text-slate-500")}
                                                                                                        >
                                                                                                            {file.nama_file_asli}
                                                                                                        </button>
                                                                                                        {isArchived && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase">Archived</span>}
                                                                                                    </div>
                                                                                                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Diunggah pada {new Date(file.created_at).toLocaleDateString()}</div>
                                                                                                    {file.file_hash && (
                                                                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5" title={`SHA-256: ${file.file_hash}`}>
                                                                                                            SHA-256: <span className="text-slate-500 font-bold select-all">{file.file_hash.substring(0, 8)}...{file.file_hash.substring(file.file_hash.length - 8)}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                {/* View Button */}
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => setViewerConfig({ url: file.path_file_disimpan, name: file.nama_file_asli })}
                                                                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-colors"
                                                                                                    title="Lihat Dokumen"
                                                                                                >
                                                                                                    <Eye size={16} />
                                                                                                </button>

                                                                                                {/* Comment Button (Bendahara & Pengusul) */}
                                                                                                {status !== 10 && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => {
                                                                                                            setCommentModalConfig({
                                                                                                                type: 'lampiran',
                                                                                                                id: file.lampiran_id,
                                                                                                                title: `Dokumen: ${file.nama_file_asli}`,
                                                                                                                isArchived: isArchived
                                                                                                            });
                                                                                                            setCommentText(comment.text);
                                                                                                        }}
                                                                                                        className={clsx("lampiran-comment-btn", comment.text ? (isBendahara && comment.isOld ? "is-old-comment" : "has-comment") : "")}
                                                                                                        title="Catatan Revisi"
                                                                                                    >
                                                                                                        <MessageCircle size={16} />
                                                                                                    </button>
                                                                                                )}

                                                                                                {isEditingPengusul && !isArchived && (
                                                                                                    <button type="button" onClick={() => removeExistingFile(file.lampiran_id)} className="btn-delete-lampiran" title="Hapus Dokumen">
                                                                                                        <Trash2 size={16} />
                                                                                                    </button>
                                                                                                )}

                                                                                                {isEditingPengusul && isArchived && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => setData('files_to_delete', data.files_to_delete.filter(id => id !== file.lampiran_id))}
                                                                                                        className="p-2 rounded-lg hover:bg-cyan-100 text-slate-400 hover:text-cyan-600 transition-colors"
                                                                                                        title="Batal Hapus"
                                                                                                    >
                                                                                                        <Save size={16} />
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
                                                                                                    Siap diunggah ({(file.size / 1024).toFixed(1)} KB)
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
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* SECTION: Evaluasi Kinerja SPK Pimpinan */}
                                <div className="p-6 bg-slate-50/50 rounded-2xl border-2 border-slate-200/60 shadow-sm mt-6">
                                    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 shadow-sm border border-cyan-100/50">
                                            <FileCheck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-800 text-base">Evaluasi Kinerja SPK Pimpinan (Decision Support System)</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                                                Dua variabel kualitatif diinput langsung oleh Anda, sedangkan variabel kuantitatif dihitung secara otomatis oleh sistem berdasarkan total realisasi anggaran dan ketepatan waktu pengajuan.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub-section: Manual Input Variables */}
                                    <div className="mb-6">
                                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-cyan-500 pl-2">
                                            Variabel Input Manual Pengusul
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Kesesuaian Waktu */}
                                            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-2">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Kesesuaian Waktu (Pelaksanaan Kegiatan)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full rounded-xl border-gray-200 text-sm py-3 px-4 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                    min={config.waktu_min}
                                                    max={config.waktu_max}
                                                    required
                                                    value={data.spk_kesesuaian_waktu}
                                                    onChange={e => setData('spk_kesesuaian_waktu', e.target.value)}
                                                    disabled={!isEditingPengusul}
                                                    placeholder={`Nilai (${config.waktu_min} - ${config.waktu_max})`}
                                                />
                                                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                                                    Konstrain {config.waktu_min}-{config.waktu_max}. Nilai kesesuaian waktu pelaksanaan acara dibanding jadwal KAK original (Bobot: {config.weight_waktu}%).
                                                </p>
                                                {errors.spk_kesesuaian_waktu && (
                                                    <p className="text-xs text-red-500 font-bold">{errors.spk_kesesuaian_waktu}</p>
                                                )}
                                            </div>

                                            {/* Kesesuaian Output */}
                                            <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-2">
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Kesesuaian Output (IKU)
                                                </label>
                                                <select
                                                    className="w-full rounded-xl border-gray-200 text-sm py-3 px-4 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                    required
                                                    value={data.spk_kesesuaian_output}
                                                    onChange={e => setData('spk_kesesuaian_output', e.target.value)}
                                                    disabled={!isEditingPengusul}
                                                >
                                                    <option value="">- Pilih Kesesuaian IKU -</option>
                                                    <option value={config.output_min}>{config.output_min} - Output Tidak Sesuai IKU</option>
                                                    <option value={config.output_max}>{config.output_max} - Output Sesuai IKU</option>
                                                </select>
                                                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                                                    Hanya boleh bernilai {config.output_min} (tidak sesuai) atau {config.output_max} (sesuai indikator IKU KAK) (Bobot: {config.weight_output}%).
                                                </p>
                                                {errors.spk_kesesuaian_output && (
                                                    <p className="text-xs text-red-500 font-bold">{errors.spk_kesesuaian_output}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-section: Automatic System Previews */}
                                    <div className="mb-6">
                                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-slate-400 pl-2">
                                            Metrik Kuantitatif (Dihitung Otomatis oleh Sistem)
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Ketepatan Anggaran */}
                                            <div className="p-5 bg-slate-100/50 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        Ketepatan Penggunaan Anggaran
                                                    </label>
                                                    <span className="text-sm font-extrabold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                                                        {finalAnggaranScore} / {config.anggaran_max}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                                                    Anggaran KAK: <strong>Rp {totalBudget.toLocaleString('id-ID')}</strong><br />
                                                    Realisasi Saat Ini: <strong>Rp {totalRealization.toLocaleString('id-ID')}</strong>
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-normal leading-normal italic">
                                                    Sistem memberikan skor {config.anggaran_max} jika realisasi 100% pas dengan anggaran. Penyimpangan (lebih/kurang) mengurangi skor secara proporsional (min. {config.anggaran_min}) (Bobot: {config.weight_anggaran}%).
                                                </p>
                                            </div>

                                            {/* Ketepatan LPJ */}
                                            <div className="p-5 bg-slate-100/50 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        Ketepatan Penyampaian LPJ
                                                    </label>
                                                    <span className="text-sm font-extrabold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                                                        {finalLpjScore} / {config.lpj_max}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                                                    Batas Akhir LPJ: <strong>{kegiatan.tgl_batas_lpj ? new Date(kegiatan.tgl_batas_lpj).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong><br />
                                                    {isSubmitted ? (
                                                        <>Status: <strong>Sudah Diajukan</strong></>
                                                    ) : (
                                                        <>Status: <strong>Prediksi Hari Ini</strong></>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-normal leading-normal italic">
                                                    Sistem memberikan skor {config.lpj_max} jika diserahkan sebelum deadline. Keterlambatan dikenakan penalty -{config.lpj_penalty_per_day} poin per hari (min. {config.lpj_min}) (Bobot: {config.weight_lpj}%).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIVE SCORE AVERAGE */}
                                    {finalWaktuScore !== '' && finalOutputScore !== '' && (
                                        <div className="mt-6 p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in">
                                            <div>
                                                <h5 className="font-extrabold text-cyan-800 text-sm">Nilai Kinerja SPK Kegiatan (Weighted Score)</h5>
                                                <p className="text-[11px] text-cyan-600 font-medium mt-0.5 leading-relaxed">
                                                    Skor akhir hasil kalkulasi bobot dinamis: ({config.weight_waktu}% Waktu, {config.weight_anggaran}% Anggaran, {config.weight_output}% Output, {config.weight_lpj}% LPJ).
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right shrink-0">
                                                <span className="text-3xl font-black text-cyan-600">
                                                    {((
                                                        (parseFloat(finalWaktuScore || 0) * config.weight_waktu) +
                                                        (parseFloat(finalOutputScore || 0) * config.weight_output) +
                                                        (parseFloat(finalAnggaranScore || 0) * config.weight_anggaran) +
                                                        (parseFloat(finalLpjScore || 0) * config.weight_lpj)
                                                    ) / 100.0).toFixed(2)}
                                                </span>
                                                <span className="text-xs text-cyan-500/80 font-extrabold ml-1">/ 100</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <AlertCircle size={20} className="text-cyan-600" />
                                        <span className="text-sm">Pastikan semua data realisasi dan bukti lampiran telah lengkap.</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isEditingPengusul && (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn-primary-action bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200"
                                            >
                                                {processing ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                                <span>{status === 12 ? 'Submit Ulang LPJ' : 'Submit LPJ'}</span>
                                            </button>
                                        )}

                                        {isReviewingBendahara && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={reviseLpj}
                                                    disabled={processing}
                                                    className="btn-primary-action bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200"
                                                >
                                                    <X size={20} /> <span>Kembalikan untuk Revisi</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={approveLpj}
                                                    disabled={processing}
                                                    className="btn-primary-action bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200"
                                                >
                                                    <CheckCircle2 size={20} /> <span>Setujui LPJ</span>
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
                <Modal show={!!commentModalConfig} onClose={() => setCommentModalConfig(null)} maxWidth="md">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageCircle size={20} className="text-cyan-600" />
                                Catatan Revisi
                            </h3>
                            <button onClick={() => setCommentModalConfig(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 text-sm font-semibold text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-cyan-600">{commentModalConfig?.title}</span>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Catatan Reviewer:</label>
                            <textarea
                                ref={commentInputRef}
                                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-0 transition-all h-40 resize-none shadow-inner"
                                placeholder={isReviewingBendahara ? (commentModalConfig?.isArchived ? "Dokumen ini dihapus. Catatan tidak dapat diubah." : "Berikan catatan spesifik mengapa item atau dokumen ini perlu direvisi...") : "Belum ada catatan."}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={!isReviewingBendahara || commentModalConfig?.isArchived}
                                maxLength={1000}
                                required={isReviewingBendahara}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setCommentModalConfig(null)} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                                Tutup
                            </button>
                            {isReviewingBendahara && !commentModalConfig?.isArchived && (
                                <button onClick={saveComment} className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors flex items-center gap-2">
                                    <Save size={18} /> Simpan Catatan
                                </button>
                            )}
                        </div>                    </div>
                </Modal>

                {/* Proof Viewer Modal */}
                <Modal show={!!viewerConfig} onClose={() => setViewerConfig(null)} maxWidth="2xl">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 truncate pr-8">
                                {viewerConfig?.name}
                            </h3>
                            <button onClick={() => setViewerConfig(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
                            {viewerConfig?.url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img src={viewerConfig.url} alt={viewerConfig.name} className="max-w-full h-auto shadow-lg" />
                            ) : (
                                <iframe src={viewerConfig?.url} className="w-full h-[600px] border-none" title="Proof Viewer" />
                            )}
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <a
                                href={viewerConfig?.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <Eye size={18} /> Buka Tab Baru
                            </a>
                            <button
                                onClick={() => setViewerConfig(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-all active:scale-95"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </Modal>
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
                .lampiran-comment-btn.is-old-comment {
                    background: #FEF9C3;
                    color: #CA8A04;
                    border-color: #FDE047;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-primary-action:hover {
                    transform: translateY(-2px);
                }
                .btn-primary-action:active {
                    transform: scale(0.95);
                }
                .btn-primary-action:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                `
            }} />
        </>
    );
}