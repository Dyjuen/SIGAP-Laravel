import { useState } from 'react';
import Sidebar from '@/Components/Sidebar/Sidebar';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Desktop hover state

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
                    "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                    isSidebarExpanded ? "lg:ml-[280px]" : "lg:ml-[80px]"
                )}
            >
                {/* Mobile Header */}
                <header className="bg-white shadow-sm lg:hidden h-16 flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg ml-4 text-slate-800">
                        SIGAP <span className="text-cyan-500">PNJ</span>
                    </span>
                </header>

                {/* Page Header */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
