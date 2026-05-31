import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './Components/WizardProgress';
import Step1Kak from './Partials/Step1Kak';
import Step2Iku from './Partials/Step2Iku';
import Step3Rab from './Partials/Step3Rab';
import CommentModal from './Components/CommentModal';
import CustomSwal from '@/Utils/CustomSwal';
import { ChevronLeft, ChevronRight, Save, Check, FileWarning, XCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function KakForm({ auth, kak, tipe_kegiatan, satuan, iku, kategori_belanja, mata_anggaran = [], readOnly = false }) {
    const isEdit = !!kak;
    const isVerifikator = auth.user.role_id === 2 && readOnly; // Verifikator viewing
    const isPengusulFixing = auth.user.role_id === 3 && kak?.status_id === 5; // Pengusul fixing revision

    // Core Navigation State
    const [currentStep, setCurrentStep] = useState(1);
    const [subStep, setSubStep] = useState('gambaran-umum');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const step1Menu = [
        'gambaran-umum',
        'penerima-manfaat',
        'strategi-pencapaian',
        'indikator-kinerja',
        'kurun-waktu'
    ];

    // Initial State mapping from potential KAK data
    // We add a random _id for frontend list rendering stability (Framer Motion animations)
    const { data, setData, post, put, processing, errors, transform } = useForm({
        kak: {
            nama_kegiatan: kak?.nama_kegiatan || '',
            tipe_kegiatan_id: kak?.tipe_kegiatan_id || '',
            gambaran_umum: kak?.gambaran_umum || '',
            deskripsi_kegiatan: kak?.deskripsi_kegiatan || '',
            sasaran_utama: kak?.sasaran_utama || '',
            // Initialize with wrapping objects for stable keys
            manfaat: kak?.manfaat?.map(m => ({ _id: Math.random(), manfaat_id: m.manfaat_id, value: m.manfaat })) || [{ _id: Math.random(), value: '' }],
            metode_pelaksanaan: kak?.metode_pelaksanaan || '',
            tahapan_pelaksanaan: kak?.tahapan?.map(t => ({ _id: Math.random(), tahapan_id: t.tahapan_id, nama_tahapan: t.nama_tahapan })) || [{ _id: Math.random(), nama_tahapan: '' }],
            indikator_kinerja: kak?.targets?.length > 0
                ? kak.targets.map(ik => ({ _id: Math.random(), target_id: ik.target_id, bulan_indikator: ik.bulan_indikator || '', deskripsi_target: ik.deskripsi_target || '', persentase_target: ik.persentase_target ?? '' }))
                : [{ _id: Math.random(), bulan_indikator: '', deskripsi_target: '', persentase_target: '' }],
            tanggal_mulai: kak?.tanggal_mulai || '',
            tanggal_selesai: kak?.tanggal_selesai || '',
            lokasi: kak?.lokasi || '',
        },
        target_iku: kak?.ikus?.map(t => ({
            _id: Math.random(),
            kak_iku_id: t.kak_iku_id, // we might need this if comments map to the pivot, but ikus has kak_iku_id or iku_id? let's preserve all
            iku_id: t.iku_id,
            target: t.target,
            satuan_id: t.satuan_id
        })) || [{ _id: Math.random(), iku_id: '', target: '', satuan_id: '' }], // Ensure min 1 item
        rab: kak?.anggaran?.map(a => ({
            _id: Math.random(),
            anggaran_id: a.anggaran_id,
            kategori_belanja_id: a.kategori_belanja_id,
            uraian: a.uraian,
            volume1: a.volume1,
            satuan1_id: a.satuan1_id,
            volume2: a.volume2,
            satuan2_id: a.satuan2_id,
            volume3: a.volume3,
            satuan3_id: a.satuan3_id,
            harga_satuan: a.harga_satuan
        })) || []
    });

    // --- FRONTEND CLIENT-SIDE VALIDATION ---
    const [clientErrors, setClientErrors] = useState({});

    const validateField = (path, value, currentData = data) => {
        let error = '';
        const parts = path.split('.');

        if (path === 'kak.nama_kegiatan') {
            if (!value || String(value).trim() === '') {
                error = 'Nama kegiatan wajib diisi.';
            } else if (String(value).trim().length < 5) {
                error = 'Nama kegiatan minimal 5 karakter.';
            } else if (String(value).trim().length > 255) {
                error = 'Nama kegiatan maksimal 255 karakter.';
            }
        }
        else if (path === 'kak.tipe_kegiatan_id') {
            if (!value) {
                error = 'Tipe kegiatan wajib dipilih.';
            }
        }
        else if (path === 'kak.deskripsi_kegiatan' || path === 'kak.gambaran_umum') {
            if (!value || String(value).trim() === '') {
                error = 'Gambaran umum kegiatan wajib diisi.';
            } else if (String(value).trim().length < 5) {
                error = 'Gambaran umum kegiatan minimal 5 karakter.';
            }
        }
        else if (path === 'kak.sasaran_utama') {
            if (!value || String(value).trim() === '') {
                error = 'Sasaran utama wajib diisi.';
            } else if (String(value).trim().length > 255) {
                error = 'Sasaran utama maksimal 255 karakter.';
            }
        }
        else if (parts[0] === 'kak' && parts[1] === 'manfaat' && parts[3] === 'value') {
            if (!value || String(value).trim() === '') {
                error = 'Output / Manfaat wajib diisi.';
            } else if (String(value).trim().length > 255) {
                error = 'Output / Manfaat maksimal 255 karakter.';
            }
        }
        else if (path === 'kak.metode_pelaksanaan') {
            if (!value || String(value).trim() === '') {
                error = 'Metode pelaksanaan wajib diisi.';
            } else if (String(value).trim().length < 5) {
                error = 'Metode pelaksanaan minimal 5 karakter.';
            }
        }
        else if (parts[0] === 'kak' && parts[1] === 'tahapan_pelaksanaan' && parts[3] === 'nama_tahapan') {
            if (!value || String(value).trim() === '') {
                error = 'Nama tahapan wajib diisi.';
            } else if (String(value).trim().length > 255) {
                error = 'Nama tahapan maksimal 255 karakter.';
            }
        }
        else if (parts[0] === 'kak' && parts[1] === 'indikator_kinerja') {
            const field = parts[3];
            if (field === 'bulan_indikator') {
                if (!value) {
                    error = 'Bulan indikator wajib dipilih.';
                }
            } else if (field === 'deskripsi_target') {
                if (!value || String(value).trim() === '') {
                    error = 'Indikator keberhasilan wajib diisi.';
                } else if (String(value).trim().length > 255) {
                    error = 'Indikator keberhasilan maksimal 255 karakter.';
                }
            } else if (field === 'persentase_target') {
                if (value === undefined || value === null || String(value).trim() === '') {
                    error = 'Target persentase wajib diisi.';
                } else {
                    const num = Number(value);
                    if (isNaN(num)) {
                        error = 'Target harus berupa angka.';
                    } else if (num < 0 || num > 100) {
                        error = 'Target harus antara 0 dan 100.';
                    }
                }
            }
        }
        else if (path === 'kak.tanggal_mulai') {
            if (!value) {
                error = 'Tanggal mulai wajib diisi.';
            }
        }
        else if (path === 'kak.tanggal_selesai') {
            if (!value) {
                error = 'Tanggal selesai wajib diisi.';
            } else if (currentData.kak.tanggal_mulai && new Date(value) < new Date(currentData.kak.tanggal_mulai)) {
                error = 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.';
            }
        }
        else if (path === 'kak.lokasi') {
            if (!value || String(value).trim() === '') {
                error = 'Lokasi wajib diisi.';
            } else if (String(value).trim().length > 255) {
                error = 'Lokasi maksimal 255 karakter.';
            }
        }
        else if (parts[0] === 'target_iku') {
            const field = parts[2];
            if (field === 'iku_id') {
                if (!value) {
                    error = 'IKU wajib dipilih.';
                }
            } else if (field === 'target') {
                if (!value || String(value).trim() === '') {
                    error = 'Target IKU wajib diisi.';
                } else if (String(value).trim().length > 255) {
                    error = 'Target IKU maksimal 255 karakter.';
                }
            } else if (field === 'satuan_id') {
                if (!value) {
                    error = 'Satuan IKU wajib dipilih.';
                }
            }
        }
        else if (parts[0] === 'rab') {
            const field = parts[2];
            if (field === 'uraian') {
                if (!value || String(value).trim() === '') {
                    error = 'Uraian RAB wajib diisi.';
                } else if (String(value).trim().length > 255) {
                    error = 'Uraian RAB maksimal 255 karakter.';
                }
            } else if (field === 'volume1') {
                if (value === undefined || value === null || String(value).trim() === '') {
                    error = 'Volume 1 wajib diisi.';
                } else {
                    const num = Number(value);
                    if (isNaN(num)) {
                        error = 'Volume 1 harus berupa angka.';
                    } else if (num < 0) {
                        error = 'Volume 1 minimal 0.';
                    }
                }
            } else if (field === 'satuan1_id') {
                if (!value) {
                    error = 'Satuan 1 wajib dipilih.';
                }
            } else if (field === 'harga_satuan') {
                if (value === undefined || value === null || String(value).trim() === '') {
                    error = 'Harga satuan wajib diisi.';
                } else {
                    const num = Number(value);
                    if (isNaN(num)) {
                        error = 'Harga satuan harus berupa angka.';
                    } else if (num < 0) {
                        error = 'Harga satuan minimal 0.';
                    }
                }
            }
        }
        return error;
    };

    const handleBlur = (path, value) => {
        const error = validateField(path, value);
        setClientErrors(prev => {
            const next = { ...prev };
            if (error) {
                next[path] = error;
            } else {
                delete next[path];
            }
            return next;
        });
    };

    const handleFieldChange = (path, value) => {
        if (clientErrors[path]) {
            const error = validateField(path, value);
            setClientErrors(prev => {
                const next = { ...prev };
                if (error) {
                    next[path] = error;
                } else {
                    delete next[path];
                }
                return next;
            });
        }
    };

    const validateSubStep = (subStepName) => {
        const errorsList = {};
        
        if (subStepName === 'gambaran-umum') {
            const e1 = validateField('kak.nama_kegiatan', data.kak.nama_kegiatan);
            const e2 = validateField('kak.tipe_kegiatan_id', data.kak.tipe_kegiatan_id);
            const e3 = validateField('kak.deskripsi_kegiatan', data.kak.deskripsi_kegiatan);
            
            if (e1) errorsList['kak.nama_kegiatan'] = e1;
            if (e2) errorsList['kak.tipe_kegiatan_id'] = e2;
            if (e3) errorsList['kak.deskripsi_kegiatan'] = e3;
        }
        
        else if (subStepName === 'penerima-manfaat') {
            const e1 = validateField('kak.sasaran_utama', data.kak.sasaran_utama);
            if (e1) errorsList['kak.sasaran_utama'] = e1;
            
            data.kak.manfaat.forEach((item, idx) => {
                const err = validateField(`kak.manfaat.${idx}.value`, item.value);
                if (err) errorsList[`kak.manfaat.${idx}.value`] = err;
            });
        }
        
        else if (subStepName === 'strategi-pencapaian') {
            const e1 = validateField('kak.metode_pelaksanaan', data.kak.metode_pelaksanaan);
            if (e1) errorsList['kak.metode_pelaksanaan'] = e1;
            
            data.kak.tahapan_pelaksanaan.forEach((item, idx) => {
                const err = validateField(`kak.tahapan_pelaksanaan.${idx}.nama_tahapan`, item.nama_tahapan);
                if (err) errorsList[`kak.tahapan_pelaksanaan.${idx}.nama_tahapan`] = err;
            });
        }
        
        else if (subStepName === 'indikator-kinerja') {
            data.kak.indikator_kinerja.forEach((item, idx) => {
                const e1 = validateField(`kak.indikator_kinerja.${idx}.bulan_indikator`, item.bulan_indikator);
                const e2 = validateField(`kak.indikator_kinerja.${idx}.deskripsi_target`, item.deskripsi_target);
                const e3 = validateField(`kak.indikator_kinerja.${idx}.persentase_target`, item.persentase_target);
                
                if (e1) errorsList[`kak.indikator_kinerja.${idx}.bulan_indikator`] = e1;
                if (e2) errorsList[`kak.indikator_kinerja.${idx}.deskripsi_target`] = e2;
                if (e3) errorsList[`kak.indikator_kinerja.${idx}.persentase_target`] = e3;
            });
        }
        
        else if (subStepName === 'kurun-waktu') {
            const e1 = validateField('kak.tanggal_mulai', data.kak.tanggal_mulai);
            const e2 = validateField('kak.tanggal_selesai', data.kak.tanggal_selesai);
            const e3 = validateField('kak.lokasi', data.kak.lokasi);
            
            if (e1) errorsList['kak.tanggal_mulai'] = e1;
            if (e2) errorsList['kak.tanggal_selesai'] = e2;
            if (e3) errorsList['kak.lokasi'] = e3;
        }
        
        return errorsList;
    };

    const validateStep2 = () => {
        const errorsList = {};
        data.target_iku.forEach((item, idx) => {
            const e1 = validateField(`target_iku.${idx}.iku_id`, item.iku_id);
            const e2 = validateField(`target_iku.${idx}.target`, item.target);
            const e3 = validateField(`target_iku.${idx}.satuan_id`, item.satuan_id);
            
            if (e1) errorsList[`target_iku.${idx}.iku_id`] = e1;
            if (e2) errorsList[`target_iku.${idx}.target`] = e2;
            if (e3) errorsList[`target_iku.${idx}.satuan_id`] = e3;
        });
        return errorsList;
    };

    const validateStep3 = () => {
        const errorsList = {};
        data.rab.forEach((item, idx) => {
            const e1 = validateField(`rab.${idx}.uraian`, item.uraian);
            const e2 = validateField(`rab.${idx}.volume1`, item.volume1);
            const e3 = validateField(`rab.${idx}.satuan1_id`, item.satuan1_id);
            const e4 = validateField(`rab.${idx}.harga_satuan`, item.harga_satuan);
            
            if (e1) errorsList[`rab.${idx}.uraian`] = e1;
            if (e2) errorsList[`rab.${idx}.volume1`] = e2;
            if (e3) errorsList[`rab.${idx}.satuan1_id`] = e3;
            if (e4) errorsList[`rab.${idx}.harga_satuan`] = e4;
        });
        return errorsList;
    };

    // --- REVISION STATE MANAGEMENT ---
    const [revisiData, setRevisiData] = useState({
        catatan: '', // General note
        catatan_kak: {}, // Main KAK fields e.g., { nama_kegiatan: '...' }
        anak: {
            t_kak_manfaat: [],
            t_kak_tahapan: [],
            t_kak_target: [], // Indikator Kinerja
            t_kak_iku: [],
            t_kak_anggaran: [] // RAB
        }
    });

    const [activeComment, setActiveComment] = useState({
        isOpen: false,
        field: null, // 'nama_kegiatan', 'deskripsi_kegiatan', or child table identifier
        type: 'kak', // 'kak' | 'anak'
        table: null, // e.g., 't_kak_anggaran', only for type='anak'
        id: null, // primary key ID, only for type='anak'
        title: '',
        initialValue: '',
        isPastNote: false
    });

    const openCommentModal = (fieldInfo, title, initialValue = '', isPastNote = false) => {
        setActiveComment({
            isOpen: true,
            ...fieldInfo,
            title,
            initialValue,
            isPastNote
        });
    };

    const handleSaveComment = (note) => {
        setRevisiData(prev => {
            const newData = { ...prev };
            if (activeComment.type === 'kak') {
                if (note.trim() === '') {
                    delete newData.catatan_kak[activeComment.field];
                } else {
                    newData.catatan_kak[activeComment.field] = note;
                }
            } else if (activeComment.type === 'anak') {
                const tableArray = [...newData.anak[activeComment.table]];
                const existingIndex = tableArray.findIndex(item => item.id === activeComment.id);

                // Determine the correct field name for the child table
                const noteCol = activeComment.table === 't_kak_manfaat' ? 'catatan_manfaat' : 'catatan_verifikator';

                if (note.trim() === '') {
                    if (existingIndex > -1) tableArray.splice(existingIndex, 1);
                } else {
                    if (existingIndex > -1) {
                        tableArray[existingIndex][noteCol] = note;
                    } else {
                        tableArray.push({ id: activeComment.id, [noteCol]: note });
                    }
                }
                newData.anak[activeComment.table] = tableArray;
            }
            return newData;
        });
    };



    const submitRevision = () => {
        if (!revisiData.catatan && Object.keys(revisiData.catatan_kak).length === 0 && Object.values(revisiData.anak).every(arr => arr.length === 0)) {
            CustomSwal.fire({
                icon: 'warning',
                title: 'Data Kosong',
                text: 'Silakan isi setidaknya satu catatan revisi (pada form atau general) sebelum mengirim permintaan revisi.'
            });
            return;
        }

        CustomSwal.fire({
            title: 'Minta Revisi?',
            text: "KAK akan dikembalikan ke Pengusul dengan catatan revisi yang telah dibuat.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Minta Revisi',
            cancelButtonText: 'Batal',
            customClass: { confirmButton: 'px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-orange-500/30 font-semibold mx-2' }
        }).then((result) => {
            if (result.isConfirmed) {
                const finalPayload = {
                    ...revisiData
                };

                router.post(route('kak.revise', kak.kak_id), finalPayload, {
                    onSuccess: () => {
                        CustomSwal.fire({ title: 'Berhasil!', text: 'Permintaan revisi berhasil dikirim.', icon: 'success' }).then(() => {
                            router.get(route('kak.index'));
                        });
                    }
                });
            }
        });
    };

    const submitRejection = () => {
        CustomSwal.fire({
            title: 'Tolak KAK?',
            html: '<textarea id="swal-catatan-tolak" class="w-full rounded-xl border-gray-200 text-sm focus:border-red-400 focus:ring-0 min-h-[100px] p-3" placeholder="Masukkan alasan penolakan di sini..."></textarea>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tolak!',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const catatan = CustomSwal.getPopup().querySelector('#swal-catatan-tolak').value;
                if (!catatan || catatan.trim() === '') {
                    CustomSwal.showValidationMessage('Alasan penolakan wajib diisi');
                    return false;
                }
                if (catatan.trim().length < 5) {
                    CustomSwal.showValidationMessage('Alasan penolakan minimal 5 karakter');
                    return false;
                }
                return { catatan: catatan };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('kak.reject', kak.kak_id), { catatan: result.value.catatan }, {
                    onSuccess: () => {
                        CustomSwal.fire({ title: 'Ditolak!', text: 'KAK berhasil ditolak.', icon: 'success' }).then(() => {
                            router.get(route('kak.index'));
                        });
                    }
                });
            }
        });
    };

    const submitApproval = () => {
        const optionsHtml = mata_anggaran.map(ma =>
            `<option value="${ma.mata_anggaran_id}">${ma.kode_anggaran} — ${ma.nama_sumber_dana}</option>`
        ).join('');

        CustomSwal.fire({
            title: `<span style="font-size:2rem;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">Setujui KAK?</span>`,
            html: `
                <p style="font-size:0.8rem;color:#64748b;margin-bottom:1.2rem;line-height:1.5;">
                    Tentukan alokasi mata anggaran untuk kegiatan ini. KAK akan segera disetujui dan dapat dilanjutkan ke tahap pengajuan kegiatan.
                </p>

                <div style="text-align:left;display:flex;flex-direction:column;gap:1rem;">

                    <div>
                        <label style="display:block;font-size:0.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">
                            Kode Mata Anggaran
                        </label>
                        <select id="swal-select-anggaran" style="
                            width:100%;padding:10px 14px;border-radius:12px;
                            border:2px solid #e2e8f0;background:#f8fafc;
                            font-size:0.875rem;color:#334155;outline:none;
                            transition:border-color .2s;cursor:pointer;
                            appearance:auto;
                        ">
                            <option value="">— Pilih Kode Anggaran —</option>
                            ${optionsHtml}
                            <option value="new">✚ Tambah Kode MAK Baru</option>
                        </select>
                    </div>

                    <div id="new-kode-container" style="display:none;padding:12px;background:#f0fdf4;border:1.5px dashed #86efac;border-radius:12px;">
                        <label style="display:block;font-size:0.72rem;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Kode MAK Baru</label>
                        <input id="swal-kode-anggaran" placeholder="Contoh: 023.14.WA.4132..." style="
                            width:100%;padding:10px 14px;border-radius:10px;
                            border:2px solid #bbf7d0;background:white;
                            font-size:0.875rem;color:#0f172a;outline:none;box-sizing:border-box;
                        ">
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div>
                            <label style="display:block;font-size:0.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Nama Sumber Dana</label>
                            <input id="swal-sumber-dana" placeholder="Contoh: PNBP" style="
                                width:100%;padding:10px 14px;border-radius:12px;
                                border:2px solid #e2e8f0;background:#f8fafc;
                                font-size:0.875rem;color:#334155;outline:none;box-sizing:border-box;
                            ">
                        </div>
                        <div>
                            <label style="display:block;font-size:0.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Tahun Anggaran</label>
                            <input id="swal-tahun-anggaran" type="number" value="${new Date().getFullYear()}" style="
                                width:100%;padding:10px 14px;border-radius:12px;
                                border:2px solid #e2e8f0;background:#f8fafc;
                                font-size:0.875rem;color:#334155;outline:none;box-sizing:border-box;
                            ">
                        </div>
                    </div>

                    <div>
                        <label style="display:block;font-size:0.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Total Pagu (Rp)</label>
                        <input id="swal-total-pagu" type="number" placeholder="Contoh: 50000000" style="
                            width:100%;padding:10px 14px;border-radius:12px;
                            border:2px solid #e2e8f0;background:#f8fafc;
                            font-size:0.875rem;color:#334155;outline:none;box-sizing:border-box;
                        ">
                    </div>
                </div>
            `,
            didOpen: () => {
                const selectEl = document.getElementById('swal-select-anggaran');
                const newKodeContainer = document.getElementById('new-kode-container');
                const kodeInput = document.getElementById('swal-kode-anggaran');
                const sumberInput = document.getElementById('swal-sumber-dana');
                const tahunInput = document.getElementById('swal-tahun-anggaran');
                const paguInput = document.getElementById('swal-total-pagu');
                const maData = mata_anggaran;

                // Focus ring on inputs
                [selectEl, sumberInput, tahunInput, paguInput].forEach(el => {
                    el?.addEventListener('focus', () => { if (el) el.style.borderColor = '#06b6d4'; });
                    el?.addEventListener('blur', () => { if (el) el.style.borderColor = '#e2e8f0'; });
                });

                selectEl.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (val === 'new') {
                        newKodeContainer.style.display = 'block';
                        kodeInput.value = '';
                        sumberInput.value = '';
                        tahunInput.value = new Date().getFullYear();
                        paguInput.value = '';
                        sumberInput.disabled = false;
                        tahunInput.disabled = false;
                        paguInput.disabled = false;
                    } else if (val !== '') {
                        newKodeContainer.style.display = 'none';
                        const selectedMA = maData.find(ma => ma.mata_anggaran_id == val);
                        if (selectedMA) {
                            kodeInput.value = selectedMA.kode_anggaran;
                            sumberInput.value = selectedMA.nama_sumber_dana;
                            tahunInput.value = selectedMA.tahun_anggaran;
                            paguInput.value = selectedMA.total_pagu;
                            sumberInput.disabled = true;
                            tahunInput.disabled = true;
                            paguInput.disabled = true;
                            // Style disabled
                            [sumberInput, tahunInput, paguInput].forEach(el => {
                                el.style.background = '#f1f5f9';
                                el.style.color = '#94a3b8';
                            });
                        }
                    } else {
                        newKodeContainer.style.display = 'none';
                        kodeInput.value = '';
                        sumberInput.value = '';
                        tahunInput.value = new Date().getFullYear();
                        paguInput.value = '';
                        sumberInput.disabled = false;
                        tahunInput.disabled = false;
                        paguInput.disabled = false;
                        [sumberInput, tahunInput, paguInput].forEach(el => {
                            el.style.background = '#f8fafc';
                            el.style.color = '#334155';
                        });
                    }
                });
            },
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
            padding: '2rem',
            customClass: {
                popup: 'rounded-3xl border-none shadow-2xl',
                title: 'text-lg font-black',
                htmlContainer: 'text-left',
                confirmButton: 'px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold uppercase tracking-wider mx-2',
                cancelButton: 'px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 font-bold uppercase tracking-wider mx-2',
            },
            preConfirm: () => {
                const selectVal = document.getElementById('swal-select-anggaran').value;
                const kode = document.getElementById('swal-kode-anggaran').value;
                const sumber = document.getElementById('swal-sumber-dana').value;
                const tahun = document.getElementById('swal-tahun-anggaran').value;
                const pagu = document.getElementById('swal-total-pagu').value;

                if (!selectVal) {
                    CustomSwal.showValidationMessage('⚠ Silakan pilih Kode Anggaran terlebih dahulu!');
                    return false;
                }

                if (selectVal === 'new') {
                    if (!kode || !sumber || !tahun || !pagu) {
                        CustomSwal.showValidationMessage('⚠ Semua field wajib diisi untuk kode anggaran baru!');
                        return false;
                    }
                }

                return {
                    mata_anggaran_id: selectVal === 'new' ? null : selectVal,
                    kode_anggaran: kode,
                    nama_sumber_dana: sumber,
                    tahun_anggaran: parseInt(tahun, 10),
                    total_pagu: parseFloat(pagu)
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('kak.approve', kak.kak_id), result.value, {
                    onSuccess: () => {
                        CustomSwal.fire({
                            title: 'KAK Disetujui!',
                            text: 'KAK berhasil disetujui dan siap dilanjutkan ke tahap pengajuan kegiatan.',
                            icon: 'success',
                            confirmButtonColor: '#10b981',
                            customClass: {
                                popup: 'rounded-3xl border-none shadow-2xl',
                                confirmButton: 'rounded-xl px-6 py-2.5 text-sm font-bold',
                            }
                        }).then(() => {
                            router.get(route('kak.index'));
                        });
                    }
                });
            }
        });
    };

    const hasNewComments = revisiData.catatan.trim() !== '' ||
        Object.keys(revisiData.catatan_kak).length > 0 ||
        Object.values(revisiData.anak).some(arr => arr.length > 0);

    // ------------------------------------

    const nextStep = () => {
        if (readOnly) {
            const currentSubIndex = step1Menu.indexOf(subStep);
            if (currentStep === 1 && currentSubIndex < step1Menu.length - 1) {
                setSubStep(step1Menu[currentSubIndex + 1]);
                return;
            }
            setCurrentStep(prev => Math.min(prev + 1, 3));
            return;
        }

        if (currentStep === 1) {
            const stepErrors = validateSubStep(subStep);
            if (Object.keys(stepErrors).length > 0) {
                setClientErrors(prev => ({ ...prev, ...stepErrors }));
                CustomSwal.fire({
                    title: 'Mohon Lengkapi Data',
                    text: 'Terdapat input yang kosong atau tidak valid di bagian ini. Silakan periksa kembali.',
                    icon: 'warning'
                });
                return;
            }

            const currentSubIndex = step1Menu.indexOf(subStep);
            if (currentSubIndex < step1Menu.length - 1) {
                setSubStep(step1Menu[currentSubIndex + 1]);
                return;
            }
        } else if (currentStep === 2) {
            const stepErrors = validateStep2();
            if (Object.keys(stepErrors).length > 0) {
                setClientErrors(prev => ({ ...prev, ...stepErrors }));
                CustomSwal.fire({
                    title: 'Mohon Lengkapi Data',
                    text: 'Terdapat input IKU yang kosong atau tidak valid. Silakan periksa kembali.',
                    icon: 'warning'
                });
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handleStepClick = (targetStep) => {
        if (readOnly) {
            setCurrentStep(targetStep);
            return;
        }

        if (targetStep > currentStep) {
            let errorsList = {};
            if (currentStep === 1) {
                step1Menu.forEach(sub => {
                    errorsList = { ...errorsList, ...validateSubStep(sub) };
                });
            } else if (currentStep === 2) {
                errorsList = { ...errorsList, ...validateStep2() };
            }

            if (Object.keys(errorsList).length > 0) {
                setClientErrors(prev => ({ ...prev, ...errorsList }));
                CustomSwal.fire({
                    title: 'Mohon Lengkapi Data',
                    text: 'Terdapat input yang kosong atau tidak valid. Silakan periksa kembali.',
                    icon: 'warning'
                });
                return;
            }
        }
        setCurrentStep(targetStep);
    };

    const prevStep = () => {
        if (currentStep === 1) {
            const currentSubIndex = step1Menu.indexOf(subStep);
            if (currentSubIndex > 0) {
                setSubStep(step1Menu[currentSubIndex - 1]);
                return;
            }
        } else if (currentStep === 2) {
            setSubStep('kurun-waktu');
        }
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const getDurationText = (start, end) => {
        if (!start || !end) return '';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

        if (diffDays < 30) return `${diffDays} Hari`;
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        return `${months} Bulan ${days > 0 ? `${days} Hari` : ''}`;
    };

    // Cleanup data before sending to server
    transform((data) => ({
        ...data,
        kak: {
            ...data.kak,
            kurun_waktu_pelaksanaan: getDurationText(data.kak.tanggal_mulai, data.kak.tanggal_selesai),
            manfaat: data.kak.manfaat.map(({ value, manfaat_id }) => ({
                value,
                ...(manfaat_id ? { manfaat_id } : {})
            })),
            tahapan_pelaksanaan: data.kak.tahapan_pelaksanaan.map(({ _id, ...rest }, index) => ({
                ...rest,
                urutan: index + 1
            })), // Remove _id and add urutan
            indikator_kinerja: data.kak.indikator_kinerja.map(({ _id, ...rest }) => rest), // Strip frontend-only _id key
        },
        target_iku: data.target_iku.map(({ _id, ...rest }) => rest),
        rab: data.rab.map(({ _id, ...rest }) => rest),
    }));

    const handlePreviewPdf = async (e, url) => {
        e.preventDefault();
        setIsPreviewLoading(true);
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
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Error previewing PDF:', error);
            CustomSwal.fire({ title: 'Gagal preview', text: 'PDF tidak bisa ditampilkan saat ini.', icon: 'error' });
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const closePreviewPdf = () => {
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
        }

        setPreviewBlobUrl(null);
        setIsPreviewOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Run all client-side validations across all steps
        let allErrors = {};
        
        // Step 1 sub-steps
        step1Menu.forEach(menu => {
            allErrors = { ...allErrors, ...validateSubStep(menu) };
        });
        // Step 2
        allErrors = { ...allErrors, ...validateStep2() };
        // Step 3
        allErrors = { ...allErrors, ...validateStep3() };

        if (Object.keys(allErrors).length > 0) {
            setClientErrors(allErrors);
            
            const errorMessages = [];
            
            if (allErrors['kak.nama_kegiatan']) errorMessages.push(`<strong>Nama Kegiatan:</strong> ${allErrors['kak.nama_kegiatan']}`);
            if (allErrors['kak.tipe_kegiatan_id']) errorMessages.push(`<strong>Tipe Kegiatan:</strong> ${allErrors['kak.tipe_kegiatan_id']}`);
            if (allErrors['kak.deskripsi_kegiatan']) errorMessages.push(`<strong>Gambaran Umum:</strong> ${allErrors['kak.deskripsi_kegiatan']}`);
            if (allErrors['kak.sasaran_utama']) errorMessages.push(`<strong>Sasaran Utama:</strong> ${allErrors['kak.sasaran_utama']}`);
            
            let hasManfaatErr = false;
            Object.keys(allErrors).forEach(k => {
                if (k.startsWith('kak.manfaat.') && !hasManfaatErr) {
                    errorMessages.push(`<strong>Output / Manfaat:</strong> Ada baris output yang belum diisi dengan benar.`);
                    hasManfaatErr = true;
                }
            });
            
            if (allErrors['kak.metode_pelaksanaan']) errorMessages.push(`<strong>Metode Pelaksanaan:</strong> ${allErrors['kak.metode_pelaksanaan']}`);
            
            let hasTahapanErr = false;
            Object.keys(allErrors).forEach(k => {
                if (k.startsWith('kak.tahapan_pelaksanaan.') && !hasTahapanErr) {
                    errorMessages.push(`<strong>Tahapan Pelaksanaan:</strong> Ada baris tahapan yang belum diisi dengan benar.`);
                    hasTahapanErr = true;
                }
            });
            
            let hasIndikatorErr = false;
            Object.keys(allErrors).forEach(k => {
                if (k.startsWith('kak.indikator_kinerja.') && !hasIndikatorErr) {
                    errorMessages.push(`<strong>Indikator Kinerja Kegiatan:</strong> Ada baris indikator yang belum diisi dengan benar.`);
                    hasIndikatorErr = true;
                }
            });
            
            if (allErrors['kak.tanggal_mulai']) errorMessages.push(`<strong>Tanggal Mulai:</strong> ${allErrors['kak.tanggal_mulai']}`);
            if (allErrors['kak.tanggal_selesai']) errorMessages.push(`<strong>Tanggal Selesai:</strong> ${allErrors['kak.tanggal_selesai']}`);
            if (allErrors['kak.lokasi']) errorMessages.push(`<strong>Lokasi:</strong> ${allErrors['kak.lokasi']}`);
            
            let hasIkuErr = false;
            Object.keys(allErrors).forEach(k => {
                if (k.startsWith('target_iku.') && !hasIkuErr) {
                    errorMessages.push(`<strong>Indikator Kinerja Utama (IKU):</strong> Ada baris IKU yang belum diisi dengan benar.`);
                    hasIkuErr = true;
                }
            });
            
            let hasRabErr = false;
            Object.keys(allErrors).forEach(k => {
                if (k.startsWith('rab.') && !hasRabErr) {
                    errorMessages.push(`<strong>Rencana Anggaran Biaya (RAB):</strong> Ada baris RAB yang belum diisi dengan benar.`);
                    hasRabErr = true;
                }
            });

            const htmlErrorList = `
                <div class="text-left bg-red-50 p-4 rounded-xl border border-red-200 mt-3 text-xs md:text-sm text-red-700 max-h-60 overflow-y-auto">
                    <ul class="list-disc list-inside space-y-1.5">
                        ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                </div>
            `;

            CustomSwal.fire({
                title: 'Data Tidak Valid',
                html: `<p class="text-sm text-gray-500">Silakan lengkapi atau perbaiki inputan berikut sebelum menyimpan:</p>${htmlErrorList}`,
                icon: 'error',
                confirmButtonText: 'Perbaiki'
            });
            return;
        }

        const submitMethod = isEdit ? put : post;
        const submitUrl = isEdit ? route('kak.update', kak.kak_id) : route('kak.store');

        submitMethod(submitUrl, {
            onSuccess: () => {
                CustomSwal.fire({
                    title: 'Berhasil!',
                    text: isEdit ? 'KAK berhasil diperbarui.' : 'KAK berhasil dibuat.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    router.get(route('kak.index'));
                });
            },
            onError: (errors) => {
                console.error("Validation Errors:", errors);
                
                const errorMessages = Object.values(errors);
                const htmlErrorList = `
                    <div class="text-left bg-red-50 p-4 rounded-xl border border-red-200 mt-3 text-xs md:text-sm text-red-700 max-h-60 overflow-y-auto">
                        <ul class="list-disc list-inside space-y-1.5">
                            ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                        </ul>
                    </div>
                `;

                CustomSwal.fire({
                    title: 'Gagal Menyimpan KAK',
                    html: `<p class="text-sm text-gray-500">Terdapat kesalahan pada inputan Anda. Silakan cek dan perbaiki kembali:</p>${htmlErrorList}`,
                    icon: 'error',
                    confirmButtonText: 'Perbaiki'
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEdit ? 'Edit KAK' : 'Usulan KAK'} />

            <div className="pt-4 pb-8 sm:py-8 relative min-h-screen">
                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[95%] space-y-4 sm:space-y-8">
                    <PageHeader 
                        title={readOnly ? 'Detail KAK' : (isEdit ? 'Edit KAK' : 'Usulan KAK Baru')} 
                        description={readOnly ? 'Informasi rincian Kerangka Acuan Kerja.' : (isEdit ? 'Perbarui informasi dan rincian Kerangka Acuan Kerja yang telah dibuat.' : 'Lengkapi informasi di bawah ini untuk membuat usulan Kerangka Acuan Kerja (KAK) baru.')}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4 sm:mb-8 w-full">
                        <div className="hidden xl:block"></div>
                        
                        <div className="flex justify-center">
                            <WizardProgress currentStep={currentStep} onStepClick={handleStepClick} />
                        </div>
                        
                        <div className="flex justify-center xl:justify-end">
                            {readOnly && kak && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', kak.kak_id))}
                                        disabled={isPreviewLoading}
                                        className={`px-4 py-2 border rounded-xl transition-colors shadow-sm flex items-center gap-2 text-sm font-semibold ${
                                            isPreviewLoading
                                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait'
                                                : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
                                        }`}
                                    >
                                        {isPreviewLoading ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        )}
                                        {isPreviewLoading ? 'Memuat...' : 'Preview PDF'}
                                    </button>
                                    <a
                                        href={route('kak.pdf.download', kak.kak_id)}
                                        className="px-4 py-2 bg-white border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-2 text-sm font-semibold"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Download PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {currentStep === 1 && (
                                    <Step1Kak
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        tipe_kegiatan={tipe_kegiatan}
                                        readOnly={readOnly}
                                        subStep={subStep}
                                        setSubStep={setSubStep}
                                        // Revision props
                                        isVerifikator={isVerifikator}
                                        isPengusul={!isVerifikator}
                                        isPengusulFixing={isPengusulFixing}
                                        openCommentModal={openCommentModal}
                                        revisiData={revisiData}
                                        originalKak={kak}
                                        clientErrors={clientErrors}
                                        handleBlur={handleBlur}
                                        handleFieldChange={handleFieldChange}
                                    />
                                )}

                                {currentStep === 2 && (
                                    <Step2Iku
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        iku={iku}
                                        satuan={satuan}
                                        readOnly={readOnly}
                                        // Revision props
                                        isVerifikator={isVerifikator}
                                        isPengusul={!isVerifikator}
                                        isPengusulFixing={isPengusulFixing}
                                        openCommentModal={openCommentModal}
                                        revisiData={revisiData}
                                        originalKak={kak}
                                        clientErrors={clientErrors}
                                        handleBlur={handleBlur}
                                        handleFieldChange={handleFieldChange}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <Step3Rab
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        kategori_belanja={kategori_belanja}
                                        satuan={satuan}
                                        readOnly={readOnly}
                                        // Revision props
                                        isVerifikator={isVerifikator}
                                        isPengusul={!isVerifikator}
                                        isPengusulFixing={isPengusulFixing}
                                        openCommentModal={openCommentModal}
                                        revisiData={revisiData}
                                        originalKak={kak}
                                        clientErrors={clientErrors}
                                        handleBlur={handleBlur}
                                        handleFieldChange={handleFieldChange}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex flex-wrap justify-between items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2
                                ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                            >
                                <ChevronLeft size={18} /> Sebelumnya
                            </button>

                            <div className="flex gap-4">
                                {currentStep < 3 ? (
                                    <button
                                        key="next-btn"
                                        type="button"
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-cyan-500 text-white rounded-xl shadow-lg hover:bg-cyan-600 hover:shadow-cyan-200 transition-all font-semibold flex items-center gap-2"
                                    >
                                        Selanjutnya <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    !readOnly && (
                                        <button
                                            key="submit-btn"
                                            type="submit"
                                            disabled={processing}
                                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} /> Simpan KAK
                                                </>
                                            )}
                                        </button>
                                    )
                                )}

                                {/* Verifikator Revision/Accept Action */}
                                {isVerifikator && currentStep === 3 && (
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={submitRejection}
                                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 transition-all duration-300 font-bold flex items-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            Tolak KAK
                                        </button>
                                        {hasNewComments ? (
                                            <button
                                                type="button"
                                                onClick={submitRevision}
                                                className="px-8 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 transition-all duration-300 font-bold flex items-center gap-2"
                                            >
                                                <FileWarning size={18} />
                                                Minta Revisi
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={submitApproval}
                                                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 font-bold flex items-center gap-2"
                                            >
                                                <Check size={18} />
                                                Terima KAK
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            {/* Comment Modal for Verifikator / Pengusul view */}
            <CommentModal
                isOpen={activeComment.isOpen}
                onClose={() => setActiveComment(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveComment}
                title={activeComment.title}
                initialValue={activeComment.initialValue}
                isPastNote={activeComment.isPastNote}
                isReadOnly={!isVerifikator}
                isPengusul={!isVerifikator}
            />

            {isPreviewOpen && previewBlobUrl && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-2 sm:p-4 md:p-8">
                    <div className="h-full w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm md:text-base font-semibold text-gray-800">Preview PDF</h3>
                            <button
                                type="button"
                                onClick={closePreviewPdf}
                                className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                            >
                                Tutup
                            </button>
                        </div>

                        <iframe
                            src={previewBlobUrl}
                            title="Preview PDF"
                            className="w-full flex-1"
                        />
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
