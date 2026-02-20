import React, { useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import SpectacularBorder from '../Components/SpectacularBorder';
import { Wallet, Trash, Plus } from 'lucide-react';

export default function Step3Rab({ data, setData, errors, kategori_belanja = [], satuan = [], readOnly = false }) {

    // --- Dynamic Field Handlers ---
    const addRab = (kategori_id) => setData('rab', [...data.rab, { _id: Math.random(), kategori_belanja_id: kategori_id, uraian: '', volume1: '', satuan1_id: '', volume2: '', satuan2_id: '', volume3: '', satuan3_id: '', harga_satuan: '' }]);
    const removeRab = (index) => {
        setData('rab', data.rab.filter((_, i) => i !== index));
    };
    const updateRab = (index, field, value) => {
        const newItems = [...data.rab];
        newItems[index][field] = value;
        setData('rab', newItems);
    };

    // --- Calculation Helpers ---
    const calculateRowTotal = (item) => {
        const v1 = parseFloat(item.volume1) || 0;
        const v2 = parseFloat(item.volume2) || 1; // Default to 1 for multiplier effect
        const v3 = parseFloat(item.volume3) || 1;
        const price = parseFloat(item.harga_satuan) || 0;
        return v1 * v2 * v3 * price;
    };

    const grandTotal = useMemo(() => {
        return data.rab.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    }, [data.rab]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <SpectacularBorder active={true}>
            <div className="space-y-6">
                <div>
                    <h4 className="text-xl font-bold text-cyan-600 mb-2">Rencana Anggaran Biaya (RAB)</h4>
                    <p className="text-sm text-gray-500 mb-6">
                        Detailkan kebutuhan anggaran untuk kegiatan ini.
                    </p>

                    {kategori_belanja.map(kategori => {
                        const categoryItems = data.rab
                            .map((item, index) => ({ ...item, originalIndex: index }))
                            .filter(item => item.kategori_belanja_id == kategori.kategori_belanja_id);

                        const categoryTotal = categoryItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);

                        return (
                            <div key={kategori.kategori_belanja_id} className="mb-10 last:mb-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-lg font-bold text-gray-800">{kategori.nama}</h5>
                                    <div className="text-sm font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-lg">
                                        Subtotal: {formatCurrency(categoryTotal)}
                                    </div>
                                </div>

                                <div className="hidden md:block overflow-x-auto overflow-y-hidden rounded-xl border border-gray-200">
                                    <LayoutGroup id={`category-${kategori.kategori_belanja_id}`}>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Uraian</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 1</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 2</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Vol 3</th>
                                                    <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Satuan</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Harga Satuan</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-32">Total</th>
                                                    {!readOnly && <th className="px-2 py-3 w-10"></th>}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {categoryItems.length === 0 && (
                                                    <tr>
                                                        <td colSpan={readOnly ? 8 : 9} className="px-4 py-6 text-center text-sm text-gray-400 italic">
                                                            Belum ada item untuk kategori ini.
                                                        </td>
                                                    </tr>
                                                )}
                                                <AnimatePresence initial={false}>
                                                    {categoryItems.map((item) => (
                                                        <motion.tr
                                                            key={`rab-row-${item._id || item.originalIndex}`}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                                            className="text-sm bg-white"
                                                        >
                                                            <td className="px-2 py-2 w-48 align-top">
                                                                <input type="text" className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.uraian} onChange={e => updateRab(item.originalIndex, 'uraian', e.target.value)} disabled={readOnly} placeholder="Nama item..." />
                                                            </td>
                                                            {/* Vol 1 */}
                                                            <td className="px-1 py-2 align-top">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.volume1} onChange={e => updateRab(item.originalIndex, 'volume1', e.target.value)} disabled={readOnly} min="0" placeholder="1" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.satuan1_id} onChange={e => updateRab(item.originalIndex, 'satuan1_id', e.target.value)} disabled={readOnly}>
                                                                    <option value="">-</option>
                                                                    {satuan.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Vol 2 (Optional) */}
                                                            <td className="px-1 py-2 align-top">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.volume2} onChange={e => updateRab(item.originalIndex, 'volume2', e.target.value)} disabled={readOnly} placeholder="-" min="0" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.satuan2_id} onChange={e => updateRab(item.originalIndex, 'satuan2_id', e.target.value)} disabled={readOnly}>
                                                                    <option value="">-</option>
                                                                    {satuan.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Vol 3 (Optional) */}
                                                            <td className="px-1 py-2 align-top">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-center focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.volume3} onChange={e => updateRab(item.originalIndex, 'volume3', e.target.value)} disabled={readOnly} placeholder="-" min="0" />
                                                            </td>
                                                            <td className="px-1 py-2 align-top">
                                                                <select className="w-full rounded-lg border-gray-200 text-xs py-2 focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.satuan3_id} onChange={e => updateRab(item.originalIndex, 'satuan3_id', e.target.value)} disabled={readOnly}>
                                                                    <option value="">-</option>
                                                                    {satuan.map(s => <option key={s.satuan_id} value={s.satuan_id}>{s.nama_satuan}</option>)}
                                                                </select>
                                                            </td>
                                                            {/* Harga */}
                                                            <td className="px-2 py-2 align-top">
                                                                <input type="number" className="w-full rounded-lg border-gray-200 text-xs py-2 text-right focus:border-cyan-400 focus:ring-0 shadow-sm"
                                                                    value={item.harga_satuan} onChange={e => updateRab(item.originalIndex, 'harga_satuan', e.target.value)} disabled={readOnly} min="0" placeholder="0" />
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-bold text-gray-700 bg-gray-50/50 align-top">
                                                                <div className="py-2">{formatCurrency(calculateRowTotal(item))}</div>
                                                            </td>
                                                            {!readOnly && (
                                                                <td className="px-2 py-2 text-center align-top">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeRab(item.originalIndex)}
                                                                        className="p-2 mt-1 rounded-lg transition-colors text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash size={18} />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </LayoutGroup>
                                </div>

                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={() => addRab(kategori.kategori_belanja_id)}
                                        className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 mt-3"
                                    >
                                        <Plus size={16} /> Tambah {kategori.nama}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Spectacular Total Card */}
                    <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 shadow-xl p-8 flex flex-col md:flex-row justify-between items-center group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-100 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="flex items-center gap-4 z-10 mb-4 md:mb-0">
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h5 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Anggaran</h5>
                                <div className="text-gray-800 font-bold text-lg">Estimasi Biaya</div>
                            </div>
                        </div>

                        <div className="z-10 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 drop-shadow-sm">
                            {formatCurrency(grandTotal)}
                        </div>
                    </div>

                </div>
            </div>
        </SpectacularBorder>
    );
}
