export function createFooter() {
  const footerHTML = `
    <footer class="bg-[#2BA9B8] text-white rounded-t-3xl flex flex-col w-full">
      <div class="py-10 sm:py-12 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 w-full max-w-[1600px] mx-auto">
        <div class="flex flex-col lg:flex-row items-start justify-between gap-y-8 lg:gap-x-10">
          
          <!-- Brand Section -->
          <div class="flex flex-col w-full lg:w-2/5 lg:border-r lg:border-white/20 lg:pr-10">
            <a href="/" class="flex items-center gap-3 mb-4 group">
              <img src="/assets/img/logo/logo-white.svg" alt="SIGAP Logo" class="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105">
              <span class="font-bold text-lg sm:text-xl tracking-wide">SIGAP</span>
            </a>
            <p class="text-white/90 text-sm leading-relaxed max-w-md">Sistem Informasi Pengajuan KAK & LPJ</p>
            <p class="text-white/70 text-xs sm:text-sm leading-relaxed mt-2 sm:mt-3 max-w-md">Membantu digitalisasi proses administrasi kegiatan kampus secara cepat, transparan, dan efisien.</p>
          </div>

          <!-- Sections -->
          <div class="w-full lg:w-auto">
            <h4 class="font-semibold text-sm tracking-wider mb-4 sm:mb-5 text-white/90">SECTIONS</h4>
            <nav class="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
              <a href="#landingHero" class="footer-link">Beranda</a>
              <a href="#landingFeatures" class="footer-link">Fitur Utama</a>
              <a href="#landingRoles" class="footer-link">Peran</a>
              <a href="#landingFAQ" class="footer-link">FAQ</a>
              <a href="#landingContact" class="footer-link">Kontak</a>
            </nav>
          </div>

          <!-- Contact -->
          <div class="w-full lg:w-auto">
            <h4 class="font-semibold text-sm tracking-wider mb-4 sm:mb-5 text-white/90">HUBUNGI KAMI</h4>
            <div class="flex flex-col gap-2 sm:gap-3">
              <a href="mailto:sigap@pnj.ac.id" class="contact-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>sigap@pnj.ac.id</span>
              </a>
              <a href="tel:+6281213020861" class="contact-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+62 812 1302 0861</span>
              </a>
              <a href="#" class="contact-link items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Politeknik Negeri Jakarta,<br>Kampus UI Depok</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bg-[#267A84] py-4 w-full">
        <div class="px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 2xl:px-48 max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-y-2 sm:gap-4">
        <span class="text-xs sm:text-sm text-white/80 text-center sm:text-left">© 2025 SIGAP PNJ - Sistem Informasi Pengajuan KAK & LPJ</span>
        <div class="flex gap-3 sm:gap-4">
          <a href="#" class="social-icon" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="#" class="social-icon" aria-label="WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9"/><path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
          </a>
        </div>
        </div>
      </div>
    </footer>

    <style>
      .footer-link {
        position: relative;
        color: rgba(255,255,255,0.8);
        font-size: 0.8125rem; /* 13px */
        transition: color 0.3s ease;
      }
      
      .footer-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1px;
        background: white;
        transition: width 0.3s ease;
      }
      
      .footer-link:hover {
        color: white;
      }
      
      .footer-link:hover::after {
        width: 100%;
      }
      
      .contact-link {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        color: rgba(255,255,255,0.8);
        font-size: 0.8125rem; /* 13px */
        transition: color 0.3s ease, transform 0.3s ease;
      }
      
      .contact-link:hover {
        color: white;
        transform: translateX(4px);
      }

      .contact-link svg {
        flex-shrink: 0;
      }

      .social-icon {
        color: rgba(255,255,255,0.7);
        transition: color 0.3s ease, transform 0.3s ease;
      }
      .social-icon:hover {
        color: white;
        transform: translateY(-3px);
      }
    </style>
  `;

  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML("beforeend", footerHTML);
  }
}