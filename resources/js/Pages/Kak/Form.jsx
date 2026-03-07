import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './Components/WizardProgress';
import Step1Kak from './Partials/Step1Kak';
import Step2Iku from './Partials/Step2Iku';
import Step3Rab from './Partials/Step3Rab';
import CommentModal from './Components/CommentModal';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Save, Check, FileWarning } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function KakForm({ auth, kak, tipe_kegiatan, satuan, iku, kategori_belanja, mata_anggaran = [], readOnly = false }) {
    const isEdit = !!kak;
    const isVerifikator = auth.user.role_id === 2 && readOnly; // Verifikator viewing
    const isPengusulFixing = auth.user.role_id === 3 && kak?.status_id === 5; // Pengusul fixing revision

    // Core Navigation State
    const [currentStep, setCurrentStep] = useState(1);
    const [subStep, setSubStep] = useState('gambaran-umum');

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
            Swal.fire({
                icon: 'warning',
                title: 'Data Kosong',
                text: 'Silakan isi setidaknya satu catatan revisi (pada form atau general) sebelum mengirim permintaan revisi.'
            });
            return;
        }

        Swal.fire({
            title: 'Minta Revisi?',
            text: "KAK akan dikembalikan ke Pengusul dengan catatan revisi yang telah dibuat.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Minta Revisi',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const finalPayload = {
                    ...revisiData
                };

                router.post(route('kak.revise', kak.kak_id), finalPayload, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Permintaan revisi berhasil dikirim.', 'success').then(() => {
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

        Swal.fire({
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
                confirmButton: 'rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider',
                cancelButton: 'rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider',
            },
            preConfirm: () => {
                const selectVal = document.getElementById('swal-select-anggaran').value;
                const kode = document.getElementById('swal-kode-anggaran').value;
                const sumber = document.getElementById('swal-sumber-dana').value;
                const tahun = document.getElementById('swal-tahun-anggaran').value;
                const pagu = document.getElementById('swal-total-pagu').value;

                if (!selectVal) {
                    Swal.showValidationMessage('⚠ Silakan pilih Kode Anggaran terlebih dahulu!');
                    return false;
                }

                if (selectVal === 'new') {
                    if (!kode || !sumber || !tahun || !pagu) {
                        Swal.showValidationMessage('⚠ Semua field wajib diisi untuk kode anggaran baru!');
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
                        Swal.fire({
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
        // Basic Client-side Validation before proceeding
        if (currentStep === 1) {
            if (!data.kak.nama_kegiatan || !data.kak.tipe_kegiatan_id) {
                Swal.fire('Mohon Lengkapi', 'Nama Kegiatan dan Tipe Kegiatan wajib diisi.', 'warning');
                return;
            }

            const currentSubIndex = step1Menu.indexOf(subStep);
            if (currentSubIndex < step1Menu.length - 1) {
                setSubStep(step1Menu[currentSubIndex + 1]);
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
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

    // Cleanup data before sending to server
    transform((data) => ({
        ...data,
        kak: {
            ...data.kak,
            manfaat: data.kak.manfaat.map(({ value, manfaat_id }) => ({
                manfaat: value,
                ...(manfaat_id ? { manfaat_id } : {})
            })),
            tahapan_pelaksanaan: data.kak.tahapan_pelaksanaan.map(({ _id, ...rest }) => rest), // Remove _id
            indikator_kinerja: data.kak.indikator_kinerja.map(({ _id, ...rest }) => rest), // Strip frontend-only _id key
        },
        target_iku: data.target_iku.map(({ _id, ...rest }) => rest),
        rab: data.rab.map(({ _id, ...rest }) => rest),
    }));

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitMethod = isEdit ? put : post;
        const submitUrl = isEdit ? route('kak.update', kak.kak_id) : route('kak.store');

        submitMethod(submitUrl, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: isEdit ? 'KAK berhasil diperbarui.' : 'KAK berhasil dibuat.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            },
            onError: (errors) => {
                console.error("Submission Errors:", errors);
                Swal.fire('Gagal!', 'Terdapat kesalahan pada inputan Anda. Silakan cek kembali.', 'error');
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title={isEdit ? 'Edit KAK' : 'Usulan KAK Baru'} />}
        >
            <Head title={isEdit ? 'Edit KAK' : 'Usulan KAK'} />

            <div className="py-12 bg-gradient-to-br from-gray-50 to-cyan-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <WizardProgress currentStep={currentStep} onStepClick={setCurrentStep} />

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
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
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
                                    <>
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
                                    </>
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

        </AuthenticatedLayout>
    );
}
