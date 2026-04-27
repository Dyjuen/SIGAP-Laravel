import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpectacularBorder from '../Components/SpectacularBorder';
import CommentIcon from '../Components/CommentIcon';
import { Trash, Plus } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';

export default function Step2Iku({
    data, setData, errors, iku = [], satuan = [], readOnly = false,
    isVerifikator = false, isPengusul = false, isPengusulFixing = false,
    openCommentModal = () => { }, revisiData = { catatan_kak: {}, anak: {} }, originalKak = null
}) {

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
                                    className="p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:border-cyan-200 transition-colors relative"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        {/* IKU Select */}
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Indikator Kinerja Utama</label>
                                            <CustomSelect
                                                value={item.iku_id}
                                                onChange={(val) => updateTargetIku(index, 'iku_id', val)}
                                                options={iku.map(i => ({ value: i.iku_id, label: `${i.kode_iku} - ${i.nama_iku}` }))}
                                                placeholder="Pilih IKU"
                                                disabled={readOnly}
                                                className="w-full rounded-lg py-2 pl-3 pr-10 text-xs"
                                            />
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
                                            <CustomSelect
                                                value={item.satuan_id}
                                                onChange={(val) => updateTargetIku(index, 'satuan_id', val)}
                                                options={satuan.map(s => ({ value: s.satuan_id, label: s.nama_satuan }))}
                                                placeholder="Satuan"
                                                disabled={readOnly}
                                                className="w-full rounded-lg py-2 pl-3 pr-10 text-xs"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="md:col-span-1 flex items-center justify-end gap-2 md:mt-5">
                                            {(isVerifikator || isPengusulFixing) && item.iku_id && (
                                                <div className="relative w-8 h-8 flex-shrink-0">
                                                    <CommentIcon
                                                        hasComment={!!revisiData.anak?.t_kak_iku?.find(r => r.id === item.iku_id)?.catatan_verifikator || !!originalKak?.ikus?.find(i => i.iku_id === item.iku_id)?.catatan_verifikator}
                                                        isPastNote={!!originalKak?.ikus?.find(i => i.iku_id === item.iku_id)?.catatan_verifikator && !revisiData.anak?.t_kak_iku?.find(r => r.id === item.iku_id)?.catatan_verifikator}
                                                        isPengusul={isPengusul}
                                                        onClick={() => {
                                                            const existingNote = revisiData.anak?.t_kak_iku?.find(r => r.id === item.iku_id)?.catatan_verifikator;
                                                            const oldNote = originalKak?.ikus?.find(i => i.iku_id === item.iku_id)?.catatan_verifikator;
                                                            openCommentModal(
                                                                { field: 'iku', type: 'anak', table: 't_kak_iku', id: item.iku_id },
                                                                `Catatan Target IKU: ${item.target}`,
                                                                existingNote || oldNote || '',
                                                                !!oldNote && !existingNote
                                                            );
                                                        }}
                                                        className="!relative !right-auto !top-auto !translate-y-0"
                                                    />
                                                </div>
                                            )}
                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTargetIku(index)}
                                                    disabled={data.target_iku.length <= 1}
                                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${data.target_iku.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title={data.target_iku.length <= 1 ? "Minimal 1 IKU" : "Hapus IKU"}
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            )}
                                        </div>
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
