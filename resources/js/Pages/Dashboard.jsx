import React, { useMemo, useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = 'cyan', href, delay = 0 }) {
    const animatedValue = useCounterAnimation(value || 0);

    const colorMap = {
        cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-200/50',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200/50',
        amber: 'from-amber-500 to-amber-600 shadow-amber-200/50',
        rose: 'from-rose-500 to-rose-600 shadow-rose-200/50',
        violet: 'from-violet-500 to-violet-600 shadow-violet-200/50',
        blue: 'from-blue-500 to-blue-600 shadow-blue-200/50',
        slate: 'from-slate-500 to-slate-600 shadow-slate-200/50',
    };

    const Wrapper = href ? Link : 'div';
    const wrapperProps = href ? { href } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className="relative overflow-hidden rounded-2xl p-6 bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 group cursor-pointer animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
                    <div className="text-4xl font-black text-slate-800 mt-2 group-hover:scale-105 transition-transform duration-300">
                        {animatedValue}
                    </div>
                </div>
                <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg', colorMap[color])}>
                    <Icon size={22} />
                </div>
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Usulan KAK" value={stats.total_kak} icon={FileText} color="blue" href={route('kak.index')} delay={100} />
                <StatCard label="Draft" value={stats.draft_kak} icon={Clock} color="slate" delay={200} />
                <StatCard label="Sedang Review" value={stats.review_kak} icon={Eye} color="amber" delay={300} />
                <StatCard label="Disetujui" value={stats.approved_kak} icon={CheckCircle2} color="emerald" delay={400} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard label="Perlu Revisi / Ditolak" value={stats.rejected_kak} icon={XCircle} color="rose" delay={500} />
                <StatCard label="Kegiatan Aktif" value={stats.kegiatan_aktif} icon={Activity} color="violet" href={route('kegiatan.monitoring')} delay={600} />
            </div>

            {/* Recent KAKs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <div className="flex justify-between items-center px-6 pt-6 pb-3">
                    <h3 className="text-lg font-black text-slate-800">Usulan Terbaru</h3>
                    <Link href={route('kak.index')} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                        Lihat Semua <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-y border-slate-100">
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nama Kegiatan</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tipe</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Terakhir Diubah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentKaks?.length > 0 ? recentKaks.map((kak) => (
                                <tr key={kak.kak_id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={route('kak.show', kak.kak_id)} className="font-bold text-slate-900 hover:text-cyan-600 transition-colors">
                                            {kak.nama_kegiatan}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{kak.tipe}</td>
                                    <td className="px-6 py-4"><StatusBadge statusId={kak.status_id} statusName={kak.status_nama} /></td>
                                    <td className="px-6 py-4 text-sm text-slate-400">{kak.updated_at}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Belum ada usulan KAK.</td></tr>
                            )}
                        </tbody>
                    </table>
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
export default function Dashboard({ auth, stats = {}, recent_kaks, pending_kegiatan }) {
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
