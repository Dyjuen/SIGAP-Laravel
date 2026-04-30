import { authService } from "../../api/authService.js";

export function renderLoginPage() {
  const rootElement = document.getElementById("root");

  const loginFormHTML = `
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
              .login-container {
                padding-right: 1rem;
              }
            }

            /* ========== ANIMATIONS ========== */
            @keyframes fadeSlideIn {
                from {
                    opacity: 0;
                    filter: blur(4px);
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    filter: blur(0px);
                    transform: translateY(0px);
                }
            }

            @keyframes slideRightIn {
                from {
                    opacity: 0;
                    filter: blur(4px);
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    filter: blur(0px);
                    transform: translateX(0px);
                }
            }

            @keyframes testimonialIn {
                from {
                    opacity: 0;
                    filter: blur(4px);
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    filter: blur(0px);
                    transform: translateY(0px) scale(1);
                }
            }

            /* ========== EYE SLASH ANIMATION ========== */
            @keyframes drawSlashForward {
                from {
                    stroke-dashoffset: -30;
                }
                to {
                    stroke-dashoffset: 0;
                }
            }

            @keyframes drawSlashReverse {
                from {
                    stroke-dashoffset: 0;
                }
                to {
                    stroke-dashoffset: -30;
                }
            }

            @keyframes fadeInSlash {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes fadeOutSlash {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

            .eye-slash-line {
                stroke-dasharray: 30;
                stroke-dashoffset: -30;
                opacity: 1;
            }

            .eye-slash-line.show {
                animation: drawSlashReverse 0.5s ease-out forwards;
            }

            .eye-slash-line.hide {
                animation: drawSlashForward 0.5s ease-out forwards;
            }

            .eye-icon {
                transition: opacity 0.2s ease;
            }

            /* Animation Classes */
            .animate-element {
                opacity: 0;
                animation: fadeSlideIn 0.6s ease-out forwards;
            }

            .animate-slide-right {
                opacity: 0;
                animation: slideRightIn 0.8s ease-out forwards;
            }

            .animate-testimonial {
                opacity: 0;
                animation: testimonialIn 0.6s ease-out forwards;
            }

            /* Animation Delays */
            .animate-delay-100 { animation-delay: 0.1s; }
            .animate-delay-200 { animation-delay: 0.2s; }
            .animate-delay-250 { animation-delay: 0.25s; }
            .animate-delay-300 { animation-delay: 0.3s; }
            .animate-delay-400 { animation-delay: 0.4s; }
            .animate-delay-450 { animation-delay: 0.45s; }
            .animate-delay-500 { animation-delay: 0.5s; }
            .animate-delay-600 { animation-delay: 0.6s; }
            .animate-delay-700 { animation-delay: 0.7s; }
            .animate-delay-800 { animation-delay: 0.8s; }
            .animate-delay-900 { animation-delay: 0.9s; }
            .animate-delay-1000 { animation-delay: 1s; }
            .animate-delay-1200 { animation-delay: 1.2s; }
            .animate-delay-1400 { animation-delay: 1.4s; }

            /* ========== GLASS MORPHISM INPUT ========== */
            .glass-input-wrapper {
                border-radius: 1rem;
                border: 1px solid rgba(209, 213, 219, 0.5);
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(8px);
                transition: all 0.3s ease;
            }

            .glass-input-wrapper:focus-within {
                border-color: rgba(51, 200, 218, 0.7);
                background: rgba(51, 200, 218, 0.1);
                box-shadow: 0 0 0 3px rgba(51, 200, 218, 0.1);
            }

            .glass-input {
                background-color: transparent;
                width: 100%;
                padding: 1rem;
                border-radius: 1rem;
                outline: none;
                font-size: 0.875rem;
            }

            .glass-input::placeholder {
                color: rgba(107, 114, 128, 0.7);
            }

            /* ========== CUSTOM CHECKBOX ========== */
            .custom-checkbox {
                appearance: none;
                width: 18px;
                height: 18px;
                border: 2px solid rgba(209, 213, 219, 0.8);
                border-radius: 4px;
                background-color: rgba(255, 255, 255, 0.3);
                cursor: pointer;
                position: relative;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .custom-checkbox:checked {
                background-color: #33C8DA;
                border-color: #33C8DA;
            }

            .custom-checkbox:checked::after {
                content: '';
                position: absolute;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }

            .custom-checkbox:hover {
                border-color: #33C8DA;
            }

            .custom-checkbox:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(51, 200, 218, 0.2);
            }

            /* ========== ERROR ALERT ========== */
            .error-alert {
                background: linear-gradient(135deg, rgba(254, 226, 226, 0.95) 0%, rgba(252, 165, 165, 0.85) 100%);
                border: 1px solid rgba(252, 165, 165, 0.6);
                color: #991B1B;
                padding: 12px 16px;
                border-radius: 1rem;
                margin-bottom: 16px;
                display: none;
                backdrop-filter: blur(8px);
                animation: fadeSlideIn 0.3s ease-out;
            }

            /* ========== LOADING SPINNER ========== */
            .spinner {
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 8px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* ========== MODERN BUTTON ========== */
            .modern-button {
                background: linear-gradient(135deg, #33C8DA 0%, #2BA9B8 100%);
                border: none;
                color: white;
                font-weight: 600;
                padding: 1rem;
                border-radius: 1rem;
                transition: all 0.7s ease;
                cursor: pointer;
                width: 100%;
                position: relative;
                overflow: hidden;
            }

            .modern-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }

            .modern-button:hover::before {
                left: 100%;
            }

            .modern-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px -6px rgba(51, 200, 218, 0.5);
            }

            .modern-button:active {
                transform: translateY(0);
            }

            .modern-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* ========== CONTAINER STYLES ========== */
            .login-container {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(20px);
                border-radius: 2rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                padding: 3rem;
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .logo-container {
                width: 4rem;
                height: 4rem;
                border-radius: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
            }

            .captcha-container {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.5rem;
            }

            .captcha-image {
                border-radius: 0.75rem;
                border: 2px solid rgba(51, 200, 218, 0.3);
                box-shadow: 0 4px 12px rgba(51, 200, 218, 0.15);
                transition: all 0.3s ease;
                background: white;
            }

            .captcha-image:hover {
                border-color: rgba(51, 200, 218, 0.5);
                box-shadow: 0 6px 16px rgba(51, 200, 218, 0.25);
            }

            .reload-captcha-btn {
                padding: 0.625rem;
                border-radius: 0.75rem;
                background: linear-gradient(135deg, rgba(51, 200, 218, 0.1) 0%, rgba(43, 169, 184, 0.05) 100%);
                backdrop-filter: blur(8px);
                border: 2px solid rgba(51, 200, 218, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .reload-captcha-btn:hover {
                background: linear-gradient(135deg, rgba(51, 200, 218, 0.2) 0%, rgba(43, 169, 184, 0.15) 100%);
                border-color: rgba(51, 200, 218, 0.6);
                box-shadow: 0 4px 12px rgba(51, 200, 218, 0.2);
            }

            .captcha-container .reload-captcha-btn svg {
                display: inline-block;
                transition: transform 0.4s ease, color 0.3s ease !important;
            }

            .captcha-container .reload-captcha-btn svg.rotated-on-click {
                transform: rotate(-180deg) !important;
            }


            .link-text {
                color: #33C8DA;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.7s ease;
            }

            .link-text:hover {
                color: #2BA9B8;
                text-decoration: underline;
            }

            /* ========== RESPONSIVE ========== */
            @media (max-width: 640px) {
                .login-container {
                    padding: 2rem 1.5rem;
                }
            }

            /* ========== TESTIMONIALS (OPTIONAL) ========== */
            .testimonial-card {
                display: flex;
                gap: 0.75rem;
                align-items: start;
                border-radius: 1.5rem;
                background: rgba(255, 255, 255, 0.4);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 1.25rem;
                width: 16rem;
            }

            .testimonial-avatar {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 1rem;
                object-fit: cover;
            }

            .testimonial-text {
                font-size: 0.875rem;
                line-height: 1.5;
            }

            /* ========== HIDE DEFAULT EYE ICON ON PASSWORD FIELDS ========== */
            input[type="password"]::-ms-reveal,
            input[type="password"]::-ms-clear {
                display: none;
            }
        </style>

        <div style="background-image: url('/assets/img/backgrounds/Auth.png'); background-size: cover; background-position: center; min-height: 100vh; position: relative; overflow: hidden;" class="flex items-center justify-center">
            <!-- Floating Circles -->
            <div class="floating-circles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
                <div class="float-circle circle-1"></div>
                <div class="float-circle circle-2"></div>
                <div class="float-circle circle-3"></div>
                <div class="float-circle circle-4"></div>
                <div class="float-circle circle-5"></div>
                <div class="float-circle circle-6"></div>
            </div>

            <style>
                @keyframes floatCircle {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    33% {
                        transform: translate(20px, -30px);
                    }
                    66% {
                        transform: translate(-15px, 15px);
                    }
                }

                @keyframes floatCircle2 {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    33% {
                        transform: translate(-25px, 20px);
                    }
                    66% {
                        transform: translate(15px, -25px);
                    }
                }

                .float-circle {
                    position: absolute;
                    border-radius: 50%;
                    border: 4px solid rgba(84, 210, 232, 0.3);
                }

                .circle-1 {
                    width: 80px;
                    height: 80px;
                    top: 15%;
                    left: 10%;
                    animation: floatCircle 18s ease-in-out infinite;
                }

                .circle-2 {
                    width: 60px;
                    height: 60px;
                    top: 70%;
                    left: 15%;
                    animation: floatCircle2 15s ease-in-out infinite;
                    animation-delay: 2s;
                }

                .circle-3 {
                    width: 100px;
                    height: 100px;
                    top: 25%;
                    right: 12%;
                    animation: floatCircle 20s ease-in-out infinite;
                    animation-delay: 4s;
                }

                .circle-4 {
                    width: 70px;
                    height: 70px;
                    bottom: 15%;
                    right: 20%;
                    animation: floatCircle2 16s ease-in-out infinite;
                    animation-delay: 6s;
                }

                .circle-5 {
                    width: 90px;
                    height: 90px;
                    top: 50%;
                    left: 8%;
                    animation: floatCircle 22s ease-in-out infinite;
                    animation-delay: 3s;
                }

                .circle-6 {
                    width: 65px;
                    height: 65px;
                    top: 60%;
                    right: 10%;
                    animation: floatCircle2 17s ease-in-out infinite;
                    animation-delay: 5s;
                }
            </style>

            <div class="w-full max-w-lg px-4" style="position: relative; z-index: 10;">
                <div class="login-container animate-element animate-delay-100">
                    <!-- Logo -->
                    <div class="flex justify-center mb-6 animate-element animate-delay-200">
                        <div class="logo-container">
                            <img src="/assets/img/logo/logoauth.svg" alt="SIGAP PNJ Logo" class="w-10 h-10">
                        </div>
                    </div>

                    <!-- Welcome Text -->
                    <h2 class="text-center text-3xl font-bold text-gray-800 mb-2 animate-element animate-delay-300" style="letter-spacing: -0.02em;">
                        Selamat Datang di
                    </h2>
                    <h2 class="text-center text-3xl font-bold text-gray-800 mb-2 animate-element animate-delay-300" style="letter-spacing: -0.02em;">
                        SIGAP PNJ!
                    </h2>
                    <p class="text-center text-gray-600 text-sm mb-6 animate-element animate-delay-400">
                        Silahkan masukkan nama pengguna dan kata sandi Anda
                    </p>

                    <!-- Error Alert -->
                    <div id="error-alert" class="error-alert"></div>

                    <!-- Form -->
                    <form id="login-form">
                        <!-- Username Field -->
                        <div class="mb-4 animate-element animate-delay-500">
                            <label class="block text-gray-700 text-sm font-semibold mb-2" for="username">
                                Nama Pengguna
                            </label>
                            <div class="glass-input-wrapper">
                                <input
                                    class="glass-input"
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan nama pengguna Anda"
                                    value=""
                                    required
                                >
                            </div>
                        </div>

                        <!-- Password Field -->
                        <div class="mb-4 animate-element animate-delay-600">
                            <label class="block text-gray-700 text-sm font-semibold mb-2" for="password">
                                Kata Sandi
                            </label>
                            <div class="glass-input-wrapper">
                                <div class="relative">
                                    <input
                                        class="glass-input"
                                        style="padding-right: 3rem;"
                                        id="password"
                                        type="password"
                                        placeholder="Masukkan kata sandi Anda"
                                        value=""
                                        required
                                    >
                                    <button
                                        type="button"
                                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        id="togglePassword"
                                        tabindex="-1"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <g class="eye-icon">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </g>
                                            <line class="eye-slash-line" x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Captcha Field -->
                        <div class="mb-4 animate-element animate-delay-700">
                            <label class="block text-gray-700 text-sm font-semibold mb-2" for="captcha">
                                Captcha
                            </label>
                            <div class="captcha-container">
                                <img src="/api/captcha" alt="Captcha" id="captcha-image" class="captcha-image">
                                <button type="button" id="reload-captcha" class="reload-captcha-btn" tabindex="-1">
                                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <div class="glass-input-wrapper">
                                <input
                                    class="glass-input"
                                    id="captcha"
                                    type="text"
                                    placeholder="Masukkan kode captcha"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Remember Me & Forgot Password -->
                        <div class="flex items-center justify-between mb-6 animate-element animate-delay-800">
                            <label class="flex items-center cursor-pointer gap-2">
                                <input type="checkbox" id="remember-me" class="custom-checkbox" checked>
                                <span class="text-sm text-gray-700">Ingat Saya</span>
                            </label>
                            <a href="/forgot-password" class="text-sm link-text">
                                Lupa Kata Sandi?
                            </a>
                        </div>

                        <!-- Login Button -->
                        <button
                            type="submit"
                            id="login-button"
                            class="modern-button animate-element animate-delay-900"
                        >
                            Masuk
                        </button>
                    </form>

                    <!-- Optional: Additional Info -->
                    <p class="text-center text-sm text-gray-500 mt-6 animate-element animate-delay-1000">
                        Sistem Informasi Gerbang Administrasi Pengajuan PNJ
                    </p>
                </div>
            </div>
        </div>
    `;

  rootElement.innerHTML = loginFormHTML;

  // Get form elements
  const form = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const captchaInput = document.getElementById("captcha");
  const rememberMeCheckbox = document.getElementById("remember-me");
  const loginButton = document.getElementById("login-button");
  const errorAlert = document.getElementById("error-alert");
  const reloadCaptchaBtn = document.getElementById("reload-captcha");
  const captchaImage = document.getElementById("captcha-image");

  // Track reload captcha behavior
  if (reloadCaptchaBtn) {
    const svgElement = reloadCaptchaBtn.querySelector('svg');

    // Reload captcha on button click with rotation
    reloadCaptchaBtn.addEventListener('click', function(e) {
      e.preventDefault();

      // Remove any existing click rotation class and force reflow
      svgElement.classList.remove('rotated-on-click');
      void svgElement.offsetWidth; // Trigger reflow to ensure removal is processed

      // Add the rotation class to trigger the -180deg rotation
      svgElement.classList.add('rotated-on-click');

      // Refresh the captcha image
      const timestamp = new Date().getTime();
      captchaImage.src = `/api/captcha?t=${timestamp}`;

      // After the click animation finishes, handle the hover state appropriately
      setTimeout(() => {
        // Remove the click rotation class and apply appropriate state based on hover
        svgElement.classList.remove('rotated-on-click');

        // If still hovered after the animation, apply hover state
        if (this.matches(':hover')) {
          svgElement.style.transform = 'rotate(180deg)';
          svgElement.style.color = '#2BA9B8';
        } else {
          svgElement.style.transform = 'rotate(0deg)';
          svgElement.style.color = '';
        }
      }, 400);
    });

    // Handle mouse enter (hover) to apply rotation
    reloadCaptchaBtn.addEventListener('mouseenter', function() {
      const svgElement = this.querySelector('svg');
      // Only apply hover rotation if not currently in click animation
      svgElement.style.transition = 'transform 0.4s ease, color 0.3s ease';
      // Check if click rotation class is active, if so, don't override it immediately
      if (!svgElement.classList.contains('rotated-on-click')) {
        svgElement.style.transform = 'rotate(180deg)';
      }
      svgElement.style.color = '#2BA9B8';
    });

    // Handle mouse leave to reset rotation
    reloadCaptchaBtn.addEventListener('mouseleave', function() {
      const svgElement = this.querySelector('svg');
      // If the click rotation class is active, don't reset it
      if (!svgElement.classList.contains('rotated-on-click')) {
        svgElement.style.transform = 'rotate(0deg)';
      }
      svgElement.style.color = '';
    });
  }

  // Show error message
  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = "block";
    setTimeout(() => {
      errorAlert.style.display = "none";
    }, 5000);
  }

  // Set loading state
  function setLoading(isLoading) {
    if (isLoading) {
      loginButton.disabled = true;
      loginButton.innerHTML = window.createButtonSpinner ? window.createButtonSpinner('#ffffff') + 'Masuk...' : '<span class="spinner"></span>Masuk...';
      usernameInput.disabled = true;
      passwordInput.disabled = true;
      captchaInput.disabled = true;
    } else {
      loginButton.disabled = false;
      loginButton.innerHTML = "Masuk";
      usernameInput.disabled = false;
      passwordInput.disabled = false;
      captchaInput.disabled = false;
    }
  }

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const captcha = captchaInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    // Validate input
    if (!username || !password || !captcha) {
      showError("Username, password, dan captcha harus diisi!");
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const response = await authService.login({
        username,
        password,
        captcha,
        remember_me: rememberMe,
      });

      // Login successful
      if (response.success) {
        const user = response.data.user;
        const roles = user.roles || [];

        // Save the token to localStorage
        localStorage.setItem("token", response.data.token);

        // Store the user's primary role in localStorage
        if (roles.length > 0) {
          const primaryRole = roles[0];
          localStorage.setItem("userRole", primaryRole);

          // Redirect based on user's role
          const rolePath = primaryRole.toLowerCase();
          let redirectPath = `/${rolePath}/dashboard`; // Default redirect

          switch (primaryRole) {
            case "Verifikator":
              redirectPath = `/${rolePath}/dashboard`;
              break;
            case "Wadir":
              redirectPath = `/${rolePath}/dashboard`;
              break;
            case "PPK":
              redirectPath = `/${rolePath}/dashboard`;
              break;
            case "Bendahara":
              redirectPath = `/${rolePath}/dashboard`;
              break;
            case "Admin":
              redirectPath = `/${rolePath}/user-management`;
              break;
          }
          window.location.pathname = redirectPath;
        } else {
          // Handle case where user has no roles
          showError(
            "Login berhasil, tetapi tidak ada peran yang ditetapkan untuk pengguna ini."
          );
          setLoading(false);
        }
      } else {
        // Reload captcha on failed login from server
        document.getElementById("captcha-image").src =
          "/api/captcha?t=" + new Date().getTime();
        showError(response.message || "Login gagal!");
        setLoading(false);
        if (captchaInput) {
            captchaInput.value = "";
            captchaInput.focus();
        }
      }
    } catch (error) {
      // Handle error
      const errorMessage =
        error.message || "Login gagal! Silakan cek username dan password Anda.";
      showError(errorMessage);
      // Reload captcha on error
      document.getElementById("captcha-image").src =
        "/api/captcha?t=" + new Date().getTime();
      setLoading(false);
      if (captchaInput) {
          captchaInput.value = "";
          captchaInput.focus();
      }
    }
  });

  // Password toggle functionality with animated slash
  const togglePasswordButton = document.getElementById("togglePassword");
  if (passwordInput && togglePasswordButton) {
    const slashLine = togglePasswordButton.querySelector('.eye-slash-line');

    togglePasswordButton.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Toggle slash animation
      if (type === "text") {
        // Show password -> Show slash
        slashLine.classList.remove('show');
        slashLine.classList.add('hide');
      } else {
        // Hide password -> Hide slash
        slashLine.classList.remove('hide');
        slashLine.classList.add('show');
      }
    });
  }


  // Add a pageshow event listener to reset the loading state
  window.addEventListener("pageshow", function (event) {
    // The event.persisted property is true if the page is from the cache
    if (event.persisted) {
      setLoading(false);
    }
  });

  // Ensure the loading state is reset when the page is rendered
  setLoading(false);
}