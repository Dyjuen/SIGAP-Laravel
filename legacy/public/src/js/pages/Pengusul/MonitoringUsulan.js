// frontend/src/pages/Pengusul/MonitoringUsulan.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderMonitoringUsulanPage(path, userRole) {
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
        .monitoring-usulan-page {
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

      /* ========================================== */
      /* KEYFRAME ANIMATIONS */
      /* ========================================== */
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

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
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

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
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

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes statusPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @keyframes borderFlow {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
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

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ========================================== */
      /* BASE STYLES WITH ANIMATIONS */
      /* ========================================== */
      .monitoring-usulan-page {
        animation: fadeIn 0.5s ease-out;
      }

      /* ========================================== */
      /* SEARCH AND ACTION SECTION STYLES */
      /* ========================================== */
      .search-and-action-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        gap: 1rem; /* Adjust gap as needed */
        opacity: 0;
        animation: slideInLeft 0.6s ease-out forwards;
        animation-delay: 0.1s;
      }

      .search-and-action-section .search-section {
        flex-grow: 1;
        margin-bottom: 0; /* Reset margin as it's handled by parent gap */
      }

      /* ========================================== */
      /* SEARCH BAR STYLES */
      /* ========================================== */
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

      /* ========================================== */
      /* BUTTON STYLES */
      /* ========================================== */
      .btn-ajukan-usulan {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(5, 156, 216, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      
      .btn-ajukan-usulan::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      
      .btn-ajukan-usulan:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 156, 216, 0.4);
      }
      
      .btn-ajukan-usulan:hover::before {
        width: 300px;
        height: 300px;
      }
      
      .btn-ajukan-usulan:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3);
      }
      
      .btn-ajukan-usulan svg {
        transition: transform 0.3s ease;
      }
      
      .btn-ajukan-usulan:hover svg {
        transform: translateX(3px);
      }

      /* Button Variants */
      .btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        cursor: pointer;
        font-weight: 600;
      }

      .btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .btn:hover::before {
        width: 300px;
        height: 300px;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-primary {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3);
      }

      .btn-edit-profile {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3);
        padding: 0.5rem;
        border-radius: 6px;
      }

      .btn-delete {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        padding: 0.5rem;
        border-radius: 6px;
      }

      .btn-download {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(5, 156, 216, 0.3);
        padding: 0.5rem 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 6px;
      }

      .btn-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0;
      }

      /* ========================================== */
      /* TABLE CARD */
      /* ========================================== */
      .card-datatable {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 0.2s;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .card-datatable::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        animation: shimmer 3s infinite;
        pointer-events: none;
        z-index: 0;
      }

      .card-datatable:hover {
        box-shadow: 0 10px 30px rgba(0, 188, 212, 0.15);
      }

      /* ========================================== */
      /* TABLE STYLES */
      /* ========================================== */
      .table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 0.75rem;
        padding: 0 1.5rem;
      }

      .table thead th {
        color: #00BCD4;
        font-weight: 600;
        font-size: 14px;
        padding: 1rem;
        text-align: left;
        border-bottom: 2px solid #E0F2FE;
        background: transparent;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .table tbody tr {
        background: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        animation: slideUp 0.5s ease-out forwards;
      }

      .table tbody tr:nth-child(1) { animation-delay: 0.3s; }
      .table tbody tr:nth-child(2) { animation-delay: 0.4s; }
      .table tbody tr:nth-child(3) { animation-delay: 0.5s; }
      .table tbody tr:nth-child(4) { animation-delay: 0.6s; }
      .table tbody tr:nth-child(5) { animation-delay: 0.7s; }
      .table tbody tr:nth-child(6) { animation-delay: 0.8s; }
      .table tbody tr:nth-child(7) { animation-delay: 0.9s; }
      .table tbody tr:nth-child(8) { animation-delay: 1s; }
      .table tbody tr:nth-child(9) { animation-delay: 1.1s; }
      .table tbody tr:nth-child(10) { animation-delay: 1.2s; }

      .table tbody tr:hover {
        background: linear-gradient(to right, #F0F9FF, transparent);
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.1);
      }

      .table tbody td {
        padding: 1rem;
        border-bottom: 1px solid #F3F4F6;
        vertical-align: middle;
      }

      /* ========================================== */
      /* CHECKBOX STYLES */
      /* ========================================== */
      .form-check-input {
        width: 20px;
        height: 20px;
        border: 2px solid #D1D5DB;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .form-check-input:hover {
        border-color: #00BCD4;
        transform: scale(1.1);
      }

      .form-check-input:checked {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        border-color: #00BCD4;
      }

      /* ========================================== */
      /* NUMBER BADGE */
      /* ========================================== */
      .number-badge {
        display: inline-block;
        background: transparent;
        color: #374151;
        padding: 4px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .table tbody tr:hover .number-badge {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(5, 156, 216, 0.4);
      }

      /* ========================================== */
      /* STATUS BADGE */
      /* ========================================== */
      .badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        min-width: 85px;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: statusPulse 2s ease-in-out infinite;
      }

      .badge:hover {
        transform: scale(1.1);
        animation: pulse 0.5s ease-in-out;
      }

      .bg-label-dark {
        background: linear-gradient(135deg, #818181ff 0%, #b4b4b4ff 100%);
        color: white;
      }

      .bg-label-warning {
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        color: white;
      }

      .bg-label-success {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
      }

      .bg-label-danger {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
      }

      .bg-label-info {
        background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
        color: white;
      }

      /* ========================================== */
      /* PAGINATION */
      /* ========================================== */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 1.3s;
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

      /* ========================================== */
      /* LOADING STATE */
      /* ========================================== */
      @keyframes skeletonLoading {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: skeletonLoading 1.5s ease-in-out infinite;
        border-radius: 4px;
      }

      /* ========================================== */
      /* ACTION BUTTONS IN TABLE */
      /* ========================================== */
      .table tbody td .btn {
        margin-right: 0.5rem;
      }

      .table tbody td .btn:last-child {
        margin-right: 0;
      }

      .table tbody td .btn svg {
        transition: transform 0.3s ease;
      }

      .table tbody td .btn:hover svg {
        transform: scale(1.2);
      }

      /* ========================================== */
      /* RESPONSIVE */
      /* ========================================== */
      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .table-responsive {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 10px;
        }
        .table-responsive::-webkit-scrollbar {
          display: block;
          height: 6px;
          background: #f1f5f9;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .dashboard-header .flex.gap-3 {
          width: 100%;
          flex-direction: column;
        }
        .btn {
          width: 100%;
          justify-content: center;
        }
        .grid-cols-4 {
          grid-template-columns: 1fr;
        }
        .pengusul-dashboard-page {
            padding: 1rem;
        }
        .monitoring-usulan-page {
            padding: 1rem;
        }
      }

      /* ========================================== */
      /* UTILITY ANIMATIONS */
      /* ========================================== */
      .text-muted {
        color: #6B7280;
      }

      .text-center {
        text-align: center;
      }

      .text-danger {
        color: #EF4444;
      }

      strong {
        font-weight: 600;
        color: #1F2937;
      }

      .small {
        font-size: 13px;
        color: #9CA3AF;
      }
    </style>

    <div class="monitoring-usulan-page">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Pemantauan Usulan</h2>
          <p>Kelola dan pantau status usulan kegiatan Anda</p>
        </div>
      </div>

      <!-- Search and Action Section -->
      <div class="search-and-action-section">
        <div class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="searchInput" 
              class="search-input" 
              placeholder="Cari nama kegiatan atau pengusul..."
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
        <button class="btn-ajukan-usulan" id="btnAjukanUsulan">
          <svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Ajukan Usulan
        </button>
      </div>
      
      <!-- Main Table Card -->
      <div class="card card-datatable table-responsive p-0">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 80px;">No.</th>
              <th>Nama Usulan Kegiatan</th>
              <th>Tanggal Diajukan</th>
              <th style="text-align: center;">Status</th>
              <th style="width: 100px; text-align: center;">Dokumen</th>
              <th style="text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody id="monitoringTableBody">
            <!-- Data will be populated by JavaScript -->
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Menampilkan <span id="startEntry">1</span> sampai <span id="endEntry">10</span> dari <span id="totalEntries">0</span> entri
          </div>
          <ul class="pagination" id="paginationList">
            <!-- Will be populated by JavaScript -->
          </ul>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // ==============================================
  // STATE
  // ==============================================
  let state = {
    activities: [],
    filteredActivities: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalEntries: 0,
    totalPages: 1,
    searchQuery: '',
    searchTimeout: null,
  };

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
      
      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
      }
      
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

  async function fetchKak() {
    const tbody = document.getElementById("monitoringTableBody");
    if (!tbody) return;

    // Show loading skeleton
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem;">
          <div class="skeleton" style="height: 20px; margin: 0.5rem 0;"></div>
          <div class="skeleton" style="height: 20px; margin: 0.5rem 0;"></div>
          <div class="skeleton" style="height: 20px; margin: 0.5rem 0;"></div>
        </td>
      </tr>
    `;

    let url = `/kak?status=1,2,5`;

    const user = JSON.parse(localStorage.getItem("auth_user"));
    if (user) {
      url += `&pengusul_user_id=${user.user_id}`;
    }

    if (state.searchQuery) {
      url += `&search=${state.searchQuery}`;
    }

    try {
      const response = await apiRequest(url);
      state.activities = response.data;
      state.activities.sort((a, b) => a.kak_id - b.kak_id);
      state.filteredActivities = state.activities;
      state.totalEntries = state.filteredActivities.length;
      state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
      renderTableRows(state.filteredActivities);
      updatePagination();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }

  async function submitForVerification(id) {
    // SweetAlert2 confirmation (replace native confirm)
    const confirmed = await confirmAction(
      "Ajukan untuk Verifikasi?",
      "Apakah Anda yakin ingin mengajukan usulan ini untuk verifikasi?"
    );

    if (!confirmed) return;

    Swal.fire({
      title: 'Mengajukan Usulan...', 
      text: 'Harap tunggu, sistem sedang memproses permintaan Anda.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await apiRequest(`/kak/${id}/submit`, { method: "POST" });

      // SweetAlert2 success modal will replace the loader
      showSuccess("Usulan berhasil diajukan.");

      fetchKak(); // Refresh data
    } catch (error) {
      console.error("Submission Error:", error);

      // SweetAlert2 error modal will replace the loader
      showError(`Gagal mengajukan usulan: ${error.message}`);
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
      1: { class: "bg-label-dark", text: "Draft" },
      2: { class: "bg-label-warning", text: "Diajukan" },
      3: { class: "bg-label-success", text: "Disetujui" },
      4: { class: "bg-label-danger", text: "Ditolak" },
      5: { class: "bg-label-info", text: "Revisi" },
      Default: { class: "bg-label-dark", text: "Tidak Diketahui" },
    };
    return statusMap[statusId] || statusMap["Default"];
  }

  function getActionButtons(statusId, id, activityName) {
    let buttons = '';
    
    switch (statusId) {
      case 1: // Draft
      case 5: // Revisi
        buttons = `
          <button class="btn btn-sm btn-icon btn-ajukan" data-id="${id}" title="${statusId === 1 ? 'Ajukan' : 'Ajukan Ulang'}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
          <button class="btn btn-sm btn-icon btn-edit-profile" data-id="${id}" data-status="${statusId}" title="Edit" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-sm btn-icon btn-delete" data-id="${id}" data-name="${activityName}" title="Hapus" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        `;
        break;
      case 2: // Sedang Diverifikasi
      case 3: // Disetujui
        buttons = `
          <button class="btn btn-sm btn-icon btn-detail" data-id="${id}" title="Lihat Detail" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        `;
        break;
      case 4: // Ditolak
        buttons = `
          <button class="btn btn-sm btn-icon btn-edit-profile" data-id="${id}" data-status="${statusId}" title="Edit" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-sm btn-icon btn-delete" data-id="${id}" data-name="${activityName}" title="Hapus" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        `;
        break;
      default:
        return `<span class="text-muted">-</span>`;
    }

    return `
      <div class="d-flex justify-content-center gap-2">
        ${buttons}
      </div>
    `;
  }

  // Function untuk render tombol Dokumen (Preview & Download)
  function getDocumentButtons(id) {
    return `
      <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
        <button class="btn btn-sm btn-icon btn-preview" data-id="${id}" title="Pratinjau PDF" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v4.5" /><path d="M16.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /><path d="M18.5 19.5l2.5 2.5" /></svg>
        </button>
        <button class="btn btn-sm btn-icon btn-download" data-id="${id}" title="Unduh PDF" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
        </button>
      </div>
    `;
  }

  // ==============================================
  // RENDER FUNCTIONS
  // ==============================================
  function renderTableRows(data) {
    const tbody = document.getElementById("monitoringTableBody");
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; display: block;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p style="color: #9CA3AF; font-size: 16px; margin: 0;">Tidak ada data usulan.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    const paginatedData = data.slice(
      (state.currentPage - 1) * state.itemsPerPage,
      state.currentPage * state.itemsPerPage
    );

    paginatedData.forEach((activity, index) => {
      const statusId = activity.status_id;
      const statusBadge = getStatusBadge(statusId);
      const actionButtons = getActionButtons(statusId, activity.kak_id, activity.nama_kegiatan);
      const documentButtons = getDocumentButtons(activity.kak_id);

      // Calculate global index for numbering (1-based, continuous across pages)
      const globalIndex =
        (state.currentPage - 1) * state.itemsPerPage + index + 1;

      const row = document.createElement("tr");
      row.style.animationDelay = `${0.3 + index * 0.1}s`;
      row.innerHTML = `
        <td>
          <span class="number-badge">${globalIndex}</span>
        </td>
        <td>
          <strong>${activity.nama_kegiatan || "Tanpa Judul"}</strong>
          <div class="small">${activity.pengusul_nama || "Tanpa Pengusul"}</div>
        </td>
        <td>
          <div>${formatDate(activity.created_at)}</div>
        </td>
        <td style="text-align: center;">
          <span class="badge ${statusBadge.class}">${statusBadge.text}</span>
        </td>
        <td style="text-align: center;">
          ${documentButtons}
        </td>
        <td style="text-align: center;">
          ${actionButtons}
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
      state.filteredActivities = state.activities;
    } else {
      state.filteredActivities = state.activities.filter(activity => {
        const namaKegiatan = (activity.nama_kegiatan || '').toLowerCase();
        const pengusulNama = (activity.pengusul_nama || '').toLowerCase();
        return namaKegiatan.includes(state.searchQuery) || pengusulNama.includes(state.searchQuery);
      });
    }
    
    state.currentPage = 1;
    state.totalEntries = state.filteredActivities.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    
    renderTableRows(state.filteredActivities);
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
    // Search input
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        
        // Show/hide clear button
        if (clearSearch) {
          if (query.length > 0) {
            clearSearch.classList.add('visible');
          } else {
            clearSearch.classList.remove('visible');
          }
        }
        
        debounceSearch(query);
      });
      
      // Clear on Escape key
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

    // Button Ajukan Usulan
    const btnAjukanUsulan = document.getElementById("btnAjukanUsulan");
    if (btnAjukanUsulan) {
      btnAjukanUsulan.addEventListener("click", function (event) {
        addRippleEffect(this, event);
        setTimeout(() => {
          window.location.pathname = "/pengusul/usulan/new";
        }, 300);
      });
    }

    const selectAll = document.getElementById("selectAll");
    if (selectAll) {
      selectAll.addEventListener("change", function () {
        document
          .querySelectorAll(".row-checkbox")
          .forEach((cb) => (cb.checked = this.checked));
      });
    }

    document.querySelectorAll(".row-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", updateSelectAll);
    });

    document.querySelectorAll(".btn-ajukan").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        addRippleEffect(this, e);
        const id = this.getAttribute("data-id");
        submitForVerification(id);
      });
    });

    document.querySelectorAll(".btn-edit-profile").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        addRippleEffect(this, e);
        const id = this.getAttribute("data-id");
        const status = this.getAttribute("data-status");

        setTimeout(() => {
          if (status === "5") {
            window.location.href = `/pengusul/usulan/revisi/${id}`;
          } else {
            window.location.pathname = `/pengusul/usulan/${id}`;
          }
        }, 300);
      });
    });

    document.querySelectorAll(".btn-detail").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        addRippleEffect(this, e);
        const id = this.getAttribute("data-id");
        
        setTimeout(() => {
          window.location.pathname = `/pengusul/riwayat/detail/${id}`;
        }, 300);
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        addRippleEffect(this, e);
        const activityId = this.getAttribute("data-id");
        const activityName = this.getAttribute("data-name");

        const confirmed = await confirmAction(
          "Yakin ingin menghapus?",
          `Kegiatan "${activityName}" akan dihapus secara permanen.`
        );

        if (confirmed) {
          try {
            await apiRequest(`/kak/${activityId}`, { method: "DELETE" });
            showSuccess(`Berhasil menghapus kegiatan "${activityName}"`);
            fetchKak();
          } catch (error) {
            showError(`Gagal menghapus kegiatan: ${error.message}`);
          }
        }
      });
    });

    document.querySelectorAll(".btn-download").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent default link behavior
        addRippleEffect(this, e);
        const id = this.getAttribute("data-id");
        
        try {
          showNotification("Membuat link download...", "info");
          
          console.log("Requesting download token for KAK ID:", id);
          
          // Request temporary download token from backend
          const response = await apiRequest(`/kak/${id}/generate-download-token`, {
            method: "POST"
          });
          
          console.log("Token response:", response);
          
          if (response.success) {
            const tempToken = response.data.download_token;
            
            console.log("Temp token generated:", tempToken);
            
            // Open download URL with temporary token (expires in 1 minute)
            setTimeout(() => {
              const downloadUrl = `/api/kak/${id}?t=${tempToken}`;
              console.log("Opening download URL:", downloadUrl);
              window.open(downloadUrl, "_blank");
              showNotification("Download dimulai!", "success");
            }, 300);
          } else {
            console.error("Failed response:", response);
            showError("Gagal membuat link download: " + response.message);
          }
        } catch (error) {
          console.error("Download error:", error);
          showError("Gagal mengunduh KAK: " + error.message);
        }
      });
    });

    // Event handler for Preview button
    document.querySelectorAll(".btn-preview").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        addRippleEffect(this, e);
        const id = this.getAttribute("data-id");
        
        try {
          showNotification("Membuat link preview...", "info");
          
          console.log("Requesting preview token for KAK ID:", id);
          
          // Request temporary preview token from backend
          const response = await apiRequest(`/kak/${id}/generate-download-token`, {
            method: "POST"
          });
          
          console.log("Token response:", response);
          
          if (response.success) {
            const tempToken = response.data.download_token;
            
            console.log("Temp token generated:", tempToken);
            
            // Open preview URL with temporary token (expires in 1 minute)
            setTimeout(() => {
              const previewUrl = `/api/kak/${id}/preview?t=${tempToken}`;
              console.log("Opening preview URL:", previewUrl);
              window.open(previewUrl, "_blank");
              showNotification("Preview dibuka!", "success");
            }, 300);
          } else {
            console.error("Failed response:", response);
            showError("Gagal membuat link preview: " + response.message);
          }
        } catch (error) {
          console.error("Preview error:", error);
          showError("Gagal membuka preview KAK: " + error.message);
        }
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent default link behavior
        addRippleEffect(this, e);
        const activityId = this.getAttribute("data-id");
        const activityName = this.getAttribute("data-name");

        const confirmed = await confirmAction(
          "Yakin ingin menghapus?",
          `Kegiatan "${activityName}" akan dihapus secara permanen.`
        );

        if (confirmed) {
          try {
            await apiRequest(`/kak/${activityId}`, { method: "DELETE" });
            showSuccess(`Berhasil menghapus kegiatan: "${activityName}"`);
            fetchKak();
          } catch (error) {
            showError(`Gagal menghapus kegiatan: ${error.message}`);
          }
        }
      });
    });
  }

  function updateSelectAll() {
    const allCheckboxes = document.querySelectorAll(".row-checkbox");
    const checkedCount = document.querySelectorAll(
      ".row-checkbox:checked"
    ).length;
    const selectAll = document.getElementById("selectAll");

    if (selectAll) {
      selectAll.checked = 
        checkedCount > 0 && checkedCount === allCheckboxes.length;
      selectAll.indeterminate = 
        checkedCount > 0 && checkedCount < allCheckboxes.length;
    }
  }

  // ==============================================
  // ANIMATION FUNCTIONS
  // ==============================================
  function addRippleEffect(element, event) {
    const ripple = document.createElement("span");
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      left: ${x}px;
      top: ${y}px;
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    element.style.position = "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    const colors = {
      info: "linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%)",
      success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      error: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.5s ease-out;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    const icon =
      type === "success"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : type === "error"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

    notification.innerHTML = icon + "<span>" + message + "</span>";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideInRight 0.5s ease-out reverse";
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // ==============================================
  // PAGINATION
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

    renderTableRows(state.filteredActivities);
    updatePagination();
  }

  function updatePagination() {
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(
      state.currentPage * state.itemsPerPage,
      state.totalEntries
    );

    document.getElementById("startEntry").textContent =
      state.totalEntries > 0 ? startEntry : 0;
    document.getElementById("endEntry").textContent = endEntry;
    document.getElementById("totalEntries").textContent = state.totalEntries;

    setupPagination();
  }

  // ==============================================
  // PLACEHOLDER FUNCTIONS (IF NOT IN GLOBAL SCOPE)
  // ==============================================
  async function confirmAction(title, message) {
    // If SweetAlert2 is available
    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0fb4caff",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Batal",
      });
      return result.isConfirmed;
    }
    // Fallback to native confirm
    return confirm(`${title}\n${message}`);
  }

  function showSuccess(message) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: message,
        confirmButtonColor: "#0fb4caff",
      });
    } else {
      showNotification(message, "success");
    }
  }

  function showError(message) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: message,
        confirmButtonColor: "#0fb4caff",
      });
    } else {
      showNotification(message, "error");
    }
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================

  // Add animate-spin keyframe
  const style = document.createElement("style");
  style.textContent = `
    @keyframes animate-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: animate-spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);

  // Initialize
  fetchKak();

  if (window.Helpers) {
    window.Helpers.init();
  }
}