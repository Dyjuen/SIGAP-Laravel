import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpectacularBorder from '../Components/SpectacularBorder';
import { FileText, Users, Target, ChartBar, Calendar, Trash, Plus } from 'lucide-react';
import Datepicker from "react-tailwindcss-datepicker";

export default function Step1Kak({ data, setData, errors, readOnly = false, mode = 'create', tipe_kegiatan = [], subStep, setSubStep }) {

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

    const addIndikator = () => setData('kak', { ...data.kak, indikator_kinerja: [...data.kak.indikator_kinerja, { _id: Math.random(), deskripsi_target: '', deskripsi_indikator: '' }] });
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
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={data.kak.nama_kegiatan}
                                            onChange={(e) => updateKak('nama_kegiatan', e.target.value)}
                                            placeholder="Masukkan nama kegiatan..."
                                            disabled={readOnly}
                                        />
                                        {errors['kak.nama_kegiatan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.nama_kegiatan']}</p>}
                                        {/* TODO: Add Change Request Comment Icon if needed */}
                                    </div>

                                    {/* Tipe Kegiatan (Select) */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tipe Kegiatan <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={data.kak.tipe_kegiatan_id}
                                            onChange={(e) => updateKak('tipe_kegiatan_id', e.target.value)}
                                            disabled={readOnly}
                                        >
                                            <option value="">Pilih Tipe Kegiatan</option>
                                            {tipe_kegiatan.map(t => (
                                                <option key={t.tipe_kegiatan_id} value={t.tipe_kegiatan_id}>
                                                    {t.nama_tipe}
                                                </option>
                                            ))}
                                        </select>
                                        {errors['kak.tipe_kegiatan_id'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tipe_kegiatan_id']}</p>}
                                    </div>

                                    {/* Deskripsi / Gambaran Umum */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Gambaran Umum Kegiatan</label>
                                        <textarea
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[150px] resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={data.kak.gambaran_umum || data.kak.deskripsi_kegiatan} // Fallback for transition
                                            onChange={(e) => updateKak('deskripsi_kegiatan', e.target.value)}
                                            placeholder="Jelaskan gambaran umum kegiatan..."
                                            disabled={readOnly}
                                        ></textarea>
                                        {errors['kak.deskripsi_kegiatan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.deskripsi_kegiatan']}</p>}
                                    </div>
                                </div>
                            )}

                            {/* --- Penerima Manfaat --- */}
                            {subStep === 'penerima-manfaat' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Penerima Manfaat</h4>

                                    {/* Sasaran Utama */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Sasaran Utama</label>
                                        <textarea
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[100px] disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={data.kak.sasaran_utama}
                                            onChange={(e) => updateKak('sasaran_utama', e.target.value)}
                                            disabled={readOnly}
                                        ></textarea>
                                        {errors['kak.sasaran_utama'] && <p className="text-xs text-red-500 mt-1">{errors['kak.sasaran_utama']}</p>}
                                    </div>

                                    {/* Manfaat Loop */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Output Kegiatan / Manfaat</label>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {data.kak.manfaat.map((item, index) => (
                                                    <motion.div
                                                        key={item._id || index} // Use _id for stability
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        className="flex gap-2"
                                                    >
                                                        <input
                                                            type="text"
                                                            className="flex-1 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                                            value={item.value} // Access value property
                                                            onChange={(e) => updateManfaat(index, e.target.value)}
                                                            placeholder={`Manfaat ${index + 1}`}
                                                            disabled={readOnly}
                                                        />
                                                        {!readOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeManfaat(index)}
                                                                disabled={data.kak.manfaat.length <= 1}
                                                                className={`p-2 transition-colors ${data.kak.manfaat.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
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
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Metode Pelaksanaan</label>
                                        <textarea
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 min-h-[150px] disabled:opacity-70 disabled:cursor-not-allowed"
                                            value={data.kak.metode_pelaksanaan}
                                            onChange={(e) => updateKak('metode_pelaksanaan', e.target.value)}
                                            disabled={readOnly}
                                        ></textarea>
                                        {errors['kak.metode_pelaksanaan'] && <p className="text-xs text-red-500 mt-1">{errors['kak.metode_pelaksanaan']}</p>}
                                    </div>

                                    {/* Tahapan Pelaksanaan */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tahapan Pelaksanaan</label>
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
                                                        <input
                                                            type="text"
                                                            className="flex-1 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                                            value={item.nama_tahapan}
                                                            onChange={(e) => updateTahapan(index, e.target.value)}
                                                            placeholder="Nama Tahapan"
                                                            disabled={readOnly}
                                                        />
                                                        {!readOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTahapan(index)}
                                                                disabled={data.kak.tahapan_pelaksanaan.length <= 1}
                                                                className={`p-2 transition-colors ${data.kak.tahapan_pelaksanaan.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
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
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Indikator Kinerja Kegiatan</h4>
                                    <p className="text-sm text-gray-500 mb-4">Tentukan target output dan indikator keberhasilan dari kegiatan ini.</p>

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
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Target (Output)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                value={item.deskripsi_target}
                                                                onChange={(e) => updateIndikator(index, 'deskripsi_target', e.target.value)}
                                                                placeholder="Contoh: Laporan Kegiatan"
                                                                disabled={readOnly}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Indikator Kinerja</label>
                                                            <input
                                                                type="text"
                                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                                value={item.deskripsi_indikator}
                                                                onChange={(e) => updateIndikator(index, 'deskripsi_indikator', e.target.value)}
                                                                placeholder="Contoh: Tersedianya dokumen laporan"
                                                                disabled={readOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    {!readOnly && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeIndikator(index)}
                                                            disabled={data.kak.indikator_kinerja.length <= 1}
                                                            className={`mt-6 p-2 transition-colors flex items-center gap-1 ${data.kak.indikator_kinerja.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg'}`}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    )}
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
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-cyan-600 mb-6">Kurun Waktu Pelaksanaan</h4>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Periode Pelaksanaan</label>
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
                                                disabled={readOnly}
                                                inputClassName="w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                                toggleClassName="absolute top-1/2 -translate-y-1/2 right-3 text-cyan-500 cursor-pointer"
                                            />
                                            {errors['kak.tanggal_mulai'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tanggal_mulai']}</p>}
                                            {errors['kak.tanggal_selesai'] && <p className="text-xs text-red-500 mt-1">{errors['kak.tanggal_selesai']}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Periode Pelaksanaan (Otomatis)</label>
                                            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-800 font-bold">
                                                {getDurationText(data.kak.tanggal_mulai, data.kak.tanggal_selesai) || '-'}
                                                <input type="hidden" name="kurun_waktu_pelaksanaan" value={getDurationText(data.kak.tanggal_mulai, data.kak.tanggal_selesai)} />
                                            </div>
                                            {/* We should ideally store the calculated text in form data too if backend expects it */}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </SpectacularBorder>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
