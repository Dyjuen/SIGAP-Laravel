// frontend/src/pages/Pengusul/RiwayatKAK.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderRiwayatKAKPage(path, userRole) {
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
  .riwayat-kak-page {
    padding-right: 1rem;
  }
}

/* Page container */
.riwayat-kak-page {
  background-image: url('/assets/img/backgrounds/BG.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding: 2rem;
  animation: pageEntrance 0.6s ease-out;
}

@keyframes pageEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

/* Info banner */
.info-banner {
  background: white;
  color: #64748b;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #03C9D7;
  animation: slideInFromLeft 0.5s ease-out;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.info-icon {
  color: #03C9D7;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Card container */
.card-datatable {
  background: white;
  border-radius: 18px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: cardEntrance 0.7s ease-out;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-datatable .table {
  border-radius: 18px;
  overflow: hidden;
}

/* Table styling */
.table {
  margin-bottom: 0;
}

.table thead tr th {
  background: #f8fafb;
  font-weight: 600;
  color: #475569;
  padding: 1rem 1rem;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

/* Sticky Actions Column */
.table th:last-child,
.table td:last-child {
  position: sticky;
  right: 0;
  background: #FFFFFF;
  z-index: 10;
  box-shadow: -4px 0 8px rgba(0,0,0,0.02);
}

/* Enhanced row hover with animations */
.table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-left: 4px solid transparent;
  opacity: 0;
  animation: rowFadeIn 0.5s ease-out forwards;
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.table tbody tr:nth-child(1) { animation-delay: 0.1s; }
.table tbody tr:nth-child(2) { animation-delay: 0.15s; }
.table tbody tr:nth-child(3) { animation-delay: 0.2s; }
.table tbody tr:nth-child(4) { animation-delay: 0.25s; }
.table tbody tr:nth-child(5) { animation-delay: 0.3s; }
.table tbody tr:nth-child(6) { animation-delay: 0.35s; }
.table tbody tr:nth-child(7) { animation-delay: 0.4s; }
.table tbody tr:nth-child(8) { animation-delay: 0.45s; }
.table tbody tr:nth-child(9) { animation-delay: 0.5s; }
.table tbody tr:nth-child(10) { animation-delay: 0.55s; }

.table tbody tr:hover {
  background-color: #f8fafc;
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-left-color: #03C9D7;
  z-index: 10;
}

.table tbody tr td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
  border: none;
}

/* Checkbox styling */
.custom-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #03C9D7;
}

/* Index number */
.index-number {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

/* KAK name */
.kak-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.kak-name-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Date text */
.date-text {
  font-size: 0.875rem;
  color: #64748b;
}

/* Status badges with animations */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-badge:hover {
  transform: scale(1.05);
}

.badge-approved {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.badge-rejected {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.badge-pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: pulseBadge 2s ease-in-out infinite;
}

@keyframes pulseBadge {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.6);
  }
}

.badge-revision {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.badge-lpj {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.badge-draft {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.3);
}

.badge-process {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.badge-money {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.badge-active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  animation: pulseBadge 2s ease-in-out infinite;
}

.badge-warning {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.badge-finished {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.status-icon {
  width: 14px;
  height: 14px;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-view:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-download {
  background: linear-gradient(135deg, #03C9D7 0%, #02b3c4 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(3, 201, 215, 0.3);
}

.btn-download:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(3, 201, 215, 0.4);
}

/* Pagination */
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
  gap: 0.5rem;
  list-style: none;
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

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  opacity: 0.5;
  color: #cbd5e0;
}

.empty-state h3 {
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Search bar styles */
.search-section {
  margin-bottom: 1.5rem;
  opacity: 0;
  animation: slideInFromLeft 0.6s ease-out forwards;
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
  border-color: #03C9D7;
  box-shadow: 0 0 0 4px rgba(3, 201, 215, 0.1);
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
  color: #03C9D7;
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

/* Responsive */
@media (max-width: 992px) {
  .riwayat-kak-page {
    padding: 1rem;
  }

  .table tbody tr:hover {
    transform: translateY(-2px) scale(1.002);
  }

  .table tbody tr td {
    padding: 1rem 0.5rem;
  }
  
  .pagination-container {
      flex-direction: column;
      gap: 1rem;
  }
  
  .search-container {
      max-width: 100%;
  }
}
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
  .riwayat-kak-page {
      padding: 1rem;
  }
}
    </style>

<!-- Header Section -->
<div class="dashboard-header">
  <div class="header-title">
    <h2>Riwayat Kegiatan</h2>
    <p>Pantau progress dan status kegiatan yang sudah berjalan</p>
  </div>
</div>

<!-- Search Section -->
<div class="search-section">
  <div class="search-container">
    <input 
      type="text" 
      id="searchInput" 
      class="search-input" 
      placeholder="Cari nama Kegiatan..."
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

<div class="card card-datatable table-responsive p-0">
  <table class="table" style="border-collapse: separate; border-spacing: 0 1rem; padding: 0 1.5rem;">
    <thead>
      <tr>
        <th style="width: 60px;">No.</th>
        <th style="min-width: 250px;">Nama Kegiatan</th>
        <th style="min-width: 130px;">Tanggal Dibuat</th>
        <th style="min-width: 150px;">Tanggal Disetujui</th>
        <th style="text-align: center; min-width: 150px;">Status</th>
        <th style="text-align: center; min-width: 200px;">Aksi</th>
      </tr>
    </thead>
    <tbody id="riwayatTableBody">
      <!-- Data will be populated by JavaScript -->
    </tbody>
  </table>
  
  <!-- Pagination -->
  <div class="pagination-container">
    <div class="pagination-info">
      Menampilkan <span id="startEntry">0</span> sampai <span id="endEntry">0</span> dari <span id="totalEntries">0</span> entri
    </div>
    <ul class="pagination" id="paginationButtons">
      <!-- Pagination buttons will be generated by JavaScript -->
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
    kakData: [],
    allKakData: [],
    filteredKakData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalEntries: 0,
    totalPages: 0,
    selectedItems: new Set(),
    searchQuery: '',
    searchTimeout: null
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

    async function previewSuratPengantar(kegiatanId) {
Swal.fire({
  title: "Membuka Surat Pengantar...",
  text: "Mohon tunggu sejenak.",
  allowOutsideClick: false,
  didOpen: () => Swal.showLoading(),
});

try {
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  const response = await fetch(`/api/kegiatan/${kegiatanId}/surat-pengantar`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Gagal mengambil file (status: ${response.status})`);
  }

  const blob = await response.blob();
  const fileUrl = URL.createObjectURL(blob);
  
  Swal.close();
  window.open(fileUrl, '_blank');
  
  setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

} catch (error) {
  Swal.fire({
    icon: 'error',
    title: 'Gagal Membuka File',
    text: error.message
  });
}
    }

  async function handlePdfAction(kakId, action) {
    const actionTitle = action === 'preview' ? 'Membuka Pratinjau PDF...' : 'Mengunduh PDF...';
    const errorMessage = action === 'preview' ? 'Gagal membuka pratinjau PDF' : 'Gagal mengunduh PDF';
  
    Swal.fire({
title: actionTitle,
text: "Sedang memproses...",
allowOutsideClick: false,
didOpen: () => Swal.showLoading(),
    });
  
    try {
// Step 1: Generate token (Required for both preview and download)
const tokenResponse = await apiRequest(`/kak/${kakId}/generate-download-token`, {
  method: 'POST',
});
  
if (!tokenResponse.success) {
  throw new Error(tokenResponse.message || 'Gagal membuat token akses file');
}
  
const tempToken = tokenResponse.data.download_token;
const url = `/api/kak/${kakId}${action === 'preview' ? '/preview' : ''}?t=${tempToken}`;

if (action === 'preview') {
  // Use fetch + blob for preview to avoid showing HTML error code
  const response = await fetch(url);

  if (!response.ok) {
     const contentType = response.headers.get("content-type");
     if (contentType && contentType.indexOf("application/json") !== -1) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'Gagal mengambil file.');
     } else {
         throw new Error(`HTTP Error: ${response.status}`);
     }
  }

  const blob = await response.blob();
  const fileUrl = URL.createObjectURL(blob);
  
  Swal.close();
  window.open(fileUrl, '_blank');
  
  // Revoke URL after a delay
  setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);

} else {
  // Download
  Swal.close();
  setTimeout(() => {
      window.open(url, '_blank');
  }, 300);
}
  
    } catch (error) {
Swal.fire({
  icon: 'error',
  title: errorMessage,
  text: error.message,
});
    }
  }

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
  function getStatusBadge(status) {
    const statusString = String(status).toLowerCase().replace(/\s+/g, '_');
    
    const statusConfig = {
// 1. Draft
draft: { class: "badge-draft", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`, text: "Draft" },

// 2. Review Verifikator
review_verifikator: { class: "badge-pending", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`, text: "Review Verifikator" },

// 3. Disetujui Verifikator
disetujui_verifikator: { class: "badge-approved", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`, text: "Disetujui Verifikator" },

// 4. Ditolak
ditolak: { class: "badge-rejected", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`, text: "Ditolak" },

// 5. Revisi
revisi: { class: "badge-revision", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`, text: "Revisi" },

// 6. Review PPK
review_ppk: { class: "badge-pending", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`, text: "Review PPK" },

// 7. Review Wadir 2
review_wadir_2: { class: "badge-pending", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`, text: "Review Wadir 2" },

// 8. Proses Pencairan
proses_pencairan: { class: "badge-process", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`, text: "Proses Pencairan" },

// 9. Uang Muka Dicairkan
uang_muka_dicairkan: { class: "badge-money", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`, text: "UM Dicairkan" },

// 10. Kegiatan Berlangsung
kegiatan_berlangsung: { class: "badge-active", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`, text: "Berlangsung" },

// 11. Menunggu LPJ
menunggu_lpj: { class: "badge-lpj", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`, text: "Menunggu LPJ" },

// 12. Review LPJ
review_lpj: { class: "badge-pending", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`, text: "Review LPJ" },

// 13. LPJ Direvisi
lpj_direvisi: { class: "badge-revision", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`, text: "LPJ Direvisi" },

// 14. Setor Fisik Dokumen
setor_fisik_dokumen: { class: "badge-warning", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`, text: "Setor Fisik" },

// 15. Selesai
selesai: { class: "badge-finished", icon: `<svg class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`, text: "Selesai" }
    };

    const config = statusConfig[statusString] || { class: "badge-pending", icon: statusConfig.review_verifikator.icon, text: status };
    return `<span class="status-badge ${config.class}">${config.icon}${config.text}</span>`;
  }

  // ==============================================
  // RENDER FUNCTIONS
  // ==============================================
  function renderTableRows() {
    const tbody = document.getElementById("riwayatTableBody");
    if (!tbody) return;

    const paginatedData = state.kakData;

    if (paginatedData.length === 0) {
tbody.innerHTML = `
  <tr>
    <td colspan="6">
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <h3>Tidak ada data KAK</h3>
        <p>Belum ada KAK yang terdaftar dalam sistem</p>
      </div>
    </td>
  </tr>
`;
return;
    }

    tbody.innerHTML = "";

    paginatedData.forEach((item, index) => {
// Calculate global index based on current page
const globalIndex = (state.currentPage - 1) * state.itemsPerPage + index + 1;
const isChecked = state.selectedItems.has(item.id);

const row = document.createElement("tr");
row.innerHTML = `
  <td>
    <span class="index-number">${globalIndex}</span>
  </td>
  <td>
    <div class="kak-name">${item.nama_kak}</div>
    <div class="kak-name-sub">${item.pengusul}</div>
  </td>
  <td>
    <span class="date-text">${item.tanggal_dibuat}</span>
  </td>
  <td>
    <span class="date-text">${item.tanggal_disetujui || "-"}</span>
  </td>
  <td style="text-align: center;">
    ${getStatusBadge(item.status)}
  </td>
  <td style="text-align: center;">
    <div class="d-flex justify-content-center gap-2">
      ${item.surat_pengantar_path ? `
      <button class="btn btn-sm btn-icon btn-preview-surat" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);" data-id="${item.kegiatan_id}" title="Preview Surat Pengantar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-text"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 9l1 0" /><path d="M9 13l6 0" /><path d="M9 17l6 0" /></svg>
      </button>` : ''}
      <button class="btn btn-sm btn-icon btn-view-detail" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);" data-id="${item.id}" title="Lihat">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>          
      </button>
      <button class="btn btn-sm btn-icon btn-preview-pdf" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);" data-kak-id="${item.id}" title="Lihat PDF">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-file-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v4.5" /><path d="M16.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /><path d="M18.5 19.5l2.5 2.5" /></svg>
      </button>
      <button class="btn btn-sm btn-icon btn-download-pdf" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);" data-kak-id="${item.id}" title="Download PDF">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
      </button>
    </div>
  </td>
`;

tbody.appendChild(row);
    });

    updatePaginationInfo();
    attachEventListeners();
  }

  // ==============================================
  // SEARCH FUNCTIONS
  // ==============================================
  function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
state.filteredKakData = state.allKakData;
    } else {
state.filteredKakData = state.allKakData.filter(item => {
  const namaKAK = (item.nama_kegiatan || '').toLowerCase();
  return namaKAK.includes(state.searchQuery);
});
    }
    
    state.currentPage = 1;
    state.totalEntries = state.filteredKakData.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    state.kakData = state.filteredKakData.slice(startIndex, endIndex);
    
    renderTableRows();
    setupPagination();
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

    // --- PREVIEW SURAT BUTTON ---
    document.querySelectorAll(".btn-preview-surat").forEach((btn) => {
btn.addEventListener("click", function() {
  const kegiatanId = this.dataset.id;
  previewSuratPengantar(kegiatanId);
});
    });

    // --- VIEW DETAIL BUTTON ---
    document.querySelectorAll(".btn-view-detail").forEach((btn) => {
btn.addEventListener("click", function () {
  const id = this.getAttribute("data-id");
  // Navigate to detail page using kak_id (which is mapped to id)
  window.navigateTo(`/${userRole}/riwayat/detail/${id}`);
});
    });

    // --- PDF BUTTONS ---
    document.querySelectorAll(".btn-preview-pdf").forEach((btn) => {
btn.addEventListener("click", () =>
  handlePdfAction(btn.dataset.kakId, 'preview')
);
    });

    document.querySelectorAll(".btn-download-pdf").forEach((btn) => {
btn.addEventListener("click", () =>
  handlePdfAction(btn.dataset.kakId, 'download')
);
    });
  }



  // ==============================================
  // PAGINATION
  // ==============================================
  function setupPagination() {
    const paginationContainer = document.getElementById("paginationButtons");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = state.totalPages;
    if (totalPages <= 1) {
  // Even if only 1 page, we might want to show disabled controls or nothing.
  // But matching MonitoringUsulan logic which shows controls.
    }

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
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
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
<li class="page-item ${state.currentPage === totalPages ? "disabled" : ""}">
  <a class="page-link" href="#" id="btnNextPage">›</a>
</li>
<li class="page-item ${state.currentPage === totalPages ? "disabled" : ""}">
  <a class="page-link" href="#" id="btnLastPage">»</a>
</li>
    `;

    // Attach event listeners to pagination buttons
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
  changePage(1);
});
    if (btnPrevPage)
btnPrevPage.addEventListener("click", (e) => {
  e.preventDefault();
  if (state.currentPage > 1) changePage(state.currentPage - 1);
});
    if (btnNextPage)
btnNextPage.addEventListener("click", (e) => {
  e.preventDefault();
  if (state.currentPage < totalPages)
    changePage(state.currentPage + 1);
});
    if (btnLastPage)
btnLastPage.addEventListener("click", (e) => {
  e.preventDefault();
  changePage(totalPages);
});
  }

  function changePage(page) {
    if (page < 1 || page > state.totalPages) return;
    
    // If searching, paginate filtered results
    if (state.searchQuery) {
state.currentPage = page;
const startIndex = (page - 1) * state.itemsPerPage;
const endIndex = startIndex + state.itemsPerPage;
state.kakData = state.filteredKakData.slice(startIndex, endIndex);
renderTableRows();
setupPagination();
return;
    }
    
    // Otherwise fetch from API
    fetchKAKData(page);
  }

  function updatePaginationInfo() {
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(
state.currentPage * state.itemsPerPage,
state.totalEntries
    );

    const startEntryEl = document.getElementById("startEntry");
    const endEntryEl = document.getElementById("endEntry");
    const totalEntriesEl = document.getElementById("totalEntries");

    if (startEntryEl) {
startEntryEl.textContent = state.totalEntries > 0 ? startEntry : 0;
    }
    if (endEntryEl) {
endEntryEl.textContent = endEntry;
    }
    if (totalEntriesEl) {
totalEntriesEl.textContent = state.totalEntries;
    }
  }
  
  function updateState(newState) {
    state = { ...state, ...newState };
    renderTableRows();
    setupPagination();
  }

  async function fetchKAKData(page = 1) {
    const tbody = document.getElementById("riwayatTableBody");
    if (tbody) {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center p-5">Memuat data...</td></tr>';
    }

    try {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) {
      if (window.showError) window.showError("Autentikasi gagal. Silakan login kembali.");
      window.navigateTo('/login');
      return;
  }

  // Call the new endpoint with pagination parameters
  const response = await fetch(`/api/kegiatan/riwayat?page=${page}&per_page=${state.itemsPerPage}`, {
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  });

  if (!response.ok) {
      throw new Error(`Gagal mengambil data: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Map the data from the new API structure
  // The API returns { data: { data: [...], pagination: {...} }, ... }
  // Based on KegiatanController::getRiwayat logic:
  // Response::success($result, ...) where $result has 'data' and 'pagination' keys.
  // So result.data from fetch will be { data: [], pagination: {} }
  
  const mappedData = result.data.data.map(item => {
      let tanggalDisetujuiRaw = null;

      // Logic to determine tanggal_disetujui based on role
      if (userRole === 'Pengusul' || userRole === 'Verifikator') {
          tanggalDisetujuiRaw = item.tanggal_disetujui_verifikator;
      } else if (item.approval_history && Array.isArray(item.approval_history)) {
          let targetLevel = '';
          if (userRole === 'PPK') targetLevel = 'PPK';
          else if (userRole === 'Wadir') targetLevel = 'Wadir2';
          else if (userRole === 'Bendahara') targetLevel = 'Bendahara-Setor';

          if (targetLevel) {
              const approval = item.approval_history.find(a => a.approval_level === targetLevel && a.status === 'Disetujui');
              if (approval) {
                  tanggalDisetujuiRaw = approval.tanggal_approval;
              }
          }
      }

      const tanggal_disetujui = tanggalDisetujuiRaw 
          ? new Date(tanggalDisetujuiRaw).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : null;

      return {
          id: item.kak_id, // Use kak_id as the primary ID for links/view
          kegiatan_id: item.kegiatan_id,
          surat_pengantar_path: item.surat_pengantar_path,
          nama_kegiatan: item.nama_kegiatan, // Keep original field name
          nama_kak: item.nama_kegiatan, // Map nama_kegiatan to nama_kak
          pengusul: item.pengusul_nama, // Map pengusul_nama to pengusul
          tanggal_dibuat: new Date(item.tanggal_dibuat).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          tanggal_disetujui: tanggal_disetujui, 
          status: item.nama_status // Map nama_status to status
      };
  });

  mappedData.sort((a, b) => a.id - b.id);

  // Store all data for search functionality
  state.allKakData = mappedData;
  state.filteredKakData = mappedData;

  updateState({
      kakData: mappedData,
      totalEntries: result.data.pagination.total,
      totalPages: result.data.pagination.last_page,
      currentPage: result.data.pagination.current_page
  });

    } catch (error) {
  console.error("Error fetching KAK data:", error);
  if (window.showError) window.showError('Gagal memuat data KAK. Silakan coba lagi.');
  if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center p-5 text-danger">Gagal memuat data. Periksa koneksi Anda dan coba lagi.</td></tr>';
  }
  updateState({ kakData: [], totalEntries: 0, totalPages: 0, currentPage: 1 });
    }
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  async function initializePage() {
    await fetchKAKData(1);
    if (window.Helpers) {
window.Helpers.init();
    }
  }

  initializePage();
}
