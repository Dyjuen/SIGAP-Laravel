import React, { Fragment } from 'react';
import { Upload, MoreVertical, FileText, Download, Eye, Tag, Landmark } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export default function KegiatanPengusulTable({ approvedKaks, onOpenSubmitModal, handlePreviewPdf, previewLoadingId }) {
    const ActionMenu = ({ kak }) => {
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
                                        onClick={() => onOpenSubmitModal(kak)}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                        )}
                                    >
                                        <Upload className="mr-3 h-4 w-4 text-blue-500" />
                                        Ajukan Menjadi Kegiatan
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={(e) => handlePreviewPdf(e, route('kak.pdf.preview-blob', kak.kak_id), kak.kak_id)}
                                        disabled={previewLoadingId === kak.kak_id}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-violet-50 text-violet-700" : "text-gray-700",
                                            previewLoadingId === kak.kak_id && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {previewLoadingId === kak.kak_id ? (
                                            <div className="mr-3 h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Eye className="mr-3 h-4 w-4 text-violet-500" />
                                        )}
                                        Preview KAK (PDF)
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <a
                                        href={route('kak.pdf.download', kak.kak_id)}
                                        className={clsx(
                                            "group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                                            active ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                                        )}
                                    >
                                        <Download className="mr-3 h-4 w-4 text-emerald-500" />
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
                    <span className="p-2 bg-blue-100/80 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    KAK yang siap diajukan menjadi Kegiatan
                </h3>
            </div>

            {approvedKaks.length > 0 ? (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100/80">
                            <thead className="bg-gray-50/80 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama KAK</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sumber Dana</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/40 divide-y divide-gray-50/50">
                                {approvedKaks.map((kak) => (
                                    <tr key={kak.kak_id} className="hover:bg-cyan-50/30 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-cyan-700 transition-colors">{kak.nama_kegiatan}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-[10px] text-gray-600 bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{kak.tipe_kegiatan?.nama_tipe}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 font-medium">{kak.mata_anggaran?.nama_sumber_dana}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <ActionMenu kak={kak} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {approvedKaks.map((kak) => (
                            <div key={kak.kak_id} className="p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 leading-tight mb-1">{kak.nama_kegiatan}</div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                                                <Tag size={10} />
                                                {kak.tipe_kegiatan?.nama_tipe}
                                            </span>
                                        </div>
                                    </div>
                                    <ActionMenu kak={kak} />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                    <Landmark size={12} className="text-gray-400" />
                                    <span className="truncate">{kak.mata_anggaran?.nama_sumber_dana}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada KAK</h3>
                    <p className="mt-1 text-sm text-gray-500">Tidak ada KAK yang siap diajukan saat ini.</p>
                </div>
            )}
        </div>
    );
}
