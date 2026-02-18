import { useState } from 'react';
import Sidebar from '@/Components/Sidebar/Sidebar';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Desktop hover state
    // Note: Desktop collapse state is managed internally by Sidebar component 
    // but affects layout margin via CSS class checking or shared state if needed.
    // For simplicity in Phase 1, we'll let the sidebar handle its own width
    // and use a standardized margin for the main content on desktop.
    // Ideally, we'd lift the 'collapsed' state up here if we want perfect margin sync,
    // but CSS grid/flex is often smoother. 

    // Let's use a simpler approach: 
    // The sidebar is fixed. We add a left margin to the main content.
    // Since sidebar width changes, we can use a context or just CSS variables.
    // For now, let's assume a default expanded width for the margin on desktop
    // and let the user toggle it. 

    // ACTUALLY: To sync the margin with the sidebar state, we need to lift the state up.
    // But since Sidebar handles internal state for 'collapsed', we might need to refactor slightly 
    // OR just pass a callback. 
    // Let's stick to the plan: Sidebar manages its own state for now to keep it self-contained,
    // but proper layout integration requires lifting state.

    // REVISION: I will lift 'collapsed' state here for better layout control.

    // Waiting for build... logic in Sidebar.jsx uses local state. 
    // I'll update Sidebar.jsx to accept 'collapsed' prop if I need strict control, 
    // but for now, let's use a responsive grid or just a fixed margin 
    // corresponding to the expanded width (280px) on desktop 
    // and let the sidebar overlay on top if it collapses? 
    // No, standard admin panels shift content.

    // Let's pass the state setter down.

    return (
        <div className="min-h-screen bg-slate-50 flex">
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
                {/* 
                    NOTE: The margin-left above is hardcoded to 280px (expanded width).
                    If sidebar collapses to 80px, there will be a gap. 
                    I'll address this in the "Verification" step by refining the state sharing 
                    if the gap is noticeable/annoying. 
                */}

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
