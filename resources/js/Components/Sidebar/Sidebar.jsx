import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    History,
    Database,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import SidebarItem from './SidebarItem';
import SidebarDropdown from './SidebarDropdown';
import SidebarProfile from './SidebarProfile';

export default function Sidebar({ isOpen, setIsOpen, isExpanded, setIsExpanded }) {
    const { url, component, auth } = usePage().props;
    const userRole = auth.user?.role_id;
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Derived collapsed state for children:
    // On mobile: Always expanded (false) if visible.
    // On desktop: Depends on hover state (!isExpanded).
    const collapsed = isMobile ? false : !isExpanded;

    const menuItems = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: route().current('dashboard')
        },
        {
            label: 'Kegiatan (KAK)',
            href: route('kak.index'),
            icon: FileText,
            active: route().current('kak.*')
        },
        {
            label: 'Manajemen Akun',
            href: route('admin.users.index'),
            icon: Users,
            active: route().current('admin.users.*'),
            roles: [1] // Admin only
        },
        {
            label: 'Manajemen Panduan',
            href: route('admin.panduan.index'),
            icon: BookOpen,
            active: route().current('admin.panduan.*'),
            roles: [1]
        },
        {
            label: 'Riwayat Aktivitas',
            href: route('admin.logs.index'),
            icon: History,
            active: route().current('admin.logs.*'),
            roles: [1]
        },
        {
            label: 'Master Data',
            icon: Database,
            active: false,
            roles: [1],
            children: [
                {
                    label: 'Role & Izin',
                    href: route('admin.master.resource.index', 'roles'),
                    active: route().current('admin.master.resource.index', 'roles')
                },
                {
                    label: 'Mata Anggaran',
                    href: route('admin.master.resource.index', 'mata-anggaran'),
                    active: route().current('admin.master.resource.index', 'mata-anggaran')
                },
                {
                    label: 'Kategori Belanja',
                    href: route('admin.master.resource.index', 'kategori-belanja'),
                    active: route().current('admin.master.resource.index', 'kategori-belanja')
                },
                {
                    label: 'Satuan',
                    href: route('admin.master.resource.index', 'satuan'),
                    active: route().current('admin.master.resource.index', 'satuan')
                },
                {
                    label: 'Tipe Kegiatan',
                    href: route('admin.master.resource.index', 'tipe-kegiatan'),
                    active: route().current('admin.master.resource.index', 'tipe-kegiatan')
                },
                {
                    label: 'Status Kegiatan',
                    href: route('admin.master.resource.index', 'kegiatan-status'),
                    active: route().current('admin.master.resource.index', 'kegiatan-status')
                },
                {
                    label: 'IKU',
                    href: route('admin.master.resource.index', 'iku'),
                    active: route().current('admin.master.resource.index', 'iku')
                },
            ]
        }
    ];

    const visibleMenuItems = menuItems.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
    });

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    "w-[280px]", // Mobile width (always 280px)
                    isExpanded ? "lg:w-[280px]" : "lg:w-[80px]" // Desktop width logic
                )}
                onMouseEnter={() => window.innerWidth >= 1024 && setIsExpanded(true)}
                onMouseLeave={() => window.innerWidth >= 1024 && setIsExpanded(false)}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-center h-16 px-4 border-b border-slate-100 overflow-hidden">
                    <Link href="/" className="flex items-center justify-center w-full h-full">
                        {/* Collapsed Logo */}
                        <img
                            src="/images/logo.svg"
                            alt="SIGAP Logo"
                            className={clsx(
                                "h-8 w-auto transition-all duration-300 absolute",
                                collapsed ? "opacity-100 scale-100" : "opacity-0 scale-75"
                            )}
                        />

                        {/* Expanded Logo */}
                        <img
                            src="/images/logo2.svg"
                            alt="SIGAP Logo Extended"
                            className={clsx(
                                "h-10 w-auto transition-all duration-300",
                                collapsed ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                            )}
                        />
                    </Link>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors lg:hidden block absolute right-4"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Menu Area */}
                <ul className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar list-none">
                    {visibleMenuItems.map((item, index) => (
                        item.children ? (
                            <SidebarDropdown
                                key={index}
                                {...item}
                                collapsed={collapsed}
                            />
                        ) : (
                            <SidebarItem
                                key={index}
                                {...item}
                                collapsed={collapsed}
                            />
                        )
                    ))}
                </ul>

                {/* Profile Section */}
                <div className="p-3 bg-slate-50/50">
                    <SidebarProfile collapsed={collapsed} />
                </div>
            </aside>
        </>
    );
}
