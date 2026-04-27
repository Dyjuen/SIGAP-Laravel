import { Link } from '@inertiajs/react';

export default function KakPagination({ kaks }) {
    if (!kaks || !kaks.links || kaks.links.length === 0) return null;

    return (
        <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-t border-gray-100/60 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
            <div className="text-sm text-gray-500 font-medium">
                Menampilkan <span className="font-bold text-gray-700">{kaks.from || 0}</span> sampai <span className="font-bold text-gray-700">{kaks.to || 0}</span> dari <span className="font-bold text-gray-700">{kaks.total}</span> data
            </div>
            <div className="flex gap-1">
                {kaks.links.map((link, i) => {
                    const isActive = link.active;
                    const isDisabled = !link.url;

                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
                                isActive
                                    ? 'bg-cyan-50 text-cyan-600 border-cyan-100 shadow-sm'
                                    : isDisabled
                                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-100 hover:shadow-sm'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveState
                        />
                    );
                })}
            </div>
        </div>
    );
}
