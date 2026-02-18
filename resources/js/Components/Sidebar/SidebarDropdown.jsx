import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function SidebarDropdown({ icon: Icon, label, children, active, collapsed }) {
    const [isOpen, setIsOpen] = useState(active);

    useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    // Close dropdown when sidebar collapses
    useEffect(() => {
        if (collapsed) setIsOpen(false);
    }, [collapsed]);

    const toggleOpen = (e) => {
        e.preventDefault();
        if (collapsed) return;
        setIsOpen(!isOpen);
    };

    return (
        <li className={clsx("menu-item", isOpen && "open")}>
            <a
                href="#"
                onClick={toggleOpen}
                className={twMerge(
                    clsx(
                        'flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg transition-all duration-200 group relative select-none cursor-pointer',
                        'hover:bg-cyan-50 hover:text-cyan-600',
                        (active || isOpen) && 'text-cyan-600 bg-cyan-50/50'
                    )
                )}
            >
                <div className={clsx("flex items-center justify-center min-w-[24px]", collapsed ? "w-full" : "")}>
                    <Icon size={20} strokeWidth={2} />
                </div>

                <span className={clsx(
                    "font-medium whitespace-nowrap flex-1 transition-all duration-300 origin-left",
                    collapsed ? "opacity-0 w-0 translate-x-[-10px]" : "opacity-100 w-auto translate-x-0"
                )}>
                    {label}
                </span>

                {!collapsed && (
                    <ChevronRight
                        size={16}
                        className={clsx(
                            "transition-transform duration-200",
                            isOpen ? "rotate-90" : ""
                        )}
                    />
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {label}
                    </div>
                )}
            </a>

            {/* Submenu */}
            <ul
                className={clsx(
                    "overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50 rounded-b-lg list-none",
                    isOpen && !collapsed ? "max-h-[500px] opacity-100 py-1" : "max-h-0 opacity-0 py-0"
                )}
            >
                {children && children.map((item, index) => (
                    <li key={index} className="pl-9 pr-3 my-0.5">
                        <Link
                            href={item.href}
                            className={clsx(
                                "block py-1.5 px-3 rounded text-sm transition-colors",
                                item.active
                                    ? "text-cyan-600 font-medium bg-cyan-100/50"
                                    : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50"
                            )}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    );
}
