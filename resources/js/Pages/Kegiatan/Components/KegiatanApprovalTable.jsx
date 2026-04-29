import React, { Fragment } from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle, MessageSquare, MoreVertical, Eye, Download, FileText, User, Calendar, Info } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export default function KegiatanApprovalTable({ pendingKegiatan, isWadir, onOpenApproveModal, handlePreviewPdf, previewLoadingId }) {
    const ActionMenu = ({ kegiatan }) => {
        return (
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center justify-center w-9 h-9 rounded-xl transition-all text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 border border-gray-100 bg-white">
                        <MoreVertical size={18} />
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => onOpenApproveModal(kegiatan)}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                                        )}
                                    >
                                        <CheckCircle className="mr-3 h-4 w-4 text-emerald-500" />
                                        Setujui Kegiatan
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href={route('kegiatan.show', kegiatan.kegiatan_id)}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-cyan-50 text-cyan-700" : "text-gray-700"
                                        )}
                                    >
                                        <Eye className="mr-3 h-4 w-4 text-cyan-500" />
                                        Lihat Detail
                                    </Link>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', kegiatan.kak_id), kegiatan.kak_id)}
                                        disabled={previewLoadingId === kegiatan.kak_id}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-violet-50 text-violet-700" : "text-gray-700",
                                            previewLoadingId === kegiatan.kak_id && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {previewLoadingId === kegiatan.kak_id ? (
                                            <div className="mr-3 h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FileText className="mr-3 h-4 w-4 text-violet-500" />
                                        )}
                                        Preview KAK (PDF)
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <a
                                        href={route('kak.pdf.download', kegiatan.kak_id)}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-amber-50 text-amber-700" : "text-gray-700"
                                        )}
                                    >
                                        <Download className="mr-3 h-4 w-4 text-amber-500" />
                                        Download PDF
                                    </a>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        );
    };
    return (
        <div className="bg-white/70 backdrop-blur-md overflow-hidden sm:rounded-2xl border border-gray-100/60 shadow-sm relative">
            <div className="p-6 border-b border-gray-100/80">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-amber-100/80 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-amber-600" />
                    </span>
                    Persetujuan Kegiatan Menunggu Anda
                </h3>
            </div>

            {pendingKegiatan.length > 0 ? (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100/80">
                            <thead className="bg-gray-50/80 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kegiatan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pengusul</th>
                                    {isWadir && <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan PPK</th>}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Diajukan</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/40 divide-y divide-gray-50/50">
                                {pendingKegiatan.map((kegiatan) => {
                                    const priorCatatan = isWadir ? kegiatan.approvals?.find(a => a.approval_level === 'PPK')?.catatan : null;

                                    return (
                                        <tr key={kegiatan.kegiatan_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors leading-tight">{kegiatan.kak.nama_kegiatan}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{kegiatan.kak.tipe_kegiatan?.nama_tipe}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {kegiatan.kak.pengusul?.nama_lengkap}
                                            </td>
                                            {isWadir && (
                                                <td className="px-6 py-4 whitespace-normal text-sm">
                                                    {priorCatatan ? (
                                                        <span className="inline-flex items-start gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-[11px]">
                                                            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                                            <span>{priorCatatan}</span>
                                                        </span>
                                                    ) : <span className="text-gray-400 italic">-</span>}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {new Date(kegiatan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <ActionMenu kegiatan={kegiatan} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {pendingKegiatan.map((kegiatan) => {
                            const priorCatatan = isWadir ? kegiatan.approvals?.find(a => a.approval_level === 'PPK')?.catatan : null;

                            return (
                                <div key={kegiatan.kegiatan_id} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 leading-tight mb-1">{kegiatan.kak.nama_kegiatan}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{kegiatan.kak.tipe_kegiatan?.nama_tipe}</div>
                                        </div>
                                        <ActionMenu kegiatan={kegiatan} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                                <User size={14} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Pengusul</div>
                                                <div className="text-xs font-bold text-gray-700">{kegiatan.kak.pengusul?.nama_lengkap}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                                <Calendar size={14} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Diajukan</div>
                                                <div className="text-xs font-bold text-gray-700">
                                                    {new Date(kegiatan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        {isWadir && priorCatatan && (
                                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mt-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                                                    <MessageSquare size={12} />
                                                    Catatan PPK
                                                </div>
                                                <div className="text-xs text-amber-700 leading-relaxed italic">
                                                    "{priorCatatan}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Tidak ada kegiatan</h3>
                    <p className="mt-1 text-sm text-gray-500">Tidak ada kegiatan yang perlu persetujuan Anda saat ini.</p>
                </div>
            )}
        </div>
    );
}
