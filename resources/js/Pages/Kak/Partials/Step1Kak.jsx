import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpectacularBorder from '../Components/SpectacularBorder';
import CommentIcon from '../Components/CommentIcon';
import { FileText, Users, Target, ChartBar, Calendar, Trash, Plus, AlertCircle } from 'lucide-react';
import Datepicker from "react-tailwindcss-datepicker";

export default function Step1Kak({
    data, setData, errors, readOnly = false, tipe_kegiatan = [],
    subStep, setSubStep,
    isVerifikator = false, isPengusul = false, isPengusulFixing = false,
    openCommentModal = () => { }, revisiData = { catatan_kak: {}, anak: {} }, originalKak = null
}) {

    const updateKak = (field, value) => {
        setData('kak', { ...data.kak, [field]: value });
    };

    // Helper to calculate duration for Kurun Waktu display
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

    // Dynamic Field Helpers
    const addManfaat = () => setData('kak', { ...data.kak, manfaat: [...data.kak.manfaat, { _id: Math.random(), value: '' }] });
    const removeManfaat = (index) => {
        if (data.kak.manfaat.length > 1) {
            setData('kak', { ...data.kak, manfaat: data.kak.manfaat.filter((_, i) => i !== index) });
        }
    };
    const updateManfaat = (index, value) => {
        const newManfaat = [...data.kak.manfaat];
        newManfaat[index].value = value; // Update value property
        setData('kak', { ...data.kak, manfaat: newManfaat });
    };

    const addTahapan = () => setData('kak', { ...data.kak, tahapan_pelaksanaan: [...data.kak.tahapan_pelaksanaan, { _id: Math.random(), nama_tahapan: '' }] });
    const removeTahapan = (index) => {
        if (data.kak.tahapan_pelaksanaan.length > 1) {
            setData('kak', { ...data.kak, tahapan_pelaksanaan: data.kak.tahapan_pelaksanaan.filter((_, i) => i !== index) });
        }
    };
    const updateTahapan = (index, value) => {
        const newItems = [...data.kak.tahapan_pelaksanaan];
        newItems[index].nama_tahapan = value;
        setData('kak', { ...data.kak, tahapan_pelaksanaan: newItems });
    };

    const addIndikator = () => setData('kak', { ...data.kak, indikator_kinerja: [...data.kak.indikator_kinerja, { _id: Math.random(), bulan_indikator: '', deskripsi_target: '', persentase_target: '' }] });
    const removeIndikator = (index) => {
        if (data.kak.indikator_kinerja.length > 1) {
            setData('kak', { ...data.kak, indikator_kinerja: data.kak.indikator_kinerja.filter((_, i) => i !== index) });
        }
    };
    const updateIndikator = (index, field, value) => {
        const newItems = [...data.kak.indikator_kinerja];
        newItems[index][field] = value;
        setData('kak', { ...data.kak, indikator_kinerja: newItems });
    };

    const menuItems = [
        { id: 'gambaran-umum', label: 'Gambaran Umum', icon: FileText },
        { id: 'penerima-manfaat', label: 'Penerima Manfaat', icon: Users },
        { id: 'strategi-pencapaian', label: 'Strategi Pencapaian', icon: Target },
        { id: 'indikator-kinerja', label: 'Indikator Kinerja', icon: ChartBar },
        { id: 'kurun-waktu', label: 'Kurun Waktu Pelaksanaan', icon: Calendar },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Menu */}
            <div className="w-full lg:w-72 shrink-0">
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 sticky top-4 p-1">
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setSubStep(item.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-left min-w-[200px] lg:w-full border-2
                                ${subStep === item.id
                                        ? 'bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm translate-x-2'
                                        : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${subStep === item.id ? 'bg-cyan-400 text-white shadow-cyan-200' : 'bg-gray-200 text-gray-400'}`}>
                                    <IconComponent size={18} />
                                </div>
                                <span className="font-semibold text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={subStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SpectacularBorder active={true}>

                            {/* --- Gambaran Umum --- */}
                            {subStep === 'gambaran-umum' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Gambaran Umum</h4>

                                    {/* Nama Kegiatan */}
                                    <div className="relative group/field">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kegiatan <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                value={data.kak.nama_kegiatan || ''}
                                                onChange={(e) => updateKak('nama_kegiatan', e.target.value)}
                                                placeholder="Masukkan nama kegiatan..."
                                                disabled={readOnly && !isPengusulFixing}
                                            />
                                            {/* Revision Comments */}
                                            {(isVerifikator || isPengusulFixing) && (
                                                <CommentIcon
                                                    hasComment={!!revisiData.catatan_kak?.nama_kegiatan || !!originalKak?.catatan_nama_kegiatan}
                                                    isPastNote={!!originalKak?.catatan_nama_kegiatan && !revisiData.catatan_kak?.nama_kegiatan}
                                                    isPengusul={isPengusul}
                                                    onClick={() => openCommentModal(
                                                        { field: 'nama_kegiatan', type: 'kak' },
                                                        'Catatan Nama Kegiatan',
                                                        revisiData.catatan_kak?.nama_kegiatan || originalKak?.catatan_nama_kegiatan || '',
                                                        !!originalKak?.catatan_nama_kegiatan && !revisiData.catatan_kak?.nama_kegiatan
                                                    )}
                                                />
                                            )}
                                        </div>
                                        {errors['kak.nama_kegiatan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.nama_kegiatan']}</p>}
                                    </div>

                                    {/* Tipe Kegiatan (Select) */}
                                    <div className="relative group/field">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tipe Kegiatan <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                value={data.kak.tipe_kegiatan_id || ''}
                                                onChange={(e) => updateKak('tipe_kegiatan_id', e.target.value)}
                                                disabled={readOnly && !isPengusulFixing}
                                            >
                                                <option value="">Pilih Tipe Kegiatan</option>
                                                {tipe_kegiatan.map(t => (
                                                    <option key={t.tipe_kegiatan_id} value={t.tipe_kegiatan_id}>
                                                        {t.nama_tipe}
                                                    </option>
                                                ))}
                                            </select>
                                            {/* Revision Comments */}
                                            {(isVerifikator || isPengusulFixing) && (
                                                <CommentIcon
                                                    hasComment={!!revisiData.catatan_kak?.tipe_kegiatan_id || !!originalKak?.catatan_tipe_kegiatan}
                                                    isPastNote={!!originalKak?.catatan_tipe_kegiatan && !revisiData.catatan_kak?.tipe_kegiatan_id}
                                                    isPengusul={isPengusul}
                                                    onClick={() => openCommentModal(
                                                        { field: 'tipe_kegiatan_id', type: 'kak' },
                                                        'Catatan Tipe Kegiatan',
                                                        revisiData.catatan_kak?.tipe_kegiatan_id || originalKak?.catatan_tipe_kegiatan || '',
                                                        !!originalKak?.catatan_tipe_kegiatan && !revisiData.catatan_kak?.tipe_kegiatan_id
                                                    )}
                                                />
                                            )}
                                        </div>
                                        {errors['kak.tipe_kegiatan_id'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tipe_kegiatan_id']}</p>}
                                    </div>

                                    {/* Deskripsi / Gambaran Umum */}
                                    <div className="relative group/field">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Gambaran Umum Kegiatan</label>
                                        <div className="relative">
                                            <textarea
                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[150px] resize-y disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                value={data.kak.gambaran_umum || data.kak.deskripsi_kegiatan || ''} // Fallback for transition
                                                onChange={(e) => updateKak('deskripsi_kegiatan', e.target.value)}
                                                placeholder="Jelaskan gambaran umum kegiatan..."
                                                disabled={readOnly && !isPengusulFixing}
                                            ></textarea>
                                            {/* Revision Comments */}
                                            {(isVerifikator || isPengusulFixing) && (
                                                <CommentIcon
                                                    hasComment={!!revisiData.catatan_kak?.deskripsi_kegiatan || !!originalKak?.catatan_deskripsi_kegiatan}
                                                    isPastNote={!!originalKak?.catatan_deskripsi_kegiatan && !revisiData.catatan_kak?.deskripsi_kegiatan}
                                                    isPengusul={isPengusul}
                                                    onClick={() => openCommentModal(
                                                        { field: 'deskripsi_kegiatan', type: 'kak' },
                                                        'Catatan Gambaran Umum',
                                                        revisiData.catatan_kak?.deskripsi_kegiatan || originalKak?.catatan_deskripsi_kegiatan || '',
                                                        !!originalKak?.catatan_deskripsi_kegiatan && !revisiData.catatan_kak?.deskripsi_kegiatan
                                                    )}
                                                    className="!top-3 !translate-y-0 !right-3" // Adjust for textarea
                                                />
                                            )}
                                        </div>
                                        {errors['kak.deskripsi_kegiatan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.deskripsi_kegiatan']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* --- Penerima Manfaat --- */}
                            {subStep === 'penerima-manfaat' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Penerima Manfaat</h4>

                                    {/* Sasaran Utama */}
                                    <div className="relative group/field">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Sasaran Utama</label>
                                        <div className="relative">
                                            <textarea
                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[100px] disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                value={data.kak.sasaran_utama}
                                                onChange={(e) => updateKak('sasaran_utama', e.target.value)}
                                                disabled={readOnly && !isPengusulFixing}
                                            ></textarea>
                                            {(isVerifikator || isPengusulFixing) && (
                                                <CommentIcon
                                                    hasComment={!!revisiData.catatan_kak?.sasaran_utama || !!originalKak?.catatan_sasaran_utama}
                                                    isPastNote={!!originalKak?.catatan_sasaran_utama && !revisiData.catatan_kak?.sasaran_utama}
                                                    isPengusul={isPengusul}
                                                    onClick={() => openCommentModal(
                                                        { field: 'sasaran_utama', type: 'kak' },
                                                        'Catatan Sasaran Utama',
                                                        revisiData.catatan_kak?.sasaran_utama || originalKak?.catatan_sasaran_utama || '',
                                                        !!originalKak?.catatan_sasaran_utama && !revisiData.catatan_kak?.sasaran_utama
                                                    )}
                                                    className="!top-3 !translate-y-0 !right-3"
                                                />
                                            )}
                                        </div>
                                        {errors['kak.sasaran_utama'] && <p className="text-xs text-red-500 mt-1">{errors['kak.sasaran_utama']}</p>}
                                    </div>

                                    {/* Manfaat Loop */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-gray-700">Output Kegiatan / Manfaat</label>
                                        </div>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {data.kak.manfaat.map((item, index) => {
                                                    // Find if this specific Manfaat ID has a comment
                                                    const originalManfaat = originalKak?.manfaat?.find(m => m.manfaat === item.value); // Naive matching if no ID initially, but we added IDs in backend? For new items during edit, they won't have it.
                                                    // In a real scenario, we need the DB 'manfaat_id' available in the frontend data model if we are editing existing ones.
                                                    // Since KAKForm is initializing from kak.manfaat strings, we need to adapt our data model if we want to attach to specific IDs.
                                                    // For now, let's attach to the whole Manfaat section as a single 'catatan_manfaat' in main KAK table for ease, or we use the index if it's a child.
                                                    // Let's assume we map to the whole Manfaat section as a global 'catatan_manfaat' for ease.
                                                    return (
                                                        <motion.div
                                                            key={item._id || index} // Use _id for stability
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                            className="flex gap-2 relative group/field"
                                                        >
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="text"
                                                                    className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                                    value={item.value} // Access value property
                                                                    onChange={(e) => updateManfaat(index, e.target.value)}
                                                                    placeholder={`Manfaat ${index + 1}`}
                                                                    disabled={readOnly && !isPengusulFixing}
                                                                />
                                                                {(isVerifikator || isPengusulFixing) && item.manfaat_id && (
                                                                    <CommentIcon
                                                                        hasComment={!!revisiData.anak?.t_kak_manfaat?.find(r => r.id === item.manfaat_id)?.catatan_manfaat || !!originalKak?.manfaat?.find(m => m.manfaat_id === item.manfaat_id)?.catatan_manfaat}
                                                                        isPastNote={!!originalKak?.manfaat?.find(m => m.manfaat_id === item.manfaat_id)?.catatan_manfaat && !revisiData.anak?.t_kak_manfaat?.find(r => r.id === item.manfaat_id)?.catatan_manfaat}
                                                                        isPengusul={isPengusul}
                                                                        onClick={() => {
                                                                            const existingNote = revisiData.anak?.t_kak_manfaat?.find(r => r.id === item.manfaat_id)?.catatan_manfaat;
                                                                            const oldNote = originalKak?.manfaat?.find(m => m.manfaat_id === item.manfaat_id)?.catatan_manfaat;
                                                                            openCommentModal(
                                                                                { field: 'manfaat', type: 'anak', table: 't_kak_manfaat', id: item.manfaat_id },
                                                                                `Catatan Output: ${item.value}`,
                                                                                existingNote || oldNote || '',
                                                                                !!oldNote && !existingNote
                                                                            );
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                            {!readOnly && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeManfaat(index)}
                                                                    disabled={data.kak.manfaat.length <= 1}
                                                                    className={`p-2 transition-colors z-20 relative ${data.kak.manfaat.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                                                >
                                                                    <Trash size={18} />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )
                                                })}
                                            </AnimatePresence>
                                            {!readOnly && (
                                                <button type="button" onClick={addManfaat} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mt-2">
                                                    <Plus size={16} /> Tambah Output
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Strategi Pencapaian --- */}
                            {subStep === 'strategi-pencapaian' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Strategi Pencapaian</h4>

                                    {/* Metode Pelaksanaan */}
                                    <div className="relative group/field">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Metode Pelaksanaan</label>
                                        <div className="relative">
                                            <textarea
                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[150px] disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                value={data.kak.metode_pelaksanaan || ''}
                                                onChange={(e) => updateKak('metode_pelaksanaan', e.target.value)}
                                                disabled={readOnly && !isPengusulFixing}
                                            ></textarea>
                                            {(isVerifikator || isPengusulFixing) && (
                                                <CommentIcon
                                                    hasComment={!!revisiData.catatan_kak?.metode_pelaksanaan || !!originalKak?.catatan_metode_pelaksanaan}
                                                    isPastNote={!!originalKak?.catatan_metode_pelaksanaan && !revisiData.catatan_kak?.metode_pelaksanaan}
                                                    isPengusul={isPengusul}
                                                    onClick={() => openCommentModal(
                                                        { field: 'metode_pelaksanaan', type: 'kak' },
                                                        'Catatan Metode Pelaksanaan',
                                                        revisiData.catatan_kak?.metode_pelaksanaan || originalKak?.catatan_metode_pelaksanaan || '',
                                                        !!originalKak?.catatan_metode_pelaksanaan && !revisiData.catatan_kak?.metode_pelaksanaan
                                                    )}
                                                    className="!top-3 !translate-y-0 !right-3"
                                                />
                                            )}
                                        </div>
                                        {errors['kak.metode_pelaksanaan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.metode_pelaksanaan']}</p>}
                                    </div>

                                    {/* Tahapan Pelaksanaan */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-gray-700">Tahapan Pelaksanaan</label>
                                        </div>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {data.kak.tahapan_pelaksanaan.map((item, index) => (
                                                    <motion.div
                                                        key={item._id || index}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        className="flex gap-2 items-center"
                                                    >
                                                        <span className="text-sm font-bold text-gray-400 w-6">{index + 1}.</span>
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                                value={item.nama_tahapan}
                                                                onChange={(e) => updateTahapan(index, e.target.value)}
                                                                placeholder="Nama Tahapan"
                                                                disabled={readOnly && !isPengusulFixing}
                                                            />
                                                            {(isVerifikator || isPengusulFixing) && item.tahapan_id && (
                                                                <CommentIcon
                                                                    hasComment={!!revisiData.anak?.t_kak_tahapan?.find(r => r.id === item.tahapan_id)?.catatan_verifikator || !!originalKak?.tahapan?.find(t => t.tahapan_id === item.tahapan_id)?.catatan_verifikator}
                                                                    isPastNote={!!originalKak?.tahapan?.find(t => t.tahapan_id === item.tahapan_id)?.catatan_verifikator && !revisiData.anak?.t_kak_tahapan?.find(r => r.id === item.tahapan_id)?.catatan_verifikator}
                                                                    isPengusul={isPengusul}
                                                                    onClick={() => {
                                                                        const existingNote = revisiData.anak?.t_kak_tahapan?.find(r => r.id === item.tahapan_id)?.catatan_verifikator;
                                                                        const oldNote = originalKak?.tahapan?.find(t => t.tahapan_id === item.tahapan_id)?.catatan_verifikator;
                                                                        openCommentModal(
                                                                            { field: 'tahapan', type: 'anak', table: 't_kak_tahapan', id: item.tahapan_id },
                                                                            `Catatan Tahapan: ${item.nama_tahapan}`,
                                                                            existingNote || oldNote || '',
                                                                            !!oldNote && !existingNote
                                                                        );
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        {!readOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTahapan(index)}
                                                                disabled={data.kak.tahapan_pelaksanaan.length <= 1}
                                                                className={`p-2 transition-colors z-20 relative ${data.kak.tahapan_pelaksanaan.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {!readOnly && (
                                                <button type="button" onClick={addTahapan} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mt-2">
                                                    <Plus size={16} /> Tambah Tahapan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Indikator Kinerja (Kegiatan) --- */}
                            {subStep === 'indikator-kinerja' && (
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-cyan-600 mb-1">Indikator Kinerja Kegiatan</h4>
                                            <p className="text-sm text-gray-500">Tentukan target output dan indikator keberhasilan dari kegiatan ini.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence mode="popLayout">
                                            {data.kak.indikator_kinerja.map((item, index) => (
                                                <motion.div
                                                    key={item._id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex gap-4 items-start"
                                                >
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Bulan</label>
                                                            <select
                                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                value={item.bulan_indikator}
                                                                onChange={(e) => updateIndikator(index, 'bulan_indikator', e.target.value)}
                                                                disabled={readOnly && !isPengusulFixing}
                                                            >
                                                                <option value="">Pilih Bulan</option>
                                                                <option value="Januari">Januari</option>
                                                                <option value="Februari">Februari</option>
                                                                <option value="Maret">Maret</option>
                                                                <option value="April">April</option>
                                                                <option value="Mei">Mei</option>
                                                                <option value="Juni">Juni</option>
                                                                <option value="Juli">Juli</option>
                                                                <option value="Agustus">Agustus</option>
                                                                <option value="September">September</option>
                                                                <option value="Oktober">Oktober</option>
                                                                <option value="November">November</option>
                                                                <option value="Desember">Desember</option>
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-6">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Indikator Keberhasilan</label>
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed pr-10"
                                                                value={item.deskripsi_target}
                                                                onChange={(e) => updateIndikator(index, 'deskripsi_target', e.target.value)}
                                                                placeholder="Contoh: Tersedianya dokumen laporan"
                                                                disabled={readOnly && !isPengusulFixing}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Target</label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                    value={item.persentase_target}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value;
                                                                        if (val !== '') {
                                                                            if (Number(val) > 100) val = '100';
                                                                            if (Number(val) < 0) val = '0';
                                                                        }
                                                                        updateIndikator(index, 'persentase_target', val);
                                                                    }}
                                                                    placeholder="0"
                                                                    min="0"
                                                                    max="100"
                                                                    disabled={readOnly && !isPengusulFixing}
                                                                />
                                                                <span className="text-sm font-bold text-gray-500">%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-6">
                                                        {(isVerifikator || isPengusulFixing) && item.target_id && (
                                                            <CommentIcon
                                                                hasComment={!!revisiData.anak?.t_kak_target?.find(r => r.id === item.target_id)?.catatan_verifikator || !!originalKak?.targets?.find(t => t.target_id === item.target_id)?.catatan_verifikator}
                                                                isPastNote={!!originalKak?.targets?.find(t => t.target_id === item.target_id)?.catatan_verifikator && !revisiData.anak?.t_kak_target?.find(r => r.id === item.target_id)?.catatan_verifikator}
                                                                isPengusul={isPengusul}
                                                                onClick={() => {
                                                                    const existingNote = revisiData.anak?.t_kak_target?.find(r => r.id === item.target_id)?.catatan_verifikator;
                                                                    const oldNote = originalKak?.targets?.find(t => t.target_id === item.target_id)?.catatan_verifikator;
                                                                    openCommentModal(
                                                                        { field: 'indikator_kinerja', type: 'anak', table: 't_kak_target', id: item.target_id },
                                                                        `Catatan Indikator Kinerja: ${item.deskripsi_target}`,
                                                                        existingNote || oldNote || '',
                                                                        !!oldNote && !existingNote
                                                                    );
                                                                }}
                                                                className="!relative !right-auto !top-auto !translate-y-0"
                                                            />
                                                        )}
                                                        {!readOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeIndikator(index)}
                                                                disabled={data.kak.indikator_kinerja.length <= 1}
                                                                className={`p-2 transition-colors flex items-center gap-1 ${data.kak.indikator_kinerja.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg'}`}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {!readOnly && (
                                            <button type="button" onClick={addIndikator} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                                                <Plus size={16} /> Tambah Indikator
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- Kurun Waktu --- */}
                            {subStep === 'kurun-waktu' && (
                                <>
                                    <style>{`
                                        .hide-dp-clear button:has(svg path[d^="M6 18L18 6"]) {
                                            display: none !important;
                                        }
                                    `}</style>
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-bold text-cyan-600 mb-6">Kurun Waktu Pelaksanaan</h4>

                                        <div className="flex flex-col gap-6">
                                            <div className="relative group/field">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Periode Pelaksanaan</label>
                                                <div className="relative hide-dp-clear">
                                                    <Datepicker
                                                        primaryColor="cyan"
                                                        displayFormat="DD MMMM YYYY"
                                                        separator="-"
                                                        value={{
                                                            startDate: data.kak.tanggal_mulai || null,
                                                            endDate: data.kak.tanggal_selesai || null
                                                        }}
                                                        onChange={(newValue) => {
                                                            setData('kak', {
                                                                ...data.kak,
                                                                tanggal_mulai: newValue?.startDate || '',
                                                                tanggal_selesai: newValue?.endDate || ''
                                                            });
                                                        }}
                                                        placeholder="Pilih Rentang Tanggal..."
                                                        disabled={readOnly && !isPengusulFixing}
                                                        showClearButton={false}
                                                        inputClassName="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-14"
                                                        toggleClassName="absolute top-1/2 -translate-y-1/2 right-12 text-cyan-500 cursor-pointer z-10"
                                                    />
                                                    {(isVerifikator || isPengusulFixing) && (
                                                        <CommentIcon
                                                            hasComment={!!revisiData.catatan_kak?.tanggal || !!originalKak?.catatan_tanggal}
                                                            isPastNote={!!originalKak?.catatan_tanggal && !revisiData.catatan_kak?.tanggal}
                                                            isPengusul={isPengusul}
                                                            onClick={() => openCommentModal(
                                                                { field: 'tanggal', type: 'kak' },
                                                                'Catatan Periode Pelaksanaan',
                                                                revisiData.catatan_kak?.tanggal || originalKak?.catatan_tanggal || '',
                                                                !!originalKak?.catatan_tanggal && !revisiData.catatan_kak?.tanggal
                                                            )}
                                                            className="absolute top-1/2 -translate-y-1/2 right-3 z-20"
                                                        />
                                                    )}
                                                </div>
                                                {errors['kak.tanggal_mulai'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tanggal_mulai']}</p>}
                                                {errors['kak.tanggal_selesai'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tanggal_selesai']}</p>}
                                            </div>

                                            <div className="relative group/field md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Periode Pelaksanaan (Otomatis)</label>
                                                <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-800 font-bold mb-6">
                                                    {getDurationText(data.kak.tanggal_mulai, data.kak.tanggal_selesai) || '-'}
                                                    <input type="hidden" name="kurun_waktu_pelaksanaan" value={getDurationText(data.kak.tanggal_mulai, data.kak.tanggal_selesai)} />
                                                </div>

                                                <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi Pelaksanaan <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed pr-12"
                                                        value={data.kak.lokasi || ''}
                                                        onChange={(e) => updateKak('lokasi', e.target.value)}
                                                        placeholder="Contoh: Gedung Direktorat Lt.2, Kampus PNJ"
                                                        disabled={readOnly && !isPengusulFixing}
                                                    />
                                                    {(isVerifikator || isPengusulFixing) && (
                                                        <CommentIcon
                                                            hasComment={!!revisiData.catatan_kak?.lokasi || !!originalKak?.catatan_lokasi}
                                                            isPastNote={!!originalKak?.catatan_lokasi && !revisiData.catatan_kak?.lokasi}
                                                            isPengusul={isPengusul}
                                                            onClick={() => openCommentModal(
                                                                { field: 'lokasi', type: 'kak' },
                                                                'Catatan Lokasi Pelaksanaan',
                                                                revisiData.catatan_kak?.lokasi || originalKak?.catatan_lokasi || '',
                                                                !!originalKak?.catatan_lokasi && !revisiData.catatan_kak?.lokasi
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                                {errors['kak.lokasi'] && <p className="text-xs text-red-500 mt-1">{errors['kak.lokasi']}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </SpectacularBorder>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
