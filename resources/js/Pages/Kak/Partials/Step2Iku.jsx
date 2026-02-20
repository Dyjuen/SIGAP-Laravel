import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpectacularBorder from '../Components/SpectacularBorder';
import { Trash, Plus } from 'lucide-react';

export default function Step2Iku({ data, setData, errors, iku = [], satuan = [], readOnly = false }) {

    const addTargetIku = () => setData('target_iku', [...data.target_iku, { _id: Math.random(), iku_id: '', target: '', satuan_id: '' }]);
    const removeTargetIku = (index) => {
        if (data.target_iku.length > 1) {
            setData('target_iku', data.target_iku.filter((_, i) => i !== index));
        }
    };
    const updateTargetIku = (index, field, value) => {
        const newItems = [...data.target_iku];
        newItems[index][field] = value;
        setData('target_iku', newItems);
    };

    return (
        <SpectacularBorder active={true}>
            <div className="space-y-6">
                <div>
                    <h4 className="text-xl font-bold text-cyan-600 mb-2">Indikator Kinerja Utama (IKU)</h4>
                    <p className="text-sm text-gray-500 mb-6">
                        Pilih Indikator Kinerja Utama yang relevan dengan kegiatan ini dan tentukan target capaiannya.
                    </p>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {data.target_iku.map((item, index) => (
                                <motion.div
                                    key={item._id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-cyan-200 transition-colors"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                        {/* IKU Select */}
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Indikator Kinerja Utama</label>
                                            <select
                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                value={item.iku_id}
                                                onChange={(e) => updateTargetIku(index, 'iku_id', e.target.value)}
                                                disabled={readOnly}
                                            >
                                                <option value="">Pilih IKU</option>
                                                {iku.map(i => (
                                                    <option key={i.iku_id} value={i.iku_id}>
                                                        {i.kode_iku} - {i.nama_iku}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Target Input */}
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Target</label>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                value={item.target}
                                                onChange={(e) => updateTargetIku(index, 'target', e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                disabled={readOnly}
                                            />
                                        </div>

                                        {/* Satuan Select */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Satuan</label>
                                            <select
                                                className="w-full rounded-lg border-gray-200 text-sm focus:border-cyan-400 focus:ring-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                                value={item.satuan_id}
                                                onChange={(e) => updateTargetIku(index, 'satuan_id', e.target.value)}
                                                disabled={readOnly}
                                            >
                                                <option value="">Satuan</option>
                                                {satuan.map(s => (
                                                    <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Remove Button */}
                                        {!readOnly && (
                                            <div className="md:col-span-1 flex justify-end md:mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => removeTargetIku(index)}
                                                    disabled={data.target_iku.length <= 1}
                                                    className={`p-2 rounded-lg transition-colors ${data.target_iku.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title={data.target_iku.length <= 1 ? "Minimal 1 IKU" : "Hapus IKU"}
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {!readOnly && (
                            <button
                                type="button"
                                onClick={addTargetIku}
                                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mt-2"
                            >
                                <Plus size={16} /> Tambah Target IKU
                            </button>
                        )}
                        {errors['target_iku'] && <p className="text-xs text-red-500 mt-1">{errors['target_iku']}</p>}
                    </div>
                </div>
            </div>
        </SpectacularBorder>
    );
}
