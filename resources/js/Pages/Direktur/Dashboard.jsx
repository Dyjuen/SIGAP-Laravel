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
    Sparkles,
    Sliders,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    Maximize2,
    List,
    Eye,
    Calculator,
    Target,
    BarChart2
} from 'lucide-react';
import gsap from 'gsap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineController,
    BarController
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineController,
    BarController
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
    const { overview, by_jurusan, trends, recent_activities, videos, period, topsis_activities, spk_config } = dashboardData;

    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isSwitching, setIsSwitching] = useState(false);
    const [expandedJurusan, setExpandedJurusan] = useState(null);
    const [showTechnicalAudit, setShowTechnicalAudit] = useState(false);
    const [focusYAxis, setFocusYAxis] = useState(false);
    const [showTrendsTable, setShowTrendsTable] = useState(false);
    const [topsisDetailModal, setTopsisDetailModal] = useState(null); // activity object | null
    const [topsisModalTab, setTopsisModalTab] = useState(0); // 0=Raw, 1=Normalisasi, 2=Ideal, 3=Skor

    useEffect(() => {
        const timer = setTimeout(() => {
            gsap.set('.kpi-card', { opacity: 0, y: 20 });
            gsap.set('.dashboard-section', { opacity: 0, y: 30 });

            gsap.to('.kpi-card', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                clearProps: 'opacity,transform'
            });

            gsap.to('.dashboard-section', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power2.out',
                clearProps: 'opacity,transform'
            });
        }, 150);

        return () => clearTimeout(timer);
    }, [period]);

    // Use pre-calculated TOPSIS values from backend (includes debug data for audit modal)
    const activeTopsis = React.useMemo(() => {
        if (!topsis_activities || topsis_activities.length === 0) {
            return { activities: [], jurusans: [] };
        }

        // Backend already sorted by topsis_score desc
        const activities = topsis_activities;

        // Group by department
        const groups = {};
        activities.forEach(act => {
            if (!groups[act.jurusan]) groups[act.jurusan] = [];
            groups[act.jurusan].push(act);
        });

        const jurusans = Object.keys(groups).map(jurusan => {
            const acts = groups[jurusan];
            const avg_score = acts.reduce((sum, val) => sum + val.topsis_score, 0) / acts.length;
            const avg_c1 = acts.reduce((sum, val) => sum + val.c1, 0) / acts.length;
            const avg_c2 = acts.reduce((sum, val) => sum + val.c2, 0) / acts.length;
            const avg_c3 = acts.reduce((sum, val) => sum + val.c3, 0) / acts.length;
            const avg_c4 = acts.reduce((sum, val) => sum + val.c4, 0) / acts.length;

            return {
                nama_jurusan: jurusan,
                avg_score,
                avg_c1,
                avg_c2,
                avg_c3,
                avg_c4,
                activities: acts,
                kak_diajukan: by_jurusan.find(j => j.nama_jurusan === jurusan)?.kak_diajukan || 0,
                kegiatan_selesai: by_jurusan.find(j => j.nama_jurusan === jurusan)?.kegiatan_selesai || 0,
                persentase_serapan: by_jurusan.find(j => j.nama_jurusan === jurusan)?.persentase_serapan || 0,
                dana_diminta: by_jurusan.find(j => j.nama_jurusan === jurusan)?.dana_diminta || 0,
                dana_terserap: by_jurusan.find(j => j.nama_jurusan === jurusan)?.dana_terserap || 0,
            };
        });

        jurusans.sort((a, b) => b.avg_score - a.avg_score);

        return { activities, jurusans };
    }, [topsis_activities, by_jurusan]);

    const handlePeriodChange = (newPeriod) => {
        setIsSwitching(true);
        router.get(route('dashboard.direktur'), { period: newPeriod }, {
            preserveState: true,
            preserveScroll: true,
            only: ['dashboardData'],
            onFinish: () => setIsSwitching(false)
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

    const getRankExplanation = (jur) => {
        const reasons = [];
        if (jur.avg_c1 >= 85) reasons.push("pelaksanaan kegiatan sangat tepat waktu");
        if (jur.avg_c2 >= 85) reasons.push("realisasi anggaran efisien sesuai KAK");
        if (jur.avg_c3 >= 85) reasons.push("penyelesaian output sesuai target");
        if (jur.avg_c4 >= 85) reasons.push("administrasi LPJ tertib dan disiplin");

        const challenges = [];
        if (jur.avg_c1 < 70) challenges.push("penjadwalan kegiatan kurang konsisten");
        if (jur.avg_c2 < 70) challenges.push("deviasi realisasi anggaran cukup tinggi");
        if (jur.avg_c4 < 70) challenges.push("pelaporan LPJ sering terlambat");

        if (reasons.length > 0) {
            let text = reasons.slice(0, 2).join(", ");
            if (challenges.length > 0) {
                text += `, namun perlu perhatian khusus pada ${challenges.slice(0, 1).join("")}`;
            }
            return text.charAt(0).toUpperCase() + text.slice(1) + ".";
        } else if (challenges.length > 0) {
            return `Perlu perbaikan intensif pada aspek ${challenges.join(" serta ")}.`;
        }
        return "Secara umum, kinerja administrasi dan ketepatan pelaksanaan kegiatan berada pada level stabil.";
    };

    const getAiSummary = () => {
        if (!activeTopsis.jurusans || activeTopsis.jurusans.length === 0) {
            return "Belum ada analisis data kinerja terdaftar untuk periode ini.";
        }

        const topJurusan = activeTopsis.jurusans[0];
        const lowJurusan = activeTopsis.jurusans[activeTopsis.jurusans.length - 1];

        let summary = `Unit ${topJurusan.nama_jurusan} memimpin dengan kinerja administrasi terbaik (Indeks: ${topJurusan.avg_score.toFixed(4)}), didukung oleh ketepatan waktu dan LPJ yang sangat tertib.`;

        if (lowJurusan && lowJurusan.nama_jurusan !== topJurusan.nama_jurusan) {
            if (lowJurusan.avg_c4 < 70) {
                summary += ` Sebaliknya, unit ${lowJurusan.nama_jurusan} memerlukan pendampingan intensif karena rendahnya tingkat kepatuhan waktu penyerahan LPJ (rata-rata ${lowJurusan.avg_c4.toFixed(1)}%).`;
            } else if (lowJurusan.avg_c2 < 70) {
                summary += ` Sebaliknya, unit ${lowJurusan.nama_jurusan} perlu dievaluasi dalam perencanaan anggaran karena deviasi realisasi dana yang cukup tinggi.`;
            } else {
                summary += ` Unit ${lowJurusan.nama_jurusan} berada di posisi terbawah dan memerlukan akselerasi peningkatan tata kelola administrasi kegiatan.`;
            }
        }

        return summary;
    };

    const activeTrends = React.useMemo(() => {
        if (focusYAxis) {
            // Filter out months that have zero activities and zero budget rencana and zero realisasi
            return trends.filter(t => t.total_kegiatan > 0 || t.dana_diminta > 0 || t.dana_terserap > 0);
        }
        return trends;
    }, [trends, focusYAxis]);

    const trendsChartData = {
        labels: activeTrends.map(t => t.periode),
        datasets: [
            {
                type: 'line',
                label: 'Realisasi Serapan (Juta)',
                data: activeTrends.map(t => t.dana_terserap / 1000000),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 3,
                pointHoverRadius: 6,
                yAxisID: 'y',
                order: 1
            },
            {
                type: 'bar',
                label: 'Rencana Anggaran (Juta)',
                data: activeTrends.map(t => t.dana_diminta / 1000000),
                backgroundColor: '#f1f5f9',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.45,
                categoryPercentage: 0.6,
                yAxisID: 'y',
                order: 3
            },
            {
                type: 'line',
                label: 'Jumlah Kegiatan',
                data: activeTrends.map(t => t.total_kegiatan),
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.35,
                yAxisID: 'y1',
                order: 2
            },
            {
                type: 'line',
                label: 'Perlu Perhatian (Hambatan)',
                data: activeTrends.map(t => t.perlu_perhatian || 0),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.35,
                yAxisID: 'y1',
                order: 4
            }
        ]
    };

    const trendsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: '600'
                    },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 12,
                    weight: 'bold'
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 11
                },
                callbacks: {
                    label: (ctx) => {
                        if (ctx.dataset.yAxisID === 'y1') {
                            return ` ${ctx.dataset.label}: ${ctx.raw} Kegiatan`;
                        }
                        return ` ${ctx.dataset.label}: Rp ${ctx.raw.toFixed(1)} Jt`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 10,
                        weight: '600'
                    },
                    color: '#64748b'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: !focusYAxis,
                grid: { color: '#f1f5f9', borderDash: [5, 5] },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 10
                    },
                    color: '#64748b',
                    callback: (val) => val + ' Jt'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: !focusYAxis,
                grid: { drawOnChartArea: false },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 10
                    },
                    color: '#64748b',
                    callback: (val) => val + ' Keg',
                    precision: 0
                }
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

    // ── TOPSIS Detail Modal Component ──────────────────────────────────────────────
    const TopsisDetailModal = ({ act, onClose }) => {
        if (!act) return null;
        const tabs = [
            { label: 'Nilai Kriteria', icon: <Calculator size={14} /> },
            { label: 'Normalisasi', icon: <BarChart2 size={14} /> },
            { label: 'Solusi Ideal', icon: <Target size={14} /> },
            { label: 'Skor Akhir', icon: <Award size={14} /> },
        ];

        const c1d = act.c1_debug || {};
        const c2d = act.c2_debug || {};
        const c3d = act.c3_debug || {};
        const c4d = act.c4_debug || {};


        const fmt6 = (n) => (n != null ? parseFloat(n).toFixed(6) : '—');
        const fmt4 = (n) => (n != null ? parseFloat(n).toFixed(4) : '—');
        const fmtRp = (n) => n != null ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : '—';

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-cyan-50 to-white">
                        <div>
                            <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Detail Perhitungan TOPSIS</div>
                            <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{act.nama_kegiatan}</h3>
                            <div className="text-xs text-slate-500 mt-0.5">{act.jurusan}</div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 bg-slate-50/50">
                        {tabs.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setTopsisModalTab(i)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-bold transition-all border-b-2 ${topsisModalTab === i
                                        ? 'border-cyan-500 text-cyan-600 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="overflow-y-auto flex-1 p-5">

                        {/* Tab 0: Nilai Kriteria Mentah */}
                        {topsisModalTab === 0 && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500">Nilai mentah setiap kriteria sebelum normalisasi. Semua kriteria berskala 0–100.</p>

                                {/* C1 */}
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-extrabold text-cyan-700">C1 – Kesesuaian Waktu</span>
                                        <span className="text-lg font-black text-cyan-500">{act.c1}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-2">
                                        {c1d.source === 'calculated' && (<>
                                            <div className="flex justify-between"><span>Rencana ({c1d.tgl_mulai_rencana} → {c1d.tgl_selesai_rencana})</span><span className="font-bold">{c1d.durasi_rencana} hari</span></div>
                                            <div className="flex justify-between"><span>Aktual ({c1d.tgl_mulai_aktual} → {c1d.tgl_selesai_aktual})</span><span className="font-bold">{c1d.durasi_aktual} hari</span></div>
                                            <div className="flex justify-between"><span>Deviasi</span><span className="font-bold text-amber-600">{c1d.deviasi_persen}%</span></div>
                                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                                <span className="text-slate-400">Rumus Kriteria</span>
                                                <div className="flex items-center gap-1 font-serif text-xs text-cyan-800 bg-cyan-50/40 px-2.5 py-1.5 rounded-lg border border-cyan-100/50">
                                                    <span className="italic font-bold">C</span>
                                                    <sub className="text-[9px] font-bold">1</sub>
                                                    <span className="mx-1">=</span>
                                                    <span className="font-sans font-bold text-[9px] uppercase tracking-wide bg-white px-1.5 py-0.5 rounded border border-slate-200">max</span>
                                                    <span>(50, 100 &minus; {c1d.deviasi_persen}%) = {act.c1}</span>
                                                </div>
                                            </div>
                                        </>)}
                                    </div>
                                </div>

                                {/* C2 */}
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-extrabold text-cyan-700">C2 – Ketepatan Anggaran</span>
                                        <span className="text-lg font-black text-cyan-500">{act.c2}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-2">
                                        {c2d.source === 'calculated' && (<>
                                            <div className="flex justify-between"><span>Rencana (KAK)</span><span className="font-bold">{fmtRp(c2d.anggaran_rencana)}</span></div>
                                            <div className="flex justify-between"><span>Realisasi</span><span className="font-bold">{fmtRp(c2d.anggaran_aktual)}</span></div>
                                            <div className="flex justify-between"><span>Deviasi</span><span className="font-bold text-amber-600">{c2d.deviasi_persen}%</span></div>
                                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                                <span className="text-slate-400">Rumus Kriteria</span>
                                                <div className="flex items-center gap-1 font-serif text-xs text-cyan-800 bg-cyan-50/40 px-2.5 py-1.5 rounded-lg border border-cyan-100/50">
                                                    <span className="italic font-bold">C</span>
                                                    <sub className="text-[9px] font-bold">2</sub>
                                                    <span className="mx-1">=</span>
                                                    <span className="font-sans font-bold text-[9px] uppercase tracking-wide bg-white px-1.5 py-0.5 rounded border border-slate-200">max</span>
                                                    <span>(50, 100 &minus; {c2d.deviasi_persen}%) = {act.c2}</span>
                                                </div>
                                            </div>
                                        </>)}
                                    </div>
                                </div>

                                {/* C3 */}
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-extrabold text-cyan-700">C3 – Kesesuaian Output (IKU)</span>
                                        <span className="text-lg font-black text-cyan-500">{act.c3}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-2">
                                        {c3d.source === 'calculated' && (<>
                                            <div className="flex justify-between"><span>Total IKU</span><span className="font-bold">{c3d.total_iku}</span></div>
                                            <div className="flex justify-between"><span>IKU Terpenuhi</span><span className="font-bold text-emerald-600">{c3d.terpenuhi}</span></div>
                                            <div className="flex justify-between"><span>Persentase</span><span className="font-bold">{c3d.persentase}%</span></div>
                                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                                <span className="text-slate-400">Rumus Kriteria</span>
                                                <div className="flex items-center gap-1 font-serif text-xs text-cyan-800 bg-cyan-50/40 px-2.5 py-1.5 rounded-lg border border-cyan-100/50">
                                                    <span className="italic font-bold">C</span>
                                                    <sub className="text-[9px] font-bold">3</sub>
                                                    <span className="mx-1">=</span>
                                                    <span className="text-sm font-sans leading-none">&lfloor;</span>
                                                    <div className="inline-flex flex-col items-center mx-1">
                                                        <span className="border-b border-cyan-200 pb-0.5 px-1 font-semibold leading-none text-[10px]">{c3d.terpenuhi}</span>
                                                        <span className="pt-0.5 px-1 font-semibold leading-none text-[10px]">{c3d.total_iku}</span>
                                                    </div>
                                                    <span className="mx-1 font-sans">&times;</span>
                                                    <span>100</span>
                                                    <span className="text-sm font-sans leading-none">&rfloor;</span>
                                                    <span className="mx-1.5 font-sans text-cyan-600/70">=</span>
                                                    <span>{act.c3}</span>
                                                </div>
                                            </div>
                                        </>)}
                                    </div>
                                </div>

                                {/* C4 */}
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-extrabold text-cyan-700">C4 – Ketepatan LPJ</span>
                                        <span className="text-lg font-black text-cyan-500">{act.c4}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 space-y-2">
                                        {c4d.source === 'calculated' && (<>
                                            <div className="flex justify-between"><span>Hari di Bendahara-LPJ</span><span className="font-bold">{c4d.hari_di_lpj ?? '—'} hari</span></div>
                                            <div className="flex justify-between"><span>Hari Terlambat (maks 14)</span><span className={`font-bold ${c4d.hari_terlambat > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{c4d.hari_terlambat ?? 0} hari</span></div>
                                            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                                <span className="text-slate-400">Rumus Kriteria</span>
                                                <div className="flex items-center gap-1 font-serif text-xs text-cyan-800 bg-cyan-50/40 px-2.5 py-1.5 rounded-lg border border-cyan-100/50">
                                                    <span className="italic font-bold">C</span>
                                                    <sub className="text-[9px] font-bold">4</sub>
                                                    <span className="mx-1">=</span>
                                                    <span className="font-sans font-bold text-[9px] uppercase tracking-wide bg-white px-1.5 py-0.5 rounded border border-slate-200">max</span>
                                                    <span>(50, 100 &minus; {c4d.hari_terlambat ?? 0}) = {act.c4}</span>
                                                </div>
                                            </div>
                                        </>)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 1: Normalisasi & Pembobotan */}
                        {topsisModalTab === 1 && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 mb-2">Normalisasi matriks keputusan & pembobotan kriteria menggunakan rumus berikut:</p>

                                <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4">
                                    <div className="flex items-center font-serif text-[13px] text-slate-700">
                                        <span className="font-bold italic">r</span>
                                        <sub className="text-[9px]">ij</sub>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <div className="inline-flex flex-col items-center">
                                            <span className="border-b border-slate-300 pb-0.5 px-2 italic text-[11px] leading-none">
                                                c<sub className="text-[8px]">ij</sub>
                                            </span>
                                            <span className="text-[11px] leading-none pt-1 inline-flex items-center">
                                                <span className="font-sans text-sm mr-[1px] leading-none">&radic;</span>
                                                <span className="border-t border-slate-300 pt-0.5 px-1 inline-flex items-center">
                                                    <span className="font-sans text-[10px] font-bold mr-0.5">&Sigma;</span>
                                                    <span className="italic">c</span>
                                                    <sub className="text-[8px]">kj</sub>
                                                    <sup className="text-[8px] -translate-y-0.5 inline-block">2</sup>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                                    <div className="flex items-center font-serif text-[13px] text-slate-700">
                                        <span className="font-bold italic">v</span>
                                        <sub className="text-[9px]">ij</sub>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <span className="italic">r</span>
                                        <sub className="text-[9px]">ij</sub>
                                        <span className="mx-1.5 font-sans text-xs text-slate-400">&times;</span>
                                        <span className="italic">w</span>
                                        <sub className="text-[9px]">j</sub>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px] border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-3 py-2.5 text-left font-black text-slate-600">Kriteria</th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">c<sub>ij</sub></th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">&radic;&Sigma;c<sub>kj</sub><sup>2</sup></th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">r<sub>ij</sub> = c<sub>ij</sub> / Pembagi</th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">w<sub>j</sub></th>
                                                <th className="px-3 py-2.5 text-center font-black text-cyan-600 font-serif italic">v<sub>ij</sub> = r<sub>ij</sub> &times; w<sub>j</sub></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[['C1 Waktu', act.c1, act.norm_c1, act.r1, act.w1, act.v1],
                                            ['C2 Anggaran', act.c2, act.norm_c2, act.r2, act.w2, act.v2],
                                            ['C3 Output', act.c3, act.norm_c3, act.r3, act.w3, act.v3],
                                            ['C4 LPJ', act.c4, act.norm_c4, act.r4, act.w4, act.v4]].map(([label, c, norm, r, w, v]) => (
                                                <tr key={label} className="hover:bg-slate-50/50">
                                                    <td className="px-3 py-2 font-bold text-slate-700">{label}</td>
                                                    <td className="px-3 py-2 text-center">{c}</td>
                                                    <td className="px-3 py-2 text-center text-slate-500">{fmt4(norm)}</td>
                                                    <td className="px-3 py-2 text-center">{fmt6(r)}</td>
                                                    <td className="px-3 py-2 text-center">{w}%</td>
                                                    <td className="px-3 py-2 text-center font-bold text-cyan-600">{fmt6(v)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Solusi Ideal */}
                        {topsisModalTab === 2 && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 mb-2">Penentuan solusi ideal positif (A⁺) dan solusi ideal negatif (A⁻) per kriteria:</p>

                                <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4">
                                    <div className="flex items-center font-serif text-[12px] text-slate-700">
                                        <span className="font-bold italic">A</span>
                                        <sup className="text-[10px] font-bold">+</sup>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <span className="font-sans text-xs">{'{'}</span>
                                        <span className="italic mx-0.5">v</span><sub className="text-[8px]">1</sub><sup>+</sup>
                                        <span className="mx-0.5">,</span>
                                        <span className="italic mx-0.5">v</span><sub className="text-[8px]">2</sub><sup>+</sup>
                                        <span className="mx-0.5">,</span>
                                        <span className="font-sans text-xs mr-1">&hellip;</span>
                                        <span className="font-sans text-xs">{'}'}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        <span className="italic mr-0.5">v</span><sub className="text-[8px]">j</sub><sup>+</sup>
                                        <span className="mx-1.5 font-sans text-xs text-slate-400">=</span>
                                        <span className="font-sans font-bold text-[8px] uppercase tracking-wide bg-white px-1 py-0.5 rounded border border-slate-200 mr-1.5">max</span>
                                        <span className="italic">v</span><sub className="text-[8px]">ij</sub>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                                    <div className="flex items-center font-serif text-[12px] text-slate-700">
                                        <span className="font-bold italic">A</span>
                                        <sup className="text-[10px] font-bold">&minus;</sup>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <span className="font-sans text-xs">{'{'}</span>
                                        <span className="italic mx-0.5">v</span><sub className="text-[8px]">1</sub><sup>&minus;</sup>
                                        <span className="mx-0.5">,</span>
                                        <span className="italic mx-0.5">v</span><sub className="text-[8px]">2</sub><sup>&minus;</sup>
                                        <span className="mx-0.5">,</span>
                                        <span className="font-sans text-xs mr-1">&hellip;</span>
                                        <span className="font-sans text-xs">{'}'}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        <span className="italic mr-0.5">v</span><sub className="text-[8px]">j</sub><sup>&minus;</sup>
                                        <span className="mx-1.5 font-sans text-xs text-slate-400">=</span>
                                        <span className="font-sans font-bold text-[8px] uppercase tracking-wide bg-white px-1 py-0.5 rounded border border-slate-200 mr-1.5">min</span>
                                        <span className="italic">v</span><sub className="text-[8px]">ij</sub>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px] border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-3 py-2.5 text-left font-black text-slate-600">Kriteria</th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">v<sub>ij</sub></th>
                                                <th className="px-3 py-2.5 text-center font-black text-emerald-600 font-serif italic">A<sub>j</sub><sup>+</sup></th>
                                                <th className="px-3 py-2.5 text-center font-black text-rose-500 font-serif italic">A<sub>j</sub><sup>&minus;</sup></th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">(v<sub>ij</sub> &minus; A<sub>j</sub><sup>+</sup>)<sup>2</sup></th>
                                                <th className="px-3 py-2.5 text-center font-black text-slate-600 font-serif italic">(v<sub>ij</sub> &minus; A<sub>j</sub><sup>&minus;</sup>)<sup>2</sup></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[['C1', act.v1, act.ideal_pos?.v1, act.ideal_neg?.v1],
                                            ['C2', act.v2, act.ideal_pos?.v2, act.ideal_neg?.v2],
                                            ['C3', act.v3, act.ideal_pos?.v3, act.ideal_neg?.v3],
                                            ['C4', act.v4, act.ideal_pos?.v4, act.ideal_neg?.v4]].map(([label, v, aPos, aNeg]) => {
                                                const dPos2 = v != null && aPos != null ? Math.pow(v - aPos, 2) : null;
                                                const dNeg2 = v != null && aNeg != null ? Math.pow(v - aNeg, 2) : null;
                                                return (
                                                    <tr key={label} className="hover:bg-slate-50/50">
                                                        <td className="px-3 py-2 font-bold text-slate-700">{label}</td>
                                                        <td className="px-3 py-2 text-center">{fmt6(v)}</td>
                                                        <td className="px-3 py-2 text-center text-emerald-600 font-bold">{fmt6(aPos)}</td>
                                                        <td className="px-3 py-2 text-center text-rose-500 font-bold">{fmt6(aNeg)}</td>
                                                        <td className="px-3 py-2 text-center text-slate-500">{dPos2 != null ? dPos2.toFixed(8) : '—'}</td>
                                                        <td className="px-3 py-2 text-center text-slate-500">{dNeg2 != null ? dNeg2.toFixed(8) : '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Skor Akhir */}
                        {topsisModalTab === 3 && (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 mb-2">Jarak Euclidean ke solusi ideal dan skor akhir preferensi TOPSIS:</p>

                                <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4 justify-between">
                                    <div className="flex items-center font-serif text-[12.5px] text-slate-700">
                                        <span className="font-bold italic">S</span>
                                        <sub className="text-[9px]">i</sub>
                                        <sup className="text-[10px] font-bold">+</sup>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <span className="text-sm font-sans mr-[1px] leading-none">&radic;</span>
                                        <span className="border-t border-slate-300 pt-0.5 px-1.5 inline-flex items-center">
                                            <span className="font-sans text-[10px] font-bold mr-0.5">&Sigma;</span>
                                            <span>(</span>
                                            <span className="italic">v</span><sub className="text-[8px]">ij</sub>
                                            <span className="mx-1">&minus;</span>
                                            <span className="italic">A</span><sub className="text-[8px]">j</sub><sup>+</sup>
                                            <span>)</span><sup className="text-[8px] -translate-y-0.5 inline-block">2</sup>
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                                    <div className="flex items-center font-serif text-[12.5px] text-slate-700">
                                        <span className="font-bold italic">S</span>
                                        <sub className="text-[9px]">i</sub>
                                        <sup className="text-[10px] font-bold">&minus;</sup>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <span className="text-sm font-sans mr-[1px] leading-none">&radic;</span>
                                        <span className="border-t border-slate-300 pt-0.5 px-1.5 inline-flex items-center">
                                            <span className="font-sans text-[10px] font-bold mr-0.5">&Sigma;</span>
                                            <span>(</span>
                                            <span className="italic">v</span><sub className="text-[8px]">ij</sub>
                                            <span className="mx-1">&minus;</span>
                                            <span className="italic">A</span><sub className="text-[8px]">j</sub><sup>&minus;</sup>
                                            <span>)</span><sup className="text-[8px] -translate-y-0.5 inline-block">2</sup>
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>
                                    <div className="flex items-center font-serif text-[12.5px] text-slate-700">
                                        <span className="font-bold italic">C</span>
                                        <sub className="text-[9px]">i</sub>
                                        <span className="mx-2 text-slate-400">=</span>
                                        <div className="inline-flex flex-col items-center">
                                            <span className="border-b border-slate-300 pb-0.5 px-2">
                                                <span className="italic">S</span><sub className="text-[8px]">i</sub><sup>&minus;</sup>
                                            </span>
                                            <span className="text-[10px] leading-none pt-1">
                                                <span className="italic">S</span><sub className="text-[8px]">i</sub><sup>+</sup>
                                                <span className="mx-1 font-sans">+</span>
                                                <span className="italic">S</span><sub className="text-[8px]">i</sub><sup>&minus;</sup>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                                        <div className="text-[10px] uppercase font-black text-slate-500 mb-1">S⁺ (Jarak ke Ideal Positif)</div>
                                        <div className="text-2xl font-black text-rose-500 tracking-tight">{fmt6(act.s_pos)}</div>
                                        <div className="font-serif text-[11px] text-slate-400 mt-1 flex items-center justify-center">
                                            <span className="italic font-semibold">S</span><sup className="text-[8px] font-semibold">+</sup>
                                            <span className="mx-1 font-sans">=</span>
                                            <span className="font-sans text-[10px]">&radic;&Sigma;(v &minus; A<sup>+</sup>)<sup>2</sup></span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 text-center shadow-sm">
                                        <div className="text-[10px] uppercase font-black text-slate-500 mb-1">S⁻ (Jarak ke Ideal Negatif)</div>
                                        <div className="text-2xl font-black text-emerald-500 tracking-tight">{fmt6(act.s_neg)}</div>
                                        <div className="font-serif text-[11px] text-slate-400 mt-1 flex items-center justify-center">
                                            <span className="italic font-semibold">S</span><sup className="text-[8px] font-semibold">&minus;</sup>
                                            <span className="mx-1 font-sans">=</span>
                                            <span className="font-sans text-[10px]">&radic;&Sigma;(v &minus; A<sup>&minus;</sup>)<sup>2</sup></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200 rounded-xl p-5 text-center shadow-sm">
                                    <div className="text-[10px] uppercase font-black text-cyan-600 mb-2">Hasil Akhir Preferensi TOPSIS</div>

                                    <div className="mt-3 flex items-center justify-center font-serif text-sm text-cyan-800 bg-white py-3 px-5 rounded-xl border border-cyan-200/60 max-w-sm mx-auto shadow-sm">
                                        <span className="font-bold italic">C</span><sub className="text-[9px]">i</sub>
                                        <span className="mx-2.5 font-sans text-slate-400">=</span>
                                        <div className="inline-flex flex-col items-center">
                                            <span className="border-b border-cyan-200 pb-0.5 px-2 font-semibold">
                                                {fmt6(act.s_neg)}
                                            </span>
                                            <span className="text-[10px] leading-none pt-1 font-semibold">
                                                {fmt6(act.s_pos)} <span className="font-sans mx-0.5 text-slate-400">+</span> {fmt6(act.s_neg)}
                                            </span>
                                        </div>
                                        <span className="mx-2.5 font-sans text-cyan-600/70">=</span>
                                        <span className="font-black text-cyan-700 text-base">{parseFloat(act.topsis_score).toFixed(6)}</span>
                                    </div>

                                    <div className="mt-4">
                                        <span className={`inline-block text-xs font-extrabold px-4 py-1.5 rounded-full border ${act.kategori === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm' :
                                                act.kategori === 'Baik' ? 'bg-cyan-100 text-cyan-700 border-cyan-200 shadow-sm' :
                                                    act.kategori === 'Cukup' ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm' :
                                                        'bg-red-100 text-red-700 border-red-200 shadow-sm'
                                            }`}>{act.kategori}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard Direktur
                </h2>
            }
        >
            {/* TOPSIS Step-by-Step Audit Modal */}
            {topsisDetailModal && (
                <TopsisDetailModal
                    act={topsisDetailModal}
                    onClose={() => setTopsisDetailModal(null)}
                />
            )}

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
                    <div className="dashboard-section bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-50">
                            <Sparkles className="text-cyan-500" size={20} />
                            <h3 className="text-lg font-black text-slate-800 m-0">AI Executive Summary</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Financial Summary */}
                            <div className={`p-5 rounded-xl border flex gap-4 items-start ${isGood ? 'bg-cyan-50/30 border-cyan-100' : 'bg-amber-50/30 border-amber-100'}`}>
                                <div className={`p-2 rounded-full ${isGood ? 'bg-cyan-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {isGood ? <Sparkles size={18} /> : <AlertCircle size={18} />}
                                </div>
                                <div>
                                    <h4 className={`m-0 mb-1.5 text-base font-bold ${isGood ? 'text-cyan-900' : 'text-amber-900'}`}>
                                        Keuangan & Penyerapan
                                    </h4>
                                    <p className="m-0 text-slate-600 text-xs leading-relaxed">
                                        Realisasi anggaran berjalan <strong>{isGood ? 'sangat baik' : 'perlu perhatian'}</strong> ({overview.persentase_serapan}%).
                                        {isGood ? (
                                            <span> Apresiasi untuk <strong>{bestUnit?.nama_jurusan}</strong> yang memimpin efisiensi.</span>
                                        ) : (
                                            <span> Mohon tinjau <strong>{worstUnit?.nama_jurusan}</strong> untuk akselerasi kegiatan.</span>
                                        )}
                                        Tren kegiatan {isGrowing ? 'sedang meningkat' : 'stabil'}, pertahankan momentum ini.
                                    </p>
                                </div>
                            </div>

                            {/* TOPSIS Summary */}
                            <div className="p-5 rounded-xl border border-cyan-100 bg-cyan-50/30 flex gap-4 items-start">
                                <div className="p-2 rounded-full bg-cyan-500 text-white">
                                    <Award size={18} />
                                </div>
                                <div>
                                    <h4 className="m-0 mb-1.5 text-cyan-900 text-base font-bold">
                                        Evaluasi Kinerja Unit (TOPSIS)
                                    </h4>
                                    <p className="m-0 text-slate-600 text-xs leading-relaxed">
                                        {getAiSummary()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="kpi-card rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Total Pengajuan</div>
                                <div className="text-3xl font-bold leading-tight drop-shadow-sm">{overview.total_kak}</div>
                                <div className="text-xs text-white/80 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                <FileText size={24} />
                            </div>
                        </div>

                        <div className="kpi-card rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-cyan-500/10 flex justify-between items-start group hover:border-cyan-200">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Kegiatan Selesai</div>
                                <div className="text-3xl font-bold leading-tight text-cyan-500">{overview.kegiatan_selesai}</div>
                                <div className="text-xs text-slate-400 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                                <Check size={24} />
                            </div>
                        </div>

                        <div className="kpi-card rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Total Anggaran</div>
                                <div className="text-2xl font-bold leading-tight drop-shadow-sm">{formatMoney(overview.dana_diminta)}</div>
                                <div className="text-xs text-white/80 mt-2">Update Realtime</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                <div className="font-bold text-xl">Rp</div>
                            </div>
                        </div>

                        <div className="kpi-card rounded-2xl p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur-md border border-white/80 shadow-lg shadow-cyan-500/10 flex justify-between items-start group hover:border-cyan-200">
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
                        <div className="kpi-card rounded-2xl p-6 bg-white border border-slate-100 shadow-sm flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-cyan-700 mb-1">Serapan Terbaik</div>
                                <div className="text-2xl font-bold text-cyan-500">{bestUnit.nama_jurusan}</div>
                                <div className="text-emerald-500 font-semibold mt-1 text-sm">{bestUnit.persentase_serapan}% Serapan</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                                <Award size={24} />
                            </div>
                        </div>

                        <div className="kpi-card rounded-2xl p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg text-white flex justify-between items-start">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-white/90 mb-1">Sisa Anggaran Terbesar</div>
                                <div className="text-2xl font-bold">{worstUnit.nama_jurusan}</div>
                                <div className="text-white/90 font-medium mt-1 text-sm">Sisa {formatMoneyShort(worstUnit.dana_diminta - worstUnit.dana_terserap)}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                        </div>

                        <div className="kpi-card rounded-2xl p-6 bg-white border border-slate-100 shadow-sm flex justify-between items-start">
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

                    {/* SPK TOPSIS Section */}
                    <div className="flex items-center gap-4 mt-10 mb-6 animate-[fadeInUp_0.5s_ease-out]">
                        <div className="text-lg font-bold text-cyan-700 flex items-center gap-2.5 bg-white px-5 py-2 rounded-full shadow-sm">
                            <span className="text-cyan-500"><Sparkles size={20} /></span> Analisis Kinerja Unit & Kegiatan (SPK)
                        </div>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-30"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.5s_ease-out]">
                        {/* Peringkat Jurusan / Unit Kerja (Senate Rankings) */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-0">
                                        <Award size={20} className="text-cyan-500" />
                                        Peringkat Kinerja Administrasi Unit Kerja
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Evaluasi komprehensif berdasarkan ketepatan waktu, efisiensi anggaran, pencapaian target, dan disiplin LPJ. Klik baris untuk detail audit.
                                    </p>
                                </div>

                                {activeTopsis.jurusans.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <AlertTriangle size={36} className="mx-auto mb-2 text-slate-300" />
                                        <div className="font-semibold text-sm">Tidak ada data SPK</div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activeTopsis.jurusans.map((jur, idx) => {
                                            const isExpanded = expandedJurusan === jur.nama_jurusan;

                                            // Determine performance status
                                            let performanceBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                                            let performanceText = "Kinerja Unggul";

                                            if (jur.avg_score < 0.5) {
                                                performanceBadge = "bg-rose-50 text-rose-700 border-rose-100";
                                                performanceText = "Butuh Akselerasi";
                                            } else if (jur.avg_score < 0.7) {
                                                performanceBadge = "bg-amber-50 text-amber-700 border-amber-100";
                                                performanceText = "Kinerja Stabil";
                                            }

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded
                                                            ? 'border-cyan-300 bg-cyan-50/10 shadow-sm'
                                                            : 'border-slate-100 hover:border-cyan-200 hover:bg-slate-50/30'
                                                        }`}
                                                >
                                                    <div
                                                        onClick={() => setExpandedJurusan(isExpanded ? null : jur.nama_jurusan)}
                                                        className="flex flex-row justify-between items-center gap-2 p-4 cursor-pointer select-none"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <span className="shrink-0 text-slate-700 text-xs font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 leading-none">
                                                                #{idx + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="font-extrabold text-sm text-slate-800 truncate">{jur.nama_jurusan}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                                                                    Selesai: {jur.kegiatan_selesai} Keg | Serapan: {jur.persentase_serapan}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-2">
                                                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${performanceBadge}`}>
                                                                {performanceText}
                                                            </span>
                                                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Audit Details */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-dashed border-slate-100 bg-slate-50/30">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                                {/* Left: Audit Scores */}
                                                                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                                                                    <div className="text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-100">
                                                                        Metrik Audit Kinerja (Evaluasi SPK)
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                                                        <div>Ketepatan Waktu:</div>
                                                                        <div className="font-bold text-right">{jur.avg_c1.toFixed(1)}%</div>
                                                                        <div>Efisiensi Anggaran:</div>
                                                                        <div className="font-bold text-right">{jur.avg_c2.toFixed(1)}%</div>
                                                                        <div>Kesesuaian Output:</div>
                                                                        <div className="font-bold text-right">{jur.avg_c3.toFixed(1)}%</div>
                                                                        <div>Kedisiplinan LPJ:</div>
                                                                        <div className="font-bold text-right">{jur.avg_c4.toFixed(1)}%</div>
                                                                        <div className="text-cyan-600 font-bold border-t border-slate-100 pt-1">Skor Indeks Akhir:</div>
                                                                        <div className="text-cyan-600 font-extrabold text-right border-t border-slate-100 pt-1">{jur.avg_score.toFixed(4)}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Right: Explanations & Recommendations */}
                                                                <div className="space-y-2.5">
                                                                    <div>
                                                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Analisis Kualitatif</span>
                                                                        <p className="m-0 text-slate-600 text-xs leading-relaxed mt-0.5">
                                                                            {getRankExplanation(jur)}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Rekomendasi Internal</span>
                                                                        <p className="m-0 text-slate-600 text-xs leading-relaxed mt-0.5 font-medium">
                                                                            {jur.avg_c4 < 70 ? (
                                                                                "Prioritas: Lakukan pengawasan administratif ketat terhadap pelaporan LPJ jurusan ini yang sering terlambat."
                                                                            ) : jur.avg_c2 < 70 ? (
                                                                                "Prioritas: Evaluasi perencanaan RAB proyek di jurusan ini agar realisasi dana lebih mendekati estimasi."
                                                                            ) : (
                                                                                "Apresiasi: Pertahankan kinerja administratif luar biasa ini dan jadikan percontohan bagi unit kerja lain."
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail Pembobotan Kriteria Aktif (Audit Criteria Information) */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-0">
                                        <Sliders size={20} className="text-cyan-500" />
                                        Parameter Bobot Kriteria
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1 mb-6">
                                        Bobot penilaian aktif yang dikonfigurasi oleh Administrator dalam perhitungan peringkat TOPSIS.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">C1: Ketepatan Waktu</div>
                                                <div className="text-[10px] text-slate-400">Realisasi pelaksanaan vs jadwal KAK</div>
                                            </div>
                                            <span className="text-sm font-black text-cyan-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                {spk_config?.weight_waktu || 25}%
                                            </span>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">C2: Ketepatan Anggaran</div>
                                                <div className="text-[10px] text-slate-400">Persentase deviasi realisasi dana</div>
                                            </div>
                                            <span className="text-sm font-black text-cyan-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                {spk_config?.weight_anggaran || 25}%
                                            </span>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">C3: Kesesuaian Output</div>
                                                <div className="text-[10px] text-slate-400">Pencapaian target output fisik</div>
                                            </div>
                                            <span className="text-sm font-black text-cyan-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                {spk_config?.weight_output || 25}%
                                            </span>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">C4: Kepatuhan LPJ</div>
                                                <div className="text-[10px] text-slate-400">Kecepatan penyerahan berkas LPJ</div>
                                            </div>
                                            <span className="text-sm font-black text-cyan-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                {spk_config?.weight_lpj || 25}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
                                    Pembaruan parameter ini dilakukan secara terpusat melalui Super Administrator untuk menjamin standarisasi evaluasi kinerja di seluruh fakultas/jurusan.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Executive Action Center: Top Performers vs Bottlenecks */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-[fadeInUp_0.5s_ease-out]">
                        {/* Kegiatan Bintang (Top Performers) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <CheckCircle className="text-emerald-500" size={18} />
                                Kegiatan Teladan (Administrasi Terbaik)
                            </h3>
                            {activeTopsis.activities.filter(a => a.topsis_score >= 0.6).length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    Belum ada kegiatan dengan performa administrasi unggul di periode ini.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeTopsis.activities.filter(a => a.topsis_score >= 0.6).slice(0, 3).map((act, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div className="max-w-[70%]">
                                                <div className="font-extrabold text-xs text-slate-800 truncate" title={act.nama_kegiatan}>
                                                    {act.nama_kegiatan}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Unit: {act.jurusan}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                {act.c4 >= 90 ? "LPJ Sangat Tepat Waktu" : "Administrasi Tertib"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Area Perlu Intervensi (Bottlenecks) */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={18} />
                                Hambatan Administrasi & Penyelesaian LPJ
                            </h3>
                            {activeTopsis.activities.filter(a => a.c4 < 70 || a.c1 < 70).length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    Seluruh kegiatan berjalan tertib tanpa kendala administrasi berarti.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeTopsis.activities.filter(a => a.c4 < 70 || a.c1 < 70).slice(0, 3).map((act, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div className="max-w-[70%]">
                                                <div className="font-extrabold text-xs text-slate-800 truncate" title={act.nama_kegiatan}>
                                                    {act.nama_kegiatan}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Unit: {act.jurusan}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                                                {act.c4 < 70 ? "Keterlambatan LPJ" : "Deviasi Anggaran"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Toggleable Technical Audit Table (TOPSIS Raw Data) */}
                    <div className="mt-6 animate-[fadeInUp_0.5s_ease-out]">
                        <button
                            onClick={() => setShowTechnicalAudit(!showTechnicalAudit)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm border border-slate-200 mx-auto"
                        >
                            {showTechnicalAudit ? "Sembunyikan Rincian Teknis Audit" : "Tampilkan Rincian Teknis Audit (Metrik SPK)"}
                            {showTechnicalAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showTechnicalAudit && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full mt-4 overflow-hidden">
                                {/* Header */}
                                <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 m-0">
                                        <Layers size={16} className="text-cyan-500" />
                                        Datasheet Teknis Perhitungan TOPSIS (Audit Internal)
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                        Geser ke kanan untuk melihat semua kolom
                                    </span>
                                </div>

                                {activeTopsis.activities.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs px-6">
                                        Tidak ada data kegiatan terdaftar.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="text-left border-collapse" style={{ minWidth: '900px' }}>
                                            <thead>
                                                <tr className="border-b-2 border-slate-100 bg-slate-50">
                                                    {/* Sticky: Rank */}
                                                    <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center w-14 border-r border-slate-100">
                                                        Rank
                                                    </th>
                                                    {/* Sticky: Nama Kegiatan */}
                                                    <th className="sticky left-14 z-10 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider min-w-[220px] border-r-2 border-slate-200 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]">
                                                        Nama Kegiatan
                                                    </th>
                                                    {/* Scrollable columns */}
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider whitespace-nowrap min-w-[140px]">Unit / Jurusan</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-24">C1 (Waktu)</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-28">C2 (Anggaran)</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-24">C3 (Output)</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-20">C4 (LPJ)</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-28">TOPSIS Score</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center whitespace-nowrap w-28">Kategori</th>
                                                    <th className="px-4 py-3 text-xs font-black uppercase text-slate-500 tracking-wider text-center w-16">Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {activeTopsis.activities.map((act, idx) => {
                                                    let katBadge = '';
                                                    if (act.kategori === 'Sangat Baik') {
                                                        katBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                                    } else if (act.kategori === 'Baik') {
                                                        katBadge = 'bg-cyan-100 text-cyan-700 border-cyan-200';
                                                    } else if (act.kategori === 'Cukup') {
                                                        katBadge = 'bg-amber-100 text-amber-700 border-amber-200';
                                                    } else {
                                                        katBadge = 'bg-red-100 text-red-700 border-red-200';
                                                    }

                                                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

                                                    return (
                                                        <tr key={idx} className={`hover:bg-cyan-50/30 transition-colors duration-150 ${rowBg}`}>
                                                            {/* Sticky: Rank */}
                                                            <td className={`sticky left-0 z-10 ${rowBg} px-4 py-3 text-center font-bold text-xs text-slate-500 border-r border-slate-100`}>
                                                                {idx + 1}
                                                            </td>
                                                            {/* Sticky: Nama Kegiatan — NO truncate, full text */}
                                                            <td className={`sticky left-14 z-10 ${rowBg} px-4 py-3 text-xs font-bold text-slate-800 border-r-2 border-slate-200 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.06)] min-w-[220px]`}>
                                                                {act.nama_kegiatan}
                                                            </td>
                                                            {/* Scrollable data */}
                                                            <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                                {act.jurusan}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{act.c1}</td>
                                                            <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{act.c2}</td>
                                                            <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{act.c3}</td>
                                                            <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{act.c4}</td>
                                                            <td className="px-4 py-3 text-center text-xs font-black text-cyan-600">{act.topsis_score.toFixed(4)}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-block text-[9px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap ${katBadge}`}>
                                                                    {act.kategori}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() => { setTopsisDetailModal(act); setTopsisModalTab(0); }}
                                                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100 hover:bg-cyan-100 hover:border-cyan-300 transition-colors duration-150 whitespace-nowrap"
                                                                    title="Lihat detail perhitungan TOPSIS"
                                                                >
                                                                    <Eye size={11} /> Detail
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Layout Grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Trend Realisasi & Kegiatan */}
                            <div className="dashboard-section bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 flex-wrap gap-2">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-500"><TrendingUp size={20} /></div>
                                        Trend Realisasi & Kegiatan
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setFocusYAxis(!focusYAxis)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${focusYAxis
                                                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Maximize2 size={12} />
                                            {focusYAxis ? 'Skala Default (0)' : 'Fokus Skala (Zoom)'}
                                        </button>
                                        <button
                                            onClick={() => setShowTrendsTable(!showTrendsTable)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${showTrendsTable
                                                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <List size={12} />
                                            {showTrendsTable ? 'Tampilkan Grafik' : 'Lihat Detail Angka'}
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[400px] w-full relative">
                                    {trends.length === 0 || trends.every(t => t.dana_diminta === 0 && t.dana_terserap === 0) ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-200 p-8 text-center animate-[fadeIn_0.3s_ease-out]">
                                            <AlertCircle size={40} className="text-cyan-500 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-700 m-0">Tidak Ada Transaksi Keuangan</h4>
                                            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                                                Belum ada pengajuan kegiatan atau realisasi anggaran yang tercatat untuk periode ini.
                                            </p>
                                        </div>
                                    ) : showTrendsTable ? (
                                        <div className="overflow-y-auto h-full border border-slate-100 rounded-xl bg-white shadow-inner p-4 animate-[fadeIn_0.3s_ease-out]">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-100 bg-slate-50 font-black text-slate-600">
                                                        <th className="px-4 py-3">Periode</th>
                                                        <th className="px-4 py-3 text-right">Rencana Anggaran</th>
                                                        <th className="px-4 py-3 text-right">Realisasi Serapan</th>
                                                        <th className="px-4 py-3 text-center">Jumlah Kegiatan</th>
                                                        <th className="px-4 py-3 text-center text-red-500">Perlu Perhatian</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                                    {activeTrends.map((t, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3 font-bold text-slate-800">{t.periode}</td>
                                                            <td className="px-4 py-3 text-right">Rp {(t.dana_diminta / 1000000).toFixed(1)} Jt</td>
                                                            <td className="px-4 py-3 text-right text-cyan-600 font-bold">Rp {(t.dana_terserap / 1000000).toFixed(1)} Jt</td>
                                                            <td className="px-4 py-3 text-center text-amber-600 font-bold">{t.total_kegiatan} Keg</td>
                                                            <td className="px-4 py-3 text-center text-red-600 font-bold">{t.perlu_perhatian || 0} Keg</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <Bar data={trendsChartData} options={trendsChartOptions} />
                                    )}
                                </div>
                            </div>

                            {/* Komparasi Unit */}
                            <div className="dashboard-section bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
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
                            <div className="dashboard-section bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-500"><PieChart size={20} /></div>
                                        Komposisi Dana
                                    </div>
                                </div>
                                <div className="h-[250px] flex items-center justify-center relative">
                                    {danaTotal === 0 && (
                                        <div className="absolute text-center text-slate-400">
                                            <PieChart size={32} className="mx-auto text-slate-300 mb-1.5" />
                                            <div className="font-bold text-xs text-slate-500">Data Kosong</div>
                                        </div>
                                    )}
                                    <Doughnut data={danaChartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                </div>
                            </div>

                            {/* Priority Feed */}
                            <div className="dashboard-section bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/80 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-1.5 bg-red-50 rounded-lg text-red-500"><AlertCircle size={20} /></div>
                                        Perlu Perhatian
                                    </div>
                                </div>
                                <div className="overflow-y-auto pr-2 max-h-[400px]">
                                    {sortedActs.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                                            <div className="font-bold text-slate-700 text-xs">Seluruh Proses Lancar</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">Tidak ada antrean kegiatan yang tertunda.</div>
                                        </div>
                                    ) : (
                                        sortedActs.map((act, i) => {
                                            const days = getDaysStuck(act.created_at);
                                            let style = { color: '#3b82f6', bg: 'bg-blue-50', label: 'BARU' };
                                            let warningBadge = '';

                                            if (days > 7) {
                                                style = { color: '#ef4444', bg: 'bg-red-50', label: 'KRITIS' };
                                                warningBadge = <span className="bg-red-100 text-red-500 text-[0.65rem] px-1.5 py-0.5 rounded font-extrabold border border-red-200">TERTAHAN {days} HARI</span>;
                                            } else if (days > 3) {
                                                style = { color: '#f97316', bg: 'bg-orange-50', label: 'LAMBAT' };
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
                                                        <span className={`w-2 h-2 rounded-full ${days > 7 ? 'bg-red-500 animate-pulse' : days > 3 ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
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
                                    <span className="text-cyan-500"><Layers size={20} /></span> Video Panduan
                                </div>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 to-transparent opacity-30"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{videos.map((vid, i) => {
                                     // Function to convert YouTube URL to embed URL
                                     const getEmbedUrl = (url) => {
                                         if (!url) return null;
                                         if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                             let videoId = '';
                                             if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1]?.split('&')[0];
                                             else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
                                             else if (url.includes('embed/')) videoId = url.split('embed/')[1]?.split('?')[0];
                                             if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                                         }
                                         return url;
                                     };
                                     
                                     let embedUrl = getEmbedUrl(vid.url);
                                     // Add origin parameter for YouTube API client identification (fixes Error 153)
                                     if (embedUrl && embedUrl.includes('youtube.com/embed/')) {
                                         const origin = window.location.origin;
                                         embedUrl = embedUrl.includes('?') 
                                             ? `${embedUrl}&origin=${origin}` 
                                             : `${embedUrl}?origin=${origin}`;
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
