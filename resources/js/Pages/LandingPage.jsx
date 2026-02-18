import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import ShaderBackground from '@/Components/Landing/ShaderBackground';
import IntroOverlay from '@/Components/Landing/IntroOverlay';
import DashboardPreview from '@/Components/Landing/DashboardPreview';

export default function LandingPage({ auth }) {
    useEffect(() => {
        AOS.init({
            once: true,
            duration: 800,
            easing: 'ease-out-cubic',
        });
    }, []);

    const features = [
        {
            icon: '/images/landing/features/pengajuan-digital.svg',
            title: 'Pengajuan Digital',
            desc: 'Buat dan kirim usulan KAK & LPJ langsung melalui sistem tanpa dokumen fisik.'
        },
        {
            icon: '/images/landing/features/revisi-terstruktur.svg',
            title: 'Revisi Terstruktur',
            desc: 'Setiap revisi tercatat dengan komentar jelas dari verifikator atau pimpinan.'
        },
        {
            icon: '/images/landing/features/pelacakan-real-time.svg',
            title: 'Pelacakan Secara Langsung',
            desc: 'Lihat status usulan kapan saja, dari validasi hingga persetujuan akhir.'
        },
        {
            icon: '/images/landing/features/dokumen-otomatis.svg',
            title: 'Dokumen Otomatis',
            desc: 'SIGAP menghasilkan file KAK, dan surat teguran resmi dalam format PDF.'
        },
        {
            icon: '/images/landing/features/notifikasi-instan.svg',
            title: 'Notifikasi Instan',
            desc: 'Terima pemberitahuan otomatis setiap ada pembaruan atau permintaan revisi.'
        }
    ];

    const toggleFAQ = (e) => {
        const button = e.currentTarget;
        const content = button.nextElementSibling;
        const icon = button.querySelector('.faq-icon');

        // Toggle current item
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
            icon.style.transform = 'rotate(0deg)';
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            icon.style.transform = 'rotate(180deg)';
        }

        // Close other items (Optional for accordion behavior)
        const allContents = document.querySelectorAll('.faq-content');
        const allIcons = document.querySelectorAll('.faq-icon');

        allContents.forEach((item) => {
            if (item !== content && item.style.maxHeight) {
                item.style.maxHeight = null;
            }
        });
        allIcons.forEach((item) => {
            if (item !== icon) {
                item.style.transform = 'rotate(0deg)';
            }
        });
    };

    return (
        <div className="font-sans antialiased text-gray-600 bg-white">
            <Head title="SIGAP PNJ - Sistem Informasi Gerbang Administrasi Pengajuan" />

            <IntroOverlay />
            <Navbar />

            {/* Global Styles for Scrollbar Hiding */}
            <style>{`
                html, body { scrollbar-width: none; -ms-overflow-style: none; }
                html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
                *::-webkit-scrollbar { display: none; }
                .gradient-text {
                    background: linear-gradient(90deg, #33C8DA, #2BA9B8, #33C8DA);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradientShift 3s ease infinite;
                }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .dashboard-3d {
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                }
                .dashboard-3d:hover {
                    transform: scale(1.02);
                }
                .glow-border::before {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    background: linear-gradient(45deg, #33C8DA, #2BA9B8, #33C8DA);
                    border-radius: inherit;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: -1;
                    filter: blur(10px);
                }
                .glow-border:hover::before {
                    opacity: 0.7;
                    animation: glow 2s ease-in-out infinite;
                }
                @keyframes glow {
                   0%, 100% { box-shadow: 0 0 5px rgba(51, 200, 218, 0.5); }
                   50% { box-shadow: 0 0 20px rgba(51, 200, 218, 0.8), 0 0 30px rgba(51, 200, 218, 0.6); }
                }
            `}</style>

            {/* HERO SECTION */}
            <section id="landingHero" className="relative pt-32 pb-20 px-4 overflow-hidden bg-white min-h-screen">
                {/* Background Image */}
                <div className="absolute top-0 left-0 w-full h-[95vh] rounded-b-[80px]" style={{ overflow: 'hidden' }}>
                    <img
                        src="/images/landing/bg-100.png"
                        alt="Hero Background"
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-white via-white/98 via-40% to-transparent pointer-events-none"></div>
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight" data-aos="fade-down" data-aos-duration="1000">
                            <span className="gradient-text">Sistem Informasi Gerbang Administrasi Pengajuan KAK & LPJ</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            SIGAP PNJ memudahkan seluruh proses administrasi kegiatan<br className="hidden md:block" />
                            di kampus secara <span className="text-[#33C8DA] font-semibold">cepat, transparan, dan efisien</span>.
                        </p>

                        <div data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="400">
                            <a href="#landingFeatures" className="hero-cta-btn inline-flex items-center gap-2 bg-[#33C8DA] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-[#2BA9B8] transition-all transform hover:-translate-y-1">
                                Jelajahi Fitur
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <DashboardPreview />
                </div>
            </section>

            {/* GRADIENT BLEND SECTION */}
            <div className="h-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative">
                <svg className="absolute top-0 left-0 w-full h-16 text-white" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
                    <path d="M0,0 C480,60 960,60 1440,0 L1440,0 L0,0 Z" />
                </svg>
            </div>

            {/* FEATURES SECTION */}
            <section id="landingFeatures" className="pt-8 pb-20 px-4 bg-white relative">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <span className="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">Fitur Utama</span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                            <span className="gradient-text">Semua Proses,</span> Satu Sistem.
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            SIGAP membantu setiap peran dari pengusul hingga pimpinan, bekerja lebih cepat dan transparan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay={100 * (idx + 1)}>
                                <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                    <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
                        {features.slice(3).map((feature, idx) => (
                            <div key={idx + 3} className="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay={100 * (idx + 4)}>
                                <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                    <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ROLES SECTION */}
            <section id="landingRoles" className="pt-8 pb-20 px-4 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-[6] pointer-events-none"></div>
                <ShaderBackground />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-[6] pointer-events-none"></div>

                <div className="container mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">PERAN</span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                            Siapa yang Menggunakan <span className="gradient-text">SIGAP?</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            Siap digunakan dengan peran berbeda untuk pemangku kepentingan yang terlibat dalam proses pengajuan dan persetujuan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Role 1 */}
                        <div className="bg-white/80 backdrop-blur-sm feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="100">
                            <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Pengusul</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Mengusulkan KAK & LPJ langsung melalui sistem digital, siap menyediakan seluruh data dengan mudah dan cepat.
                            </p>
                        </div>
                        {/* Role 2 */}
                        <div className="bg-white/80 backdrop-blur-sm feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="200">
                            <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Verifikator</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Melakukan verifikasi dokumen terhadap suatu usulan yang di review, dari verifikasi persyaratan hingga data.
                            </p>
                        </div>
                        {/* Role 3 */}
                        <div className="bg-white/80 backdrop-blur-sm feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="300">
                            <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">WD2 & PPK</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Memberikan persetujuan atau pengajuan akhir terhadap usulan kegiatan sebelum disetujui.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
                        {/* Role 4 */}
                        <div className="bg-white/80 backdrop-blur-sm feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="400">
                            <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Bendahara</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Melakukan pencairan dana dan memvalidasi transaksi keuangan dari setiap laporan LPJ.
                            </p>
                        </div>
                        {/* Role 5 */}
                        <div className="bg-white/80 backdrop-blur-sm feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="500">
                            <div className="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
                                <svg className="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Rektorat</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Memantau dan mengawasi seluruh aktivitas sistem sebagai observer untuk transparansi dan akuntabilitas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="landingFAQ" className="py-20 px-4 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <span className="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">FAQ</span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                            Frequently asked <span className="gradient-text">questions</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            Punya Pertanyaan? Kami siap bantu.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
                        {/* Left Side: Image */}
                        <div className="order-2 lg:order-1" data-aos="fade-right" data-aos-duration="1000" data-aos-delay="300">
                            <img src="/images/landing/faq-boy-with-logos.png" alt="FAQ Illustration" className="w-full max-w-md mx-auto" />
                        </div>

                        {/* Right Side: FAQ Items */}
                        <div className="order-1 lg:order-2 space-y-4">
                            {[
                                { q: 'Siapa yang bisa menggunakan SIGAP?', a: 'SIGAP digunakan oleh civitas akademika PNJ, termasuk Pengusul (Dosen/Tendik), Verifikator, PPK, WD2, dan Bendahara sesuai hak akses masing-masing.' },
                                { q: 'Bagaimana cara mengajukan KAK?', a: 'Login sebagai Pengusul, masuk ke menu "Ajukan Usulan", isi formulir digital, unggah dokumen pendukung, dan kirim untuk verifikasi.' },
                                { q: 'Apakah saya bisa memantau status usulan?', a: 'Tentu! Fitur "Pelacakan Langsung" memungkinkan Anda melihat status terkini usulan Anda, apakah sedang diverifikasi, disetujui, atau perlu revisi.' },
                                { q: 'Format dokumen apa yang dihasilkan?', a: 'Sistem secara otomatis menghasilkan dokumen formal (KAK, LPJ, Surat Tugas) dalam format PDF yang siap cetak dan tanda tangan digital.' }
                            ].map((faq, idx) => (
                                <div key={idx} className="faq-item ripple bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all" data-aos="fade-left" data-aos-duration="1000" data-aos-delay={100 * (idx + 1)}>
                                    <button className="faq-button w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none" onClick={toggleFAQ}>
                                        <span className="font-semibold text-gray-900 text-[15px] lg:text-base">{faq.q}</span>
                                        <svg className="faq-icon w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-out">
                                        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
