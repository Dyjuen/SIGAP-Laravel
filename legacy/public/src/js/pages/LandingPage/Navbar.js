export function createNavbar() {
  const html = `
    <header class="bg-white backdrop-blur-sm border border-gray-200 shadow-lg fixed top-5 w-[90vw] sm:w-[85vw] rounded-3xl left-1/2 transform -translate-x-1/2 z-[9999]">
      <div class="mx-auto px-5 sm:px-7 lg:px-10">
        <div class="flex items-center justify-between h-16 sm:h-[68px] lg:h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <a href="/" class="flex items-center gap-2 sm:gap-3">
              <img src="/assets/img/logo/logoland.svg" alt="SIGAP" class="h-8 sm:h-10 lg:h-12 w-auto" />
            </a>
          </div>

          <!-- Desktop Navigation with Tubelight Effect -->
          <nav class="hidden lg:flex items-center gap-1 text-base font-semibold bg-gray-50 border border-gray-200 py-1.5 px-2 rounded-full">
            <div class="nav-items-container relative">
              <a href="#landingHero" class="nav-item active" data-nav="beranda">Beranda</a>
              <a href="#landingFeatures" class="nav-item" data-nav="fitur">Fitur Utama</a>
              <a href="#landingRoles" class="nav-item" data-nav="peran">Peran</a>
              <a href="#landingFAQ" class="nav-item" data-nav="faq">FAQ</a>
              <a href="#landingContact" class="nav-item" data-nav="kontak">Kontak Kami</a>
              <div class="tubelight-bg"></div>
              <div class="tubelight-glow"></div>
            </div>
          </nav>

          <!-- CTA Button -->
          <div class="flex items-center gap-2 sm:gap-3">
            <a href="/login" class="cta-btn inline-flex items-center bg-[#33C8DA] text-white px-3 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm lg:text-base shadow-md hover:shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cta-icon hidden sm:block sm:w-[18px] sm:h-[18px]">
                <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M21 12h-13l3 -3" />
                <path d="M11 15l-3 -3" />
              </svg>
              <span class="whitespace-nowrap">Masuk</span>
              <span class="hidden sm:inline whitespace-nowrap">Ke Aplikasi</span>
            </a>

            <!-- Mobile menu button -->
            <button id="nav-toggle" class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
              <svg id="hamburger-icon" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg id="close-icon" class="h-6 w-6 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div id="mobile-menu" class="lg:hidden border-t border-gray-200 bg-white rounded-b-3xl overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0;">
        <div class="px-5 sm:px-6 py-5 sm:py-6">
          <!-- Mobile Navigation with Tubelight Effect -->
          <div class="mobile-nav-container relative bg-gray-50 border border-gray-200 py-2.5 px-2.5 rounded-3xl mb-4">
            <a href="#landingHero" class="mobile-nav-item active" data-nav="beranda">Beranda</a>
            <a href="#landingFeatures" class="mobile-nav-item" data-nav="fitur">Fitur Utama</a>
            <a href="#landingRoles" class="mobile-nav-item" data-nav="peran">Peran</a>
            <a href="#landingFAQ" class="mobile-nav-item" data-nav="faq">FAQ</a>
            <a href="#landingContact" class="mobile-nav-item" data-nav="kontak">Kontak Kami</a>
            <div class="mobile-tubelight-bg"></div>
            <div class="mobile-tubelight-glow"></div>
          </div>
          
          <a href="/login" class="flex items-center justify-center gap-2 py-3.5 bg-[#33C8DA] text-white rounded-2xl font-semibold hover:bg-[#2BA9B8] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M21 12h-13l3 -3" />
              <path d="M11 15l-3 -3" />
            </svg>
            Masuk Ke Aplikasi
          </a>
        </div>
      </div>
    </header>

    <style>
      .nav-items-container {
        position: relative;
        display: flex;
        gap: 0.25rem;
      }

      .nav-item {
        position: relative;
        padding: 0.625rem 1.75rem;
        color: rgba(75, 85, 99, 0.8);
        transition: color 0.3s ease;
        border-radius: 9999px;
        z-index: 2;
        cursor: pointer;
      }
      
      .nav-item:hover {
        color: #33C8DA;
      }

      .nav-item.active {
        color: #33C8DA;
      }

      /* Tubelight Background Effect */
      .tubelight-bg {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(51, 200, 218, 0.1);
        border-radius: 9999px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
        pointer-events: none;
      }

      /* Tubelight Glow Container */
      .tubelight-glow {
        position: absolute;
        top: -8px;
        left: 0;
        width: 100%;
        height: 4px;
        pointer-events: none;
        z-index: 3;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Main Glow Bar */
      .tubelight-glow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 4px;
        background: #33C8DA;
        border-radius: 9999px 9999px 0 0;
      }

      /* Large Outer Glow */
      .tubelight-glow::after {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 48px;
        height: 24px;
        background: rgba(51, 200, 218, 0.3);
        border-radius: 9999px;
        filter: blur(12px);
      }

      /* Medium Glow Layer */
      .tubelight-glow > .glow-middle {
        position: absolute;
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 24px;
        background: rgba(51, 200, 218, 0.2);
        border-radius: 9999px;
        filter: blur(12px);
      }

      /* Small Inner Glow */
      .tubelight-glow > .glow-inner {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 16px;
        background: rgba(51, 200, 218, 0.2);
        border-radius: 9999px;
        filter: blur(6px);
      }
      
      .cta-btn {
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
      }
      
      .cta-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }
      
      .cta-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -8px rgba(51, 200, 218, 0.4);
        background: #2BA9B8;
      }
      
      .cta-btn:hover::before {
        left: 100%;
      }
      
      .cta-btn:hover .cta-icon {
        animation: nudge 0.4s ease;
      }

      @keyframes nudge {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(4px); }
      }
      
      /* Mobile Navigation Styles */
      .mobile-nav-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .mobile-nav-item {
        position: relative;
        padding: 0.875rem 1.5rem;
        color: rgba(75, 85, 99, 0.8);
        transition: color 0.3s ease;
        border-radius: 1.5rem;
        z-index: 2;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9375rem;
        text-align: center;
      }
      
      .mobile-nav-item:hover {
        color: #33C8DA;
      }

      .mobile-nav-item.active {
        color: #33C8DA;
      }

      /* Mobile Tubelight Background Effect */
      .mobile-tubelight-bg {
        position: absolute;
        top: 0.625rem;
        left: 0.625rem;
        right: 0.625rem;
        height: 0;
        background: rgba(51, 200, 218, 0.1);
        border-radius: 1.5rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
        pointer-events: none;
      }

      /* Mobile Tubelight Glow Container */
      .mobile-tubelight-glow {
        position: absolute;
        left: 0.625rem;
        width: calc(100% - 1.25rem);
        height: 4px;
        pointer-events: none;
        z-index: 3;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Mobile Main Glow Bar */
      .mobile-tubelight-glow::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: #33C8DA;
        border-radius: 9999px 9999px 0 0;
      }

      /* Mobile Large Outer Glow */
      .mobile-tubelight-glow::after {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 56px;
        height: 24px;
        background: rgba(51, 200, 218, 0.3);
        border-radius: 9999px;
        filter: blur(12px);
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .mobile-nav-item {
          font-size: 0.875rem;
          padding: 0.75rem 1.25rem;
        }
      }
      
      .mobile-item {
        display: block;
        padding: 0.625rem 0;
        color: #374151;
        font-weight: 500;
        transition: color 0.2s ease, transform 0.2s ease;
      }
      
      .mobile-item:hover {
        color: #33C8DA;
        transform: translateX(4px);
      }
    </style>
  `;

  // Initialize navbar interactions
  setTimeout(() => {
    console.log('Initializing navbar...');
    
    const navItems = document.querySelectorAll('.nav-item');
    const tubelightBg = document.querySelector('.tubelight-bg');
    const tubelightGlow = document.querySelector('.tubelight-glow');
    
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const mobileTubelightBg = document.querySelector('.mobile-tubelight-bg');
    const mobileTubelightGlow = document.querySelector('.mobile-tubelight-glow');
    
    // Create additional glow layers for desktop
    if (tubelightGlow) {
      const glowMiddle = document.createElement('div');
      glowMiddle.className = 'glow-middle';
      const glowInner = document.createElement('div');
      glowInner.className = 'glow-inner';
      tubelightGlow.appendChild(glowMiddle);
      tubelightGlow.appendChild(glowInner);
    }

    // Create additional glow layers for mobile
    if (mobileTubelightGlow) {
      const mobileGlowMiddle = document.createElement('div');
      mobileGlowMiddle.className = 'glow-middle';
      mobileGlowMiddle.style.position = 'absolute';
      mobileGlowMiddle.style.top = '-4px';
      mobileGlowMiddle.style.left = '50%';
      mobileGlowMiddle.style.transform = 'translateX(-50%)';
      mobileGlowMiddle.style.width = '40px';
      mobileGlowMiddle.style.height = '24px';
      mobileGlowMiddle.style.background = 'rgba(51, 200, 218, 0.3)';
      mobileGlowMiddle.style.borderRadius = '9999px';
      mobileGlowMiddle.style.filter = 'blur(12px)';
      
      const mobileGlowInner = document.createElement('div');
      mobileGlowInner.className = 'glow-inner';
      mobileGlowInner.style.position = 'absolute';
      mobileGlowInner.style.top = '0';
      mobileGlowInner.style.left = '50%';
      mobileGlowInner.style.transform = 'translateX(-50%)';
      mobileGlowInner.style.width = '20px';
      mobileGlowInner.style.height = '16px';
      mobileGlowInner.style.background = 'rgba(51, 200, 218, 0.4)';
      mobileGlowInner.style.borderRadius = '9999px';
      mobileGlowInner.style.filter = 'blur(6px)';
      
      mobileTubelightGlow.appendChild(mobileGlowMiddle);
      mobileTubelightGlow.appendChild(mobileGlowInner);
    }

    function updateTubelight(item) {
      if (!tubelightBg || !tubelightGlow) return;
      
      const rect = item.getBoundingClientRect();
      const container = item.parentElement.getBoundingClientRect();
      
      const left = rect.left - container.left;
      const width = rect.width;
      
      tubelightBg.style.left = `${left}px`;
      tubelightBg.style.width = `${width}px`;
      
      tubelightGlow.style.left = `${left}px`;
      tubelightGlow.style.width = `${width}px`;
    }

    function updateMobileTubelight(item) {
      if (!mobileTubelightBg || !mobileTubelightGlow) return;
      
      const rect = item.getBoundingClientRect();
      const container = item.parentElement.getBoundingClientRect();
      
      const top = rect.top - container.top;
      const height = rect.height;
      
      mobileTubelightBg.style.top = `${top}px`;
      mobileTubelightBg.style.height = `${height}px`;
      
      mobileTubelightGlow.style.top = `${top - 8}px`;
    }

    // Initialize with active item (desktop)
    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
      updateTubelight(activeItem);
    }

    // Initialize with active item (mobile)
    const mobileActiveItem = document.querySelector('.mobile-nav-item.active');
    if (mobileActiveItem) {
      updateMobileTubelight(mobileActiveItem);
    }

    // Handle clicks (desktop)
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        updateTubelight(this);
        
        // Sync with mobile
        const navAttr = this.getAttribute('data-nav');
        mobileNavItems.forEach(mItem => {
          if (mItem.getAttribute('data-nav') === navAttr) {
            mobileNavItems.forEach(m => m.classList.remove('active'));
            mItem.classList.add('active');
            updateMobileTubelight(mItem);
          }
        });
      });
    });

    // Handle clicks (mobile)
    mobileNavItems.forEach(item => {
      item.addEventListener('click', function(e) {
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        updateMobileTubelight(this);
        
        // Sync with desktop
        const navAttr = this.getAttribute('data-nav');
        navItems.forEach(dItem => {
          if (dItem.getAttribute('data-nav') === navAttr) {
            navItems.forEach(d => d.classList.remove('active'));
            dItem.classList.add('active');
            updateTubelight(dItem);
          }
        });
        
        // Close mobile menu after selection with smooth animation
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');
        if (mobileMenu && hamburgerIcon && closeIcon) {
          setTimeout(() => {
            // Animate out
            mobileMenu.style.maxHeight = '0';
            mobileMenu.style.opacity = '0';
            
            hamburgerIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            
            // Hide after animation completes
            setTimeout(() => {
              mobileMenu.style.display = 'none';
            }, 300);
          }, 200);
        }
      });
    });

    // Handle mobile menu toggle - SMOOTH ANIMATION VERSION
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');
    
    console.log('Nav Toggle:', navToggle);
    console.log('Mobile Menu:', mobileMenu);
    console.log('Hamburger Icon:', hamburgerIcon);
    console.log('Close Icon:', closeIcon);
    
    if (navToggle && mobileMenu && hamburgerIcon && closeIcon) {
      navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Hamburger clicked!');
        
        // Check current state directly from styles
        const isMenuOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px' && mobileMenu.style.maxHeight !== '';
        console.log('Current state - isMenuOpen:', isMenuOpen);
        console.log('Current maxHeight:', mobileMenu.style.maxHeight);
        
        if (!isMenuOpen) {
          // Open menu with smooth animation
          console.log('Opening menu...');
          mobileMenu.style.display = 'block';
          
          // Force reflow to trigger animation
          mobileMenu.offsetHeight;
          
          // Animate in
          requestAnimationFrame(() => {
            mobileMenu.style.maxHeight = '500px';
            mobileMenu.style.opacity = '1';
          });
          
          hamburgerIcon.classList.add('hidden');
          closeIcon.classList.remove('hidden');
          
          // Recalculate mobile tubelight position when menu opens
          setTimeout(() => {
            const mobileActive = document.querySelector('.mobile-nav-item.active');
            if (mobileActive) {
              updateMobileTubelight(mobileActive);
            }
          }, 350);
        } else {
          // Close menu with smooth animation
          console.log('Closing menu...');
          
          // Animate out
          mobileMenu.style.maxHeight = '0';
          mobileMenu.style.opacity = '0';
          
          hamburgerIcon.classList.remove('hidden');
          closeIcon.classList.add('hidden');
          
          // Hide after animation completes
          setTimeout(() => {
            mobileMenu.style.display = 'none';
          }, 300);
        }
      });
      
      console.log('Hamburger event listener attached!');
    } else {
      console.error('Missing elements:', {
        navToggle: !!navToggle,
        mobileMenu: !!mobileMenu,
        hamburgerIcon: !!hamburgerIcon,
        closeIcon: !!closeIcon
      });
    }

    // Update on window resize
    window.addEventListener('resize', () => {
      const activeItem = document.querySelector('.nav-item.active');
      if (activeItem) {
        updateTubelight(activeItem);
      }
      
      const mobileActive = document.querySelector('.mobile-nav-item.active');
      if (mobileActive && mobileMenu && mobileMenu.style.maxHeight !== '0px' && mobileMenu.style.maxHeight !== '') {
        updateMobileTubelight(mobileActive);
      }
    });
    
    console.log('Navbar initialization complete!');
  }, 100);

  return html;
}