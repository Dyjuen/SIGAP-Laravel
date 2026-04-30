// frontend/src/pages/verifikator/DashboardVerifikator.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";
import { kegiatanService } from "../../api/kegiatanService.js"; // Assuming this handles KAK too
import flasher from "../../components/FlasherNotification.js";

export function renderDashboardVerifikator(path, userRole) {
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
        .monitoring-usulan-page {
          padding-right: 1rem;
        }
      }

      /* --- Custom CSS for Figma Design --- */
      
      /* 1. Main Background */
      .layout-wrapper {
        background-image: url('/assets/img/backgrounds/BG.png') !important;
        background-size: cover !important;
        background-position: center !important;
      }
      .content-wrapper {
        background: transparent !important;
      }
      /* Navbar, Footer, Menu tetap solid */
      .layout-navbar, .content-footer, .layout-menu {
        background: #FFFFFF !important;
      }

      /* 2. Sidebar */
      .app-brand-text {
        color: #00BCD4 !important;
        font-size: 20px !important;
        font-weight: 700 !important;
      }
      .menu-inner .menu-item.active > .menu-link {
        background: #00BCD4 !important;
        color: #ffffff !important;
        border-radius: 8px;
        margin: 0 0.5rem;
        backdrop-filter: blur(5px);
      }
      .menu-inner .menu-item.active > .menu-link i,
      .menu-inner .menu-item.active > .menu-link div {
        color: #ffffff !important;
      }
      
      /* 3. Stat Cards (Efek Kaca/Glassmorphism) */
      .stat-card-active {
        transition: all 0.4s ease;
        background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%) !important;
        color: #FFFFFF !important;
        backdrop-filter: blur(10px);
        border: 2px solid transparent !important;
      }
      .stat-card-active h1, .stat-card-active h4, .stat-card-active span, .stat-card-active small {
        color: #FFFFFF !important;
      }
      
      .stat-card-active:hover {
        transition: all 0.4s ease;
        transform: translateY(-5px);
      }
      
      .stat-card-inactive {
        transition: all 0.4s ease;
        background: rgba(255, 255, 255, 0.6) !important;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(224, 247, 250, 0.6) !important;
        color: #00bcd4 !important;
      }
      .stat-card-inactive h1, .stat-card-inactive h4, .stat-card-inactive span, .stat-card-inactive small {
        color: #00bcd4 !important;
      }

      .stat-card-inactive:hover {
        transition: all 0.4s ease;
        transform: translateY(-5px);
      }

      /* 4. Table Styling (Card Rows + Efek Kaca) */
      .card-datatable {
        background: rgba(255, 255, 255, 0.6) !important;
        backdrop-filter: blur(10px);
        border-radius: 0.875rem !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        padding: 1.5rem;
      }
      .table {
        border-collapse: separate !important;
        border-spacing: 0 1rem !important;
      }
      .table thead {
        background: transparent !important; 
      }
      .table thead th {
        color: #6B7280 !important;
        font-weight: 500 !important;
        background: transparent !important;
        border: none !important;
        text-transform: none !important;
        font-size: 14px !important;
        padding-top: 0 !important;
        padding-bottom: 0.5rem !important;
      }
      .table tbody tr {
        background: #FFFFFF !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        transition: all 0.2s ease;
      }
      .table tbody tr:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
      }
      .table tbody td {
        border: none !important;
        padding: 1.25rem 1rem !important;
        vertical-align: middle;
      }
      .table tbody td:first-child {
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      .table tbody td:last-child {
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }
      
      /* 5. Custom Checkbox */
      .form-check-input {
        border-radius: 6px !important;
        border: 2px solid #D1D5DB !important;
      }
      .form-check-input:checked {
        background-color: #33C8DA !important;
        border-color: #33C8DA !important;
      }
      
      /* 6. Aksi Buttons */
      .btn-revisi {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
      }
      .btn-delete {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
        color: white !important;
      }

      /* 7. Responsive Layout Switching */
      .desktop-layout {
        display: flex;
      }
      .mobile-layout {
        display: none;
      }

      /* Mobile breakpoint - switches to dropdown */
      @media (max-width: 768px) {
        .desktop-layout {
          display: none;
        }
        .mobile-layout {
          display: block;
        }
      }
      
      /* 7. Icon Styling */
      i.ti {
        background: none !important;
        display: inline-block;
        color: inherit !important;
        font-style: normal !important;
        font-size: 24px !important;
      }

      .menu-icon i,
      .navbar-nav i.ti {
        font-size: 35px !important;
        vertical-align: middle !important;
      }

      .menu-link i {
        margin-right: 10px !important;
      }
      
      /* 8. Container */
      .container-xxl {
        max-width: 96% !important;
      }

      .nav-item i.ti {
        font-size: 24px !important;
      }

      .btn-primary {
        background: #00bcd4 !important;
        color: white !important;
      }

      .btn-primary:hover {
        background: #0097A7 !important;
      }

      /* 9. Pagination Styling */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0;
      }
      .pagination-info {
        color: #6B7280;
        font-size: 14px;
        font-weight: 500;
      }
      .pagination {
        display: flex;
        list-style: none;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
      }
      .pagination .page-item {
        display: inline-block;
      }
      .pagination .page-link {
        padding: 0.5rem 0.75rem;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        color: #374151;
        text-decoration: none;
        transition: all 0.3s;
        font-weight: 500;
        min-width: 40px;
        text-align: center;
        display: inline-block;
      }
      .pagination .page-link:hover {
        background: #E0F7FA !important;
        color: #00BCD4 !important;
        border-color: #00BCD4 !important;
      }
      .pagination .page-item.active .page-link {
        background: #00BCD4 !important;
        border-color: #00BCD4 !important;
        color: white !important;
      }
      .pagination .page-item.disabled .page-link {
        opacity: 0.5;
        cursor: not-allowed;
        background: #F9FAFB !important;
        color: #D1D5DB !important;
      }

      /* 10. Badge Colors */
      .badge.bg-warning {
        background: #FEF3C7 !important;
        color: #92400E !important;
      }
      .badge.bg-info {
        background: #DBEAFE !important;
        color: #1E40AF !important;
      }
      .badge.bg-success {
        background: #D1FAE5 !important;
        color: #065F46 !important;
      }

      /* Video Placeholder - Pengusul Style */
      .video-placeholder {
        background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
        border-radius: 12px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .video-placeholder::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 188, 212, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .video-placeholder:hover::before {
        opacity: 1;
        animation: shimmer 2s ease-in-out infinite;
      }

      .video-placeholder svg {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .video-placeholder:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(0, 188, 212, 0.2);
      }

      .video-placeholder:hover svg {
        transform: scale(1.3);
        stroke: #00BCD4;
      }

      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }

      /* Search bar styles */
      .search-section {
        margin-bottom: 1.5rem;
        opacity: 0;
        animation: slideInLeft 0.6s ease-out forwards;
        animation-delay: 0.1s;
      }

      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-30px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .search-container {
        position: relative;
        max-width: 500px;
      }

      .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 3rem;
        border: 2px solid #E5E7EB;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .search-input:focus {
        outline: none;
        border-color: #00BCD4;
        box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9CA3AF;
        pointer-events: none;
        transition: color 0.3s ease;
      }

      .search-input:focus + .search-icon {
        color: #00BCD4;
      }

      .clear-search {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        padding: 0.25rem;
        display: none;
        transition: color 0.3s ease;
      }

      .clear-search:hover {
        color: #EF4444;
      }

      .clear-search.visible {
        display: block;
      }

      @media (max-width: 768px) {
        .monitoring-usulan-page {
            padding: 1rem;
        }
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
        }
        .search-container {
            max-width: 100%;
        }
        .col-sm-6 {
            width: 100%;
        }
      }
    </style>

    <div class="monitoring-usulan-page">
        <div class="row g-4 mb-4">
            <div class="col-sm-6 col-xl-6">
                <div class="card stat-card-active">
                <div class="card-body">
                    <div class="d-flex align-items-start justify-content-between">
                    <div class="content-left">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Usulan</span>
                        <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Menunggu</h4>
                        <div class="d-flex align-items-end mt-2">
                        <h1 class="mb-0 me-2" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="menungguCount">0</h1>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <div class="col-sm-6 col-xl-6">
                <div class="card stat-card-inactive">
                <div class="card-body">
                    <div class="d-flex align-items-start justify-content-between">
                    <div class="content-left">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Usulan</span>
                        <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Revisi</h4>
                        <div class="d-flex align-items-end mt-2">
                        <h1 class="mb-0 me-2" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="revisiCount">0</h1>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <!-- Search Section -->
        <div class="search-section">
            <div class="search-container">
            <input 
                type="text" 
                id="searchInput" 
                class="search-input" 
                placeholder="Cari usulan kegiatan, pengusul..."
            />
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <button class="clear-search" id="clearSearch" title="Clear search">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </button>
            </div>
        </div>

        <div class="card card-datatable table-responsive p-0 pb-3">
            <table class="table" style="border-collapse: separate; border-spacing: 0 1rem; padding: 0 1.5rem;">
                <thead>
                <tr>
                    <th style="width: 80px;">No.</th>
                    <th>Nama Usulan Kegiatan</th>
                    <th>Pengusul</th>
                    <th>Tanggal Diajukan</th>
                    <th style="text-align: center;">Status</th>
                    <th style="width: 120px; text-align: center;">Aksi</th>
                </tr>
                </thead>
                <tbody id="usulanTableBody">
                </tbody>
            </table>
            
            <div class="px-4 pb-4">
                <div class="pagination-container">
                    <div class="pagination-info">
                        Menampilkan <span id="startEntry">0</span> sampai <span id="endEntry">0</span> dari <span id="totalEntries">0</span> entri
                    </div>
                    <ul class="pagination" id="paginationList">
                        <!-- populated by js -->
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Video Panduan Section -->
        <div class="card card-datatable mt-4">
          <div class="px-4 pt-4 pb-2">
            <h4 class="mb-0" style="color: #00BCD4; font-weight: 700;">Video Panduan</h4>
            <p class="text-muted small mt-1">Panduan dalam menggunakan SIGAP</p>
          </div>
          <div class="p-4">
            <div class="row g-4" id="videoList">
               <!-- Initial Placeholders -->
               <div class="col-md-4">
                 <div class="video-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </div>
               </div>
               <div class="col-md-4">
                 <div class="video-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </div>
               </div>
               <div class="col-md-4">
                 <div class="video-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </div>
               </div>
            </div>
          </div>
        </div>

    </div>
  `;

  // Render the main layout with the page-specific content
  renderDashboardLayout(pageContent, userRole);

  // --- All the page-specific JavaScript logic goes here ---

  // ==============================================
  // STATE
  // ==============================================
  let state = {
    allUsulan: [], // Holds all data from API
    displayUsulan: [], // Holds data to be displayed in the table
    currentPage: 1,
    itemsPerPage: 10,
    totalEntries: 0,
    totalPages: 1,
    searchQuery: "",
    searchTimeout: null,
    currentStatusId: 2, // Default to 'Menunggu Verifikasi'
  };

  let revisiModalInstance = null;

  // ==============================================
  // API FUNCTIONS
  // ==============================================
  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      if (data.status === false || data.status === "error") {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // ==============================================
  // DATA HANDLING
  // ==============================================
  async function initializeDashboard() {
    const tbody = document.getElementById("usulanTableBody");
    if (tbody) {
      tbody.innerHTML = window.createTableLoadingRow
        ? window.createTableLoadingRow(6, "Memuat data verifikasi...")
        : '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
    }

    try {
      // 1. Get User Profile first
      const profileResponse = await apiRequest("/auth/profile");
      const user = profileResponse.data;
      const username = user.username;

      // 2. Fetch all relevant data at once
      const response = await apiRequest(`/kak`);
      let allUsulan = response.data || [];

      // 3. Filter based on username
      const verifMatch = username.match(/^verifikator(\d+)$/);
      if (verifMatch) {
        const typeId = parseInt(verifMatch[1]);
        if (typeId >= 1 && typeId <= 4) {
          allUsulan = allUsulan.filter((u) => u.tipe_kegiatan_id == typeId);
        }
      }

      state.allUsulan = allUsulan;

      updateStats();

      // Set default view
      filterAndDisplayUsulan(state.currentStatusId);
    } catch (error) {
      console.error("Failed to initialize dashboard:", error);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error loading data: ${error.message}</td></tr>`;
      }
    }
  }

  function filterAndDisplayUsulan(statusId) {
    state.currentStatusId = statusId;

    // Filter by status
    let filtered = state.allUsulan.filter((u) => u.status_id == statusId);

    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.nama_kegiatan && u.nama_kegiatan.toLowerCase().includes(query)) ||
          (u.pengusul_nama && u.pengusul_nama.toLowerCase().includes(query))
      );
    }

    state.displayUsulan = filtered;
    state.displayUsulan.sort((a, b) => a.kak_id - b.kak_id);

    // Init pagination
    state.totalEntries = state.displayUsulan.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    state.currentPage = 1;

    renderTableRows();
    updatePagination();
  }

  // ==============================================
  // SEARCH FUNCTIONS
  // ==============================================
  function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    filterAndDisplayUsulan(state.currentStatusId);
  }

  function debounceSearch(query) {
    if (state.searchTimeout) {
      clearTimeout(state.searchTimeout);
    }
    state.searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  }

  function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");

    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        const query = e.target.value;
        if (clearSearch) {
          if (query.length > 0) clearSearch.classList.add("visible");
          else clearSearch.classList.remove("visible");
        }
        debounceSearch(query);
      });

      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          this.value = "";
          if (clearSearch) clearSearch.classList.remove("visible");
          performSearch("");
        }
      });
    }

    if (clearSearch) {
      clearSearch.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        this.classList.remove("visible");
        performSearch("");
      });
    }
  }

  // ==============================================
  // ACTIONS
  // ==============================================
  async function handleAction(kakId, actionType, payload = {}) {
    // Custom confirmation messages
    const messages = {
      approve: "Anda yakin ingin menyetujui usulan ini?",
      revise: "Anda yakin ingin mengirim revisi untuk usulan ini?",
      reject: "Anda yakin ingin menolak usulan ini?",
    };

    // --- Step 1: SweetAlert2 confirmation ---
    const confirmResult = await Swal.fire({
      title: messages[actionType] || "Anda yakin?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00BCD4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    // --- Step 2: Execute POST request ---
    try {
      await apiRequest(`/kak/${kakId}/${actionType}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // --- Step 3: SweetAlert2 success ---
      showSuccess(`Usulan berhasil di-${actionType}!`);

      initializeDashboard(); // Refresh UI
    } catch (error) {
      console.error(`Gagal ${actionType} usulan:`, error);

      // --- Step 4: SweetAlert2 error ---
      showError(`Gagal ${actionType} usulan: ${error.message}`);
    }
  }

  async function handlePdfAction(kakId, action) {
    const actionTitle =
      action === "preview" ? "Membuka Pratinjau PDF..." : "Mengunduh PDF...";
    const errorMessage =
      action === "preview"
        ? "Gagal membuka pratinjau PDF"
        : "Gagal mengunduh PDF";

    Swal.fire({
      title: actionTitle,
      text: "Sedang memproses...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Step 1: Generate token (Required for both preview and download)
      const tokenResponse = await apiRequest(
        `/kak/${kakId}/generate-download-token`,
        {
          method: "POST",
        }
      );

      if (!tokenResponse.success) {
        throw new Error(
          tokenResponse.message || "Gagal membuat token akses file"
        );
      }

      const tempToken = tokenResponse.data.download_token;
      const url = `/api/kak/${kakId}${
        action === "preview" ? "/preview" : ""
      }?t=${tempToken}`;

      if (action === "preview") {
        // Use fetch + blob for preview to avoid showing HTML error code
        const response = await fetch(url);

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengambil file.");
          } else {
            throw new Error(`HTTP Error: ${response.status}`);
          }
        }

        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);

        Swal.close();
        window.open(fileUrl, "_blank");

        // Revoke URL after a delay
        setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);
      } else {
        // Download
        Swal.close();
        setTimeout(() => {
          window.open(url, "_blank");
        }, 300);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: errorMessage,
        text: error.message,
      });
    }
  }

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
  function formatDate(dateString) {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  }

  function getStatusBadge(statusId) {
    const statusMap = {
      1: { class: "bg-label-secondary", text: "Draf" },
      2: { class: "bg-label-warning", text: "Diajukan" },
      3: { class: "bg-label-success", text: "Disetujui" },
      4: { class: "bg-label-danger", text: "Ditolak" },
      5: { class: "bg-label-info", text: "Revisi" },
    };
    return (
      statusMap[statusId] || { class: "bg-label-dark", text: "Tidak Diketahui" }
    );
  }

  function getActionButtons(statusId, kakId) {
    let buttons = "";

    switch (statusId) {
      case 2: // Menunggu Verifikasi
        buttons = `
          <li>
            <a class="dropdown-item btn-approve" href="javascript:void(0);" data-id="${kakId}">
              <div class="d-flex align-items-center text-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><polyline points="20 6 9 17 4 12"></polyline></svg> 
                Setujui
              </div>
            </a>
          </li>
          <li>
            <a class="dropdown-item btn-revise" href="javascript:void(0);" data-id="${kakId}">
              <div class="d-flex align-items-center text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> 
                Revisi
              </div>
            </a>
          </li>
          <li>
            <a class="dropdown-item btn-reject" href="javascript:void(0);" data-id="${kakId}">
              <div class="d-flex align-items-center text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> 
                Tolak
              </div>
            </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item btn-preview-pdf" href="javascript:void(0);" data-kak-id="${kakId}">
              <div class="d-flex align-items-center text-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> 
                Lihat PDF
              </div>
            </a>
          </li>
          <li>
            <a class="dropdown-item btn-download-pdf" href="javascript:void(0);" data-kak-id="${kakId}">
              <div class="d-flex align-items-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
                Download
              </div>
            </a>
          </li>
        `;
        break;
      default:
        return `<span class="text-muted">-</span>`;
    }

    return `
      <div class="dropdown">
        <button type="button" class="btn btn-text-secondary btn-icon rounded-pill dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-bs-boundary="window" data-bs-popper-config='{"strategy":"fixed"}' aria-expanded="false" style="border: 2px solid #e5e7eb; border-radius: 8px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-dark"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="12" cy="5" r="1"></circle></svg>
        </button>
        <div class="dropdown-menu dropdown-menu-end m-0">
          ${buttons}
        </div>
      </div>
    `;
  }

  // ==============================================
  // RENDER FUNCTIONS
  // ==============================================
  function renderTableRows() {
    const tbody = document.getElementById("usulanTableBody");
    if (!tbody) return;

    if (state.displayUsulan.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align: center;">Tidak ada usulan yang menunggu verifikasi.</td></tr>';
      return;
    }

    tbody.innerHTML = "";

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedData = state.displayUsulan.slice(
      startIndex,
      startIndex + state.itemsPerPage
    );

    paginatedData.forEach((usulan, index) => {
      const statusBadge = getStatusBadge(usulan.status_id);
      const actionButtons = getActionButtons(usulan.status_id, usulan.kak_id);
      const globalIndex = startIndex + index + 1;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <span style="font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 0.5rem 0.75rem; border-radius: 8px; background: #FFFFFF; color: #374151;">${globalIndex}</span>
        </td>
        <td><strong>${usulan.nama_kegiatan || "Tanpa Judul"}</strong></td>
        <td><strong>${usulan.pengusul_nama || "Tanpa Pengusul"}</strong></td>
        <td>${formatDate(usulan.created_at)}</td>
        <td style="text-align: center;">
          <span class="badge ${
            statusBadge.class
          }" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">${
        statusBadge.text
      }</span>
        </td>
        <td style="text-align: center;">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-approve" data-id="${
              usulan.kak_id
            }" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);" title="Setujui">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-revise" data-id="${
              usulan.kak_id
            }" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);" title="Revisi">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-reject" data-id="${
              usulan.kak_id
            }" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);" title="Tolak">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-preview-pdf" data-kak-id="${
              usulan.kak_id
            }" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);" title="Lihat PDF">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-download-pdf" data-kak-id="${
              usulan.kak_id
            }" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);" title="Download">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    attachEventListeners();
  }

  // ==============================================
  // PAGINATION FUNCTIONS
  // ==============================================
  function setupPagination() {
    const paginationContainer = document.getElementById("paginationList");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    // Previous buttons
    paginationContainer.innerHTML += `
      <li class="page-item ${state.currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnFirstPage">«</a>
      </li>
      <li class="page-item ${state.currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnPrevPage">‹</a>
      </li>
    `;

    // Page number buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      state.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationContainer.innerHTML += `
        <li class="page-item ${i === state.currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Next buttons
    paginationContainer.innerHTML += `
      <li class="page-item ${
        state.currentPage === state.totalPages ? "disabled" : ""
      }">
        <a class="page-link" href="#" id="btnNextPage">›</a>
      </li>
      <li class="page-item ${
        state.currentPage === state.totalPages ? "disabled" : ""
      }">
        <a class="page-link" href="#" id="btnLastPage">»</a>
      </li>
    `;

    // Attach events
    document.querySelectorAll(".pagination .page-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const page = this.getAttribute("data-page");
        if (page) {
          changePage(parseInt(page));
        }
      });
    });

    const btnFirstPage = document.getElementById("btnFirstPage");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");
    const btnLastPage = document.getElementById("btnLastPage");

    if (btnFirstPage)
      btnFirstPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage > 1) changePage(1);
      });
    if (btnPrevPage)
      btnPrevPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage > 1) changePage(state.currentPage - 1);
      });
    if (btnNextPage)
      btnNextPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage < state.totalPages)
          changePage(state.currentPage + 1);
      });
    if (btnLastPage)
      btnLastPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage < state.totalPages) changePage(state.totalPages);
      });
  }

  function changePage(page) {
    if (page < 1 || page > state.totalPages) return;
    state.currentPage = page;

    // Smooth scroll to top of table
    document.querySelector(".card-datatable")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    renderTableRows();
    updatePagination();
  }

  function updatePagination() {
    const totalEntries = state.displayUsulan.length;
    state.totalEntries = totalEntries;
    state.totalPages = Math.ceil(totalEntries / state.itemsPerPage);

    // Recalculate if filtered data changed
    if (state.currentPage > state.totalPages && state.totalPages > 0) {
      state.currentPage = state.totalPages;
    }
    if (state.totalPages === 0) state.currentPage = 1;

    const startEntry =
      totalEntries > 0 ? (state.currentPage - 1) * state.itemsPerPage + 1 : 0;
    const endEntry = Math.min(
      state.currentPage * state.itemsPerPage,
      totalEntries
    );

    const startEl = document.getElementById("startEntry");
    const endEl = document.getElementById("endEntry");
    const totalEl = document.getElementById("totalEntries");

    if (startEl) startEl.textContent = startEntry;
    if (endEl) endEl.textContent = endEntry;
    if (totalEl) totalEl.textContent = totalEntries;

    setupPagination();
  }

  // ==============================================
  // EVENT LISTENERS
  // ==============================================
  function attachEventListeners() {
    document.querySelectorAll(".btn-approve").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const kakId = btn.dataset.id;

        // Prompt for Mata Anggaran details
        const { value: formValues } = await Swal.fire({
          title: "Input Data Mata Anggaran",
          html:
            '<div style="text-align: left;">' +
            '<label for="swal-input1" class="form-label">Kode MAK <span class="text-danger">*</span></label>' +
            '<input id="swal-input1" class="form-control mb-3" placeholder="Contoh: MAK123">' +
            '<label for="swal-input2" class="form-label">Nama Sumber Dana</label>' +
            '<input id="swal-input2" class="form-control mb-3" placeholder="Contoh: APBN">' +
            '<label for="swal-input3" class="form-label">Tahun Anggaran</label>' +
            '<input id="swal-input3" class="form-control mb-3" type="number" placeholder="Contoh: 2025">' +
            '<label for="swal-input4" class="form-label">Total Pagu</label>' +
            '<input id="swal-input4" class="form-control" type="number" step="0.01" placeholder="Contoh: 10000000">' +
            "</div>",
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Setujui",
          cancelButtonText: "Batal",
          confirmButtonColor: "#00BCD4",
          preConfirm: () => {
            const kodeAnggaran = document.getElementById("swal-input1").value;
            if (!kodeAnggaran) {
              Swal.showValidationMessage(`Kode MAK wajib diisi.`);
              return false;
            }
            return {
              kode_anggaran: kodeAnggaran,
              nama_sumber_dana: document.getElementById("swal-input2").value,
              tahun_anggaran: document.getElementById("swal-input3").value,
              total_pagu: document.getElementById("swal-input4").value,
            };
          },
        });

        if (formValues) {
          Swal.fire({
            title: "Menyetujui KAK...",
            text: "Harap tunggu, sistem sedang memproses persetujuan.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          try {
            await apiRequest(`/kak/${kakId}/approve`, {
              method: "POST",
              body: JSON.stringify(formValues),
            });

            showSuccess(`Usulan berhasil disetujui!`);
            initializeDashboard(); // Refresh UI
          } catch (error) {
            console.error(`Gagal approve usulan:`, error);
            showError(`Gagal approve usulan: ${error.message}`);
          }
        }
      });
    });

    document.querySelectorAll(".btn-revise").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kakId = btn.dataset.id;
        // Redirect to the revision page with the ID
        window.location.href = `/verifikator/revisi/${kakId}`;
      });
    });

    document.querySelectorAll(".btn-reject").forEach((btn) => {
      btn.addEventListener("click", async () => {
        // Step 1: Ask for rejection reason
        const result = await Swal.fire({
          title: "Masukkan Alasan Penolakan",
          input: "textarea",
          inputPlaceholder: "Contoh: Dokumen tidak valid...",
          inputAttributes: {
            maxlength: 500,
            "aria-label": "Catatan Penolakan",
          },
          showCancelButton: true,
          confirmButtonText: "Lanjut",
          cancelButtonText: "Batal",
          confirmButtonColor: "#00BCD4",
        });

        // Cancel pressed
        if (!result.isConfirmed) return;

        const catatan = (result.value || "").trim();

        if (!catatan) {
          showError("Alasan penolakan tidak boleh kosong!");
          return;
        }

        // Step 2: Confirm rejection
        const confirmReject = await Swal.fire({
          title: "Tolak Usulan?",
          text: "Usulan akan ditolak berdasarkan alasan yang Anda berikan.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#00BCD4",
          cancelButtonColor: "#d33",
          confirmButtonText: "Tolak",
          cancelButtonText: "Batal",
        });

        if (!confirmReject.isConfirmed) return;

        // Step 3: Call your backend action
        handleAction(btn.dataset.id, "reject", { catatan });
      });
    });

    // --- PDF BUTTONS ---
    document.querySelectorAll(".btn-preview-pdf").forEach((btn) => {
      btn.addEventListener("click", () =>
        handlePdfAction(btn.dataset.kakId, "preview")
      );
    });

    document.querySelectorAll(".btn-download-pdf").forEach((btn) => {
      btn.addEventListener("click", () =>
        handlePdfAction(btn.dataset.kakId, "download")
      );
    });
  }

  // ==============================================
  // MODAL & STATS
  // ==============================================
  function setupModal() {
    const modalElement = document.getElementById("revisiModal");
    if (!modalElement) {
      console.warn(
        "[VERIFIKATOR] revisiModal element not found in DOM - skipping modal setup"
      );
      return;
    }

    if (typeof bootstrap !== "undefined") {
      revisiModalInstance = new bootstrap.Modal(modalElement);

      const btnKirimRevisi = document.getElementById("btnKirimRevisi");
      if (btnKirimRevisi) {
        btnKirimRevisi.addEventListener("click", async () => {
          const catatan = document.getElementById("revisiCatatan").value.trim();
          const kakId = document.getElementById("revisiUsulanId").value;
          if (!catatan) return alert("Catatan revisi harus diisi!");

          await handleAction(kakId, "revise", {
            catatan_telaah: { deskripsi_kegiatan: catatan },
          }); // Assuming note goes here
          revisiModalInstance.hide();
        });
      }
    } else {
      console.error("Bootstrap 5 JS not found. Modals will not work.");
    }
  }

  function updateStats() {
    const menungguCount = state.allUsulan.filter(
      (u) => u.status_id === 2
    ).length;
    const revisiCount = state.allUsulan.filter((u) => u.status_id === 5).length;

    document.getElementById("menungguCount").textContent = menungguCount;
    document.getElementById("revisiCount").textContent = revisiCount;
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  initializeDashboard();
  setupModal();
  setupSearch();
  fetchVideos();

  function fetchVideos() {
    console.log("[VERIFIKATOR] Fetching videos..."); // Debug
    // Use local apiRequest helper
    apiRequest("/dashboard/video")
      .then((response) => {
        console.log("[VERIFIKATOR] Video API Response:", response); // Debug
        if (response.success && response.data) {
          renderVideos(response.data);
        } else {
          renderVideos([]);
        }
      })
      .catch((error) => {
        console.error("[VERIFIKATOR] Error fetching videos:", error);
        renderVideos([]);
      });
  }

  function renderVideos(videos) {
    const container = document.getElementById("videoList");
    if (!container) {
      console.error("[VERIFIKATOR] videoList container not found!"); // Debug
      return;
    }

    console.log("[VERIFIKATOR] Rendering videos:", videos); // Debug

    container.innerHTML = "";
    if (!videos || videos.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted py-4">Belum ada video panduan.</div>`;
      return;
    }

    videos.forEach((video) => {
      // Use path_media from database
      let videoUrl = video.path_media || video.url || "";
      let embedUrl = videoUrl;

      console.log(
        "[VERIFIKATOR] Processing video:",
        video.judul_panduan,
        videoUrl
      ); // Debug

      // Simple YouTube URL to Embed URL converter
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        let videoId = "";
        if (videoUrl.includes("youtube.com/watch?v=")) {
          videoId = videoUrl.split("watch?v=")[1].split("&")[0];
        } else if (videoUrl.includes("youtu.be/")) {
          videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
        } else if (videoUrl.includes("youtube.com/embed/")) {
          videoId = videoUrl.split("embed/")[1].split("?")[0];
        }
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      const col = document.createElement("div");
      col.className = "col-md-4";

      // Create inner card
      const videoCard = document.createElement("div");
      videoCard.className = "video-placeholder";
      videoCard.style.background = "black";
      videoCard.style.position = "relative";

      videoCard.innerHTML = `
        <iframe src="${embedUrl}" title="${
        video.judul_panduan || "Video Panduan"
      }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius: 12px;"></iframe>
      `;

      col.appendChild(videoCard);
      container.appendChild(col);
    });
  }

  if (window.Helpers) {
    window.Helpers.init();
  }

  // === NEW LOGIC: Check for overdue KAKs for Verifikator after dashboard renders ===
  (async () => {
    try {
      const overdueKak = await kegiatanService.getOverdueKakForVerifikator(); // Call the KAK service method
      if (overdueKak && overdueKak.count > 0) {
        // Reuse the showOverdueKegiatanNotification which is generic enough
        flasher.showOverdueKegiatanNotification(overdueKak);
      }
    } catch (overdueError) {
      console.error(
        "Failed to fetch overdue KAKs for Verifikator:",
        overdueError
      );
    }
  })();
  // === END NEW LOGIC ===
}
