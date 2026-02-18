import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, ChevronUp, User, Mail } from 'lucide-react';
import { clsx } from 'clsx';

export default function SidebarProfile({ collapsed }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    if (!user) return null;

    const initials = user.nama_lengkap
        ? user.nama_lengkap.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    const role = user.role || 'User';

    return (
        <div className="mt-auto pt-4 border-t border-slate-100">
            <div
                className={clsx(
                    "relative transition-all duration-300",
                    isExpanded ? "rounded-t-lg bg-cyan-50" : "rounded-lg hover:bg-slate-50"
                )}
            >
                <div
                    onClick={toggleExpand}
                    className="flex items-center p-2 cursor-pointer gap-3"
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
                        {initials}
                    </div>

                    <div className={clsx(
                        "flex-1 overflow-hidden transition-all duration-300",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        <h4 className="font-semibold text-sm text-slate-800 truncate leading-tight">
                            {user.nama_lengkap}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-slate-500 truncate">{role}</span>
                        </div>
                    </div>

                    {!collapsed && (
                        <ChevronUp
                            size={16}
                            className={clsx(
                                "text-slate-400 transition-transform duration-200",
                                isExpanded ? "rotate-180" : ""
                            )}
                        />
                    )}
                </div>

                {/* Expanded Details */}
                <div className={clsx(
                    "overflow-hidden transition-all duration-300 absolute bottom-full left-0 right-0 bg-white shadow-xl rounded-t-lg border border-slate-100 mb-2 mx-2",
                    isExpanded && !collapsed ? "max-h-40 opacity-100 p-3" : "max-h-0 opacity-0 p-0 border-0"
                )}>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 break-all bg-slate-50 p-2 rounded">
                        <Mail size={14} className="flex-shrink-0" />
                        {user.email}
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                        <LogOut size={16} />
                        Keluar
                    </Link>
                </div>
            </div>
        </div>
    );
}
