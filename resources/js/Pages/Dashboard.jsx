import React, { useMemo, useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PanduanSection from '@/Components/PanduanSection';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText,
    ClipboardCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Banknote,
    Activity,
    ArrowRight,
    Users,
    Send,
    Play,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Counter Animation Hook ───────────────────────────────────────────────────
function useCounterAnimation(target, duration = 1500) {
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
        }, 200);
        return () => { clearTimeout(timer); if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [target, duration]);

    return count;
}

// ─── Stat Card (Reference Style) ────────────────────────────────────────────────
function StatCard({ label, subtitle = 'USULAN', value, color = 'white', href, delay = 0 }) {
    const animatedValue = useCounterAnimation(value || 0);

    const isCyan = color === 'cyan';
    const bgClass = isCyan ? 'bg-[#00bcd4] shadow-lg shadow-cyan-500/20' : 'bg-white shadow-sm border border-slate-100';
    const textClass = isCyan ? 'text-white' : 'text-slate-800';
    const subtitleClass = isCyan ? 'text-cyan-50' : 'text-cyan-500';
    const valueClass = isCyan ? 'text-white' : 'text-cyan-500';

    const Wrapper = href ? Link : 'div';
    const wrapperProps = href ? { href } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={clsx("relative overflow-hidden rounded-[24px] p-6 sm:p-8 hover:-translate-y-2 transition-all duration-300 group cursor-pointer animate-fade-in-up min-h-[180px] flex flex-col justify-between", bgClass)}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative z-10">
                <div className={clsx("text-[13px] uppercase font-black tracking-[0.1em] mb-2 opacity-80", subtitleClass)}>{subtitle}</div>
                <div className={clsx("text-2xl sm:text-[32px] font-black leading-tight tracking-tight", textClass)}>{label}</div>
            </div>

            {/* Background Number Fix */}
            <div className={clsx("absolute -right-6 top-1/2 -translate-y-1/2 text-[150px] sm:text-[180px] font-black opacity-[0.06] group-hover:scale-110 transition-transform duration-700 pointer-events-none select-none leading-none", isCyan ? 'text-white' : 'text-slate-900')}>
                {value}
            </div>

            <div className={clsx("text-5xl sm:text-7xl font-black absolute bottom-6 right-8 tracking-tighter", valueClass)}>
                {animatedValue}
            </div>
        </Wrapper>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ statusId, statusName }) {
    const config = {
        1: 'bg-slate-100 text-slate-700',
        2: 'bg-amber-50 text-amber-700 border border-amber-200',
        3: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        4: 'bg-rose-50 text-rose-700 border border-rose-200',
        5: 'bg-orange-50 text-orange-700 border border-orange-200',
    };
    return (
        <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold', config[statusId] || 'bg-slate-100 text-slate-600')}>
            {statusName || '-'}
        </span>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// PENGUSUL DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function PengusulDashboard({ stats, recentKaks, recentLpjs = [] }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header Actions - Moved to top right */}
            <div className="flex justify-end gap-3 mb-2">
                <Link href={route('kak.create')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2">
                    + Tambah Usulan
                </Link>
                <Link href={route('kegiatan.index')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2">
                    + Ajukan Kegiatan
                </Link>
            </div>

            {/* Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard subtitle="USULAN" label="Draft" value={stats.draft_kak} color="cyan" href={route('kak.index')} delay={100} />
                <StatCard subtitle="USULAN" label="Diajukan" value={stats.review_kak} color="white" href={route('kak.index')} delay={200} />
                <StatCard subtitle="USULAN" label="Revisi" value={stats.rejected_kak} color="white" href={route('kak.index')} delay={300} />
            </div>

            {/* Tables Area - side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pemantauan Kegiatan */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex justify-between items-center px-8 py-6">
                        <h3 className="text-lg font-black text-slate-800">Pemantauan Kegiatan</h3>
                        <Link href={route('kegiatan.monitoring')} className="text-xs font-black text-cyan-500 hover:text-cyan-600 transition-colors uppercase tracking-wider">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-x-auto md:overflow-visible min-h-[150px] px-4 pb-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider">No.</th>
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Nama Kegiatan</th>
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentKaks?.length > 0 ? recentKaks.slice(0, 5).map((kak, index) => (
                                    <tr key={kak.kak_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="font-bold text-[14px] text-slate-800">{kak.nama_kegiatan}</div>
                                            <div className="text-[11px] font-black text-cyan-500 mt-0.5 uppercase tracking-wide">Pengusul</div>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="inline-flex items-center gap-2 text-[11px] font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                                                <span className="truncate max-w-[120px]">{kak.status_nama || 'Menunggu'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-16 text-center text-slate-400 text-sm font-medium">Belum ada usulan KAK.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pemantauan LPJ */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex justify-between items-center px-8 py-6">
                        <h3 className="text-lg font-black text-slate-800">Pemantauan LPJ</h3>
                        <Link href={route('kegiatan.monitoring')} className="text-xs font-black text-cyan-500 hover:text-cyan-600 transition-colors uppercase tracking-wider">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-x-auto md:overflow-visible min-h-[150px] px-4 pb-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider">No.</th>
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Nama Kegiatan</th>
                                    <th className="px-4 py-3 text-[11px] font-black text-cyan-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentLpjs?.length > 0 ? recentLpjs.slice(0, 5).map((lpj, index) => (
                                    <tr key={`lpj-${lpj.kegiatan_id}`} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="font-bold text-[14px] text-slate-800">{lpj.nama_kegiatan}</div>
                                            <div className="text-[11px] font-black text-cyan-500 mt-0.5 uppercase tracking-wide">Pengusul</div>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className={clsx(
                                                    "text-[11px] font-black px-3 py-1 rounded-lg border whitespace-nowrap",
                                                    lpj.status_id === 10 ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    lpj.status_id === 11 ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    lpj.status_id === 12 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    lpj.status_id === 13 ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                    lpj.status_id === 14 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    "bg-slate-50 text-slate-600 border-slate-100"
                                                )}>
                                                    {lpj.status_nama}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                    Deadline: {lpj.tgl_batas_lpj || '-'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-16 text-center text-slate-400 text-sm font-medium">Belum ada LPJ.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// PPK / WADIR DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function ApproverDashboard({ stats, pendingKegiatan, roleName }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard subtitle="KEGIATAN" label="Menunggu" value={stats.pending_count} color="cyan" href={route('kegiatan.index')} delay={100} />
                <StatCard subtitle="KEGIATAN" label="Disetujui" value={stats.approved_count} color="white" delay={200} />
                <StatCard subtitle="KEGIATAN" label="Total" value={stats.total_kegiatan} color="white" href={route('kegiatan.monitoring')} delay={300} />
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex justify-between items-center px-8 py-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Menunggu Persetujuan Anda</h3>
                        <p className="text-sm font-medium text-slate-400 mt-0.5">Daftar kegiatan yang memerlukan verifikasi segera</p>
                    </div>
                    <Link href={route('kegiatan.index')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto md:overflow-visible min-h-[150px] px-4 pb-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Nama Kegiatan</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Pengusul</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingKegiatan?.length > 0 ? pendingKegiatan.map((k) => (
                                <tr key={k.kegiatan_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-5">
                                        <div className="font-bold text-[14px] text-slate-800">{k.nama_kegiatan}</div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="text-[13px] font-medium text-slate-600">{k.pengusul}</div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                                            {k.tipe}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="text-[12px] font-medium text-slate-400">{k.created_at}</div>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <Link href={route('kegiatan.show', k.kegiatan_id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl text-xs font-black transition-all">
                                            <Eye size={14} /> Detail
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-slate-400 text-sm font-medium">Tidak ada kegiatan yang menunggu.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// VERIFIKATOR DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function VerifikatorDashboard({ stats, recentKaks }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard subtitle="USULAN" label="Menunggu" value={stats.pending_kak} color="cyan" href={route('kak.index')} delay={100} />
                <StatCard subtitle="USULAN" label="Disetujui" value={stats.approved_kak} color="white" delay={200} />
                <StatCard subtitle="USULAN" label="Total" value={stats.total_kak} color="white" delay={300} />
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex justify-between items-center px-8 py-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Usulan Menunggu Review</h3>
                        <p className="text-sm font-medium text-slate-400 mt-0.5">Daftar KAK yang perlu diperiksa kelengkapannya</p>
                    </div>
                    <Link href={route('kak.index')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto md:overflow-visible min-h-[150px] px-4 pb-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Nama Kegiatan</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Pengusul</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider">Terakhir Diubah</th>
                                <th className="px-4 py-4 text-[11px] font-black text-cyan-500 uppercase tracking-wider text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentKaks?.length > 0 ? recentKaks.map((kak) => (
                                <tr key={kak.kak_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-5">
                                        <div className="font-bold text-[14px] text-slate-800">{kak.nama_kegiatan}</div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="text-[13px] font-medium text-slate-600">{kak.pengusul}</div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className="text-[12px] font-medium text-slate-400">{kak.updated_at}</div>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <Link href={route('kak.show', kak.kak_id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-black transition-all">
                                            <Eye size={14} /> Review
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-6 py-16 text-center text-slate-400 text-sm font-medium">Tidak ada KAK yang menunggu review.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN / DEFAULT DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
function AdminDashboard({ stats }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard subtitle="SISTEM" label="Total KAK" value={stats.total_kak} color="cyan" href={route('kak.index')} delay={100} />
                <StatCard subtitle="SISTEM" label="Kegiatan" value={stats.total_kegiatan} color="white" href={route('kegiatan.monitoring')} delay={200} />
                <StatCard subtitle="SISTEM" label="Menunggu" value={stats.pending_approvals} color="white" delay={300} />
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard({ auth, stats = {}, recent_kaks, recent_lpjs = [], pending_kegiatan, panduans = [] }) {
    const roleId = auth.user?.role_id;

    const roleLabels = {
        1: 'Administrator',
        2: 'Verifikator',
        3: 'Pengusul',
        4: 'PPK',
        5: 'Wakil Direktur',
        6: 'Bendahara',
        7: 'Rektorat',
    };

    const roleName = roleLabels[roleId] || 'Pengguna';

    const greetings = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const renderDashboard = () => {
        switch (roleId) {
            case 3: return <PengusulDashboard stats={stats} recentKaks={recent_kaks} recentLpjs={recent_lpjs} />;
            case 4:
            case 5: return <ApproverDashboard stats={stats} pendingKegiatan={pending_kegiatan} roleName={roleName} />;
            case 2: return <VerifikatorDashboard stats={stats} recentKaks={recent_kaks} />;
            default: return <AdminDashboard stats={stats} />;
        }
    };

    return (
        <>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <PageHeader
                        title={`${greetings()}, ${auth.user?.nama_lengkap?.split(' ')[0] || roleName}!`}
                        description={`Dashboard ${roleName} — SIGAP PNJ`}
                    />
                }
            >
                <Head title="Dashboard" />
                {renderDashboard()}

                {/* Panduan Section is placed globally at the bottom of the dashboard */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8 border-t border-slate-200/60 pt-8">
                    <PanduanSection panduans={panduans} />
                </div>
            </AuthenticatedLayout>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        opacity: 0;
                        animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `
            }} />
        </>
    );
}
