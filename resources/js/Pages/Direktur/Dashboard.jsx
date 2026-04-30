import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    TrendingUp,
    DollarSign,
    PieChart,
    Check,
    Clock,
    FileText,
    Layers,
    Building,
    AlertCircle,
    Award,
    Download,
    X,
    Sparkles
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = '#64748b';
ChartJS.defaults.scale.grid.color = '#f1f5f9';

const formatMoney = (amount) => {
    if (!amount) return 'Rp 0';
    if (amount >= 1e9) return `Rp ${(amount / 1e9).toFixed(1)}M`;
    if (amount >= 1e6) return `Rp ${(amount / 1e6).toFixed(1)}Jt`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const formatMoneyShort = (amount) => {
    if (!amount) return 'Rp 0';
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}M`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}Jt`;
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount);
};

export default function Dashboard({ dashboardData }) {
    const { overview, by_jurusan, trends, recent_activities, videos, period } = dashboardData;

    const [selectedUnit, setSelectedUnit] = useState(null);

    const handlePeriodChange = (newPeriod) => {
        router.get(route('dashboard.direktur'), { period: newPeriod }, {
            preserveState: true,
            preserveScroll: true,
            only: ['dashboardData']
        });
    };

    const getDaysStuck = (dateStr) => {
        if (!dateStr) return 0;
        const lastUpdate = new Date(dateStr.replace(' ', 'T'));
        const now = new Date();
        const diffTime = Math.abs(now - lastUpdate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const activeItems = recent_activities.filter(a => a.status === 'Aktif');
    const sortedActs = [...activeItems].sort((a, b) => getDaysStuck(b.created_at) - getDaysStuck(a.created_at));

    // Best and worst unit logic
    const bestUnit = [...by_jurusan].sort((a, b) => b.persentase_serapan - a.persentase_serapan)[0] || { nama_jurusan: '-', persentase_serapan: 0 };
    const worstUnit = [...by_jurusan].sort((a, b) => (b.dana_diminta - b.dana_terserap) - (a.dana_diminta - a.dana_terserap))[0] || { nama_jurusan: '-', dana_diminta: 0, dana_terserap: 0 };
    const isGood = overview.persentase_serapan > 50;
    const currentTotal = trends[trends.length - 1]?.total_kegiatan || 0;
    const prevTotal = trends[trends.length - 2]?.total_kegiatan || 0;
    const isGrowing = currentTotal >= prevTotal;
    const growth = overview.budget_growth || 0;

    const trendsChartData = {
        labels: trends.map(t => t.periode),
        datasets: [
            {
                label: 'Rencana Anggaran (Juta)',
                data: trends.map(t => t.dana_diminta / 1000000),
                backgroundColor: '#e2e8f0',
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                order: 2
            },
            {
                label: 'Realisasi Serapan (Juta)',
                data: trends.map(t => t.dana_terserap / 1000000),
                backgroundColor: '#06b6d4',
                borderRadius: 4,
                barPercentage: 0.4,
                categoryPercentage: 0.7,
                order: 1
            }
        ]
    };

    const trendsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', align: 'end' },
            tooltip: {
                mode: 'index', intersect: false,
                callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} Jt`
                }
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { color: '#f1f5f9', borderDash: [5, 5] },
                beginAtZero: true,
                ticks: { callback: (val) => val + ' Jt' }
            }
        }
    };

    const sortedJurusan = [...by_jurusan].sort((a, b) => b.kak_diajukan - a.kak_diajukan);
    const jurusanChartData = {
        labels: sortedJurusan.map(j => j.nama_jurusan
            .replace('Teknik Informatika Komputer', 'TIK')
            .replace('Teknik ', 'T. ')
            .replace('Administrasi ', 'Adm. ')
            .replace('Grafika dan Penerbitan', 'Grafika')
        ),
        datasets: [{
            label: 'Jumlah Pengajuan',
            data: sortedJurusan.map(j => j.kak_diajukan),
            backgroundColor: '#06b6d4', // simplified gradient for react-chartjs
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.8
        }]
    };

    const jurusanChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 10
            }
        },
        scales: {
            x: { grid: { display: false, drawBorder: false }, ticks: { precision: 0 } },
            y: { grid: { display: false, drawBorder: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: '500' }, color: '#64748b' } }
        }
    };

    const danaTotal = by_jurusan.reduce((acc, curr) => acc + curr.dana_terserap, 0);
    const danaChartData = danaTotal === 0 ? {
        labels: [], datasets: [{ data: [1], backgroundColor: ['#f1f5f9'], borderWidth: 0 }]
    } : {
        labels: by_jurusan.map(j => j.nama_jurusan),
        datasets: [{
            data: by_jurusan.map(j => j.dana_terserap),
            backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
        }]
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard Direktur
                </h2>
            }
        >
            <Head title="Dashboard Direktur" />

            <div className="py-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header & Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-[fadeInUp_0.5s_ease-out]">
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                                Dashboard Direktur
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Monitoring Kinerja & Anggaran Terkini</p>
                        </div>
                        <div className="flex bg-white/80 p-1 rounded-xl backdrop-blur-md shadow-sm border border-slate-200">
                            {[
                                { val: '3months', label: '3 Bln' },
                                { val: '6months', label: '6 Bln' },
                                { val: '1year', label: '1 Thn' },
                                { val: 'year', label: 'Tahun Ini' },
                                { val: 'all', label: 'Semua' }
                            ].map(btn => (
                                <button
                                    key={btn.val}
                                    onClick={() => handlePeriodChange(btn.val)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${period === btn.val
                                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/40'
                                        : 'text-slate-500 hover:text-cyan-600 hover:bg-cyan-50'
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Executive Summary */}
                    <div className="animate-[fadeInUp_0.5s_ease-out]">
                        {isGood ? (
                            <div className="bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-500 p-6 rounded-xl shadow-sm flex gap-4 items-start">
                                <div className="bg-cyan-500 text-white p-2 rounded-full mt-1">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="m-0 mb-2 text-cyan-900 text-base font-bold">Executive Summary: Kinerja Positif</h4>
                                    <p className="m-0 text-slate-600 text-sm leading-relaxed">
                                        Realisasi anggaran berjalan <strong>sangat baik</strong> ({overview.persentase_serapan}%).
                                        Apresiasi untuk <strong>{bestUnit?.nama_jurusan}</strong> yang memimpin efisiensi.
                                        Tren kegiatan {isGrowing ? 'sedang meningkat' : 'stabil'}, pertahankan momentum ini.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border-l-4 border-amber-500 p-6 rounded-xl shadow-sm flex gap-4 items-start">
                                <div className="bg-amber-100 text-amber-600 p-2 rounded-full mt-1">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="m-0 mb-2 text-amber-900 text-base font-bold">Executive Summary: Perlu Perhatian</h4>
                                    <p className="m-0 text-slate-600 text-sm leading-relaxed">
                                        Serapan anggaran masih di angka <strong>{overview.persentase_serapan}%</strong>.
                                        Mohon tinjau <strong>{worstUnit?.nama_jurusan}</strong> untuk akselerasi kegiatan.
                                        Pastikan tidak ada bottleneck administrasi pada kegiatan yang sedang berlangsung.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Total Pengajuan</div>
                                <div className="text-3xl font-bold leading-tight drop-shadow-sm">{overview.total_kak}</div>
                                <div className="text-xs text-white/80 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                <FileText size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-cyan-500/10 flex justify-between items-start group hover:border-cyan-200">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Kegiatan Selesai</div>
                                <div className="text-3xl font-bold leading-tight text-cyan-500">{overview.kegiatan_selesai}</div>
                                <div className="text-xs text-slate-400 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                                <Check size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Total Anggaran</div>
                                <div className="text-2xl font-bold leading-tight drop-shadow-sm">{formatMoney(overview.dana_diminta)}</div>
                                <div className="text-xs text-white/80 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                <div className="font-bold text-xl">Rp</div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-cyan-500/10 flex justify-between items-start group hover:border-cyan-200">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Realisasi Dana</div>
                                <div className="text-2xl font-bold leading-tight text-cyan-500">{formatMoney(overview.dana_terserap)}</div>
                                <div className="text-xs text-slate-400 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                                <PieChart size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Insights Box */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Serapan Terbaik</div>
                                <div className="text-2xl font-bold text-cyan-500">{bestUnit.nama_jurusan}</div>
                                <div className="text-emerald-500 font-semibold mt-1 text-sm">{bestUnit.persentase_serapan}% Serapan</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                                <Award size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Sisa Anggaran Terbesar</div>
                                <div className="text-2xl font-bold">{worstUnit.nama_jurusan}</div>
                                <div className="text-white/90 font-medium mt-1 text-sm">Sisa {formatMoneyShort(worstUnit.dana_diminta - worstUnit.dana_terserap)}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl p-6 bg-white border border-slate-100 shadow-sm flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Tren Anggaran</div>
                                <div className="text-3xl font-bold text-cyan-500">{growth > 0 ? '+' : ''}{growth}%</div>
                                <div className="text-slate-500 font-medium mt-1 text-sm">vs Periode Lalu</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Layout Grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Trend Realisasi & Kegiatan */}
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-500"><TrendingUp size={20} /></div>
                                        Trend Realisasi & Kegiatan
                                    </div>
                                </div>
                                <div className="h-[350px] w-full">
                                    <Bar data={trendsChartData} options={trendsChartOptions} />
                                </div>
                            </div>

                            {/* Komparasi Unit */}
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-500"><Layers size={20} /></div>
                                        Komparasi Unit/Jurusan
                                    </div>
                                </div>
                                <div className="h-[280px] w-full">
                                    <Bar data={jurusanChartData} options={jurusanChartOptions} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Komposisi Dana */}
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-500"><PieChart size={20} /></div>
                                        Komposisi Dana
                                    </div>
                                </div>
                                <div className="h-[250px] flex items-center justify-center relative">
                                    {danaTotal === 0 && (
                                        <div className="absolute text-center text-slate-400">
                                            <div className="text-4xl opacity-50 mb-2">🍩</div>
                                            <div className="font-semibold text-sm">Data Kosong</div>
                                        </div>
                                    )}
                                    <Doughnut data={danaChartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                </div>
                            </div>

                            {/* Priority Feed */}
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 rounded-lg text-red-500"><AlertCircle size={20} /></div>
                                        Perlu Perhatian
                                    </div>
                                </div>
                                <div className="overflow-y-auto pr-2 max-h-[400px]">
                                    {sortedActs.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <div className="text-4xl mb-2">👍</div>
                                            <div className="font-semibold">Lancar Jaya</div>
                                            <div className="text-sm">Tidak ada antrian yang macet.</div>
                                        </div>
                                    ) : (
                                        sortedActs.map((act, i) => {
                                            const days = getDaysStuck(act.created_at);
                                            let style = { color: '#3b82f6', bg: 'bg-blue-50', icon: '⏳', label: 'BARU' };
                                            let warningBadge = '';

                                            if (days > 7) {
                                                style = { color: '#ef4444', bg: 'bg-red-50', icon: '🔥', label: 'KRITIS' };
                                                warningBadge = <span className="bg-red-100 text-red-500 text-[0.65rem] px-1.5 py-0.5 rounded font-extrabold border border-red-200">STUCK {days} HARI</span>;
                                            } else if (days > 3) {
                                                style = { color: '#f97316', bg: 'bg-orange-50', icon: '⚠️', label: 'LAMBAT' };
                                                warningBadge = <span className="bg-orange-100 text-orange-700 text-[0.65rem] px-1.5 py-0.5 rounded font-extrabold border border-orange-200">{days} HARI</span>;
                                            } else {
                                                warningBadge = <span className="bg-blue-100 text-blue-800 text-[0.65rem] px-1.5 py-0.5 rounded font-extrabold">{days} HARI</span>;
                                            }

                                            let posisi = <span>di meja <strong>{act.approval_level}</strong></span>;
                                            if (act.approval_level === 'Wadir2') posisi = <span>menunggu <strong>Wadir 2</strong></span>;
                                            if (act.approval_level === 'PPK') posisi = <span>verifikasi <strong>PPK</strong></span>;

                                            return (
                                                <div key={i} className={`p-3 mb-3 rounded-xl border-l-4 shadow-sm transition-colors hover:bg-cyan-50 ${style.bg}`} style={{ borderColor: style.color }}>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <div className="flex gap-1.5 items-center">
                                                            {warningBadge}
                                                            <span className="text-[0.7rem] text-slate-500">di {act.approval_level}</span>
                                                        </div>
                                                        <span className="text-base">{style.icon}</span>
                                                    </div>
                                                    <div className="font-bold text-sm text-slate-800 leading-tight mb-1">
                                                        {act.nama_kegiatan}
                                                    </div>
                                                    <div className="text-xs text-slate-600">
                                                        Sudah {days} hari tertahan {posisi}.
                                                    </div>
                                                    <div className="text-[0.7rem] text-slate-400 mt-1.5 pt-1.5 border-t border-dashed border-slate-200 italic">
                                                        Pengusul: {act.jurusan}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Performa Unit */}
                    <div className="flex items-center gap-4 mt-10 mb-6">
                        <div className="text-lg font-bold text-cyan-700 flex items-center gap-2.5 bg-white px-5 py-2 rounded-full shadow-sm">
                            <span className="text-cyan-500"><FileText size={20} /></span> Detail Performa Unit
                        </div>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-30"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {by_jurusan.map((unit, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1 group cursor-pointer" onClick={() => setSelectedUnit(unit)}>
                                <div className="p-5 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center rounded-t-2xl">
                                    <div className="font-bold text-slate-800">{unit.nama_jurusan}</div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Pengajuan KAK</span>
                                        <span className="font-bold text-slate-800">{unit.kak_diajukan}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Kegiatan Selesai</span>
                                        <span className="font-bold text-slate-800">{unit.kegiatan_selesai}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Dana Diminta</span>
                                        <span className="font-bold text-slate-800">{formatMoneyShort(unit.dana_diminta)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Persentase Serapan</span>
                                        <span className={`font-bold ${unit.persentase_serapan >= 70 ? 'text-emerald-500' : unit.persentase_serapan >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                            {unit.persentase_serapan}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Video Panduan */}
                    {videos && videos.length > 0 && (
                        <>
                            <div className="flex items-center gap-4 mt-10 mb-6">
                                <div className="text-lg font-bold text-cyan-700 flex items-center gap-2.5 bg-white px-5 py-2 rounded-full shadow-sm">
                                    <span className="text-cyan-500">🎥</span> Video Panduan
                                </div>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-30"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((vid, i) => {
                                    let embedUrl = vid.url;
                                    if (vid.url.includes('youtube.com/watch?v=')) {
                                        embedUrl = vid.url.replace('watch?v=', 'embed/');
                                    } else if (vid.url.includes('youtu.be/')) {
                                        embedUrl = vid.url.replace('youtu.be/', 'www.youtube.com/embed/');
                                    }

                                    return (
                                        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={embedUrl}
                                                title={vid.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                            <div className="p-4 font-semibold text-slate-800 text-sm">{vid.title}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* Modal Detail Unit */}
            {selectedUnit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg"><Building size={20} /></div>
                                <div>
                                    <h3 className="m-0 text-lg font-bold text-slate-800">{selectedUnit.nama_jurusan}</h3>
                                    <p className="m-0 text-sm text-slate-500">Statistik lengkap</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUnit(null)} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-500 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">KAK Diajukan</span>
                                    <span className="font-bold text-lg">{selectedUnit.kak_diajukan}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Kegiatan Berlangsung</span>
                                    <span className="font-bold text-lg text-amber-500">{selectedUnit.kegiatan_berlangsung}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Kegiatan Selesai</span>
                                    <span className="font-bold text-lg text-emerald-500">{selectedUnit.kegiatan_selesai}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Dana Diminta</span>
                                    <span className="font-bold text-lg">{formatMoney(selectedUnit.dana_diminta)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500">Dana Terserap</span>
                                    <span className="font-bold text-lg text-cyan-500">{formatMoney(selectedUnit.dana_terserap)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
