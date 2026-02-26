import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { Head, router } from '@inertiajs/react';
import { Banknote, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const formatRupiah = (amount) => {
    if (amount === null || amount === undefined) return 'Rp 0';
    return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', { minimumFractionDigits: 0 });
};

export default function Index({ auth, kegiatans }) {
    const handleCairkan = async (kegiatan) => {
        const { value: nominal } = await Swal.fire({
            title: 'Masukkan Nominal Pencairan',
            input: 'number',
            inputAttributes: { min: 1, step: 1 },
            inputPlaceholder: 'Nominal dalam rupiah...',
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            cancelButtonText: 'Batal',
            confirmButtonText: 'Cairkan',
            preConfirm: (val) => {
                if (!val || parseFloat(val) <= 0) {
                    Swal.showValidationMessage('Masukkan nominal yang valid (> 0).');
                }
                return parseFloat(val);
            },
        });

        if (!nominal) return;

        if (nominal > kegiatan.sisa_dana) {
            Swal.fire('Gagal', `Nominal melebihi sisa dana (${formatRupiah(kegiatan.sisa_dana)}).`, 'error');
            return;
        }

        const confirm = await Swal.fire({
            title: 'Konfirmasi Pencairan',
            text: `Cairkan ${formatRupiah(nominal)} untuk kegiatan "${kegiatan.nama_kegiatan}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ya, cairkan',
        });

        if (!confirm.isConfirmed) return;

        router.post(route('pencairan.store', kegiatan.kegiatan_id), { nominal_pencairan: nominal }, {
            onSuccess: () => Swal.fire({ icon: 'success', title: 'Berhasil', text: `${formatRupiah(nominal)} berhasil dicairkan.`, timer: 1500, showConfirmButton: false }),
            onError: (errors) => Swal.fire('Gagal', Object.values(errors).flat().join('\n'), 'error'),
        });
    };

    const handleSelesai = async (kegiatan) => {
        const confirm = await Swal.fire({
            title: 'Anda yakin ingin menandai UM Selesai?',
            text: 'Tindakan ini akan menyelesaikan tahap Bendahara-Cair dan memulai tahap LPJ.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0891b2',
            cancelButtonText: 'Batal',
            confirmButtonText: 'Ya, selesaikan',
        });

        if (!confirm.isConfirmed) return;

        router.post(route('pencairan.selesai', kegiatan.kegiatan_id), {}, {
            onSuccess: () => Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pencairan berhasil diselesaikan. Tahap LPJ telah dimulai.', timer: 2000, showConfirmButton: false }),
            onError: (errors) => Swal.fire('Gagal', Object.values(errors).flat().join('\n'), 'error'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader title="Pencairan Dana" subtitle="Kelola pencairan dana untuk kegiatan yang sedang berjalan" />}
        >
            <Head title="Pencairan Dana" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-100">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-cyan-600" />
                                Kegiatan Menunggu Pencairan
                            </h3>

                            {kegiatans.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No.</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Kegiatan</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pelaksana & PJ</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan Wadir 2</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Anggaran</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Dicairkan</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Sisa Dana</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {kegiatans.map((item, index) => (
                                                <tr key={item.kegiatan_id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-4 text-sm text-slate-600">{index + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-semibold text-slate-900">{item.nama_kegiatan}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-medium text-slate-800">{item.pelaksana_manual || '-'}</div>
                                                        <div className="text-xs text-slate-500">{item.penanggung_jawab_manual || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                        {item.catatan_wadir2 || '-'}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-semibold text-cyan-700">
                                                        {formatRupiah(item.total_anggaran_diusulkan)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-600">
                                                        {formatRupiah(item.dana_dicairkan)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-semibold text-red-500">
                                                        {formatRupiah(item.sisa_dana)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleCairkan(item)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg text-xs font-medium transition-colors border border-cyan-200"
                                                                title="Cairkan Dana"
                                                            >
                                                                <Banknote className="w-4 h-4" />
                                                                Cairkan
                                                            </button>
                                                            <button
                                                                onClick={() => handleSelesai(item)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors border border-emerald-200"
                                                                title="Selesaikan Pencairan (UM Selesai)"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                UM Selesai
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Banknote className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="font-medium">Tidak ada kegiatan yang menunggu pencairan dana saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
