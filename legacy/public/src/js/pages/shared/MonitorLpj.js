// public/src/js/pages/shared/MonitorLpj.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderDaftarLpjPage(path, userRole) {
  const isBendahara = userRole.toLowerCase() === "bendahara";
  const isPengusul = userRole.toLowerCase() === "pengusul";

  const bendaharaStatCards = `
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div class="stat-card stat-card-active rounded-xl shadow-lg p-6 cursor-pointer" data-status="all">
        <h4 class="text-lg font-bold mb-1">Semua LPJ</h4>
        <h1 class="text-5xl font-bold" id="count-all">0</h1>
      </div>
      <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Diajukan">
        <h4 class="text-lg font-bold mb-1">Perlu Direview</h4>
        <h1 class="text-5xl font-bold" id="count-diajukan">0</h1>
      </div>
      <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Setor Fisik">
        <h4 class="text-lg font-bold mb-1">Setor Fisik</h4>
        <h1 class="text-5xl font-bold" id="count-setor-fisik">0</h1>
      </div>
      <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Direvisi">
        <h4 class="text-lg font-bold mb-1">Direvisi</h4>
        <h1 class="text-5xl font-bold" id="count-revisi">0</h1>
      </div>
      <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Selesai">
        <h4 class="text-lg font-bold mb-1">Selesai</h4>
        <h1 class="text-5xl font-bold" id="count-selesai">0</h1>
      </div>
    </div>`;

  const pengusulStatCards = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="stat-card stat-card-active rounded-xl shadow-lg p-6 cursor-pointer" data-status="all">
          <h4 class="text-lg font-bold mb-1">Semua LPJ</h4>
          <h1 class="text-5xl font-bold" id="count-all">0</h1>
        </div>
        <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Menunggu Penyerahan">
          <h4 class="text-lg font-bold mb-1">Menunggu LPJ</h4>
          <h1 class="text-5xl font-bold" id="count-menunggu">0</h1>
        </div>
        <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Direvisi">
          <h4 class="text-lg font-bold mb-1">Revisi</h4>
          <h1 class="text-5xl font-bold" id="count-revisi">0</h1>
        </div>
        <div class="stat-card stat-card-inactive rounded-xl shadow-lg p-6 cursor-pointer" data-status="Setor Fisik">
          <h4 class="text-lg font-bold mb-1">Setor Fisik</h4>
          <h1 class="text-5xl font-bold" id="count-setor-fisik">0</h1>
        </div>
    </div>`;

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
        .daftar-lpj-page {
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

      @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

      .countdown-normal { color: #D97706; }
      .countdown-danger { color: #be123c; }

      /* Search Styles */
      .search-section {
        margin-bottom: 1.5rem;
        opacity: 0;
        animation: slideInLeft 0.6s ease-out forwards;
        animation-delay: 0.1s;
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
        border-color: #0fb4caff;
        box-shadow: 0 0 0 4px rgba(15, 180, 202, 0.1);
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
        color: #0fb4caff;
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

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Pagination Styles */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-top: 1px solid #f1f5f9;
        background: white;
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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        min-width: 40px;
        text-align: center;
        display: inline-block;
        position: relative;
        overflow: hidden;
      }

      .pagination .page-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.2), transparent);
        transition: left 0.5s;
      }

      .pagination .page-link:hover {
        background: #F3F4F6;
        border-color: #00BCD4;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 188, 212, 0.2);
      }

      .pagination .page-link:hover::before {
        left: 100%;
      }

      .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
        border-color: #00BCD4;
        box-shadow: 0 4px 12px rgba(5, 156, 216, 0.4);
        transform: scale(1.1);
      }

      .pagination .page-item.disabled .page-link {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Button Styles */
      .btn {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }
      
      .btn:hover {
        transform: translateY(-2px);
      }

      .btn-icon {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 8px;
        border: none;
        cursor: pointer;
      }
      
      .btn-icon svg {
        width: 16px;
        height: 16px;
      }

      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .daftar-lpj-page {
            padding: 1rem;
        }
        .grid-cols-1.md\:grid-cols-5, .grid-cols-1.md\:grid-cols-4 {
            grid-template-columns: 1fr; /* Stack cards */
        }
        .search-container {
            max-width: 100%;
        }
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
        }
      }
    </style>
    <div class="daftar-lpj-page">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Pemantauan LPJ</h2>
          <p>Pantau status laporan pertanggungjawaban kegiatan</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      ${isBendahara ? bendaharaStatCards : pengusulStatCards}

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="Cari nama kegiatan atau pengusul..."
            autocomplete="off"
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

      <!-- Table Card -->
      <div class="card-datatable">
        <div class="table-responsive">
          <table class="table" id="lpjTable">
            <thead>
              <tr>
                <th style="width: 4%; text-align: center; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">No.</th>
                <th style="width: 24%; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Nama Kegiatan</th>
                ${
                  isBendahara
                    ? '<th style="width: 18%; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Pengusul</th>'
                    : ""
                }
                <th style="${
                  isPengusul ? "text-align: center;" : ""
                }background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Batas Waktu LPJ</th>
                <th class="text-center">Hitung Mundur</th>
                <th class="text-center">Status</th>
                <th class="text-center" style="width: 220px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="lpjTableBody">
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
  `;

  renderDashboardLayout(pageContent, userRole);
  initializeDaftarLpj(userRole);
}

