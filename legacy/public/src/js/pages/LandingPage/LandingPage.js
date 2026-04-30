import { createFooter } from "./Footer.js";
import { createNavbar } from "./Navbar.js";
import { ShaderBackground } from "./ShaderBackground.js";

export function renderLandingPage(userRole) {
  const featuresStyle = `
    /* Hide scrollbar but keep scroll functionality */
  html, body {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* Ensure all scrollable elements hide scrollbar */
  *::-webkit-scrollbar {
    display: none;
  }

  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  /* AOS Base Styles */
  [data-aos] {
    opacity: 0;
    transition-property: transform, opacity;
  }

  [data-aos].aos-animate {
    opacity: 1;
  }

  /* Fade Animations */
  [data-aos="fade-up"] {
    transform: translateY(60px);
  }

  [data-aos="fade-up"].aos-animate {
    transform: translateY(0);
  }

  [data-aos="fade-down"] {
    transform: translateY(-60px);
  }

  [data-aos="fade-down"].aos-animate {
    transform: translateY(0);
  }

  [data-aos="fade-left"] {
    transform: translateX(80px);
  }

  [data-aos="fade-left"].aos-animate {
    transform: translateX(0);
  }

  [data-aos="fade-right"] {
    transform: translateX(-80px);
  }

  [data-aos="fade-right"].aos-animate {
    transform: translateX(0);
  }

  /* Zoom Animations */
  [data-aos="zoom-in"] {
    transform: scale(0.8);
  }

  [data-aos="zoom-in"].aos-animate {
    transform: scale(1);
  }

  [data-aos="zoom-out"] {
    transform: scale(1.2);
  }

  [data-aos="zoom-out"].aos-animate {
    transform: scale(1);
  }

  /* Flip Animations */
  [data-aos="flip-left"] {
    transform: perspective(2500px) rotateY(-100deg);
  }

  [data-aos="flip-left"].aos-animate {
    transform: perspective(2500px) rotateY(0);
  }

  [data-aos="flip-right"] {
    transform: perspective(2500px) rotateY(100deg);
  }

  [data-aos="flip-right"].aos-animate {
    transform: perspective(2500px) rotateY(0);
  }

  /* Slide Animations */
  [data-aos="slide-up"] {
    transform: translateY(100%);
  }

  [data-aos="slide-up"].aos-animate {
    transform: translateY(0);
  }

  /* Scroll Reveal Animation */
  .feature-card {
    transition: opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.5s ease, border-color 0.3s ease;
  }

  .feature-card.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  .feature-header {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .feature-header.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  /* Pulse animation */
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  /* Glow effect */
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(51, 200, 218, 0.5); }
    50% { box-shadow: 0 0 20px rgba(51, 200, 218, 0.8), 0 0 30px rgba(51, 200, 218, 0.6); }
  }

  /* Shimmer effect */
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  /* Wave animation */
  @keyframes wave {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(10px); }
  }

  /* Enhanced card hover effects */
  .feature-card {
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(51, 200, 218, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
    pointer-events: none;
    z-index: 0;
  }

  .feature-card:hover::before {
    width: 300px;
    height: 300px;
  }

  .feature-card:hover .icon-wrapper {
    animation: pulse 2s ease-in-out infinite;
  }

  /* Shimmer effect on cards */
  .feature-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.7s ease;
  }

  .feature-card:hover::after {
    left: 100%;
  }

  /* Text gradient animation */
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .gradient-text {
    background: linear-gradient(90deg, #33C8DA, #2BA9B8, #33C8DA);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 3s ease infinite;
  }

  /* Hero CTA Button Animation */
  .hero-cta-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .hero-cta-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
  }
  
  .hero-cta-btn:hover::before {
    left: 100%;
  }

  .hero-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(51, 200, 218, 0.4);
  }
  
  .hero-cta-btn:hover .hero-cta-icon {
    animation: nudge 0.4s ease;
  }

  @keyframes nudge {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }

  /* Number counter animation */
  .stat-number {
    font-variant-numeric: tabular-nums;
    transition: all 0.5s ease;
  }

  /* Stagger animation for list items */
  .stagger-item {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
  }

  .stagger-item:nth-child(1) { animation-delay: 0.1s; }
  .stagger-item:nth-child(2) { animation-delay: 0.2s; }
  .stagger-item:nth-child(3) { animation-delay: 0.3s; }
  .stagger-item:nth-child(4) { animation-delay: 0.4s; }
  .stagger-item:nth-child(5) { animation-delay: 0.5s; }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Particle effect background */
  .particles-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(51, 200, 218, 0.3);
    animation: particleFloat 20s infinite;
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(0) translateX(0) scale(1);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(-100vh) translateX(50px) scale(0);
      opacity: 0;
    }
  }

  /* Enhanced FAQ animations */
  .faq-item {
    transition: all 0.3s ease;
  }

  .faq-item:hover {
    transform: translateX(5px);
  }

  .faq-content {
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Tooltip animation */
  .tooltip {
    position: relative;
  }

  .tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-5px);
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .tooltip:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px);
  }

  /* Loading skeleton animation */
  @keyframes skeleton {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
    background-size: 200px 100%;
    animation: skeleton 1.5s ease-in-out infinite;
  }

  /* Ripple effect on click */
  .ripple {
    position: relative;
    overflow: hidden;
  }

  .ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }

  .ripple:active::after {
    width: 200px;
    height: 200px;
  }

  /* 3D Tilt Effect for Dashboard */
  .dashboard-3d {
    transform-style: preserve-3d;
    transition: transform 0.1s ease-out;
  }

  .dashboard-3d:hover {
    transform: scale(1.02);
  }

  /* Glowing border effect */
  .glow-border {
    position: relative;
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

  /* Typewriter effect */
  .typewriter {
    overflow: hidden;
    border-right: 3px solid #33C8DA;
    white-space: nowrap;
    animation: typing 3.5s steps(40, end), blink 0.75s step-end infinite;
  }

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink {
    50% { border-color: transparent; }
  }

  /* Progress bar animation */
  .progress-bar {
    position: relative;
    overflow: hidden;
    background: rgba(51, 200, 218, 0.1);
  }

  .progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #33C8DA, #2BA9B8);
    width: 0%;
    transition: width 1s ease;
  }

  .progress-bar.animate::after {
    width: 100%;
  }

  /* Rotating border effect */
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .rotating-border {
    position: relative;
  }

  .rotating-border::before {
    content: '';
    position: absolute;
    inset: -4px;
    background: conic-gradient(from 0deg, transparent, #33C8DA, transparent 360deg);
    border-radius: inherit;
    animation: rotate 3s linear infinite;
    z-index: -1;
  }

  /* Smooth section transitions */
  section {
    opacity: 0;
    transform: translateY(30px);
    animation: sectionFadeIn 0.8s ease forwards;
  }

  @keyframes sectionFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Interactive hover states */
  .interactive-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .interactive-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(51, 200, 218, 0.2);
  }

  /* Gradient background animation */
  .animated-gradient {
    background: linear-gradient(270deg, #33C8DA, #2BA9B8, #1E8A96);
    background-size: 600% 600%;
    animation: gradientFlow 15s ease infinite;
  }

  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  `;

  const mainContent = `
    <div>
      <!-- Navbar -->
      ${createNavbar()}

<!-- HERO SECTION - ENHANCED -->
<section id="landingHero" class="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
  <!-- Animated particles background -->
  <div class="particles-bg">
    <div class="particle" style="width: 4px; height: 4px; left: 10%; animation-delay: 0s;"></div>
    <div class="particle" style="width: 6px; height: 6px; left: 20%; animation-delay: 2s;"></div>
    <div class="particle" style="width: 3px; height: 3px; left: 30%; animation-delay: 4s;"></div>
    <div class="particle" style="width: 5px; height: 5px; left: 40%; animation-delay: 1s;"></div>
    <div class="particle" style="width: 4px; height: 4px; left: 50%; animation-delay: 3s;"></div>
    <div class="particle" style="width: 6px; height: 6px; left: 60%; animation-delay: 5s;"></div>
    <div class="particle" style="width: 3px; height: 3px; left: 70%; animation-delay: 2.5s;"></div>
    <div class="particle" style="width: 5px; height: 5px; left: 80%; animation-delay: 4.5s;"></div>
    <div class="particle" style="width: 4px; height: 4px; left: 90%; animation-delay: 1.5s;"></div>
  </div>

  <!-- Background Image -->
  <div class="absolute top-0 left-0 w-full h-[95vh] rounded-b-[80px]" style="overflow: hidden;">
    <img 
      id="hero-bg-img" src="assets/img/backgrounds/bg-100.png" 
      alt="Hero Background" 
      class="absolute top-0 left-0 w-full h-full object-cover opacity-30"
      style="will-change: transform; "
    />
    <!-- Enhanced gradient fade -->
    <div class="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-white via-white/98 via-40% to-transparent pointer-events-none"></div>
  </div>

  <div class="container mx-auto relative z-10">
    <!-- Hero Text with enhanced animations -->
    <div class="text-center max-w-4xl mx-auto mb-16">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight" data-aos="fade-down" data-aos-duration="1000">
        <span class="gradient-text">Sistem Informasi Gerbang Administrasi Pengajuan KAK & LPJ</span> 
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
        SIGAP PNJ memudahkan seluruh proses administrasi kegiatan<br class="hidden md:block">
        di kampus secara <span class="text-[#33C8DA] font-semibold">cepat, transparan, dan efisien</span>.
      </p>
      
      <!-- Enhanced CTA Button -->
      <div data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="400">
        <a href="#landingFeatures" class="hero-cta-btn inline-flex items-center gap-2 bg-[#33C8DA] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg">
          Jelajahi Fitur
          <svg class="hero-cta-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Dashboard Preview with 3D effect -->
    <div class="relative max-w-5xl mx-auto" id="heroDashboard" style="perspective: 1000px;" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="600">
      <div id="heroAnimationImg" class="relative dashboard-3d glow-border rounded-2xl shadow-2xl border border-gray-100 overflow-hidden bg-white" 
        style="transform-style: preserve-3d; transition: transform 0.15s ease-out; transform-origin: center center;">  
        
        <img 
          id="dashboard-bg"
          src="assets/img/previews/dashboard-preview.png" 
          alt="SIGAP Dashboard Background" 
          class="w-full h-auto rounded-2xl"
          style="transition: transform 0.1s ease-out;"
        >
        
        <img 
          id="dashboard-elements"
          src="assets/img/previews/dashboard-elements.png" 
          alt="SIGAP Dashboard Elements" 
          class="absolute top-0 left-0 w-full h-auto pointer-events-none"
          style="transition: transform 0.1s ease-out;"
        >
      </div>
    </div>
  </div>
</section>

<!-- GRADIENT BLEND SECTION -->
<div class="h-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative">
  <svg class="absolute top-0 left-0 w-full h-16 text-white" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
    <path d="M0,0 C480,60 960,60 1440,0 L1440,0 L0,0 Z"/>
  </svg>
</div>

<!-- FEATURES SECTION - ENHANCED -->
<section id="landingFeatures" class="section-py pt-8 pb-20 px-4 bg-white relative">
  <div class="container mx-auto">
    <div class="text-center mb-16">
      <span class="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">Fitur Utama</span>
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
        <span class="gradient-text">Semua Proses,</span> Satu Sistem.
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
        SIGAP membantu setiap peran dari pengusul hingga pimpinan, bekerja lebih cepat dan transparan.
      </p>
    </div>

    <!-- Features Grid with enhanced cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="100">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <img src="assets/svg/features/pengajuan-digital.svg" alt="Pengajuan Digital Icon" class="w-12 h-12">
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Pengajuan Digital</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Buat dan kirim usulan KAK & LPJ langsung melalui sistem tanpa dokumen fisik.
        </p>
      </div>

      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="200">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <img src="assets/svg/features/revisi-terstruktur.svg" alt="Revisi Terstruktur Icon" class="w-12 h-12">
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Revisi Terstruktur</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Setiap revisi tercatat dengan komentar jelas dari verifikator atau pimpinan.
        </p>
      </div>

      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="300">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <img src="assets/svg/features/pelacakan-real-time.svg" alt="Pelacakan Real-Time Icon" class="w-12 h-12">
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Pelacakan Secara LangsungBUKAN</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Lihat status usulan kapan saja, dari validasi hingga persetujuan akhir.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="400">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <img src="assets/svg/features/dokumen-otomatis.svg" alt="Dokumen Otomatis Icon" class="w-12 h-12">
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Dokumen Otomatis</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          SIGAP menghasilkan file KAK, dan surat teguran resmi dalam format PDF.
        </p>
      </div>

      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="500">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <img src="assets/svg/features/notifikasi-instan.svg" alt="Notifikasi Instan Icon" class="w-12 h-12">
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Notifikasi Instan</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Terima pemberitahuan otomatis setiap ada pembaruan atau permintaan revisi.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Roles Section - ENHANCED -->
<section id="landingRoles" class="section-py pt-8 pb-20 px-4 bg-white relative">
  <!-- Gradient blend dari Features (putih) -->
  <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-[6] pointer-events-none"></div>
  
  <!-- Shader Background Canvas -->
  <canvas id="rolesShaderBg" class="absolute top-0 left-0 w-full h-full opacity-100 pointer-events-none"></canvas>
  
  <!-- Gradient blend ke FAQ (putih) -->
  <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-[6] pointer-events-none"></div>
  <div class="container mx-auto">
    <div class="text-center mb-16">
      <span class="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">PERAN</span>
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
        Siapa yang Menggunakan <span class="gradient-text">SIGAP?</span>
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
        Siap digunakan dengan peran berbeda untuk pemangku kepentingan yang terlibat dalam proses pengajuan dan persetujuan.
      </p>
    </div>

    <!-- Row 1: 3 cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      
      <!-- Role 1: Pengusul -->
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="100">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <svg class="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Pengusul</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Mengusulkan KAK & LPJ langsung melalui sistem digital, siap menyediakan seluruh data dengan mudah dan cepat.
        </p>
      </div>

      <!-- Role 2: Verifikator -->
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="200">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <svg class="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Verifikator</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Melakukan verifikasi dokumen terhadap suatu usulan yang di review, dari verifikasi persyaratan hingga data.
        </p>
      </div>

      <!-- Role 3: WD2 & PPK -->
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="flip-left" data-aos-duration="1000" data-aos-delay="300">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <svg class="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">WD2 & PPK</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Memberikan persetujuan atau pengajuan akhir terhadap usulan kegiatan sebelum disetujui.
        </p>
      </div>
    </div>

    <!-- Row 2: 2 cards centered -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
      
      <!-- Role 4: Bendahara -->
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="400">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <svg class="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Bendahara</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Melakukan pencairan dana dan memvalidasi transaksi keuangan dari setiap laporan LPJ.
        </p>
      </div>

      <!-- Role 5: Rektorat -->
      <div class="feature-card interactive-card group text-center p-6 rounded-2xl border border-gray-100 hover:bg-cyan-50/50 hover:border-cyan-200 transition-all duration-300" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="500">
        <div class="icon-wrapper w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl group-hover:scale-105 transition-transform duration-300">
          <svg class="w-12 h-12 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#33C8DA] transition-colors duration-300">Rektorat</h3>
        <p class="text-gray-600 leading-relaxed text-sm">
          Memantau dan mengawasi seluruh aktivitas sistem sebagai observer untuk transparansi dan akuntabilitas.
        </p>
      </div>
    </div>
  </div>
</section>
  <!-- FAQ Section - ENHANCED -->
  <section id="landingFAQ" class="section-py py-20 px-4 bg-white">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <span class="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">FAQ</span>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
          Frequently asked <span class="gradient-text">questions</span>
        </h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
          Punya Pertanyaan? Kami siap bantu.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
        <!-- Left Side: Image -->
        <div class="order-2 lg:order-1" data-aos="fade-right" data-aos-duration="1000" data-aos-delay="300">
          <img src="assets/img/front-pages/landing-page/faq-boy-with-logos.png" alt="FAQ Illustration" class="w-full max-w-md mx-auto">
        </div>

        <!-- Right Side: FAQ Items -->
        <div class="order-1 lg:order-2 space-y-4">
          <!-- FAQ 1 -->
          <div class="faq-item ripple bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="100">
            <button class="faq-button w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900 text-[15px] lg:text-base">Siapa yang bisa menggunakan SIGAP?</span>
              <svg class="faq-icon w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="px-6 py-5 bg-cyan-50/30 border-t border-cyan-100">
                <p class="text-gray-700 leading-relaxed text-[14px] lg:text-[15px] text-justify">
                  SIGAP dapat digunakan oleh seluruh civitas akademika Politeknik Negeri Jakarta yang terlibat dalam proses pengajuan dan persetujuan kegiatan kampus. Ini mencakup empat peran utama: <strong>Pengusul</strong> (dosen dan staff yang mengajukan kegiatan), <strong>Verifikator</strong> (yang melakukan review dan verifikasi dokumen), <strong>WD2 & PPK</strong> (yang memberikan persetujuan akhir), dan <strong>Bendahara</strong> (yang mengelola pencairan dana).
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ 2 -->
          <div class="faq-item ripple bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="200">
            <button class="faq-button w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900 text-[15px] lg:text-base">Apakah data saya aman?</span>
              <svg class="faq-icon w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="px-6 py-5 bg-cyan-50/30 border-t border-cyan-100">
                <p class="text-gray-700 leading-relaxed text-[14px] lg:text-[15px] text-justify">
                  Keamanan data adalah prioritas utama kami. SIGAP menggunakan <strong>enkripsi tingkat enterprise</strong> dan sistem keamanan berlapis untuk melindungi semua informasi. Kami juga menerapkan <strong>audit trail</strong> lengkap untuk setiap aktivitas.
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ 3 -->
          <div class="faq-item ripple bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="300">
            <button class="faq-button w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900 text-[15px] lg:text-base">Apa saja fitur utama yang ditawarkan?</span>
              <svg class="faq-icon w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="px-6 py-5 bg-cyan-50/30 border-t border-cyan-100">
                <p class="text-gray-700 leading-relaxed text-[14px] lg:text-[15px] mb-3">
                  SIGAP menyediakan: Pengajuan Digital KAK & LPJ, Sistem Revisi Terstruktur, Pelacakan Secara Langsung, Dokumen Otomatis, Notifikasi Instan, dan Dashboard Monitoring.
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ 4 -->
          <div class="faq-item ripple bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="400">
            <button class="faq-button w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onclick="toggleFAQ(this)">
              <span class="font-semibold text-gray-900 text-[15px] lg:text-base">Bagaimana jika ada revisi?</span>
              <svg class="faq-icon w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="faq-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="px-6 py-5 bg-cyan-50/30 border-t border-cyan-100">
                <p class="text-gray-700 leading-relaxed text-[14px] lg:text-[15px]">
                  Sistem revisi di SIGAP sangat terstruktur: Notifikasi Otomatis, Catatan Jelas, Riwayat Lengkap, Panduan Perbaikan, Resubmit Mudah, dan Tracking Progress real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

<!-- Contact Section - SIMPLIFIED -->
<section id="landingContact" class="section-py py-20 px-4 relative overflow-hidden">
  <!-- Animated gradient background -->
  <div class="absolute inset-0 animated-gradient opacity-10 pointer-events-none"></div>
  <div class="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-[#2BA9B8]/5 pointer-events-none"></div>
  
  <div class="container mx-auto relative z-10">
    <div class="text-center mb-16">
      <span class="section-badge inline-block px-4 py-2 bg-cyan-100 text-[#33C8DA] rounded-full text-sm font-semibold mb-4" data-aos="fade-down" data-aos-duration="800">KONTAK</span>
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
        Hubungi <span class="gradient-text">Tim SIGAP</span>
      </h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
        Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <!-- Left Side: Contact Image -->
      <div class="relative" data-aos="fade-right" data-aos-duration="1000" data-aos-delay="300">
        <div class="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-[#33C8DA]/20 hover:shadow-lg transition-shadow duration-300">
          <img src="assets/img/front-pages/landing-page/contact-customer-service.png" alt="Customer Service" class="w-full rounded-xl mb-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-[#33C8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Alamat Email</p>
                <a href="mailto:Sigap@pnj.ac.id" class="text-sm font-semibold text-gray-900 hover:text-[#33C8DA] transition-colors">Sigap@pnj.ac.id</a>
              </div>
            </div>

            <div class="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Nomor Telepon</p>
                <a href="tel:+6234088963" class="text-sm font-semibold text-gray-900 hover:text-[#33C8DA] transition-colors">+6234 088 963</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Contact Form -->
      <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="400">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Kirim sebuah pesan</h3>
        <p class="text-gray-600 mb-6">Ada pertanyaan? Hubungi kami melalui formulir di bawah ini.</p>

        <form class="space-y-5" onsubmit="handleContactSubmit(event)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <input type="text" id="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33C8DA] focus:border-transparent outline-none transition-all hover:border-cyan-300" placeholder="Budi Hartono" required>
            </div>
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Alamat Email</label>
              <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33C8DA] focus:border-transparent outline-none transition-all hover:border-cyan-300" placeholder="budihartono@gmail.com" required>
            </div>
          </div>
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
            <input type="tel" id="phone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33C8DA] focus:border-transparent outline-none transition-all hover:border-cyan-300" placeholder="+62 812 3456 7890" required>
          </div>
          <div>
            <label for="message" class="block text-sm font-semibold text-gray-700 mb-2">Pesan</label>
            <textarea id="message" rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#33C8DA] focus:border-transparent outline-none transition-all resize-none hover:border-cyan-300" placeholder="Tulis pesan Anda di sini..." required></textarea>
          </div>
          <button type="submit" class="w-full bg-[#33C8DA] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#2BA9B8] transition-colors duration-300 shadow-md hover:shadow-lg">
            Kirim Pesan
          </button>
        </form>
      </div>
    </div>
  </div>
</section>
</div>

<!-- Footer -->
<div id="footer"></div>
`;
const rootElement = document.getElementById("root");
if (rootElement) {
rootElement.innerHTML = mainContent;
} else {
console.error("Root element #root not found.");
return;
}
// Inject styles
const styleTag = document.createElement('style');
styleTag.innerHTML = featuresStyle;
document.head.appendChild(styleTag);
createFooter();
// Initialize AOS
function initAOS() {
const observerOptions = {
root: null,
rootMargin: '0px',
threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.getAttribute('data-aos-delay') || 0;
      const duration = entry.target.getAttribute('data-aos-duration') || 1000;
      
      entry.target.style.transitionDuration = `${duration}ms`;
      entry.target.style.transitionDelay = `${delay}ms`;
      
      setTimeout(() => {
        entry.target.classList.add('aos-animate');
      }, 10);
      
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
  observer.observe(el);
});
}
initAOS();
// Initialize Shader Background
let shaderBg = null;
setTimeout(() => {
const rolesCanvas = document.getElementById('rolesShaderBg');
if (rolesCanvas) {
shaderBg = new ShaderBackground('rolesShaderBg');
}
}, 100);
// Mobile menu toggle
const toggle = document.getElementById("nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
if (toggle && mobileMenu) {
toggle.addEventListener("click", () => {
mobileMenu.classList.toggle("hidden");
});
}
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    }
  });
});
// FAQ Toggle Function
window.toggleFAQ = function(button) {
const faqItem = button.closest('.faq-item');
const content = faqItem.querySelector('.faq-content');
const icon = faqItem.querySelector('.faq-icon');
const isActive = faqItem.classList.contains('faq-active');
// Close all FAQs
document.querySelectorAll('.faq-item').forEach(item => {
  const itemContent = item.querySelector('.faq-content');
  const itemIcon = item.querySelector('.faq-icon');
  const itemButton = item.querySelector('.faq-button');
  
  item.classList.remove('faq-active', 'border-[#33C8DA]', 'border-2');
  item.classList.add('border-gray-200');
  itemContent.style.maxHeight = '0';
  itemIcon.style.transform = 'rotate(0deg)';
  itemIcon.classList.remove('text-[#33C8DA]');
  itemIcon.classList.add('text-gray-400');
  itemButton.classList.remove('bg-cyan-50');
  
  const contentDiv = itemContent.querySelector('div');
  if (contentDiv) {
    contentDiv.classList.remove('bg-cyan-50/50', 'border-cyan-100');
    contentDiv.classList.add('bg-gray-50', 'border-gray-100');
  }
});

// Open clicked FAQ if it wasn't active
if (!isActive) {
  faqItem.classList.add('faq-active', 'border-[#33C8DA]', 'border-2');
  faqItem.classList.remove('border-gray-200');
  content.style.maxHeight = content.scrollHeight + 'px';
  icon.style.transform = 'rotate(90deg)';
  icon.classList.remove('text-gray-400');
  icon.classList.add('text-[#33C8DA]');
  button.classList.add('bg-cyan-50');
  
  const contentDiv = content.querySelector('div');
  if (contentDiv) {
    contentDiv.classList.remove('bg-gray-50', 'border-gray-100');
    contentDiv.classList.add('bg-cyan-50/50', 'border-cyan-100');
  }
}
};
// Contact Form Submit Handler
window.handleContactSubmit = function(e) {
e.preventDefault();
const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const phone = document.getElementById('phone').value;
const message = document.getElementById('message').value;

// Show success message (you can customize this)
alert(`Terima kasih ${name}! Pesan Anda telah diterima. Kami akan menghubungi Anda segera.`);

// Reset form
e.target.reset();

// Here you would typically send the data to your backend
console.log('Form submitted:', { name, email, phone, message });
};
// 3D Multi-Layer Dashboard Animation - ENHANCED
const heroDashboard = document.getElementById('heroDashboard');
const dashboardContainer = document.getElementById('heroAnimationImg');
const dashboardBg = document.getElementById('dashboard-bg');
const dashboardElements = document.getElementById('dashboard-elements');
if (heroDashboard && dashboardContainer && dashboardBg && dashboardElements) {
heroDashboard.style.perspective = '1000px';
heroDashboard.style.perspectiveOrigin = 'center center';

dashboardContainer.style.perspective = 'none';
dashboardContainer.style.transformStyle = 'preserve-3d';
dashboardContainer.style.transformOrigin = 'center center';
dashboardContainer.style.transition = 'transform 0.1s ease-out';

dashboardBg.style.transition = 'transform 0.1s ease-out';
dashboardElements.style.transition = 'transform 0.1s ease-out';

heroDashboard.addEventListener('mousemove', (e) => {
  const rect = heroDashboard.getBoundingClientRect();
  
  const mouseX = (e.clientX - rect.left) / rect.width;
  const mouseY = (e.clientY - rect.top) / rect.height;
  
  const normalizedX = (mouseX - 0.5) * 2;
  const normalizedY = (mouseY - 0.5) * 2;
  
  const maxRotation = 10;
  
  const rotateY = normalizedX * maxRotation;
  const rotateX = -normalizedY * maxRotation;
  
  dashboardContainer.style.transform = `
    rotateX(${rotateX}deg) 
    rotateY(${rotateY}deg) 
    scale3d(1.02, 1.02, 1.02)
  `;
  
  const parallax = 8;
  dashboardBg.style.transform = `translateX(${normalizedX * parallax}px) translateY(${normalizedY * parallax}px)`;
  dashboardElements.style.transform = `translateX(${-normalizedX * parallax * 1.5}px) translateY(${-normalizedY * parallax * 1.5}px)`;
});

heroDashboard.addEventListener('mouseleave', () => {
  dashboardContainer.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  dashboardBg.style.transform = 'translateX(0) translateY(0)';
  dashboardElements.style.transform = 'translateX(0) translateY(0)';
});
}
// Scroll Reveal for Features Section
function initFeaturesAnimation() {
const observerOptions = {
root: null,
rootMargin: '0px 0px -100px 0px',
threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, observerOptions);

const header = document.querySelector('.feature-header');
if (header) observer.observe(header);

document.querySelectorAll('.feature-card').forEach(card => {
  observer.observe(card);
});
}
initFeaturesAnimation();
// Parallax effect for background images on scroll
window.addEventListener('scroll', () => {
const scrolled = window.pageYOffset;
const heroBg = document.getElementById('hero-bg-img');
if (heroBg) {
  heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
}
});
// Add intersection observer for section animations
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
}
});
}, { threshold: 0.1 });
sections.forEach(section => {
sectionObserver.observe(section);
});
// Cleanup function
return () => {
if (shaderBg) {
shaderBg.destroy();
}
};
}