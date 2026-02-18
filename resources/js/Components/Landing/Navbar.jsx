import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('beranda');
    const navRef = useRef(null);
    const mobileNavRef = useRef(null);
    const tubelightBgRef = useRef(null);
    const tubelightGlowRef = useRef(null);
    const mobileTubelightBgRef = useRef(null);
    const mobileTubelightGlowRef = useRef(null);

    const navItems = [
        { id: 'beranda', label: 'Beranda', href: '#landingHero' },
        { id: 'fitur', label: 'Fitur Utama', href: '#landingFeatures' },
        { id: 'peran', label: 'Peran', href: '#landingRoles' },
        { id: 'faq', label: 'FAQ', href: '#landingFAQ' },
        { id: 'kontak', label: 'Kontak Kami', href: '#landingContact' },
    ];

    useEffect(() => {
        // Initialize tubelight effect
        const updateTubelight = (element) => {
            if (!tubelightBgRef.current || !tubelightGlowRef.current) return;

            const rect = element.getBoundingClientRect();
            const container = element.parentElement.getBoundingClientRect();

            const left = rect.left - container.left;
            const width = rect.width;

            tubelightBgRef.current.style.left = `${left}px`;
            tubelightBgRef.current.style.width = `${width}px`;

            tubelightGlowRef.current.style.left = `${left}px`;
            tubelightGlowRef.current.style.width = `${width}px`;
        };

        const activeElement = document.querySelector(`.nav-item[data-nav="${activeNav}"]`);
        if (activeElement) {
            updateTubelight(activeElement);
        }
    }, [activeNav]);

    useEffect(() => {
        // Initialize mobile tubelight effect
        const updateMobileTubelight = (element) => {
            if (!mobileTubelightBgRef.current || !mobileTubelightGlowRef.current) return;

            const rect = element.getBoundingClientRect();
            const container = element.parentElement.getBoundingClientRect();

            const top = rect.top - container.top;
            const height = rect.height;

            mobileTubelightBgRef.current.style.top = `${top}px`;
            mobileTubelightBgRef.current.style.height = `${height}px`;

            mobileTubelightGlowRef.current.style.top = `${top - 8}px`; // Adjust for glow
        };

        if (isMobileMenuOpen) {
            const activeMobileElement = document.querySelector(`.mobile-nav-item[data-nav="${activeNav}"]`);
            if (activeMobileElement) {
                // Small delay to allow rendering
                setTimeout(() => updateMobileTubelight(activeMobileElement), 50);
            }
        }
    }, [activeNav, isMobileMenuOpen]);


    const handleNavClick = (id) => {
        setActiveNav(id);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg fixed top-5 w-[90vw] sm:w-[85vw] rounded-3xl left-1/2 transform -translate-x-1/2 z-[999]">
            <div className="mx-auto px-5 sm:px-7 lg:px-10">
                <div className="flex items-center justify-between h-16 sm:h-[68px] lg:h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <a href="/" className="flex items-center gap-2 sm:gap-3">
                            <img src="/images/logo/logoland.svg" alt="SIGAP" className="h-8 sm:h-10 lg:h-12 w-auto" />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 text-base font-semibold bg-gray-50 border border-gray-200 py-1.5 px-2 rounded-full">
                        <div className="nav-items-container relative flex gap-1" ref={navRef}>
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`nav-item relative px-7 py-2.5 text-gray-600/80 hover:text-[#33C8DA] transition-colors duration-300 rounded-full z-10 cursor-pointer ${activeNav === item.id ? 'active text-[#33C8DA]' : ''}`}
                                    data-nav={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div ref={tubelightBgRef} className="tubelight-bg absolute top-0 left-0 h-full bg-[#33C8DA]/10 rounded-full transition-all duration-300 pointer-events-none z-0"></div>
                            <div ref={tubelightGlowRef} className="tubelight-glow absolute -top-2 left-0 w-full h-1 pointer-events-none z-20 transition-all duration-300">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#33C8DA] rounded-t-full"></div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-[#33C8DA]/30 rounded-full blur-md"></div>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-[#33C8DA]/20 rounded-full blur-md"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#33C8DA]/20 rounded-full blur-sm"></div>
                            </div>
                        </div>
                    </nav>

                    {/* CTA Button */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href={route('login')} className="cta-btn inline-flex items-center bg-[#33C8DA] text-white px-3 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm lg:text-base shadow-md hover:shadow-lg hover:bg-[#2BA9B8] transition-all duration-300 relative overflow-hidden group">
                            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-[100%]"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cta-icon hidden sm:block sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform duration-300">
                                <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                                <path d="M21 12h-13l3 -3" />
                                <path d="M11 15l-3 -3" />
                            </svg>
                            <span className="whitespace-nowrap">Masuk</span>
                            <span className="hidden sm:inline whitespace-nowrap">Ke Aplikasi</span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`lg:hidden border-t border-gray-200 bg-white rounded-b-3xl overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-5 sm:px-6 py-5 sm:py-6">
                    <div className="mobile-nav-container relative flex flex-col gap-2 bg-gray-50 border border-gray-200 py-2.5 px-2.5 rounded-3xl mb-4" ref={mobileNavRef}>
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`mobile-nav-item relative px-6 py-3.5 text-gray-600/80 hover:text-[#33C8DA] transition-colors duration-300 rounded-3xl z-10 cursor-pointer font-semibold text-center text-sm ${activeNav === item.id ? 'active text-[#33C8DA]' : ''}`}
                                data-nav={item.id}
                                onClick={() => handleNavClick(item.id)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <div ref={mobileTubelightBgRef} className="mobile-tubelight-bg absolute left-2.5 right-2.5 h-0 bg-[#33C8DA]/10 rounded-3xl transition-all duration-300 pointer-events-none z-0"></div>
                        <div ref={mobileTubelightGlowRef} className="mobile-tubelight-glow absolute left-2.5 w-[calc(100%-1.25rem)] h-1 pointer-events-none z-20 transition-all duration-300">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#33C8DA] rounded-t-full"></div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-6 bg-[#33C8DA]/30 rounded-full blur-md"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-4 bg-[#33C8DA]/40 rounded-full blur-sm"></div>
                        </div>
                    </div>

                    <Link href={route('login')} className="flex items-center justify-center gap-2 py-3.5 bg-[#33C8DA] text-white rounded-2xl font-semibold hover:bg-[#2BA9B8] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                            <path d="M21 12h-13l3 -3" />
                            <path d="M11 15l-3 -3" />
                        </svg>
                        Masuk Ke Aplikasi
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