function initializeDaftarLpj(userRole) {
  const isBendahara = userRole.toLowerCase() === "bendahara";
  const isPengusul = userRole.toLowerCase() === "pengusul";

  const state = {
    kegiatan: [],
    allKegiatan: [],
    filteredKegiatan: [],
    filter: "all",
    countdownInterval: null,
    searchQuery: "",
    searchTimeout: null,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  };

  const tbody = document.getElementById("lpjTableBody");
  const statCards = document.querySelectorAll("[data-status]");

  function showError(message) {
    Swal.fire("Error", message, "error");
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
      showError(error.message);
      throw error;
    }
  }

  async function fetchData() {
    tbody.innerHTML = window.createTableLoadingRow
      ? window.createTableLoadingRow(7, "Memuat data LPJ...")
      : `<tr><td colspan="7" class="text-center">Loading...</td></tr>`;
    try {
      const user = JSON.parse(localStorage.getItem("auth_user"));
      const userIdParam = user ? `?user_id=${user.user_id}` : "";
      const response = await apiRequest(`/dashboard/lpj${userIdParam}`);
      state.kegiatan = response.data.data || [];
      state.allKegiatan = [...state.kegiatan];
      filterAndRender();
      updateStats();
      startCountdownTimers();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Gagal memuat data: ${error.message}</td></tr>`;
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      "Menunggu Penyerahan": "bg-label-secondary",
      Diajukan: "bg-label-warning",
      Direvisi: "bg-label-info",
      "Setor Fisik": "bg-label-danger",
      Selesai: "bg-label-success",
    };
    return statusMap[status] || "bg-label-dark";
  }

  function getActionButtons(item) {
    const { status_lpj: status, kegiatan_id: id, approval_status } = item;

    if (isBendahara) {
      const detailButton = `<button class="btn btn-sm btn-icon" onclick="window.location.href='/bendahara/kegiatan/lpj/detail/${id}'" title="Lihat Detail" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
      
      switch (status) {
        case "Diajukan":
          return `
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-icon" onclick="window.location.href='/bendahara/kegiatan/lpj/revisi/${id}'" title="Revisi" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="btn btn-sm btn-icon" data-action="setujui" data-id="${id}" title="Setujui" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
              </div>`;
        case "Setor Fisik":
            return `
                <div class="d-flex justify-content-center gap-2">
                  ${detailButton}
                  <button class="btn btn-sm btn-icon" data-action="selesaikan" data-id="${id}" title="${approval_status === "bendahara-setor" ? 'Setujui & Selesaikan' : 'Selesaikan'}" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>
                </div>`;
        default:
          return `<span class="text-muted">-</span>`;
      }
    } else if (isPengusul) {
      switch (status) {
        case "Menunggu Penyerahan":
          return `<button class="btn btn-sm btn-icon" onclick="window.location.href='/pengusul/kegiatan/lpj/new?kegiatan_id=${id}'" title="Submit LPJ" style="background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%); color: white; box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></button>`;
        case "Direvisi":
          return `<button class="btn btn-sm btn-icon" onclick="window.location.href='/pengusul/kegiatan/lpj/revisi/${id}'" title="Kerjakan Revisi" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>`;
        case "Diajukan":
        case "Setor Fisik":
        case "Selesai":
          return `<button class="btn btn-sm btn-icon" onclick="window.location.href='/pengusul/kegiatan/lpj/detail/${id}'" title="Lihat Detail" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3); border: none;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
        default:
          return `<span class="text-muted">-</span>`;
      }
    }
    return "";
  }
  function calculateCountdown(deadline) {
    if (!deadline) return { text: "-", colorClass: "" };

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;

    if (diffTime > 0) {
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffMinutes = Math.floor(
        (diffTime % (1000 * 60 * 60)) / (1000 * 60)
      );

      if (diffDays > 0) {
        return {
          text: `${diffDays} hari ${diffHours} jam`,
          colorClass: "countdown-normal",
        };
      } else {
        return {
          text: `${diffHours} jam ${diffMinutes} menit`,
          colorClass: "countdown-normal",
        };
      }
    } else {
      const overdueTime = now - deadlineDate;
      const overdueDays = Math.floor(overdueTime / (1000 * 60 * 60 * 24));
      const overdueHours = Math.floor(
        (overdueTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (overdueDays > 0) {
        return { text: `-${overdueDays} hari`, colorClass: "countdown-danger" };
      } else if (overdueHours > 0) {
        return { text: `-${overdueHours} jam`, colorClass: "countdown-danger" };
      } else {
        return { text: "Baru saja", colorClass: "countdown-danger" };
      }
    }
  }

  function renderTableRows() {
    tbody.innerHTML = "";
    if (state.filteredKegiatan.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">Tidak ada data untuk ditampilkan.</td></tr>`;
      updatePaginationInfo(0, 0, 0);
      return;
    }

    state.totalPages = Math.ceil(state.filteredKegiatan.length / state.itemsPerPage);
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(state.currentPage * state.itemsPerPage, state.filteredKegiatan.length);
    
    updatePaginationInfo(startEntry, endEntry, state.filteredKegiatan.length);
    setupPagination();

    const paginatedData = state.filteredKegiatan.slice(
      (state.currentPage - 1) * state.itemsPerPage,
      state.currentPage * state.itemsPerPage
    );

    paginatedData.forEach((item, index) => {
      const row = document.createElement("tr");
      const statusClass = getStatusBadge(item.status_lpj);
      const actionButtons = getActionButtons(item);
      const countdown = calculateCountdown(item.tgl_batas_lpj);
      // Global index
      const globalIndex = (state.currentPage - 1) * state.itemsPerPage + index + 1;

      const pengusulCellContent = isBendahara
        ? `
        <td>
          <div style="color: #1e293b; font-weight: 600;">${
            item.pelaksana_manual || "-"
          }</div>
          <div class="text-muted" style="font-size: 0.8125rem; margin-top: 2px;">${
            item.pengusul_nama || ""
          }</div>
        </td>`
        : "";

      row.innerHTML = `
        <td>${globalIndex}</td>
        <td>
            <strong style="color: #1e293b;">${item.nama_kegiatan}</strong>
        </td>
        ${pengusulCellContent}
        <td class="${isPengusul ? "text-center" : ""}">${
        item.tgl_batas_lpj
          ? new Date(item.tgl_batas_lpj).toLocaleDateString("id-ID")
          : "-"
      }</td>
        <td class="text-center">
            <span id="countdown-${item.kegiatan_id}" class="${
        countdown.colorClass
      } font-semibold">
              <i class="bx bx-time me-1"></i>${countdown.text}
            </span>
        </td>
        <td class="text-center">
            <span class="badge ${statusClass}">${item.status_lpj}</span>
        </td>
        <td class="text-center">${actionButtons}</td>
      `;
      tbody.appendChild(row);
    });
  }

  function updatePaginationInfo(start, end, total) {
    const startEl = document.getElementById("startEntry");
    const endEl = document.getElementById("endEntry");
    const totalEl = document.getElementById("totalEntries");

    if (startEl) startEl.textContent = total > 0 ? start : 0;
    if (endEl) endEl.textContent = end;
    if (totalEl) totalEl.textContent = total;
  }

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
    renderTableRows();
  }

  function updateStats() {
    document.getElementById("count-all").textContent = state.kegiatan.length;
    if (isBendahara) {
      document.getElementById("count-diajukan").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Diajukan").length;
      document.getElementById("count-setor-fisik").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Setor Fisik").length;
      document.getElementById("count-revisi").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Direvisi").length;
      document.getElementById("count-selesai").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Selesai").length;
    } else if (isPengusul) {
      document.getElementById("count-menunggu").textContent =
        state.kegiatan.filter(
          (k) => k.status_lpj === "Menunggu Penyerahan"
        ).length;
      document.getElementById("count-revisi").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Direvisi").length;
      document.getElementById("count-setor-fisik").textContent =
        state.kegiatan.filter((k) => k.status_lpj === "Setor Fisik").length;
    }
  }

  function performSearch() {
    const query = state.searchQuery.toLowerCase().trim();

    if (!query) {
      state.kegiatan = [...state.allKegiatan];
      filterAndRender();
      return;
    }

    state.kegiatan = state.allKegiatan.filter((item) => {
      const namaKegiatan = (item.nama_kegiatan || "").toLowerCase();
      const pengusulNama = (item.pengusul_nama || "").toLowerCase();

      return namaKegiatan.includes(query) || pengusulNama.includes(query);
    });

    filterAndRender();
    updateStats();
  }

  function debounceSearch() {
    if (state.searchTimeout) {
      clearTimeout(state.searchTimeout);
    }
    state.searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  }

  function filterAndRender() {
    let filteredData = state.kegiatan;

    if (state.filter === "all") {
      filteredData = filteredData.filter((k) => k.status_lpj !== "Selesai");
    } else {
      filteredData = filteredData.filter((k) => k.status_lpj === state.filter);
    }
    state.currentPage = 1;
    state.filteredKegiatan = filteredData;
    renderTableRows();
  }

  function startCountdownTimers() {
    if (state.countdownInterval) clearInterval(state.countdownInterval);
    state.countdownInterval = setInterval(() => {
      state.kegiatan.forEach((item) => {
        const el = document.getElementById(`countdown-${item.kegiatan_id}`);
        if (el) {
          const countdown = calculateCountdown(item.tgl_batas_lpj);
          el.textContent = countdown.text;
          el.className = `font-semibold ${countdown.colorClass}`;
        }
      });
    }, 1000 * 60); // Update every minute
  }

  statCards.forEach((card) => {
    card.addEventListener("click", function () {
      state.filter = this.getAttribute("data-status");
      statCards.forEach((c) =>
        c.classList.replace("stat-card-active", "stat-card-inactive")
      );
      this.classList.replace("stat-card-inactive", "stat-card-active");
      filterAndRender();
    });
  });

  async function approveLpj(id) {
    Swal.fire({
      title: "Setujui LPJ?",
      text: "Anda yakin ingin menyetujui LPJ ini? Proses akan dilanjutkan ke tahap berikutnya.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(`/kegiatan/${id}/lpj/approve`, { method: "POST" });
          Swal.fire("Berhasil!", "LPJ telah disetujui.", "success");
          fetchData();
        } catch (error) {
          Swal.fire(
            "Gagal!",
            `Gagal menyetujui LPJ: ${error.message}`,
            "error"
          );
        }
      }
    });
  }

  async function completeLpj(id) {
    Swal.fire({
      title: "Setujui & Selesaikan LPJ?",
      text: "LPJ akan disetujui dan statusnya akan ditandai sebagai 'Selesai'. Anda yakin?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui & Selesaikan!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(`/kegiatan/${id}/lpj/complete`, { method: "POST" });
          Swal.fire(
            "Berhasil!",
            "LPJ telah disetujui dan diselesaikan.",
            "success"
          );
          fetchData();
        } catch (error) {
          Swal.fire(
            "Gagal!",
            `Gagal menyelesaikan LPJ: ${error.message}`,
            "error"
          );
        }
      }
    });
  }

  if (isBendahara) {
    tbody.addEventListener("click", async (event) => {
      const target = event.target.closest("button[data-action]");
      if (!target) return;

      const action = target.dataset.action;
      const id = target.dataset.id;

      if (action === "setujui") {
        await approveLpj(id);
      } else if (action === "selesaikan") {
        await completeLpj(id);
      }
    });
  }

  // Search event listeners
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearch");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      if (clearSearchBtn) {
        if (state.searchQuery.length > 0) {
          clearSearchBtn.classList.add("visible");
        } else {
          clearSearchBtn.classList.remove("visible");
        }
      }
      debounceSearch();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        state.searchQuery = "";
        if (clearSearchBtn) clearSearchBtn.classList.remove("visible");
        performSearch();
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      clearSearchBtn.classList.remove("visible");
      performSearch();
      searchInput.focus();
    });
  }

  fetchData();
}
