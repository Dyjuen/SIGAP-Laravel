import { Link } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';

export default function KakToolbar({ searchTerm, setSearchTerm, statusFilter, handleStatusChange, auth }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-3">
                <div className="w-full md:w-1/2 relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        className="w-full py-2.5 pl-11 pr-4 rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 transition-all hover:bg-white/80"
                        placeholder="Cari kegiatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <CustomSelect 
                        value={statusFilter}
                        onChange={(val) => handleStatusChange({ target: { value: val } })}
                        options={[
                            { value: "", label: "Semua Status" },
                            { value: "1", label: "Draft", colorClass: "bg-gray-500" },
                            { value: "2", label: "Review", colorClass: "bg-amber-500" },
                            { value: "3", label: "Disetujui", colorClass: "bg-emerald-500" },
                            { value: "4", label: "Ditolak", colorClass: "bg-rose-500" },
                            { value: "5", label: "Revisi", colorClass: "bg-orange-500" }
                        ]}
                    />
                </div>
            </div>

            {/* Only Pengusul (Role 3) can create */}
            {auth.user.role_id === 3 && (
                <Link
                    href={route('kak.create')}
                    className="w-full sm:w-auto inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all duration-300 ease-in-out shadow-sm hover:shadow-md active:scale-95 border border-cyan-100 hover:border-cyan-600 font-semibold"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Buat KAK Baru</span>
                </Link>
            )}
        </div>
    );
}
