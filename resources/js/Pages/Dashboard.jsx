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
            className={clsx("relative overflow-hidden rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 group cursor-pointer animate-fade-in-up h-[130px] flex flex-col justify-between", bgClass)}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative z-10">
                <div className={clsx("text-[10px] uppercase font-bold tracking-widest mb-1", subtitleClass)}>{subtitle}</div>
                <div className={clsx("text-[22px] font-bold leading-none", textClass)}>{label}</div>
            </div>
            
            {/* Background Number Fix */}
            <div className={clsx("absolute -right-4 top-1/2 -translate-y-1/2 text-[130px] font-black opacity-[0.05] group-hover:scale-110 transition-transform duration-500 pointer-events-none select-none leading-none", isCyan ? 'text-white' : 'text-slate-900')}>
                {value}
            </div>
            
            <div className={clsx("text-5xl font-bold absolute bottom-4 right-6", valueClass)}>
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
function PengusulDashboard({ stats, recentKaks }) {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Actions - Moved to top right */}
            <div className="flex justify-end gap-3 mb-2">
                <Link href={route('kak.create')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                    + Tambah Usulan
                </Link>
                <Link href={route('kegiatan.index')} className="bg-[#00bcd4] hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                    + Ajukan Kegiatan
                </Link>
            </div>

            {/* Statistik Utama (Reference Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard subtitle="USULAN" label="Draft" value={stats.draft_kak} color="cyan" href={route('kak.index')} delay={100} />
                <StatCard subtitle="USULAN" label="Diajukan" value={stats.review_kak} color="white" href={route('kak.index')} delay={200} />
                <StatCard subtitle="USULAN" label="Revisi" value={stats.rejected_kak} color="white" href={route('kak.index')} delay={300} />
            </div>

            {/* Tables Area - side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pemantauan Kegiatan */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex justify-between items-center px-6 py-5">
                        <h3 className="text-[15px] font-bold text-slate-800">Pemantauan Kegiatan</h3>
                        <Link href={route('kegiatan.monitoring')} className="text-xs font-medium text-cyan-500 hover:text-cyan-600 transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-x-auto p-4 pt-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-2 py-3 text-[11px] font-bold text-cyan-500">No.</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-cyan-500">Nama Kegiatan</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-cyan-500 text-right">Status Saat Ini</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentKaks?.length > 0 ? recentKaks.slice(0, 5).map((kak, index) => (
                                    <tr key={kak.kak_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-2 py-4">
                                            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-[13px] text-slate-800">{kak.nama_kegiatan}</div>
                                            <div className="text-[10px] font-medium text-cyan-500 mt-0.5">Pengusul</div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                <span className="truncate max-w-[120px]">{kak.status_nama || 'Menunggu'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400 text-xs">Belum ada usulan KAK.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pemantauan LPJ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex justify-between items-center px-6 py-5">
                        <h3 className="text-[15px] font-bold text-slate-800">Pemantauan LPJ</h3>
                        <Link href={route('kegiatan.monitoring')} className="text-xs font-medium text-cyan-500 hover:text-cyan-600 transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="overflow-x-auto p-4 pt-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-2 py-3 text-[11px] font-bold text-cyan-500">No.</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-cyan-500">Nama Kegiatan</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-cyan-500 text-right">Status Saat Ini</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentKaks?.length > 0 ? recentKaks.slice(0, 5).map((kak, index) => (
                                    <tr key={`lpj-${kak.kak_id}`} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-2 py-4">
                                            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-[13px] text-slate-800">{kak.nama_kegiatan}</div>
                                            <div className="text-[10px] font-medium text-cyan-500 mt-0.5">Pengusul</div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="text-[11px] font-bold text-emerald-600">Selesai</div>
                                                <div className="text-[9px] font-medium text-slate-400 mt-0.5">Deadline: -</div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400 text-xs">Belum ada LPJ.</td></tr>
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Menunggu Persetujuan" value={stats.pending_count} icon={Clock} color="amber" href={route('kegiatan.index')} delay={100} />
                <StatCard label="Sudah Disetujui" value={stats.approved_count} icon={CheckCircle2} color="emerald" delay={200} />
                <StatCard label="Total Kegiatan" value={stats.total_kegiatan} icon={ClipboardCheck} color="blue" href={route('kegiatan.monitoring')} delay={300} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h3 className="text-lg font-black text-slate-800">Menunggu Persetujuan Anda</h3>
                    <Link href={route('kegiatan.index')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-y border-slate-100">
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nama Kegiatan</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Pengusul</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tipe</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingKegiatan?.length > 0 ? pendingKegiatan.map((k) => (
                                <tr key={k.kegiatan_id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{k.nama_kegiatan}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{k.pengusul}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{k.tipe}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{k.created_at}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('kegiatan.show', k.kegiatan_id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-sm font-medium transition-colors">
                                            <Eye size={14} /> Detail
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Tidak ada kegiatan yang menunggu.</td></tr>
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="KAK Menunggu Review" value={stats.pending_kak} icon={Clock} color="amber" href={route('kak.index')} delay={100} />
                <StatCard label="KAK Disetujui" value={stats.approved_kak} icon={CheckCircle2} color="emerald" delay={200} />
                <StatCard label="Total KAK" value={stats.total_kak} icon={FileText} color="blue" delay={300} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h3 className="text-lg font-black text-slate-800">KAK Menunggu Review</h3>
                    <Link href={route('kak.index')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-y border-slate-100">
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nama Kegiatan</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Pengusul</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Terakhir Diubah</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentKaks?.length > 0 ? recentKaks.map((kak) => (
                                <tr key={kak.kak_id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{kak.nama_kegiatan}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{kak.pengusul}</td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{kak.updated_at}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={route('kak.show', kak.kak_id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors">
                                            <Eye size={14} /> Review
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Tidak ada KAK yang menunggu review.</td></tr>
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total KAK" value={stats.total_kak} icon={FileText} color="blue" href={route('kak.index')} delay={100} />
                <StatCard label="Total Kegiatan" value={stats.total_kegiatan} icon={ClipboardCheck} color="emerald" href={route('kegiatan.monitoring')} delay={200} />
                <StatCard label="Persetujuan Aktif" value={stats.pending_approvals} icon={Clock} color="amber" delay={300} />
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard({ auth, stats = {}, recent_kaks, pending_kegiatan, panduans = [] }) {
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
            case 3: return <PengusulDashboard stats={stats} recentKaks={recent_kaks} />;
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
                <div className="max-w-7xl mx-auto mt-12 mb-8 border-t border-slate-200/60 pt-8">
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
