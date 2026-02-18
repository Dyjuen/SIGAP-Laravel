import { Link } from '@inertiajs/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function SidebarItem({ icon: Icon, label, href, active, collapsed }) {
    return (
        <li className="menu-item">
            <Link
                href={href}
                className={twMerge(
                    clsx(
                        'flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg transition-all duration-200 group relative overflow-hidden',
                        'hover:bg-cyan-50 hover:text-cyan-600 hover:translate-x-1',
                        active && 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600 hover:text-white hover:translate-x-0'
                    )
                )}
            >
                <div className={clsx("flex items-center justify-center min-w-[24px] transition-all duration-300", collapsed ? "w-full" : "")}>
                    <Icon size={20} strokeWidth={2} />
                </div>

                <span className={clsx(
                    "font-medium whitespace-nowrap transition-all duration-300 origin-left",
                    collapsed ? "opacity-0 w-0 translate-x-[-10px]" : "opacity-100 w-auto translate-x-0"
                )}>
                    {label}
                </span>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {label}
                    </div>
                )}
            </Link>
        </li>
    );
}
