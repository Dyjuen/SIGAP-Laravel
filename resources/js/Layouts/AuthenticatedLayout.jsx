import { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar/Sidebar';
import NotificationBell from '@/Components/NotificationBell';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Desktop hover state
    const { app } = usePage().props;

    // 30s Polling for notifications
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['auth'],
                preserveScroll: true,
                preserveState: true 
            });
        }, app.notification_polling_interval || 300000);

        return () => clearInterval(interval);
    }, [app.notification_polling_interval]);

    return (
        <div className="min-h-screen bg-slate-50 flex bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/backgrounds/BG.png')" }}>
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
            />

            {/* Main Content Wrapper */}
            <div
                className={clsx(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out min-w-0 overflow-x-hidden",
                    isSidebarExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
                )}
            >
                {/* Mobile Header */}
                <header className="bg-white shadow-sm lg:hidden h-16 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-lg ml-4 text-slate-800">
                            SIGAP <span className="text-cyan-500">PNJ</span>
                        </span>
                    </div>
                    <NotificationBell />
                </header>

                {/* Desktop Top Bar (Optional, for notifications) */}
                <div className="hidden lg:flex justify-end p-4 lg:px-8">
                    <NotificationBell />
                </div>

                {/* Page Header */}
                {header && (
                    <div className="pt-2 pb-4 px-4 lg:px-8 max-w-7xl mx-auto w-full">
                        {header}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
