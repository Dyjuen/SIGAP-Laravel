// frontend/src/pages/Bendahara/Dashboard.js
import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderBendaharaDashboardPage(path, userRole) {
  const dashboardContent = `
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
        .bendahara-dashboard-page {
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

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .bendahara-dashboard-page {
        animation: fadeInUp 0.5s ease-out;
      }

      .stat-card-active,
      .stat-card-inactive {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }

      .stat-card-active::before,
      .stat-card-inactive::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
      }

      .stat-card-active:hover::before,
      .stat-card-inactive:hover::before {
        left: 100%;
      }

      .stat-card-active {
        animation-delay: 0.1s;
      }

      .stat-card-inactive:nth-of-type(2) {
        animation-delay: 0.2s;
      }

      .stat-card-inactive:nth-of-type(3) {
        animation-delay: 0.3s;
      }

      .stat-card-inactive:nth-of-type(4) {
        animation-delay: 0.4s;
      }

      .stat-card-active:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 15px 40px rgba(0, 188, 212, 0.5) !important;
      }

      .stat-card-inactive:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 15px 40px rgba(0, 188, 212, 0.35);
      }

      .stat-card-active:active,
      .stat-card-inactive:active {
        transform: translateY(-5px) scale(1.01);
      }

      .card-datatable {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 0.5s;
        margin-top: 0.5rem;
      }

      .table {
        margin-bottom: 0;
        border-collapse: collapse;
        width: 100%;
      }

      .table tbody tr {
        opacity: 0;
        animation: fadeInUp 0.4s ease-out forwards;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        /* position: relative; */
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .table thead th,
      .table tbody td {
        padding: 1rem !important;
        vertical-align: middle !important;
        border: none !important;
      }
/*
      .table tbody tr::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        background: linear-gradient(135deg, #00BCD4, #0097A7);
        transform: scaleY(0);
        transition: transform 0.3s ease;
        border-radius: 0 4px 4px 0;
      }

      .table tbody tr:hover::before {
        transform: scaleY(1);
      }
*/

      .table tbody tr:nth-child(1) { animation-delay: 0.6s; }
      .table tbody tr:nth-child(2) { animation-delay: 0.7s; }
      .table tbody tr:nth-child(3) { animation-delay: 0.8s; }
      .table tbody tr:nth-child(4) { animation-delay: 0.9s; }
      .table tbody tr:nth-child(5) { animation-delay: 1s; }

      .table tbody tr:hover {
        /* transform: translateX(4px); */
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
        background: #fafbfc;
      }

      .number-badge {
        transition: all 0.3s ease;
        display: inline-block;
      }

      .table tbody tr:hover .number-badge {
        transform: scale(1.1);
        background: #00BCD4 !important;
        color: white !important;
      }

      .btn {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }

      .btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .btn:hover::after {
        width: 300px;
        height: 300px;
      }

      .btn:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 10px 30px rgba(0, 188, 212, 0.5);
      }

      .btn:active {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 5px 15px rgba(0, 188, 212, 0.4);
      }

      /* Specific styles for btn-icon within table action cells */
      .table tbody td .btn.btn-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0; /* Override default button padding */
        flex-shrink: 0; /* Prevent buttons from shrinking below their content size */
      }
      .table tbody td .btn.btn-icon svg {
        width: 16px;
        height: 16px;
      }
      /* Adjust gap for action buttons */
      .table tbody td .d-flex.gap-2 {
        gap: 0.25rem !important; /* Reduced gap for more compact buttons */
      }

      .form-select {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .form-select:hover {
        border-color: #00BCD4;
        box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
      }

      .form-select:focus {
        transform: scale(1.03);
        box-shadow: 0 6px 20px rgba(0, 188, 212, 0.25);
        border-color: #00BCD4;
      }

      .form-check-input {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .form-check-input:hover {
        transform: scale(1.2);
        box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.2);
      }

      .badge {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      /* Ensure badges in table status column are centered */
      .table tbody td .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center; /* Ensures text inside is centered if it wraps */
      }

      .badge:hover {
        transform: scale(1.1);
      }

      .counter {
        opacity: 0;
        animation: fadeInUp 0.5s ease-out forwards;
        transition: all 0.3s ease;
      }

      .counter:hover {
        transform: scale(1.1);
        color: #00BCD4;
        text-shadow: 0 0 20px rgba(0, 188, 212, 0.5);
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      .card-datatable:hover {
        box-shadow: 0 12px 40px rgba(0, 188, 212, 0.2);
      }

      .pagination-container {
        transition: all 0.3s ease;
      }

      .pagination-container:hover {
        background: #f8fafb !important;
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
      
      .table {
        width: 100%;
        border-collapse: collapse !important;
      }
      
      .table thead th {
        padding: 1rem !important;
        vertical-align: middle !important;
      }
      
      
      .stat-card-filter {
        cursor: pointer;
      }

      .video-placeholder {
        background: #000;
        border-radius: 12px;
        height: 200px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      /* Responsive Layout Switching */
      .desktop-layout {
        display: flex;
      }
      .mobile-layout {
        display: none;
      }

      /* Mobile breakpoint - switches to dropdown */
      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .desktop-layout {
          display: none;
        }
        .mobile-layout {
          display: block;
        }
        
        .bendahara-dashboard-page {
            padding: 1rem;
        }
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
        }
        .card-datatable .d-flex.justify-content-between {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start !important;
        }
        .card-datatable .d-flex.gap-2 {
            width: 100%;
        }
        #filterStatus {
            width: 100% !important;
        }
      }
    </style>

    <div class="bendahara-dashboard-page">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Dashboard Bendahara</h2>
          <p>Monitoring Pencairan & LPJ</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-3">
        <div class="col-sm-6 col-xl">
          <div class="card stat-card-inactive stat-card-filter" data-filter="waiting">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Pencairan</span>
                  <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Menunggu</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2 counter" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="waitingCount" data-target="0">0</h1>
                    <small style="font-size: 15px; font-weight: 500; color: white !important;">Kegiatan</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl">
          <div class="card stat-card-inactive stat-card-filter" data-filter="disbursed">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Pencairan</span>
                  <h4 class="mb-3 mt-1 whitespace-nowrap" style="font-size: 20px; font-weight: 600;">Sudah Dicairkan</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2 counter" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="disbursedCount" data-target="0">0</h1>
                    <small style="font-size: 15px; font-weight: 500; opacity: 0.8;">Kegiatan</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl">
          <div class="card stat-card-inactive">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Total Anggaran</span>
                  <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Dicairkan</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2" style="font-size: 32px; font-weight: 700; letter-spacing: -1px;" id="totalDisbursed">0</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl">
          <div class="card stat-card-inactive">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Total Anggaran</span>
                  <h4 class="mb-3 mt-1 whitespace-nowrap" style="font-size: 20px; font-weight: 600;">Belum Dicairkan</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2" style="font-size: 32px; font-weight: 700; letter-spacing: -1px;" id="totalUndisbursed">0</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 col-xl">
          <div class="card stat-card-inactive stat-card-filter" data-filter="lpj_submitted">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">LPJ</span>
                  <h4 class="mb-3 mt-1 whitespace-nowrap" style="font-size: 20px; font-weight: 600;">Perlu Verifikasi</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2 counter" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="lpjCount" data-target="0">0</h1>
                    <small style="font-size: 15px; font-weight: 500; opacity: 0.8;">LPJ</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="card card-datatable">
        <div class="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h3 class="text-xl font-bold text-gray-800 mb-0">Kegiatan Siap Dicairkan</h3>
          <div class="d-flex gap-2">
            <select id="filterStatus" class="form-select form-select-sm" style="width: 200px;">
              <option value="all">Semua Status</option>
              <option value="waiting">Menunggu Pencairan</option>
              <option value="disbursed">Sudah Dicairkan</option>
              <option value="lpj_submitted">LPJ Diajukan</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th class="whitespace-nowrap" style="width: 4%; text-align: center; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">No</th>
              <th style=" text-align: left; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Nama Kegiatan</th>
              <th style="text-align: left; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Pengusul</th>
              <th style="text-align: left; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Uang Diminta</th>
              <th style="text-align: left; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Uang Dicairkan</th>
              <th style="text-align: center; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Status</th>
              <th style="text-align: center; background: #f8fafb; font-weight: 600; color: #475569; font-size: 0.875rem; border-bottom: 2px solid #e2e8f0;">Aksi</th>
            </tr>
          </thead>
          <tbody id="disbursementTableBody">
            <!-- Data will be populated by JavaScript -->
          </tbody>
        </table>
        </div>
        
        <!-- Pagination Container -->
        <div class="pagination-container" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-top: 1px solid #f1f5f9; background: white;">
          <div class="pagination-info" style="color: #6B7280; font-size: 14px;">
            Menampilkan <span id="startEntry">0</span> sampai <span id="endEntry">0</span> dari <span id="totalEntries">0</span> entri
          </div>
          <ul class="pagination" id="paginationList">
            <!-- Will be populated by JavaScript -->
          </ul>
        </div>
      </div>

      <!-- Video Panduan Section -->
      <div class="mt-4">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title mb-0">Video Panduan</h4>
          </div>
          <div class="card-body">
            <div class="row g-4" id="videoList">
               <div class="col-12 text-center text-muted py-4">Memuat video...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(dashboardContent, userRole);

  // ==============================================
  // STATE
  // ==============================================
  let state = {
    allKegiatan: [],
    displayKegiatan: [],
    currentFilter: "all",
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  };

  // ==============================================
  // API FUNCTIONS
  // ==============================================
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
      if (data.success !== true) {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async function fetchKegiatan() {
    const tbody = document.getElementById("disbursementTableBody");
    tbody.innerHTML = window.createTableLoadingRow
      ? window.createTableLoadingRow(7, "Memuat data pencairan...")
      : '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
    try {
      const response = await apiRequest("/kegiatan");
      const kegiatanData = response.data.data
        ? response.data.data
        : response.data;
      state.allKegiatan = kegiatanData || [];

      // Calculate stats from fetched data
      calculateAndUpdateStats();

      applyFilter();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="y" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }

  function calculateAndUpdateStats() {
    // Count based on approval status
    let waitingCount = 0;
    let disbursedCount = 0;
    let lpjCount = 0;
    let totalDisbursedAmount = 0;
    let totalUndisbursedAmount = 0;

    console.log("[BENDAHARA] All kegiatan data:", state.allKegiatan); // Debug - lihat struktur data

    state.allKegiatan.forEach((k) => {
      const totalAnggaran = parseFloat(k.total_anggaran_diusulkan || 0); // FIXED: Use correct field name

      console.log(
        `[BENDAHARA] Kegiatan: ${k.nama_kegiatan}, Anggaran: ${totalAnggaran}, Current Approval:`,
        k.current_approval,
        "Approvals:",
        k.approvals
      ); // Debug

      // Menunggu Pencairan: Bendahara-Cair step is Active
      const isWaitingDisbursement =
        k.current_approval?.approval_level === "Bendahara-Cair" &&
        k.current_approval?.status === "Aktif";

      // Sudah Dicairkan: Bendahara-Cair step is Disetujui
      const isDisbursed = k.approvals?.some(
        (a) => a.approval_level === "Bendahara-Cair" && a.status === "Disetujui"
      );

      if (isWaitingDisbursement) {
        waitingCount++;
        totalUndisbursedAmount += totalAnggaran;
        console.log(`  → MENUNGGU: +${totalAnggaran}`); // Debug
      }

      if (isDisbursed) {
        disbursedCount++;
        totalDisbursedAmount += totalAnggaran;
        console.log(`  → DICAIRKAN: +${totalAnggaran}`); // Debug
      }

      // LPJ Perlu Verifikasi: Bendahara-LPJ step is Active AND LPJ has been submitted
      if (
        k.current_approval?.approval_level === "Bendahara-LPJ" &&
        k.current_approval?.status === "Aktif" &&
        k.lpj_submitted_at
      ) {
        lpjCount++;
      }
    });

    console.log("[BENDAHARA STATS] Final:", {
      waitingCount,
      disbursedCount,
      lpjCount,
      totalDisbursedAmount,
      totalUndisbursedAmount,
    }); // Debug

    const stats = {
      total_pencairan_menunggu: waitingCount,
      total_pencairan_dicairkan: disbursedCount,
      total_lpj_verifikasi: lpjCount,
      total_anggaran_dicairkan: totalDisbursedAmount,
      total_anggaran_belum_dicairkan: totalUndisbursedAmount,
    };

    updateStatsUI(stats);
  }

  function applyFilter() {
    const filter = state.currentFilter;

    if (filter === "all") {
      // Show all activities where PPK and Wadir have approved (ready for Bendahara or already processed)
      state.displayKegiatan = state.allKegiatan.filter((k) => {
        const ppkApproval = k.approvals?.find(
          (a) => a.approval_level === "PPK"
        );
        const wadirApproval = k.approvals?.find(
          (a) => a.approval_level === "Wadir2"
        );
        return (
          ppkApproval?.status === "Disetujui" &&
          wadirApproval?.status === "Disetujui"
        );
      });
    } else if (filter === "waiting") {
      // Waiting for Disbursement: Bendahara-Cair step is Active
      state.displayKegiatan = state.allKegiatan.filter((k) => {
        return (
          k.current_approval?.approval_level === "Bendahara-Cair" &&
          k.current_approval?.status === "Aktif"
        );
      });
    } else if (filter === "disbursed") {
      // Already Disbursed: Bendahara-Cair step is Disetujui
      state.displayKegiatan = state.allKegiatan.filter((k) => {
        return k.approvals?.some(
          (a) =>
            a.approval_level === "Bendahara-Cair" && a.status === "Disetujui"
        );
      });
    } else if (filter === "lpj_submitted") {
      // LPJ submitted, waiting for verification
      state.displayKegiatan = state.allKegiatan.filter((k) => {
        return (
          k.current_approval?.approval_level === "Bendahara-LPJ" &&
          k.current_approval?.status === "Aktif" &&
          k.lpj_submitted_at // Only show if LPJ has been submitted
        );
      });
    }

    state.currentPage = 1;
    renderTableRows(state.displayKegiatan);
    updateActiveFilterVisuals();
  }

  async function viewDisbursementDetails(kegiatanId) {
    try {
      const response = await apiRequest(`/kegiatan/${kegiatanId}`);
      const kegiatan = response.data;

      const disbursementDate = kegiatan.disbursement_date
        ? new Date(kegiatan.disbursement_date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-";

      // Check if disbursed based on approval status
      const isDisbursed = kegiatan.approvals?.some(
        (a) => a.approval_level === "Bendahara-Cair" && a.status === "Disetujui"
      );

      Swal.fire({
        title: "Detail Pencairan",
        html: `
          <div class="text-start">
            <table class="table table-borderless">
              <tr>
                <td><strong>Nama Kegiatan:</strong></td>
                <td>${kegiatan.nama_kegiatan}</td>
              </tr>
              <tr>
                <td><strong>Pengusul:</strong></td>
                <td>${kegiatan.pengusul_nama}</td>
              </tr>
              <tr>
                <td><strong>Total Anggaran:</strong></td>
                <td>${formatCurrency(
                  kegiatan.total_anggaran_diusulkan || 0
                )}</td>
              </tr>
              <tr>
                <td><strong>Tanggal Pencairan:</strong></td>
                <td>${disbursementDate}</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td>${
                  isDisbursed
                    ? '<span class="badge bg-success">Sudah Dicairkan</span>'
                    : '<span class="badge bg-warning">Menunggu Pencairan</span>'
                }</td>
              </tr>
            </table>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#00BCD4",
      });
    } catch (error) {
      showError(`Gagal mengambil detail: ${error.message}`);
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
  // RENDER FUNCTIONS
  // ==============================================
  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function renderTableRows(data) {
    const tbody = document.getElementById("disbursementTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data || data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center">Tidak ada data kegiatan.</td></tr>';
      updatePaginationInfo(0, 0, 0);
      return;
    }

    // Pagination Logic
    state.totalPages = Math.ceil(data.length / state.itemsPerPage);
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(
      state.currentPage * state.itemsPerPage,
      data.length
    );

    updatePaginationInfo(startEntry, endEntry, data.length);
    setupPagination();

    const paginatedData = data.slice(
      (state.currentPage - 1) * state.itemsPerPage,
      state.currentPage * state.itemsPerPage
    );

    paginatedData.forEach((kegiatan, index) => {
      const row = document.createElement("tr");
      // Calculate global index
      const globalIndex =
        (state.currentPage - 1) * state.itemsPerPage + index + 1;

      let statusBadge = "";
      let actionButtons = "";

      // Determine status
      const isDisbursed = kegiatan.approvals?.some(
        (a) => a.approval_level === "Bendahara-Cair" && a.status === "Disetujui"
      );
      const isLpjVerification =
        kegiatan.current_approval?.approval_level === "Bendahara-LPJ" &&
        kegiatan.current_approval?.status === "Aktif";

      if (isLpjVerification) {
        if (!kegiatan.lpj_submitted_at) {
          statusBadge =
            '<span class="badge bg-label-secondary" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">Menunggu Penyerahan LPJ</span>';
          actionButtons = `<span class="text-muted" style="font-size: 0.875rem;"></span>`;
        } else {
          statusBadge =
            '<span class="badge bg-label-info" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">Verifikasi LPJ</span>';
          actionButtons = `
            <div class="d-flex justify-content-center gap-2">
              <a href="/bendahara/kegiatan/lpj/revisi/${kegiatan.kegiatan_id}" class="btn btn-sm btn-icon" style="background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%); color: white; box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3);" title="Verifikasi LPJ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path><path d="M9 15l2 2l4 -4"></path></svg>
              </a>
            </div>
          `;
        }
      } else if (isDisbursed) {
        statusBadge =
          '<span class="badge bg-label-success" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">Dicairkan</span>';
        actionButtons = `
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-icon btn-view-detail" data-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);" title="Detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn btn-sm btn-icon btn-preview-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);" title="KAK PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </button>
              <button class="btn btn-sm btn-icon btn-download-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);" title="Unduh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
          `;
      } else {
        statusBadge =
          '<span class="badge bg-label-warning" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">Menunggu</span>';
        actionButtons = `
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-icon btn-view-detail" data-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);" title="Detail">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
              <button class="btn btn-sm btn-icon btn-preview-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);" title="KAK PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </button>
              <a href="/bendahara/kegiatan/pencairan" class="btn btn-sm btn-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);" title="Cairkan Dana">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </a>
              <button class="btn btn-sm btn-icon btn-download-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);" title="Unduh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
          `;
      }

      row.innerHTML = `
        <td style=" text-align: center;">
          <span style="font-weight: 600; color: #64748b; font-size: 0.875rem;">${globalIndex}</span>
        </td>
        <td style=" text-align: left;">
          <strong style="color: #1e293b;">${kegiatan.nama_kegiatan}</strong>
        </td>
        <td style=" text-align: left;">
          <div style="color: #1e293b; font-weight: 600;">${
            kegiatan.pelaksana_manual || "-"
          }</div>
          <div class="text-muted" style="font-size: 0.8125rem; margin-top: 2px;">${
            kegiatan.pengusul_nama || ""
          }</div>
        </td>
        <td style=" text-align: left;">
          <strong style="color: #00BCD4;">${formatCurrency(
            kegiatan.total_anggaran_diusulkan || 0
          )}</strong>
        </td>
        <td style=" text-align: left;">
          <strong style="color: #059669;">${formatCurrency(
            kegiatan.dana_dicairkan || 0
          )}</strong>
        </td>
        
        <td style=" text-align: center;">
          ${statusBadge}
        </td>
        <td style=" text-align: center;">
          ${actionButtons}
        </td>
      `;

      tbody.appendChild(row);
    });

    attachEventListeners();
  }

  // ==============================================
  // EVENT LISTENERS
  // ==============================================
  function attachEventListeners() {
    // Re-attach event listeners for dynamically created buttons in table rows
    document.querySelectorAll(".btn-view-detail").forEach((btn) => {
      btn.addEventListener("click", () =>
        viewDisbursementDetails(btn.dataset.id)
      );
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

  // Initialize stat card filters ONCE on page load
  function initializeStatCardFilters() {
    document.querySelectorAll(".stat-card-filter").forEach((card) => {
      card.addEventListener("click", () => {
        const filterValue = card.dataset.filter;

        console.log("[BENDAHARA] Card clicked, filter:", filterValue); // Debug

        // Simply set the filter to the clicked card's value
        // Don't toggle - always apply the clicked filter
        // New logic to toggle filter off if active card is clicked again
        if (filterValue === state.currentFilter) {
          state.currentFilter = "all"; // Deactivate filter
        } else {
          state.currentFilter = filterValue; // Activate new filter
        }

        applyFilter();
        updateActiveFilterVisuals();
      });
    });

    const filterSelect = document.getElementById("filterStatus");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        state.currentFilter = e.target.value;
        applyFilter();
        updateActiveFilterVisuals();
      });
    }
  }

  function updateActiveFilterVisuals() {
    const filterValue = state.currentFilter;

    const filterSelect = document.getElementById("filterStatus");
    if (filterSelect) {
      filterSelect.value = filterValue;
    }

    document.querySelectorAll(".stat-card-filter").forEach((card) => {
      if (card.dataset.filter === filterValue) {
        card.classList.add("stat-card-active");
        card.classList.remove("stat-card-inactive");
      } else {
        card.classList.remove("stat-card-active");
        card.classList.add("stat-card-inactive");
      }
    });
  }

  async function fetchSummaryStats() {
    try {
      const response = await apiRequest("/dashboard/summary");
      const stats = response.data;
      updateStatsUI(stats);
    } catch (error) {
      console.error("Failed to fetch summary stats:", error);
    }
  }

  function updateStatsUI(stats) {
    const waitingEl = document.getElementById("waitingCount");
    const disbursedEl = document.getElementById("disbursedCount");
    const lpjEl = document.getElementById("lpjCount");
    const totalDisbursedEl = document.getElementById("totalDisbursed");
    const totalUndisbursedEl = document.getElementById("totalUndisbursed");

    if (waitingEl) {
      waitingEl.setAttribute(
        "data-target",
        stats.total_pencairan_menunggu || 0
      );
      waitingEl.textContent = "0";
    }
    if (disbursedEl) {
      disbursedEl.setAttribute(
        "data-target",
        stats.total_pencairan_dicairkan || 0
      );
      disbursedEl.textContent = "0";
    }
    if (lpjEl) {
      lpjEl.setAttribute("data-target", stats.total_lpj_verifikasi || 0);
      lpjEl.textContent = "0";
    }

    // Format currency for total anggaran
    if (totalDisbursedEl) {
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.total_anggaran_dicairkan || 0);
      totalDisbursedEl.textContent = formatted;
    }

    if (totalUndisbursedEl) {
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.total_anggaran_belum_dicairkan || 0);
      totalUndisbursedEl.textContent = formatted;
    }

    // Trigger counter animations
    setTimeout(() => {
      initCounters();
    }, 100);
  }

  function showError(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonColor: "#00BCD4",
    });
  }

  function showSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      timer: 2000,
      showConfirmButton: false,
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
    renderTableRows(state.displayKegiatan);
  }

  // ==============================================
  // ANIMATION FUNCTIONS
  // ==============================================
  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target"));
    if (isNaN(target)) return;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    setTimeout(() => {
      updateCounter();
    }, 500);
  }

  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach((counter, index) => {
      setTimeout(() => {
        animateCounter(counter);
      }, index * 100);
    });
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  fetchKegiatan(); // This will also calculate stats from data
  fetchVideos();

  // Initialize stat card filter event listeners ONCE
  initializeStatCardFilters();

  setTimeout(() => {
    initCounters();
  }, 100);

  async function fetchVideos() {
    try {
      // Use common dashboard endpoint like Pengusul
      const response = await apiRequest("/dashboard/video");
      if (response.success && response.data) {
        renderVideos(response.data);
      } else {
        renderVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      renderVideos([]);
    }
  }

  function renderVideos(videos) {
    const container = document.getElementById("videoList");
    if (!container) return;

    container.innerHTML = "";
    if (!videos || videos.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted py-4">Belum ada video panduan.</div>`;
      return;
    }

    videos.forEach((video) => {
      // Use path_media from database
      let videoUrl = video.path_media || video.url || "";
      let embedUrl = videoUrl;

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
}
