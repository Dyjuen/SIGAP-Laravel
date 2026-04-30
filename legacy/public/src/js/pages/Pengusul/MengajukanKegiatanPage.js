// frontend/src/pages/pengusul/MengajukanKegiatanPage.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderMengajukanKegiatanPage(path, userRole) {
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

      /* Desktop right padding */
      @media (min-width: 1024px) {
        .mengajukan-kegiatan-page {
          padding-right: 1rem;
        }
      }

      /* ========== GLOBAL Z-INDEX FIX ========== */
      .modal-backdrop { z-index: 9999 !important; }
      .modal { z-index: 10000 !important; }

      /* ========== HEADER STYLES (From Dashboard Direktur) ========== */
      .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; animation: fadeInUp 0.5s ease-out; }
      .header-title h2 { font-size: 2.25rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
      .header-title p { color: #64748b; margin-top: 0.25rem; font-size: 1rem; font-weight: 500; }

      /* ========== MODAL STYLES (From UserManagement) ========== */
      @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }

      .modal-backdrop.show {
          opacity: 0.7 !important;
          backdrop-filter: blur(8px);
          background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 151, 167, 0.1));
      }

      .modal.show .modal-dialog {
          animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .modal-content {
          border: none !important;
          border-radius: 24px !important;
          box-shadow: 
              0 0 0 1px rgba(0, 188, 212, 0.1),
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 80px rgba(0, 188, 212, 0.15) !important;
          overflow: hidden;
          background: #ffffff !important;
      }

      .modal-header-gradient {
          background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%);
          color: #1F2937;
          border: none;
          padding: 1.5rem 2rem;
          position: relative;
          display: flex;
          align-items: center;
      }

      .modal-header-gradient .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
      }

      .modal-header-gradient .btn-close {
          position: absolute;
          top: 50%;
          right: 2rem !important;
          margin-top: -18px; /* Replaces translateY */
          transform: none !important;
          transition: none !important;
          animation: none !important;
          background: transparent;
          opacity: 0.7;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none !important;
      }

      .modal-header-gradient .btn-close:hover {
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.6);
          transform: none !important;
          transition: none !important;
          animation: none !important;
          box-shadow: none !important;
      }

      .modal-header-gradient .btn-close svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: white;
          stroke-width: 2.5;
      }

      .modal-body-modern {
          padding: 2.5rem !important;
          background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
      }

      .glass-input-wrapper {
          position: relative;
          border-radius: 16px;
          background: white;
          border: 2px solid #E5E7EB;
          transition: all 0.3s;
          overflow: hidden;
      }

      .glass-input-wrapper:focus-within {
          border-color: #00bcd4;
          background: #F0F8FF;
          box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
      }

      .glass-input-wrapper input, .glass-input-wrapper select {
          background: transparent;
          width: 100%;
          padding: 1rem 1.25rem;
          border: none;
          outline: none;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1F2937;
      }

      /* Fix for file input */
      .glass-input-wrapper input[type="file"] {
          padding: 0.7rem 1.25rem;
      }

      .form-label-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1F2937;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
      }

      .form-label-modern i {
          font-size: 1.25rem;
          color: #00bcd4;
          background: rgba(33, 150, 243, 0.1);
          padding: 0.4rem;
          border-radius: 8px;
      }

      .modal-footer-modern {
          padding: 1.75rem 2.5rem !important;
          background: linear-gradient(to top, #fafafa, #ffffff);
          border: none;
          gap: 1rem;
          display: flex;
          justify-content: flex-end;
      }

      .btn-modern-cancel {
          background: white;
          border: 2px solid #E5E7EB;
          color: #6B7280;
          font-weight: 600;
          padding: 0.875rem 1.75rem;
          border-radius: 14px;
          transition: all 0.3s;
      }

      .btn-modern-cancel:hover {
          border-color: #9CA3AF;
          color: #374151;
          transform: translateY(-2px);
      }

      .btn-modern-primary {
          background: linear-gradient(135deg, #2196F3, #64B5F6);
          border: none;
          color: white;
          font-weight: 700;
          padding: 0.875rem 2rem;
          border-radius: 14px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
      }

      .btn-modern-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(33, 150, 243, 0.5);
      }

      .modal-error-alert {
          background: #FEF2F2;
          border-left: 4px solid #EF4444;
          color: #991B1B;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: none;
      }

      .form-group-animate { animation: fadeInUp 0.5s ease-out backwards; }
      .form-group-animate:nth-child(1) { animation-delay: 0.1s; }
      .form-group-animate:nth-child(2) { animation-delay: 0.15s; }
      .form-group-animate:nth-child(3) { animation-delay: 0.2s; }

      /* ========== EXISTING STYLES (Merged/Preserved) ========== */
      .card-datatable {
        background: rgba(255, 255, 255, 0.6) !important;
        backdrop-filter: blur(10px);
        border-radius: 0.875rem !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        overflow: hidden;
      }
      .table { border-collapse: separate !important; border-spacing: 0 1rem !important; }
      .table thead th {
        color: #6B7280 !important;
        font-weight: 500 !important;
        background: transparent !important;
        border: none !important;
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
      .table tbody td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
      .table tbody td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
      
      .btn-ajukan {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%) !important;
        color: white !important;
        padding: 0.5rem 1.5rem;
        border: none !important;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(5, 156, 216, 0.3) !important;
        transition: all 0.3s;
      }
      .btn-ajukan:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 156, 216, 0.4) !important;
      }

      /* Search & Filters */
      .search-section { margin-bottom: 1.5rem; animation: slideInLeft 0.6s ease-out forwards; }
      @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
      
      .search-input {
        width: 100%; padding: 0.875rem 1rem 0.875rem 3rem;
        border: 2px solid #E5E7EB; border-radius: 10px;
        transition: all 0.3s; background: white;
      }
      .search-input:focus { border-color: #00BCD4; box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1); outline: none; }
      .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9CA3AF; }
      .clear-search { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9CA3AF; cursor: pointer; display: none; }
      .clear-search.visible { display: block; }

      .pagination-container {
        display: flex; justify-content: space-between; align-items: center; padding: 1.5rem;
        opacity: 0; animation: fadeInUp 0.6s ease-out forwards; animation-delay: 0.5s;
      }
      .pagination .page-link {
        padding: 0.5rem 0.75rem; border: 1px solid #E5E7EB; border-radius: 6px;
        color: #374151; font-weight: 500; min-width: 40px; text-align: center;
        transition: all 0.3s;
      }
      .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white; border-color: #00BCD4;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .mengajukan-kegiatan-page { padding: 1rem; }
        .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .pagination-container { flex-direction: column; gap: 1rem; }
      }
    </style>

    <div class="mengajukan-kegiatan-page">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Pengajuan Kegiatan</h2>
          <p>Ajukan kegiatan yang telah disetujui</p>
        </div>
      </div>

      <!-- Alert Container -->
      <div class="container-xxl">
        <div id="pageAlertContainer" style="display: none; margin-bottom: 1.5rem;"></div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container" style="position: relative; max-width: 500px;">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="Cari nama kegiatan..."
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

      <!-- Main Table Card -->
      <div class="card card-datatable p-0">
        <div class="table-responsive text-nowrap" style="padding: 0 1.5rem;">
          <table class="table" style="border-collapse: separate; border-spacing: 0 1rem;">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Usulan Kegiatan</th>
                <th>Tanggal Diajukan</th>
                <th>Tanggal Disetujui</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Aksi</th>
              </tr>
            </thead>
            <tbody id="kegiatanTableBody">
              <!-- Data will be populated by JavaScript -->
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Menampilkan <span id="startEntry">0</span> sampai <span id="endEntry">0</span> dari <span id="totalEntries">0</span> entri
          </div>
          <ul class="pagination" id="paginationList">
            <!-- Will be populated by JavaScript -->
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal Ajukan Kegiatan (Premium Style) -->
    <div class="modal fade" id="ajukanKegiatanModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header modal-header-gradient">
            <div>
              <h5 class="modal-title">Ajukan Kegiatan</h5>
              <p class="mb-0 text-white opacity-75 small">Lengkapi data pelaksana untuk memulai kegiatan</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body modal-body-modern">
            <div id="ajukanKegiatanError" class="modal-error-alert">
              <i class="ti ti-alert-circle"></i>
              <span></span>
            </div>
            <form id="ajukanKegiatanForm">
              <input type="hidden" id="kakId">
              
              <div class="row g-4">
                <div class="col-12 form-group-animate">
                  <label for="penanggungJawab" class="form-label-modern">
                    <i class="ti ti-user"></i>Penanggung Jawab
                  </label>
                  <div class="glass-input-wrapper">
                    <input type="text" id="penanggungJawab" placeholder="Masukkan nama penanggung jawab" required>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label for="pelaksana" class="form-label-modern">
                    <i class="ti ti-users"></i>Pelaksana Kegiatan
                  </label>
                  <div class="glass-input-wrapper">
                    <input type="text" id="pelaksana" placeholder="Masukkan nama pelaksana kegiatan" required>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label for="suratPengantar" class="form-label-modern">
                    <i class="ti ti-file-upload"></i>Surat Pengantar
                  </label>
                  <div class="glass-input-wrapper">
                    <input type="file" id="suratPengantar" accept=".pdf,.doc,.docx" required>
                  </div>
                  <div class="helper-text">
                    <i class="ti ti-info-circle"></i> Format: PDF, DOC, DOCX (Max 5MB)
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer modal-footer-modern">
            <button type="button" class="btn btn-modern-cancel" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-modern-primary" id="btnSelesaiAjukan">
              Selesai & Ajukan
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // ==============================================
  // STATE & SETUP
  // ==============================================
  let state = {
    approvedTelaah: [], // The currently displayed data (after search/filter)
    allApprovedTelaah: [], // All data fetched from API
    filteredTelaah: [], // Data filtered by search query
    searchQuery: '',
    searchTimeout: null,
    // Pagination State
    currentPage: 1,
    itemsPerPage: 10,
    totalEntries: 0,
    totalPages: 1,
  };

  let ajukanModalInstance = null;
  if (typeof bootstrap !== "undefined") {
    ajukanModalInstance = new bootstrap.Modal(
      document.getElementById("ajukanKegiatanModal")
    );
  }

  // ==============================================
  // API FUNCTIONS
  // ==============================================
  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    headers["Authorization"] = `Bearer ${token}`;

    const config = { ...options, headers };

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      if (data.success !== true) {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async function fetchApprovedTelaah() {
    const tbody = document.getElementById("kegiatanTableBody");
    tbody.innerHTML = window.createTableLoadingRow ? window.createTableLoadingRow(6, 'Memuat daftar kegiatan...') : '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
      const user = JSON.parse(localStorage.getItem("auth_user"));
      const userIdParam = user ? `&pengusul_user_id=${user.user_id}` : '';
      const response = await apiRequest(`/kak?status=3${userIdParam}`);
      state.allApprovedTelaah = response.data;
      state.allApprovedTelaah.sort((a, b) => a.kak_id - b.kak_id);
      state.filteredTelaah = state.allApprovedTelaah;
      
      // Init pagination
      state.totalEntries = state.filteredTelaah.length;
      state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
      state.currentPage = 1;
      
      renderTableRows(state.filteredTelaah);
      updatePagination();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }

  async function submitKegiatan(formData) {
    const btnSelesaiAjukan = document.getElementById("btnSelesaiAjukan");
    ajukanModalInstance.hide();

    Swal.fire({
      title: 'Mengajukan Kegiatan...',
      text: 'Harap tunggu, sistem sedang memproses permintaan Anda.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await apiRequest("/kegiatan", {
        method: "POST",
        body: formData,
      });

      if (window.setButtonLoading && btnSelesaiAjukan) {
        window.setButtonLoading(btnSelesaiAjukan, false);
      }

      fetchApprovedTelaah(); // Refresh the list

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Diajukan!',
        text: 'Kegiatan telah berhasil diajukan dan alur persetujuan dimulai.',
        timer: 2500,
        showConfirmButton: false
      });

    } catch (error) {
      if (window.setButtonLoading && btnSelesaiAjukan) {
        window.setButtonLoading(btnSelesaiAjukan, false);
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengajukan',
        text: error.message || "Terjadi kesalahan saat mengajukan kegiatan.",
      }).then(() => {
        ajukanModalInstance.show(); // Re-show modal on error
      });
    }
  }

  // ==============================================
  // UI & HELPER FUNCTIONS
  // ==============================================
  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function showPageAlert(message, type = "success") {
    const alertContainer = document.getElementById("pageAlertContainer");
    if (alertContainer) {
      alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
      alertContainer.style.display = "block";
      setTimeout(() => {
        alertContainer.style.display = "none";
        alertContainer.innerHTML = "";
      }, 5000); // Hide after 5 seconds
    }
  }

  function showModalError(message) {
    const errorDiv = document.getElementById("ajukanKegiatanError");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
    }
  }

  function hideModalError() {
    const errorDiv = document.getElementById("ajukanKegiatanError");
    if (errorDiv) {
      errorDiv.style.display = "none";
    }
  }

  function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (window.setButtonLoading) {
      window.setButtonLoading(button, isLoading, 'Memproses...');
    } else {
      const textSpan = button.querySelector(".button-text");
      const spinner = button.querySelector(".spinner-border");

      button.disabled = isLoading;
      if (spinner) spinner.classList.toggle("d-none", !isLoading);
      if (textSpan) textSpan.style.opacity = isLoading ? "0" : "1";
    }
  }

  function renderTableRows(data) {
    const tbody = document.getElementById("kegiatanTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center">Tidak ada usulan KAK yang disetujui.</td></tr>';
      return;
    }

    // Apply pagination slicing
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + state.itemsPerPage);

    paginatedData.forEach((item, index) => {
      // Calculate global index
      const globalIndex = startIndex + index + 1;
      
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <span style="font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 0.5rem 0.75rem; border-radius: 8px; background: #FFFFFF; color: #374151;">${
            globalIndex
          }</span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <strong>${item.nama_kegiatan}</strong>
            <small class="text-muted">${
              item.pengusul_nama || "Tanpa Pengusul"
            }</small>
          </div>
        </td>
        <td>${formatDate(item.created_at)}</td>
        <td>${formatDate(item.updated_at)}</td>
        <td style="text-align: center;">
          <span class="badge bg-label-success">Disetujui</span>
        </td>
        <td style="text-align: center;">
          <button 
            class="btn btn-sm btn-ajukan" 
            data-id="${item.kak_id}"
          >
            Ajukan Kegiatan
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    attachEventListeners();
  }

  // ==============================================
  // SEARCH FUNCTIONS
  // ==============================================
  function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
      state.filteredTelaah = state.allApprovedTelaah;
    } else {
      state.filteredTelaah = state.allApprovedTelaah.filter(item => {
        const namaKegiatan = (item.nama_kegiatan || '').toLowerCase();
        const pengusul = (item.pengusul_nama || '').toLowerCase();
        return namaKegiatan.includes(state.searchQuery) || pengusul.includes(state.searchQuery);
      });
    }
    
    state.approvedTelaah = state.filteredTelaah;
    
    // Reset pagination on search
    state.totalEntries = state.filteredTelaah.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    state.currentPage = 1;
    
    renderTableRows(state.approvedTelaah);
    updatePagination();
  }

  function debounceSearch(query) {
    if (state.searchTimeout) {
      clearTimeout(state.searchTimeout);
    }
    
    state.searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  }

  // ==============================================
  // EVENT LISTENERS
  // ==============================================
  function attachEventListeners() {
    document.querySelectorAll(".btn-ajukan").forEach((btn) => {
      btn.addEventListener("click", handleAjukanClick);
    });

    const suratPengantarInput = document.getElementById("suratPengantar");
    if (suratPengantarInput) {
      suratPengantarInput.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      suratPengantarInput.addEventListener("change", (e) => {
        e.stopPropagation();
      });
    }

    if (ajukanModalInstance) {
      // Focus input when modal opens
      const modalEl = document.getElementById("ajukanKegiatanModal");
      if (modalEl) {
        modalEl.addEventListener('shown.bs.modal', function () {
          const firstInput = document.getElementById("penanggungJawab");
          if (firstInput) {
            firstInput.focus();
          }
        });
      }
    }

    // Prevent default form submission for the modal form
    const ajukanKegiatanForm = document.getElementById("ajukanKegiatanForm");
    if (ajukanKegiatanForm) {
      ajukanKegiatanForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission
      });
    }
  }

  function handleAjukanClick(e) {
    const kakId = e.currentTarget.dataset.id;
    document.getElementById("kakId").value = kakId;
    document.getElementById("ajukanKegiatanForm").reset();
    hideModalError(); // Clear modal errors on open
    ajukanModalInstance.show();
  }

  const btnSelesaiAjukan = document.getElementById("btnSelesaiAjukan");
  if (btnSelesaiAjukan) {
    btnSelesaiAjukan.addEventListener("click", () => {
      const kakId = document.getElementById("kakId").value;
      const penanggungJawab = document
        .getElementById("penanggungJawab")
        .value.trim();
      const pelaksana = document.getElementById("pelaksana").value.trim();
      const suratPengantar = document.getElementById("suratPengantar").files[0];

      if (!penanggungJawab || !pelaksana || !suratPengantar) {
        showModalError("Semua field harus diisi!"); // Use modal-specific error
        return;
      }

      if (suratPengantar.size > 5 * 1024 * 1024) {
        showModalError("Ukuran file Surat Pengantar maksimal 5MB!"); // Use modal-specific error
        return;
      }

      if (window.setButtonLoading) {
        window.setButtonLoading(btnSelesaiAjukan, true, 'Memproses...');
      }

      const formData = new FormData();
      formData.append("kak_id", kakId);
      formData.append("penanggung_jawab_manual", penanggungJawab);
      formData.append("pelaksana_manual", pelaksana);
      formData.append("surat_pengantar", suratPengantar);

      submitKegiatan(formData);
    });
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  
  // Setup search functionality
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  
      
  
      if (searchInput) {
  
        searchInput.addEventListener('input', function(e) {
  
          const query = e.target.value;
  
          
  
          if (clearSearch) {
  
            if (query.length > 0) {
  
              clearSearch.classList.add('visible');
  
            } else {
  
              clearSearch.classList.remove('visible');
  
            }
  
          }
  
          
  
          debounceSearch(query);
  
        });
  
        
  
        searchInput.addEventListener('keydown', function(e) {
  
          if (e.key === 'Escape') {
  
            this.value = '';
  
            if (clearSearch) {
  
              clearSearch.classList.remove('visible');
  
            }
  
            performSearch('');
  
          }
  
        });
  
      }
  
      
  
      if (clearSearch) {
  
        clearSearch.addEventListener('click', function() {
  
          if (searchInput) {
  
            searchInput.value = '';
  
            searchInput.focus();
  
          }
  
          this.classList.remove('visible');
  
          performSearch('');
  
        });
  
      }
  
      
  
      fetchApprovedTelaah();

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

    renderTableRows(state.filteredTelaah);
    updatePagination();
  }

  function updatePagination() {
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(
      state.currentPage * state.itemsPerPage,
      state.totalEntries
    );

    const startEl = document.getElementById("startEntry");
    const endEl = document.getElementById("endEntry");
    const totalEl = document.getElementById("totalEntries");

    if (startEl) startEl.textContent = state.totalEntries > 0 ? startEntry : 0;
    if (endEl) endEl.textContent = endEntry;
    if (totalEl) totalEl.textContent = state.totalEntries;

    setupPagination();
  }
}
