import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WizardProgress from './Components/WizardProgress';
import Step1Kak from './Partials/Step1Kak';
import Step2Iku from './Partials/Step2Iku';
import Step3Rab from './Partials/Step3Rab';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';

export default function KakForm({ auth, kak, tipe_kegiatan, satuan, iku, kategori_belanja, readOnly = false }) {
    const isEdit = !!kak;
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
            manfaat: kak?.manfaat?.map(m => ({ _id: Math.random(), value: m.deskripsi })) || [{ _id: Math.random(), value: '' }],
            metode_pelaksanaan: kak?.metode_pelaksanaan || '',
            tahapan_pelaksanaan: kak?.tahapan?.map(t => ({ _id: Math.random(), nama_tahapan: t.nama_tahapan })) || [{ _id: Math.random(), nama_tahapan: '' }],
            indikator_kinerja: kak?.indikator_kinerja?.length > 0
                ? kak.indikator_kinerja.map(ik => ({ _id: Math.random(), deskripsi_target: ik.deskripsi_target, deskripsi_indikator: ik.deskripsi_indikator }))
                : [{ _id: Math.random(), deskripsi_target: '', deskripsi_indikator: '' }],
            tanggal_mulai: kak?.tanggal_mulai || '',
            tanggal_selesai: kak?.tanggal_selesai || '',
        },
        target_iku: kak?.targets?.map(t => ({
            _id: Math.random(),
            iku_id: t.iku_id,
            target: t.target,
            satuan_id: t.satuan_id
        })) || [{ _id: Math.random(), iku_id: '', target: '', satuan_id: '' }], // Ensure min 1 item
        rab: kak?.anggaran?.map(a => ({
            _id: Math.random(),
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
            manfaat: data.kak.manfaat.map(m => m.value), // Unwrap benefit strings
            tahapan_pelaksanaan: data.kak.tahapan_pelaksanaan.map(({ _id, ...rest }) => rest), // Remove _id
            // indikator_kinerja: data.kak.indikator_kinerja.map(({ _id, ...rest }) => rest), // If used later
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{isEdit ? 'Edit KAK' : 'Usulan KAK Baru'}</h2>}
        >
            <Head title={isEdit ? 'Edit KAK' : 'Usulan KAK'} />

            <div className="py-12 bg-gradient-to-br from-gray-50 to-cyan-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <WizardProgress currentStep={currentStep} />

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
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2
                                ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                            >
                                <ChevronLeft size={18} /> Sebelumnya
                            </button>

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
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
