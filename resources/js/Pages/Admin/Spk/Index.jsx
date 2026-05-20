import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// Counter animation hook to match Dashboard style
function useCounterAnimation(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        if (!target || target === 0) { setCount(0); return; }
        let start = 0;
        const increment = target / (duration / 16);
        const animate = () => {
            start += increment;
            if (start < target) {
                setCount(Math.floor(start));
                animRef.current = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };
        const timer = setTimeout(() => {
            animRef.current = requestAnimationFrame(animate);
        }, 100);
        return () => { clearTimeout(timer); if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [target, duration]);

    return count;
}

// Stat Card component modeled after Dashboard.jsx (completely icon-free)
function StatCard({ subtitle, label, value, color = 'white', delay = 0, isDecimal = false }) {
    const displayValue = isDecimal ? value : Math.round(value);
    const animatedValue = useCounterAnimation(displayValue || 0);

    const isCyan = color === 'cyan';
    const bgClass = isCyan ? 'bg-[#00bcd4] shadow-md shadow-cyan-500/10' : 'bg-white shadow-sm border border-slate-100';
    const textClass = isCyan ? 'text-white' : 'text-slate-800';
    const subtitleClass = isCyan ? 'text-cyan-50' : 'text-cyan-500';
    const valueClass = isCyan ? 'text-white' : 'text-cyan-500';

    return (
        <div
            className={`relative overflow-hidden rounded-[24px] p-6 sm:p-8 hover:-translate-y-1.5 transition-all duration-300 group animate-fade-in-up min-h-[160px] flex flex-col justify-between ${bgClass}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative z-10">
                <div className={`text-[11px] uppercase font-black tracking-[0.1em] mb-2 opacity-90 ${subtitleClass}`}>{subtitle}</div>
                <div className={`text-xl sm:text-2xl font-black leading-tight tracking-tight ${textClass}`}>{label}</div>
            </div>

            {/* Background Number styling */}
            <div className={`absolute -right-4 top-1/2 -translate-y-1/2 text-[120px] font-black opacity-[0.05] group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none leading-none ${isCyan ? 'text-white' : 'text-slate-900'}`}>
                {displayValue}
            </div>

            <div className={`text-4xl sm:text-5xl font-black absolute bottom-6 right-8 tracking-tighter ${valueClass}`}>
                {isDecimal ? value : animatedValue}
            </div>
        </div>
    );
}

export default function Index({ auth, spk_config, kegiatans, statistics }) {
    // Form management
    const { data, setData, post, processing, errors } = useForm({
        weight_waktu: spk_config.weight_waktu ? parseFloat(spk_config.weight_waktu) : 25,
        weight_anggaran: spk_config.weight_anggaran ? parseFloat(spk_config.weight_anggaran) : 25,
        weight_output: spk_config.weight_output ? parseFloat(spk_config.weight_output) : 25,
        weight_lpj: spk_config.weight_lpj ? parseFloat(spk_config.weight_lpj) : 25,
        waktu_min: spk_config.waktu_min ?? 50,
        waktu_max: spk_config.waktu_max ?? 100,
        anggaran_min: spk_config.anggaran_min ?? 50,
        anggaran_max: spk_config.anggaran_max ?? 100,
        output_min: spk_config.output_min ?? 0,
        output_max: spk_config.output_max ?? 100,
        lpj_min: spk_config.lpj_min ?? 50,
        lpj_max: spk_config.lpj_max ?? 100,
        lpj_penalty_per_day: spk_config.lpj_penalty_per_day ?? 5,
    });

    // Local Search & Pagination State for Table
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filteredKegiatans, setFilteredKegiatans] = useState(kegiatans);

    // Live total weight calculation
    const totalWeight = 
        parseFloat(data.weight_waktu || 0) + 
        parseFloat(data.weight_anggaran || 0) + 
        parseFloat(data.weight_output || 0) + 
        parseFloat(data.weight_lpj || 0);

    const isSumValid = Math.abs(totalWeight - 100) < 0.001;

    // Filter effect when search term or kegiatans list changes
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const results = kegiatans.filter(kegiatan =>
            kegiatan.nama_kegiatan.toLowerCase().includes(lowerSearch) ||
            kegiatan.pengusul.toLowerCase().includes(lowerSearch) ||
            kegiatan.kategori.toLowerCase().includes(lowerSearch)
        );
        setFilteredKegiatans(results);
        setCurrentPage(1);
    }, [searchTerm, kegiatans]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredKegiatans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredKegiatans.length / itemsPerPage);

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isSumValid) {
            Swal.fire({
                icon: 'error',
                title: 'Jumlah Bobot Tidak Valid',
                text: `Total bobot kriteria harus tepat bernilai 100%. Saat ini bernilai ${totalWeight}%.`,
                confirmButtonColor: '#00bcd4'
            });
            return;
        }

        post(route('admin.spk.config.update'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Disimpan',
                    text: 'Konfigurasi parameter SPK berhasil diperbarui.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (errs) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan',
                    text: errs.weights_sum || 'Terjadi kesalahan saat menyimpan data. Periksa kembali inputan Anda.',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    // Helper functions for badge coloring (matching Dashboard status badges style)
    const getKategoriBadgeClass = (kategori) => {
        switch (kategori) {
            case 'Sangat Baik':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Baik':
                return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
            case 'Cukup':
                return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'Kurang':
                return 'bg-rose-50 text-rose-700 border border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-100';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title="Manajemen Parameter & Dashboard SPK" description="Atur bobot kriteria dinamis, batasan konstrain nilai, dan lihat hasil evaluasi kinerja kegiatan" />}
        >
            <Head title="Manajemen SPK" />

            <div className="py-8 bg-slate-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* STATS OVERVIEW CARDS (matching dashboard theme, icon-free) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            subtitle="SKOR INSTANSI" 
                            label="Rata-Rata Skor" 
                            value={statistics.average_score} 
                            color="cyan" 
                            delay={100} 
                            isDecimal={true}
                        />
                        <StatCard 
                            subtitle="EVALUASI" 
                            label="Total Dievaluasi" 
                            value={statistics.total_evaluated} 
                            color="white" 
                            delay={200} 
                        />
                        <StatCard 
                            subtitle={statistics.highest_kegiatan ? statistics.highest_kegiatan.nama_kegiatan : 'Tidak ada data'} 
                            label="Kinerja Tertinggi" 
                            value={statistics.highest_kegiatan ? statistics.highest_kegiatan.score : 0} 
                            color="white" 
                            delay={300} 
                            isDecimal={true}
                        />
                        <StatCard 
                            subtitle={statistics.lowest_kegiatan ? statistics.lowest_kegiatan.nama_kegiatan : 'Tidak ada data'} 
                            label="Kinerja Terendah" 
                            value={statistics.lowest_kegiatan ? statistics.lowest_kegiatan.score : 0} 
                            color="white" 
                            delay={400} 
                            isDecimal={true}
                        />
                    </div>

                    {/* UPPER MAIN SECTION: CONFIG & BREAKDOWN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* FORM PARAMETER & WEIGHT CONFIGURATION (Left - Spans 2 cols, matching clean theme) */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                            <div className="p-6 sm:p-8 bg-white border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">
                                        Pengaturan Kriteria SPK
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Tentukan bobot kriteria penilaian (total wajib 100%) dan parameter batas nilai.</p>
                                </div>
                                
                                {/* LIVE WEIGHT SUM BADGE */}
                                <div className={`px-4 py-2 rounded-xl text-xs font-black border flex flex-col items-center ${
                                    isSumValid 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                }`}>
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Total Bobot</span>
                                    <span className="text-sm">{totalWeight}%</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 flex-1">
                                
                                {/* 1. SECTION CRITERIA WEIGHTS */}
                                <div>
                                    <h4 className="text-[11px] font-black text-cyan-500 uppercase tracking-wider mb-5 border-b border-slate-50 pb-2">
                                        Bobot Kriteria Penilaian
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Kesesuaian Waktu */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600">Kesesuaian Waktu Pelaksanaan</label>
                                                <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg">{data.weight_waktu}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.weight_waktu}
                                                onChange={e => setData('weight_waktu', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00bcd4] focus:outline-none"
                                            />
                                            {errors.weight_waktu && <p className="text-xs text-rose-500 font-bold">{errors.weight_waktu}</p>}
                                        </div>

                                        {/* Ketepatan Anggaran */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600">Ketepatan Penggunaan Anggaran</label>
                                                <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg">{data.weight_anggaran}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.weight_anggaran}
                                                onChange={e => setData('weight_anggaran', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00bcd4] focus:outline-none"
                                            />
                                            {errors.weight_anggaran && <p className="text-xs text-rose-500 font-bold">{errors.weight_anggaran}</p>}
                                        </div>

                                        {/* Kesesuaian Output */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600">Kesesuaian Target Output (IKU)</label>
                                                <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg">{data.weight_output}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.weight_output}
                                                onChange={e => setData('weight_output', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00bcd4] focus:outline-none"
                                            />
                                            {errors.weight_output && <p className="text-xs text-rose-500 font-bold">{errors.weight_output}</p>}
                                        </div>

                                        {/* Ketepatan LPJ */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600">Ketepatan Penyampaian LPJ</label>
                                                <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg">{data.weight_lpj}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.weight_lpj}
                                                onChange={e => setData('weight_lpj', parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00bcd4] focus:outline-none"
                                            />
                                            {errors.weight_lpj && <p className="text-xs text-rose-500 font-bold">{errors.weight_lpj}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. SECTION VALUES CONSTRAINTS */}
                                <div>
                                    <h4 className="text-[11px] font-black text-cyan-500 uppercase tracking-wider mb-5 border-b border-slate-50 pb-2">
                                        Batasan Konstrain Nilai Kriteria
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Waktu Bounds */}
                                        <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                            <p className="text-xs font-black text-slate-700 border-b border-slate-100 pb-1 mb-2">Kesesuaian Waktu</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Min Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.waktu_min}
                                                        onChange={e => setData('waktu_min', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Max Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.waktu_max}
                                                        onChange={e => setData('waktu_max', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Anggaran Bounds */}
                                        <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                            <p className="text-xs font-black text-slate-700 border-b border-slate-100 pb-1 mb-2">Ketepatan Anggaran</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Min Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.anggaran_min}
                                                        onChange={e => setData('anggaran_min', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Max Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.anggaran_max}
                                                        onChange={e => setData('anggaran_max', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Output Bounds */}
                                        <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                            <p className="text-xs font-black text-slate-700 border-b border-slate-100 pb-1 mb-2">Kesesuaian Output</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Min Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.output_min}
                                                        onChange={e => setData('output_min', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Max Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.output_max}
                                                        onChange={e => setData('output_max', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* LPJ Bounds & Penalty */}
                                        <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                            <p className="text-xs font-black text-slate-700 border-b border-slate-100 pb-1 mb-2">Ketepatan LPJ</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Min Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.lpj_min}
                                                        onChange={e => setData('lpj_min', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Max Nilai</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.lpj_max}
                                                        onChange={e => setData('lpj_max', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Denda / Hari Laju</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-xs rounded-lg border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 py-1.5"
                                                        value={data.lpj_penalty_per_day}
                                                        onChange={e => setData('lpj_penalty_per_day', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Warnings if max < min */}
                                    <div className="mt-4 space-y-1">
                                        {data.waktu_max <= data.waktu_min && <p className="text-xs text-rose-500 font-bold">Nilai Max Kesesuaian Waktu harus lebih besar dari Min.</p>}
                                        {data.anggaran_max <= data.anggaran_min && <p className="text-xs text-rose-500 font-bold">Nilai Max Ketepatan Anggaran harus lebih besar dari Min.</p>}
                                        {data.output_max <= data.output_min && <p className="text-xs text-rose-500 font-bold">Nilai Max Kesesuaian Output harus lebih besar dari Min.</p>}
                                        {data.lpj_max <= data.lpj_min && <p className="text-xs text-rose-500 font-bold">Nilai Max Ketepatan LPJ harus lebih besar dari Min.</p>}
                                    </div>
                                </div>

                                {/* Form Action Buttons */}
                                <div className="flex justify-end pt-4 border-t border-slate-50">
                                    <button
                                        type="submit"
                                        disabled={processing || !isSumValid || data.waktu_max <= data.waktu_min || data.anggaran_max <= data.anggaran_min || data.output_max <= data.output_min || data.lpj_max <= data.lpj_min}
                                        className="bg-[#00bcd4] hover:bg-cyan-500 text-white font-black py-3 px-8 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-xs sm:text-sm"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan & Terapkan Konfigurasi'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* CATEGORY BREAKDOWN VISUAL (Right Column) */}
                        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-1">
                                    Distribusi Predikat Kinerja
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mb-6">Persentase capaian kualitas berdasarkan kriteria nilai akhir evaluasi.</p>
                                
                                <div className="space-y-5">
                                    {/* Sangat Baik */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Sangat Baik (&ge; 85)</span>
                                            <span>{statistics.category_counts['Sangat Baik']} ({statistics.total_evaluated > 0 ? round((statistics.category_counts['Sangat Baik'] / statistics.total_evaluated) * 100, 0) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div 
                                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${statistics.total_evaluated > 0 ? (statistics.category_counts['Sangat Baik'] / statistics.total_evaluated) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Baik */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#00bcd4] rounded-full"></span> Baik (70 - 84)</span>
                                            <span>{statistics.category_counts['Baik']} ({statistics.total_evaluated > 0 ? round((statistics.category_counts['Baik'] / statistics.total_evaluated) * 100, 0) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div 
                                                className="bg-[#00bcd4] h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${statistics.total_evaluated > 0 ? (statistics.category_counts['Baik'] / statistics.total_evaluated) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Cukup */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Cukup (55 - 69)</span>
                                            <span>{statistics.category_counts['Cukup']} ({statistics.total_evaluated > 0 ? round((statistics.category_counts['Cukup'] / statistics.total_evaluated) * 100, 0) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div 
                                                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${statistics.total_evaluated > 0 ? (statistics.category_counts['Cukup'] / statistics.total_evaluated) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Kurang */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Kurang (&lt; 55)</span>
                                            <span>{statistics.category_counts['Kurang']} ({statistics.total_evaluated > 0 ? round((statistics.category_counts['Kurang'] / statistics.total_evaluated) * 100, 0) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-1.5">
                                            <div 
                                                className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${statistics.total_evaluated > 0 ? (statistics.category_counts['Kurang'] / statistics.total_evaluated) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TARGET AND LEGACY NOTE */}
                            <div className="mt-8 p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100/50 text-[11px] text-cyan-800 space-y-1.5">
                                <p className="font-black">Cara Kerja Perhitungan SPK:</p>
                                <p className="leading-relaxed font-semibold opacity-90">
                                    Skor Akhir dihitung otomatis dengan menjumlahkan perkalian nilai riil kriteria dengan masing-masing bobotnya kemudian dibagi 100. Kategori kinerja yang tertera langsung disinkronkan ke seluruh data LPJ secara dinamis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* LOWER SECTION: DETAILED EVALUATION TABLE */}
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up">
                        {/* Table Header Controls */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    Hasil Evaluasi Kinerja Kegiatan
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Daftar semua kegiatan yang sudah mengunggah LPJ beserta rincian parameter pendukung keputusan.</p>
                            </div>
                            
                            {/* SEARCH BAR */}
                            <div className="w-full md:w-80">
                                <input
                                    type="text"
                                    className="w-full py-2 px-4 text-xs rounded-xl border-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition duration-200 bg-white"
                                    placeholder="Cari kegiatan, pengusul..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table Data */}
                        <div className="overflow-x-auto min-h-[200px]">
                            <table className="min-w-full divide-y divide-slate-50 text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/50">
                                        <th scope="col" className="px-6 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">No.</th>
                                        <th scope="col" className="px-6 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Detail Kegiatan / Pengusul</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider">Waktu ({spk_config.weight_waktu}%)</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider">Anggaran ({spk_config.weight_anggaran}%)</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider">Output ({spk_config.weight_output}%)</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider">LPJ ({spk_config.weight_lpj}%)</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider bg-slate-50/80">Nilai Akhir</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-black text-cyan-500 uppercase tracking-wider">Kategori</th>
                                        <th scope="col" className="px-6 py-4 text-left text-[11px] font-black text-cyan-500 uppercase tracking-wider">Tgl LPJ Masuk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((keg, index) => (
                                            <tr key={keg.kegiatan_id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 whitespace-nowrap text-[13px] text-slate-400 font-bold">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-5 max-w-sm">
                                                    <div className="font-bold text-[14px] text-slate-800 leading-snug">{keg.nama_kegiatan}</div>
                                                    <div className="text-[11px] font-black text-cyan-500 mt-1 uppercase tracking-wide">Pengusul: {keg.pengusul}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-bold text-slate-600">
                                                    {keg.waktu_score}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-bold text-slate-600">
                                                    {keg.anggaran_score}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-bold text-slate-600">
                                                    {keg.output_score === 100 ? '100' : '0'}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-bold text-slate-600">
                                                    {keg.lpj_score}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-black text-cyan-600 bg-cyan-50/20">
                                                    {keg.total_score}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center">
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-black rounded-lg ${getKategoriBadgeClass(keg.kategori)}`}>
                                                        {keg.kategori}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-[12px] text-slate-400 font-bold">
                                                    {keg.lpj_submitted_at}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-16 text-center text-slate-400 font-medium text-sm">
                                                Belum ada data evaluasi kinerja kegiatan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer Controls */}
                        {filteredKegiatans.length > 0 && (
                            <div className="px-6 py-4 bg-white border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">
                                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredKegiatans.length)} dari {filteredKegiatans.length} entri
                                </span>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-bold"
                                    >
                                        &laquo;
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition duration-150 ${currentPage === i + 1
                                                ? 'bg-[#00bcd4] text-white shadow-md shadow-cyan-500/10'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-bold"
                                    >
                                        &raquo;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Simple rounding helper to prevent decimal errors
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
