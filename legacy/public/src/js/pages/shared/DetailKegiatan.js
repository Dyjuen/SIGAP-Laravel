// frontend/src/pages/Pengusul/DummyInputReadOnly.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderDetailKegiatanPage(path, userRole) {
  const pageContent = `
    <style>
      /* Scrollbar Hiding */
      html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
      }

      /* Desktop right padding to prevent content from touching right edge */
      @media (min-width: 1024px) {
        .kerangka-acuan-kerja-page {
          padding-right: 1rem;
        }
      }

      /* Keyframe Animations */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      /* Progress Steps */
      .progress-step-item {
        cursor: pointer;
        animation: fadeIn 0.6s ease-out;
      }

      .progress-step-item:hover {
        transform: translateY(-3px); 
      }
      
      .progress-step-circle {
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
        transition: all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);        
      }

      .progress-step-item:hover .progress-step-circle {
        box-shadow: 0 8px 20px rgba(0, 188, 212, 0.6);
        transform: rotate(360deg);
      }
      
      /* Menu buttons - SAMA SEPERTI STEPPER YANG SMOOTH! */
      .menu-button {
        transition: all 0.4s ease-in-out;
        position: relative;
        overflow: hidden;
      }

      .menu-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.3), transparent);
        transition: left 0.6s ease;
      }

      .menu-button:hover::before {
        left: 100%;
      }

      .menu-button:hover {
        transform: translateY(-3px); 
      }

      .menu-button.active {
        border-color: #00BCD4 !important;
        background: rgba(0, 188, 212, 0.1) !important;
      }

      /* KUNCI: SAMA PERSIS SEPERTI STEPPER CIRCLE! */
      .menu-button .w-8 {
        transition: all 0.8s cubic-bezier(0.050, 0.600, 0.165, 1.025);
      }

      .menu-button:hover .w-8 {
        transform: rotate(360deg);
      }

      /* PENTING: MATIKAN transform untuk icon di dalam menu button! */
      .menu-button .w-8 .ti {
        transition: none !important;
        transform: none !important;
      }

      .menu-button:hover .w-8 .ti {
        transform: none !important;
        /* Icon ikut muter karena parent (.w-8) yang rotate, bukan transform sendiri! */
      }

      /* Text transition */
      .menu-button .font-semibold {
        transition: color 0.3s ease;
      }

      .menu-button:hover .font-semibold {
        color: #00ACC1;
      }
      
      /* Step content */
      .step-content {
        display: none;
      }
      
      .step-content.active {
        display: block;
        animation: fadeIn 0.5s ease-out;
      }

      /* Card animations */
      .bg-white.rounded-xl.shadow-lg {
        animation: slideInUp 0.6s ease-out;
        transition: all 0.7s ease;
      }

      .bg-white.rounded-xl.shadow-lg:hover {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        transform: translateY(-5px);
      }
      
      /* RAB Grid */
      .grid-rab {
        display: grid;
        grid-template-columns: 2.5fr 0.8fr 1.2fr 0.8fr 1.2fr 0.8fr 1.2fr 2.5fr;
        gap: 1rem;
        align-items: end;
      }
      
      .row-item {
        padding: 1rem;
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        margin-bottom: 1rem;
        background: white;
        animation: fadeInLeft 0.5s ease-out;
        transition: all 0.8s cubic-bezier(0.050, 0.600, 0.165, 1.025);
        position: relative;
        overflow: hidden;
      }

      .row-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.1), transparent);
        transition: left 0.6s ease;
      }

      .row-item:hover::before {
        left: 100%;
      }

      .row-item:hover {
        border-color: #00BCD4;
        box-shadow: 0 8px 16px rgba(0, 188, 212, 0.2);
        transform: translateX(5px) scale(1.02);
      }

      .row-item:nth-child(odd) {
        animation-delay: 0.1s;
      }

      .row-item:nth-child(even) {
        animation-delay: 0.2s;
      }

      /* Input fields */
      input[readonly], textarea[readonly], select[disabled] {
        transition: all 0.7s ease;
      }

      input[readonly]:hover, textarea[readonly]:hover, select[disabled]:hover {
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
        transform: scale(1.01);
      }

      /* Buttons */
      button {
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      button::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
      }

      button:active::after {
        width: 300px;
        height: 300px;
      }

      button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 188, 212, 0.3);
      }

      button:active {
        transform: translateY(-1px);
      }

      /* Labels */
      label {
        transition: all 0.7s ease;
        display: inline-block;
      }

      /* Headers */
      h4, h5 {
        animation: fadeInDown 0.6s ease-out;
        transition: all 0.7s ease;
      }

      /* Backdrop */
      .backdrop-blur-md {
        animation: slideInDown 0.6s ease-out;
        transition: all 0.7s ease;
      }

      .backdrop-blur-md:hover {
        backdrop-filter: blur(20px) !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }

      /* Loading shimmer effect */
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
      }

      /* Stagger animations for grid items */
      .grid > * {
        animation: fadeIn 0.5s ease-out;
      }

      .grid > *:nth-child(1) { animation-delay: 0.1s; }
      .grid > *:nth-child(2) { animation-delay: 0.2s; }
      .grid > *:nth-child(3) { animation-delay: 0.3s; }
      .grid > *:nth-child(4) { animation-delay: 0.4s; }
      .grid > *:nth-child(5) { animation-delay: 0.5s; }
      .grid > *:nth-child(6) { animation-delay: 0.6s; }

      /* Smooth scroll */
      html {
        scroll-behavior: smooth;
      }

      /* Container animations */
      .flex.gap-8 > * {
        animation: fadeInRight 0.6s ease-out;
      }

      .flex.gap-8 > *:first-child {
        animation: fadeInLeft 0.6s ease-out;
      }

      /* Icon animations */
      .ti {
        transition: all 0.3s ease;
        display: inline-block;
      }

      button:hover .ti {
        transform: scale(1.2) rotate(10deg);
      }

      /* Border Drawing Animation - SUPER SMOOTH VERSION with POP-UP */
      .border-hover-draw {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Subtle pop-up effect saat hover */
      .border-hover-draw:hover {
        transform: translateY(-4px) scale(1.01);
      }

      .border-hover-draw::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 2px;
        background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        
        /* Default state: hidden di tengah bawah */
        clip-path: polygon(
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%
        );
        
        /* Smooth reverse animation by default */
        animation: borderDrawReverse 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* Forward animation saat hover - SUPER SMOOTH */
      .border-hover-draw:hover::before {
        animation: borderDrawForward 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* ====== FORWARD ANIMATION (Mouse IN) ====== */
      /* Bawah → Kiri/Kanan → Atas */
      @keyframes borderDrawForward {
        0% {
          /* Start: titik tengah bawah */
          clip-path: polygon(
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%
          );
        }
        
        30% {
          /* Garis bawah expand smooth ke kiri-kanan */
          clip-path: polygon(
            0% 100%, 0% 100%, 
            0% 100%, 50% 100%, 
            50% 100%, 100% 100%, 
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Border kiri & kanan naik bersamaan ke atas (SMOOTH!) */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
        
        100% {
          /* Complete: border penuh dengan slight overshoot */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
      }

      /* ====== REVERSE ANIMATION (Mouse OUT) ====== */
      /* Atas → Kiri/Kanan → Bawah */
      @keyframes borderDrawReverse {
        0% {
          /* Start: border penuh */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
        
        30% {
          /* Garis atas & border kiri-kanan turun smooth */
          clip-path: polygon(
            0% 100%, 0% 100%, 
            0% 100%, 50% 100%, 
            50% 100%, 100% 100%, 
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Garis bawah mulai menyusut ke tengah */
          clip-path: polygon(
            25% 100%, 25% 100%, 
            25% 100%, 50% 100%, 
            50% 100%, 75% 100%, 
            75% 100%, 75% 100%
          );
        }
        
        100% {
          /* End: hilang di tengah bawah */
          clip-path: polygon(
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%
          );
        }
      }

      /* Bonus: Input subtle lift + shadow + glow saat hover */
      .border-hover-draw:hover input[readonly],
      .border-hover-draw:hover textarea[readonly] {
        border-color: rgba(0, 188, 212, 0.4) !important;
        box-shadow: 
          0 8px 24px rgba(0, 188, 212, 0.12),
          0 0 0 1px rgba(0, 188, 212, 0.1);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* ====== MAIN STEP CONTENT - Border Drawing + Pop-Up ====== */
      .main-step-content {
        display: none;
        position: relative;
      }

      .main-step-content.active {
        display: block;
        animation: 
          fadeIn 0.6s ease-out,
          popUpEntry 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Wrapper untuk border animation */
      .main-step-content.active > .bg-white {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Border drawing effect (made smoother to match .border-hover-draw) */
      .main-step-content.active > .bg-white::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 16px;
        padding: 2px;
        background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: -1;
        opacity: 0;

        /* Default hidden (center-bottom) */
        clip-path: polygon(
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%
        );

        /* Smoother animation + slightly longer so it feels natural on page load */
        animation: 
          mainStepBorderDraw 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.15s forwards,
          borderFadeIn 0.35s ease-out 0.15s forwards;
      }

      /* Pop-up subtle saat hover */
      .main-step-content.active > .bg-white:hover {
        transform: translateY(-6px) scale(1.005);
      }

      .main-step-content.active > .bg-white:hover::before {
        opacity: 1;
      }

      /* Animasi pop-up entry */
      @keyframes popUpEntry {
        0% {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Border drawing untuk main step */
      @keyframes mainStepBorderDraw {
        /* 0%: hidden center-bottom */
        0% {
          clip-path: polygon(
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%
          );
        }

        /* 20%: bottom expands smoothly left-right */
        20% {
          clip-path: polygon(
            0% 100%, 0% 100%, 
            0% 100%, 50% 100%, 
            50% 100%, 100% 100%, 
            100% 100%, 100% 100%
          );
        }

        /* 45%: sides start rising (soft corner formation) */
        45% {
          clip-path: polygon(
            0% 100%, 0% 65%, 
            0% 65%, 50% 65%, 
            50% 65%, 100% 65%, 
            100% 65%, 100% 100%
          );
        }

        /* 75%: sides rise higher (near final) */
        75% {
          clip-path: polygon(
            0% 100%, 0% 30%, 
            0% 30%, 50% 30%, 
            50% 30%, 100% 30%, 
            100% 30%, 100% 100%
          );
        }

        /* 100%: complete border */
        100% {
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
      }

      /* Border fade in */
      @keyframes borderFadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 0.8;
        }
      }

      /* Hover enhancement untuk main step */
      .main-step-content.active > .bg-white:hover::before {
        opacity: 1 !important;
        animation: none; /* Stop animation saat hover */
        clip-path: polygon(
          0% 100%, 0% 0%, 
          0% 0%, 50% 0%, 
          50% 0%, 100% 0%, 
          100% 0%, 100% 100%
        );
      }
      /* Spectacular Total Card */
      .spectacular-total-card {
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        border: 1px solid rgba(0, 188, 212, 0.2);
        border-radius: 20px;
        padding: 2rem 2.5rem;
        margin-top: 3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      .spectacular-total-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #00BCD4, #00E5FF);
      }
      .spectacular-total-card::after {
        content: '';
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(0, 188, 212, 0.08) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
      }
      .total-label {
        font-size: 1.25rem;
        color: #455A64;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .total-label i {
        font-size: 1.75rem;
        color: #00BCD4;
        background: rgba(0, 188, 212, 0.1);
        padding: 0.75rem;
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.1);
      }
      .total-value {
        font-size: 2.75rem;
        font-weight: 800;
        background: linear-gradient(135deg, #0097A7 0%, #006064 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
        letter-spacing: -0.5px;
      }
      /* Spectacular Divider */
      .spectacular-divider {
        position: relative;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
      }
      .spectacular-divider::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.3), #00BCD4, rgba(0, 188, 212, 0.3), transparent);
        border-radius: 100%;
        opacity: 0.8;
        box-shadow: 0 2px 4px rgba(0, 188, 212, 0.2);
      }
      .download-fab {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1000;
      }
      .btn-close::after {
        display: none !important;
      }

      @media (max-width: 1024px) {
        .kerangka-acuan-kerja-page {
            padding: 1rem;
        }
        
        /* Progress Steps Scrollable */
        .flex.justify-center.gap-24 {
            justify-content: flex-start;
            gap: 1.5rem;
            overflow-x: auto;
            padding-bottom: 1.5rem;
        }
        .progress-step-item {
            min-width: max-content;
        }

        /* Stack Layout */
        .flex.gap-8 {
            flex-direction: column;
        }
        .w-96 {
            width: 100%;
        }

        /* RAB Grid Scrollable */
        .overflow-x-auto {
            overflow-x: auto;
        }
        .min-w-full {
            min-width: 800px; /* Ensure table doesn't squish too much */
        }

        /* Buttons */
        .flex.justify-between.mt-8 {
            flex-direction: column-reverse;
            gap: 1rem;
        }
        .flex.justify-between.mt-8 button {
            width: 100%;
            justify-content: center;
        }
        
        /* Action buttons fixed bottom */
        .action-buttons {
            flex-direction: column;
            gap: 1rem;
        }
        .action-buttons button, .action-buttons .flex {
            width: 100%;
        }
        .action-buttons .flex {
            flex-direction: column;
        }
      }
    </style>

    <div class="kerangka-acuan-kerja-page">
      <!-- Progress Steps -->
      <div class="flex justify-center gap-24 mb-8 backdrop-blur-md p-6 rounded-xl shadow-lg" style="background: rgba(255, 255, 255, 0.8);">
        <div class="progress-step-item flex items-center justify-center gap-3 px-4" data-main-step="1">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #00BCD4; color: #FFFFFF;">1</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #00BCD4;">Kerangka Acuan Kerja</div>
          </div>
        </div>
        <div class="progress-step-item flex items-center justify-center gap-3 px-4" data-main-step="2">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #E5E7EB; color: #6B7280;">2</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #6B7280;">Indikator Kinerja Utama</div>
          </div>
        </div>
        <div class="progress-step-item flex items-center justify-center gap-3 px-4" data-main-step="3">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #E5E7EB; color: #6B7280;">3</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #6B7280;">Rencana Anggaran Biaya</div>
          </div>
        </div>
      </div>

<button id="downloadPdfBtn" class="download-fab" title="Download PDF"><i class="ti ti-download" style="font-size: 1.5rem;">&#xea96;</i></button>

      <!-- Main Step 1: Kerangka Acuan Kerja -->
      <div class="main-step-content active" id="main-step-1">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="flex gap-8">
            <!-- Sidebar Menu -->
            <div class="flex flex-col gap-4 w-96">
              <button class="menu-button border-2 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3 active" data-menu="gambaran-umum" style="border-color: #00BCD4; background: rgba(0, 188, 212, 0.1);">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-file-text" style="font-size: 1rem; line-height: 1;">&#xef40;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Gambaran Umum</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="penerima-manfaat">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-users" style="font-size: 1rem; line-height: 1;">&#xf7cd;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Penerima Manfaat</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="strategi-pencapaian">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-target" style="font-size: 1rem; line-height: 1;">&#xeb35;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Strategi Pencapaian</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="indikator-kinerja">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-chart-bar" style="font-size: 1rem; line-height: 1;">&#xea59;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Indikator Kinerja</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="kurun-waktu">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-calendar" style="font-size: 1rem; line-height: 1;">&#xea53;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Kurun Waktu Pelaksanaan</div>
              </button>
            </div>

            <!-- Main Form Area -->
            <div class="flex-1 min-h-[500px]">
              <div class="border border-gray-200 rounded-xl p-6 border-hover-draw">
                <!-- Step 1: Gambaran Umum -->
                <div class="step-content active" id="gambaran-umum">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Gambaran Umum</h4>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Nama Kegiatan</label>
                    <input type="text" readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="border-color: #E5E7EB; background: #F9FAFB;" value="" data-field="namaKegiatan">
                  </div>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Tipe Kegiatan</label>
                    <input type="text" readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="border-color: #E5E7EB; background: #F9FAFB;" value="" data-field="tipeKegiatan">
                  </div>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Gambaran Umum Kegiatan</label>
                    <textarea readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[200px] resize-y" style="border-color: #E5E7EB; background: #F9FAFB;" data-field="gambaranUmum"></textarea>
                  </div>
                </div>

                <!-- Step 2: Penerima Manfaat -->
                <div class="step-content" id="penerima-manfaat">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Penerima Manfaat</h4>
                  
                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Penerima Manfaat (Sasaran Utama)</label>
                    <textarea readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[100px] resize-y" style="border-color: #E5E7EB; background: #F9FAFB;" data-field="sasaranUtama"></textarea>
                  </div>

                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Output Kegiatan</label>
                    <textarea readonly id="manfaatTextarea" class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[150px] resize-y" style="border-color: #E5E7EB; background: #F9FAFB;" placeholder="Tidak ada output kegiatan"></textarea>
                  </div>
                </div>

                <!-- Step 3: Strategi Pencapaian -->
                <div class="step-content" id="strategi-pencapaian">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Strategi Pencapaian</h4>
                  
                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Metode Pelaksanaan</label>
                    <textarea readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[200px] resize-y" style="border-color: #E5E7EB; background: #F9FAFB;" data-field="metodePelaksanaan"></textarea>
                  </div>

                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Tahapan Pelaksanaan</label>
                    <textarea readonly id="tahapanTextarea" class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[200px] resize-y" style="border-color: #E5E7EB; background: #F9FAFB;" placeholder="Tidak ada tahapan pelaksanaan"></textarea>
                  </div>
                </div>

                <!-- Step 4: Indikator Kinerja -->
                <div class="step-content" id="indikator-kinerja">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Indikator Kinerja</h4>
                  
                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Indikator Kinerja</label>
                    <div class="overflow-x-auto rounded-lg border border-gray-200">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indikator Keberhasilan</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target (%)</th>
                          </tr>
                        </thead>
                        <tbody id="indikatorKinerjaContainer" class="bg-white divide-y divide-gray-200">
                          <!-- Dynamic content will be injected here -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Step 5: Kurun Waktu -->
                <div class="step-content" id="kurun-waktu">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Kurun Waktu Pelaksanaan</h4>
                  
                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Period Pelaksanaan</label>
                    <input type="text" id="kurunWaktu" readonly class="form-control w-full px-4 py-3 border-2 rounded-lg text-sm" style="border-color: #E5E7EB; background: #F9FAFB;" placeholder="Date range not set" />
                    <small class="text-gray-500 mt-1 block">Tanggal mulai dan tanggal selesai</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBack">
              <span>←</span> Kembali
            </button>
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2 hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" id="btnNext">
              Lanjut <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Step 2: IKU & Renstra -->
      <div class="main-step-content" id="main-step-2">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h4 class="mb-8 font-bold text-xl" style="color: #00BCD4;">Indikator Kinerja Utama & Renstra</h4>
          
          <div class="mb-8 overflow-x-auto rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indikator Kinerja Utama</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                </tr>
              </thead>
              <tbody id="ikuRenstraContainer" class="bg-white divide-y divide-gray-200">
                <!-- Dynamic content will be injected here -->
              </tbody>
            </table>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBackIku">
              <span>←</span> Kembali
            </button>
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2 hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" id="btnNextIku">
              Lanjut <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Step 3: RAB -->
      <div class="main-step-content" id="main-step-3">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h4 class="mb-8 font-bold text-xl" style="color: #00BCD4;">Rincian Anggaran Biaya</h4>
          
          <!-- Belanja Barang -->
          <div class="mb-10 spectacular-divider">
            <div class="flex justify-between items-center mb-6">
              <h5 class="font-bold text-lg" style="color: #374151;">Belanja Barang</h5>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uraian</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 3</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 3</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody id="belanjaBarangContainer" class="bg-white divide-y divide-gray-200">
                  <!-- Dynamic content will be injected here -->
                </tbody>
              </table>
            </div>
            <div class="flex justify-end items-center mt-4">
              <div class="text-right">
                <span class="text-sm text-gray-500">Subtotal:</span>
                <span id="subtotal-barang" class="font-bold text-lg ml-2" style="color: #00BCD4;">Rp 0</span>
              </div>
            </div>
          </div>

          <!-- Belanja Jasa -->
          <div class="mb-10 spectacular-divider">
            <div class="flex justify-between items-center mb-6">
              <h5 class="font-bold text-lg" style="color: #374151;">Belanja Jasa</h5>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uraian</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 3</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 3</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody id="belanjaJasaContainer" class="bg-white divide-y divide-gray-200">
                  <!-- Dynamic content will be injected here -->
                </tbody>
              </table>
            </div>
            <div class="flex justify-end items-center mt-4">
              <div class="text-right">
                <span class="text-sm text-gray-500">Subtotal:</span>
                <span id="subtotal-jasa" class="font-bold text-lg ml-2" style="color: #00BCD4;">Rp 0</span>
              </div>
            </div>
          </div>

          <!-- Belanja Perjalanan -->
          <div class="mb-10">
            <div class="flex justify-between items-center mb-6">
              <h5 class="font-bold text-lg" style="color: #374151;">Belanja Perjalanan</h5>
            </div>
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uraian</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 1</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 2</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vol 3</th>
                    <th scope="col" class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sat 3</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody id="belanjaPerjalananContainer" class="bg-white divide-y divide-gray-200">
                  <!-- Dynamic content will be injected here -->
                </tbody>
              </table>
            </div>
            <div class="flex justify-end items-center mt-4">
              <div class="text-right">
                <span class="text-sm text-gray-500">Subtotal:</span>
                <span id="subtotal-perjalanan" class="font-bold text-lg ml-2" style="color: #00BCD4;">Rp 0</span>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBackRab">
              <span>←</span> Back
            </button>
          </div>
        </div>
      </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // --- JavaScript Logic ---
  const pathSegments = path.split("/").filter(Boolean);
  const kakId =
    pathSegments.length > 2 ? pathSegments[pathSegments.length - 1] : null;

  let kakDataState = null;

  let mainStep = 1;
  let currentStep = 1;
  const totalSteps = 5;
  const menuItems = [
    "gambaran-umum",
    "penerima-manfaat",
    "strategi-pencapaian",
    "indikator-kinerja",
    "kurun-waktu",
  ];

  let masterState = {
    iku: [],
    satuan: [],
    kategoriBelanja: [],
    tipeKegiatan: [],
  };

  // ==============================================
  // API FUNCTIONS
  // ==============================================
  async function handlePdfAction(kakId, action) {
    const actionTitle =
      action === "preview" ? "Membuka Pratinjau PDF..." : "Mengunduh PDF...";
    const errorMessage =
      action === "preview"
        ? "Gagal membuka pratinjau PDF"
        : "Gagal mengunduh PDF";

    Swal.fire({
      title: actionTitle,
      text: "Membuat token sementara...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Step 1: Generate token
      const tokenResponse = await apiRequest(
        `/kak/${kakId}/generate-download-token`,
        {
          method: "POST",
        }
      );

      if (!tokenResponse.success) {
        throw new Error(tokenResponse.message || "Gagal membuat token");
      }

      const tempToken = tokenResponse.data.download_token;

      // Step 2: Build URL and open/download
      const url =
        action === "preview"
          ? `/api/kak/${kakId}/preview?t=${tempToken}`
          : `/api/kak/${kakId}?t=${tempToken}`;

      Swal.close();

      setTimeout(() => {
        window.open(url, "_blank");
      }, 300);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: errorMessage,
        text: error.message,
      });
    }
  }

  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const config = { ...options, headers };
    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      if (typeof Swal !== "undefined") {
        Swal.fire({ icon: "error", title: "API Error", text: error.message });
      }
      throw error;
    }
  }

  // ==============================================
  // HELPER & CREATION FUNCTIONS
  // ==============================================
  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNameById = (id, list, idField, nameField) => {
    const item = list.find((d) => d[idField] == id);
    return item ? item[nameField] : "N/A";
  };

  const createReadOnlyRow = (value) => `
    <div class="row-item">
      <input type="text" readonly class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="border-color: #E5E7EB; background: #F9FAFB;" value="${value}">
    </div>
  `;

  const createIndikatorKinerjaRow = (item) => `
    <tr class="bg-white border-b hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
        item.bulan_indikator || ""
      }</td>
      <td class="px-6 py-4 text-sm text-gray-900">${
        item.deskripsi_target || ""
      }</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${
        item.persentase_target || ""
      }%</td>
    </tr>
  `;

  const createIkuRow = (item) => `
    <tr class="bg-white border-b hover:bg-gray-50">
      <td class="px-6 py-4 text-sm text-gray-900">${getNameById(
        item.iku_id,
        masterState.iku,
        "iku_id",
        "nama_iku"
      )}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-semibold">${
        item.target || "0"
      }</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">${
        item.nama_satuan ||
        (item.satuan_id
          ? getNameById(
              item.satuan_id,
              masterState.satuan,
              "satuan_id",
              "nama_satuan"
            )
          : "-")
      }</td>
    </tr>
  `;

  const createRabRow = (item) => {
    const vol1 = parseFloat(item.volume1) || 0;
    const vol2 = parseFloat(item.volume2) || 1;
    const vol3 = parseFloat(item.volume3) || 1;
    const harga = parseFloat(item.harga_satuan) || 0;
    const total = vol1 * vol2 * vol3 * harga;

    return `
    <tr class="bg-white border-b hover:bg-gray-50">
      <td class="px-4 py-4 text-sm text-gray-900 font-medium">${
        item.uraian || ""
      }</td>
      <td class="px-2 py-4 text-center text-sm text-gray-600">${
        item.volume1 || ""
      }</td>
      <td class="px-2 py-4 text-center text-sm text-gray-500 text-xs">${getNameById(
        item.satuan1_id,
        masterState.satuan,
        "satuan_id",
        "nama_satuan"
      )}</td>
      <td class="px-2 py-4 text-center text-sm text-gray-600">${
        item.volume2 || ""
      }</td>
      <td class="px-2 py-4 text-center text-sm text-gray-500 text-xs">${
        item.satuan2_id
          ? getNameById(
              item.satuan2_id,
              masterState.satuan,
              "satuan_id",
              "nama_satuan"
            )
          : "-"
      }</td>
      <td class="px-2 py-4 text-center text-sm text-gray-600">${
        item.volume3 || ""
      }</td>
      <td class="px-2 py-4 text-center text-sm text-gray-500 text-xs">${
        item.satuan3_id
          ? getNameById(
              item.satuan3_id,
              masterState.satuan,
              "satuan_id",
              "nama_satuan"
            )
          : "-"
      }</td>
      <td class="px-4 py-4 text-right text-sm text-gray-900 whitespace-nowrap">${formatCurrency(
        item.harga_satuan
      )}</td>
      <td class="px-4 py-4 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">${formatCurrency(
        total
      )}</td>
    </tr>
  `;
  };

  // ==============================================
  // DATA FETCH AND POPULATE
  // ==============================================
  async function fetchAndPopulateData(kakId) {
    if (!kakId) {
      Swal.fire("Error", "ID Usulan tidak ditemukan di URL.", "error");
      return;
    }

    Swal.fire({
      title: "Memuat Data...",
      text: "Silakan tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [
        kakResponse,
        ikuResponse,
        satuanResponse,
        kategoriBelanjaResponse,
        tipeKegiatanResponse,
      ] = await Promise.all([
        apiRequest(`/kak/${kakId}/data`),
        apiRequest("/master/iku"),
        apiRequest("/master/satuan"),
        apiRequest("/master/kategori-belanja"),
        apiRequest("/master/tipe-kegiatan"),
      ]);

      masterState.iku = ikuResponse.data;
      masterState.satuan = satuanResponse.data;
      masterState.kategoriBelanja = kategoriBelanjaResponse.data;
      masterState.tipeKegiatan = tipeKegiatanResponse.data;
      const kakData = kakResponse.data;
      kakDataState = kakData;

      // Populate form fields
      document.querySelector('[data-field="namaKegiatan"]').value =
        kakData.nama_kegiatan || "";
      document.querySelector('[data-field="tipeKegiatan"]').value =
        getNameById(
          kakData.tipe_kegiatan_id,
          masterState.tipeKegiatan,
          "tipe_kegiatan_id",
          "nama_tipe"
        ) || "";
      document.querySelector('[data-field="gambaranUmum"]').value =
        kakData.deskripsi_kegiatan || "";
      document.querySelector('[data-field="metodePelaksanaan"]').value =
        kakData.metode_pelaksanaan || "";
      const tanggalMulai = kakData.tanggal_mulai;
      const tanggalSelesai = kakData.tanggal_selesai;
      const kurunWaktuEl = document.getElementById("kurunWaktu");
      if (tanggalMulai && tanggalSelesai) {
        // Formatting the date to a more readable format, e.g., DD MMM YYYY
        const formatDate = (dateStr) => {
          if (!dateStr) return "";
          const [year, month, day] = dateStr.split("-");
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };
        kurunWaktuEl.value = `${formatDate(tanggalMulai)} - ${formatDate(
          tanggalSelesai
        )}`;
      } else {
        kurunWaktuEl.value = "Date range not set";
      }

      // Populate Sasaran & Manfaat
      if (kakData.sasaran_utama) {
        document.querySelector('[data-field="sasaranUtama"]').value =
          kakData.sasaran_utama;
      }

      const manfaatContainer = document.getElementById("manfaatTextarea");
      if (kakData.manfaat && kakData.manfaat.length > 0) {
        const text = kakData.manfaat
          .map((item, index) => `${index + 1}. ${item.manfaat}`)
          .join("\n");
        manfaatContainer.value = text;
      } else {
        manfaatContainer.value = "-";
      }

      // Populate Tahapan
      const tahapanContainer = document.getElementById("tahapanTextarea");
      if (kakData.tahapan && kakData.tahapan.length > 0) {
        const text = kakData.tahapan
          .map((item, index) => `${index + 1}. ${item.nama_tahapan}`)
          .join("\n");
        tahapanContainer.value = text;
      } else {
        tahapanContainer.value = "-";
      }

      // Populate Indikator Kinerja
      const indikatorContainer = document.getElementById(
        "indikatorKinerjaContainer"
      );
      indikatorContainer.innerHTML = "";
      if (kakData.target && kakData.target.length > 0) {
        kakData.target.forEach((item) => {
          indikatorContainer.innerHTML += createIndikatorKinerjaRow(item);
        });
      }

      // Populate IKU
      const ikuContainer = document.getElementById("ikuRenstraContainer");
      ikuContainer.innerHTML = "";
      if (kakData.iku && kakData.iku.length > 0) {
        kakData.iku.forEach((item) => {
          ikuContainer.innerHTML += createIkuRow(item);
        });
      }

      // Populate RAB
      const belanjaBarangContainer = document.getElementById(
        "belanjaBarangContainer"
      );
      belanjaBarangContainer.innerHTML = "";
      const belanjaJasaContainer = document.getElementById(
        "belanjaJasaContainer"
      );
      belanjaJasaContainer.innerHTML = "";
      const belanjaPerjalananContainer = document.getElementById(
        "belanjaPerjalananContainer"
      );
      belanjaPerjalananContainer.innerHTML = "";

      let totalBarang = 0;
      let totalJasa = 0;
      let totalPerjalanan = 0;

      if (kakData.anggaran && kakData.anggaran.length > 0) {
        const kategoriBarangId = masterState.kategoriBelanja.find(
          (k) => k.nama?.toLowerCase() === "belanja barang"
        )?.kategori_belanja_id;
        const kategoriJasaId = masterState.kategoriBelanja.find(
          (k) => k.nama?.toLowerCase() === "belanja jasa"
        )?.kategori_belanja_id;
        const kategoriPerjalananId = masterState.kategoriBelanja.find(
          (k) => k.nama?.toLowerCase() === "belanja perjalanan"
        )?.kategori_belanja_id;

        kakData.anggaran.forEach((item) => {
          const vol1 = parseFloat(item.volume1) || 0;
          const vol2 = parseFloat(item.volume2) || 1;
          const vol3 = parseFloat(item.volume3) || 1;
          const harga = parseFloat(item.harga_satuan) || 0;
          const total = vol1 * vol2 * vol3 * harga;

          if (item.kategori_belanja_id == kategoriBarangId) {
            belanjaBarangContainer.innerHTML += createRabRow(item);
            totalBarang += total;
          } else if (item.kategori_belanja_id == kategoriJasaId) {
            belanjaJasaContainer.innerHTML += createRabRow(item);
            totalJasa += total;
          } else if (item.kategori_belanja_id == kategoriPerjalananId) {
            belanjaPerjalananContainer.innerHTML += createRabRow(item);
            totalPerjalanan += total;
          }
        });
      }

      const formatMoney = (val) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(val);

      if (document.getElementById("subtotal-barang")) {
        document.getElementById("subtotal-barang").textContent =
          formatMoney(totalBarang);
      }
      if (document.getElementById("subtotal-jasa")) {
        document.getElementById("subtotal-jasa").textContent =
          formatMoney(totalJasa);
      }
      if (document.getElementById("subtotal-perjalanan")) {
        document.getElementById("subtotal-perjalanan").textContent =
          formatMoney(totalPerjalanan);
      }

      const grandTotal = totalBarang + totalJasa + totalPerjalanan;

      // Remove existing total card if any to avoid duplicates
      const existingTotal = document.querySelector(".spectacular-total-card");
      if (existingTotal) existingTotal.remove();

      const totalContainer = document.createElement("div");
      totalContainer.className = "spectacular-total-card";
      totalContainer.innerHTML = `
        <div class="total-label">
            <i class="ti ti-wallet"></i>
            <span>Total Estimasi Biaya</span>
        </div>
        <div class="total-value">${formatMoney(grandTotal)}</div>
      `;

      // Append to the main card of Step 3
      const step3Card = document.querySelector("#main-step-3 > .bg-white");
      // Insert before the navigation buttons (which is the last element usually)
      const navButtons = step3Card.querySelector(".flex.justify-between.mt-8");

      if (navButtons) {
        step3Card.insertBefore(totalContainer, navButtons);
      } else {
        step3Card.appendChild(totalContainer);
      }

      Swal.close();
    } catch (error) {
      Swal.fire("Gagal Memuat Data", error.message, "error");
    }
  }

  // Initialize
  function init() {
    updateMainStepDisplay();
    updateStepDisplay();
    attachEventListeners();
    fetchAndPopulateData(kakId);
  }

  function updateMainStepDisplay() {
    const stepIcons = {
      1: { class: "ti ti-file-text", entity: "&#xef40;" },
      2: { class: "ti ti-chart-bar", entity: "&#xea59;" },
      3: { class: "ti ti-currency-dollar", entity: "&#xeb84;" },
    };
    document.querySelectorAll(".progress-step-item").forEach((step, index) => {
      const stepNum = index + 1;
      const circle = step.querySelector(".progress-step-circle");
      const text = step.querySelector(".progress-step-text");
      const subtext = step.querySelector(".progress-step-subtext");
      circle.className =
        "progress-step-circle w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300";
      if (stepNum < mainStep) {
        circle.style.background = "#10B981";
        circle.style.color = "#FFFFFF";
        circle.innerHTML =
          '<i class="ti ti-check" style="font-size: 1.125rem;">&#xea5e;</i>';
        text.style.color = "#10B981";
        if (subtext) subtext.style.color = "#10B981";
      } else if (stepNum === mainStep) {
        circle.style.background = "#00BCD4";
        circle.style.color = "#FFFFFF";
        circle.innerHTML = `<i class="${stepIcons[stepNum].class}" style="font-size: 1.125rem;">${stepIcons[stepNum].entity}</i>`;
        text.style.color = "#00BCD4";
        if (subtext) subtext.style.color = "#00BCD4";
      } else {
        circle.style.background = "#E5E7EB";
        circle.style.color = "#6B7280";
        circle.innerHTML = `<i class="${stepIcons[stepNum].class}" style="font-size: 1.125rem;">${stepIcons[stepNum].entity}</i>`;
        text.style.color = "#6B7280";
        if (subtext) subtext.style.color = "#9CA3AF";
      }
    });
    document
      .querySelectorAll(".main-step-content")
      .forEach((content, index) => {
        content.classList.toggle("active", index + 1 === mainStep);
      });
  }

  function updateStepDisplay() {
    if (mainStep !== 1) return;
    document.querySelectorAll(".menu-button").forEach((btn, index) => {
      const isActive = index + 1 === currentStep;
      btn.classList.toggle("active", isActive);
      btn.style.borderColor = isActive ? "#00BCD4" : "#E5E7EB";
      btn.style.background = isActive ? "rgba(0, 188, 212, 0.1)" : "";
    });
    document
      .querySelectorAll("#main-step-1 .step-content")
      .forEach((content) => {
        content.classList.toggle(
          "active",
          content.id === menuItems[currentStep - 1]
        );
      });
    document.getElementById("btnBack").style.visibility =
      currentStep === 1 ? "hidden" : "visible";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function attachEventListeners() {
    // Progress step click
    document.querySelectorAll(".progress-step-item").forEach((step) => {
      step.addEventListener("click", function () {
        const targetStep = parseInt(this.getAttribute("data-main-step"));
        mainStep = targetStep;
        if (mainStep === 1) {
          currentStep = 1;
        }
        updateMainStepDisplay();
        updateStepDisplay();
      });
    });

    // Menu buttons
    document.querySelectorAll(".menu-button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const menuIndex = menuItems.indexOf(this.getAttribute("data-menu"));
        if (menuIndex !== -1) {
          currentStep = menuIndex + 1;
          updateStepDisplay();
        }
      });
    });

    // Navigation buttons
    document.getElementById("btnBack").addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
      }
    });

    document.getElementById("btnNext").addEventListener("click", () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepDisplay();
      } else {
        mainStep = 2;
        updateMainStepDisplay();
      }
    });

    document.getElementById("btnBackIku").addEventListener("click", () => {
      mainStep = 1;
      currentStep = totalSteps;
      updateMainStepDisplay();
      updateStepDisplay();
    });

    document.getElementById("btnNextIku").addEventListener("click", () => {
      mainStep = 3;
      updateMainStepDisplay();
    });

    document.getElementById("btnBackRab").addEventListener("click", () => {
      mainStep = 2;
      updateMainStepDisplay();
    });

    document.getElementById("downloadPdfBtn").addEventListener("click", () => {
      handlePdfAction(kakId, "download");
    });
  }

  init();

  if (window.Helpers) {
    window.Helpers.init();
  }
}

export default renderDetailKegiatanPage;
