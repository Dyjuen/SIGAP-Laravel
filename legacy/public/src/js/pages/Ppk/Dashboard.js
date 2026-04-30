// frontend/src/pages/Ppk/Dashboard.js
import { renderDashboardLayout } from "../../layout/AppLayout.js";
import { kegiatanService } from "../../api/kegiatanService.js";
import { FlasherNotification } from "../../components/FlasherNotification.js";

export function renderPpkDashboardPage(path, userRole) {
  const pageContent = `
    <div class="monitoring-kegiatan-page">
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
          .monitoring-kegiatan-page {
            padding-right: 1rem;
          }
        }

        .video-placeholder {
          background: #000;
          border-radius: 12px;
          height: 200px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Pagination Styles */
        .pagination-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 1.5rem 0 1.5rem;
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
            background: #F3F4F6;
            border-color: #00BCD4;
        }
        .pagination .page-item.active .page-link {
            background: linear-gradient(135deg, #0fb4caff 0%, #059cd8ff 100%);
            color: white;
            border-color: #00BCD4;
        }
        .pagination .page-item.disabled .page-link {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
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
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .monitoring-kegiatan-page {
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
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-sm-6 col-xl-6">
          <div class="card stat-card-active">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="content-left">
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Kegiatan</span>
                  <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Total Menunggu</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="waitingCount">0</h1>
                    <small style="font-size: 15px; font-weight: 500; opacity: 0.9;">Kegiatan</small>
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
                  <span style="font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Kegiatan</span>
                  <h4 class="mb-3 mt-1" style="font-size: 20px; font-weight: 600;">Total Diterima</h4>
                  <div class="d-flex align-items-end mt-2">
                    <h1 class="mb-0 me-2" style="font-size: 44px; font-weight: 700; letter-spacing: -1px;" id="acceptedCount">0</h1>
                    <small style="font-size: 15px; font-weight: 500; opacity: 0.8;">Kegiatan</small>
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
            placeholder="Cari nama kegiatan, pengusul..."
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
      <div class="card card-datatable table-responsive p-0 pb-3">
        <table class="table" style="border-collapse: separate; border-spacing: 0 1rem; padding: 0 1.5rem;">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">
                <!-- Checkbox removed -->
              </th>
              <th>No.</th>
              <th>Nama Usulan Kegiatan</th>
              <th>Pengusul</th>
              <th>Tanggal Diajukan</th>
              <th style="text-align: center;">Status</th>
              <th style="width: 140px; text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody id="monitoringTableBody">
            <!-- Data will be populated by JavaScript -->
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Menampilkan <span id="startEntry">0</span> sampai <span id="endEntry">0</span> dari <span id="totalEntries">0</span> entri
          </div>
          <ul class="pagination" id="paginationList">
            <!-- populated by js -->
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

  renderDashboardLayout(pageContent, userRole);
  
  // ==============================================
  // STATE
  // ==============================================
  let state = {
      allKegiatan: [],
      displayKegiatan: [],
      filteredKegiatan: [], // Added
      currentPage: 1,
      itemsPerPage: 10,
      totalEntries: 0,
      totalPages: 1,
      searchQuery: '', // Added
      searchTimeout: null, // Added
  };

  // ==============================================
  // API FUNCTIONS
  // ==============================================
  async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const config = { ...options, headers };
    try {
        const response = await fetch(`/api${endpoint}`, config);
        const data = await response.json();
        if (data.success !== true) {
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
  }

  async function fetchKegiatan() {
      const tbody = document.getElementById("monitoringTableBody");
      tbody.innerHTML = window.createTableLoadingRow ? window.createTableLoadingRow(7, 'Memuat data kegiatan...') : '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
      try {
          const response = await apiRequest('/kegiatan');
          const kegiatanData = response.data.data ? response.data.data : response.data;
          state.allKegiatan = kegiatanData || [];
          
          state.displayKegiatan = state.allKegiatan.filter(k => 
              k.current_approval && k.current_approval.approval_level === 'PPK' && k.current_approval.status === 'Aktif'
          );
          state.displayKegiatan.sort((a, b) => a.kegiatan_id - b.kegiatan_id);

          performSearch(state.searchQuery);
          updateStats(state.allKegiatan);
      } catch (error) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${error.message}</td></tr>`;
      }
  }

  // ==============================================
  // SEARCH FUNCTIONS
  // ==============================================
  function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
      state.filteredKegiatan = state.displayKegiatan;
    } else {
      state.filteredKegiatan = state.displayKegiatan.filter(item => {
        const namaKegiatan = (item.nama_kegiatan || '').toLowerCase();
        const pengusul = (item.pengusul_nama || '').toLowerCase();
        return namaKegiatan.includes(state.searchQuery) || 
               pengusul.includes(state.searchQuery);
      });
    }
    
    // Init pagination
    state.totalEntries = state.filteredKegiatan.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    state.currentPage = 1;

    renderTableRows(state.filteredKegiatan);
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

  function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        if (clearSearch) {
          if (query.length > 0) clearSearch.classList.add('visible');
          else clearSearch.classList.remove('visible');
        }
        debounceSearch(query);
      });
      
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.value = '';
          if (clearSearch) clearSearch.classList.remove('visible');
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
  }

    async function handleApproveAction(kegiatanId) {
    // ===============================
    // Step 1: Textarea input modal for optional note
    // ===============================
    const swalInput = await Swal.fire({
      title: "Masukkan Rekomendasi Tindak Lanjut (opsional)",
      input: "textarea",
      inputPlaceholder: "Tulis rekomendasi (boleh kosong)...",
      inputAttributes: {
        maxlength: 500,
        "aria-label": "Catatan",
      },
      showCancelButton: true,
      confirmButtonText: "Lanjut",
      cancelButtonText: "Batal",
      confirmButtonColor: "#00BCD4",
    });

    if (!swalInput.isConfirmed) return;

    const catatan = swalInput.value ?? "";
    
    let payload = {
      status: "Disetujui",
      catatan: catatan.trim() || null,
    };

    // ===============================
    // Step 2: Confirmation modal
    // ===============================
    const confirmResult = await Swal.fire({
      title: "Apakah Anda yakin ingin menyetujui kegiatan ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Setujui",
      cancelButtonText: "Batal",
      confirmButtonColor: "#00BCD4",
      cancelButtonColor: "#d33",
    });

    if (!confirmResult.isConfirmed) return;

    // ===============================
    // Step 3: Show loader and make API request
    // ===============================
    Swal.fire({
      title: "Menyetujui Kegiatan...",
      text: "Harap tunggu, sistem sedang memproses persetujuan.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await apiRequest(`/kegiatan/${kegiatanId}/approve`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showSuccess(`Kegiatan berhasil disetujui.`);
      fetchKegiatan(); // Refresh data
    } catch (error) {
      showError(`Gagal menyetujui kegiatan: ${error.message}`);
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
  // RENDER FUNCTIONS
  // ==============================================
    function formatDate(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    }

  function renderTableRows(data) {
    const tbody = document.getElementById("monitoringTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada kegiatan yang menunggu persetujuan Anda.</td></tr>';
        return;
    }

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const paginatedData = data.slice(
      startIndex,
      startIndex + state.itemsPerPage
    );

        paginatedData.forEach((kegiatan, index) => {
          const globalIndex = startIndex + index + 1;
          const row = document.createElement("tr");

          row.innerHTML = `

            <td style="text-align: center;">

              <!-- Checkbox removed -->

            </td>

            <td>

              <span class="number-badge">${globalIndex}</span>

            </td>

            <td>

              <strong>${kegiatan.nama_kegiatan}</strong>

            </td>

            <td>

              <strong>${kegiatan.pengusul_nama}</strong>

              <div class="text-muted">${kegiatan.pengusul_role || ''}</div>

            </td>

            <td>

              <div class="date-text">${formatDate(kegiatan.created_at)}</div>

            </td>

            <td style="text-align: center;">

              <span class="badge bg-label-warning" style="min-width: 85px; padding: 6px 16px; border-radius: 6px;">Menunggu</span>

            </td>

        <td style="text-align: center;">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-view-detail" data-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);" title="Detail">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-preview-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);" title="KAK PDF">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>
            ${kegiatan.surat_pengantar_path ? `
            <button class="btn btn-sm btn-icon btn-preview-surat" data-id="${kegiatan.kegiatan_id}" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);" title="Surat Pengantar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>` : ''}
            <button class="btn btn-sm btn-icon btn-approve" data-id="${kegiatan.kegiatan_id}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);" title="Setujui">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button class="btn btn-sm btn-icon btn-download-pdf" data-kak-id="${kegiatan.kak_id}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);" title="Unduh">
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

    renderTableRows(state.filteredKegiatan);
    updatePagination();
  }

  function updatePagination() {
    const totalEntries = state.filteredKegiatan.length;
    state.totalEntries = totalEntries;
    state.totalPages = Math.ceil(totalEntries / state.itemsPerPage);
    
    // Recalculate if filtered data changed
    if (state.currentPage > state.totalPages && state.totalPages > 0) {
        state.currentPage = state.totalPages;
    }
    if (state.totalPages === 0) state.currentPage = 1;

    const startEntry = totalEntries > 0 ? (state.currentPage - 1) * state.itemsPerPage + 1 : 0;
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

  // --- APPROVE BUTTON (both desktop and mobile) ---
  document.querySelectorAll(".btn-approve, .dropdown-item.btn-approve").forEach((btn) => {
    btn.addEventListener("click", function() {
      const id = this.dataset.id || this.closest('tr')?.querySelector('.btn-approve')?.dataset.id;
      if (id) handleApproveAction(id);
    });
  });

  // --- PREVIEW SURAT BUTTON (both desktop and mobile) ---
  document.querySelectorAll(".btn-preview-surat, .dropdown-item.btn-preview-surat").forEach((btn) => {
    btn.addEventListener("click", function() {
      const kegiatanId = this.dataset.id || this.closest('tr')?.querySelector('.btn-preview-surat')?.dataset.id;
      if (kegiatanId) previewSuratPengantar(kegiatanId);
    });
  });

  // --- VIEW DETAIL BUTTON (both desktop and mobile) ---
  document.querySelectorAll(".btn-view-detail, .dropdown-item.btn-view-detail").forEach((btn) => {
    btn.addEventListener("click", function () {
      const kakId = this.dataset.id || this.closest('tr')?.querySelector('.btn-view-detail')?.dataset.id;
      if (kakId) window.location.href = `/${userRole.toLowerCase()}/kegiatan/detail/${kakId}`;
    });
  });

  // --- PDF BUTTONS (both desktop and mobile) ---
  document.querySelectorAll(".btn-preview-pdf, .dropdown-item.btn-preview-pdf").forEach((btn) => {
    btn.addEventListener("click", function() {
      const kakId = this.dataset.kakId || this.closest('tr')?.querySelector('.btn-preview-pdf')?.dataset.kakId;
      if (kakId) handlePdfAction(kakId, 'preview');
    });
  });

  document.querySelectorAll(".btn-download-pdf, .dropdown-item.btn-download-pdf").forEach((btn) => {
    btn.addEventListener("click", function() {
      const kakId = this.dataset.kakId || this.closest('tr')?.querySelector('.btn-download-pdf')?.dataset.kakId;
      if (kakId) handlePdfAction(kakId, 'download');
    });
  });
}

  function showError(message) {
      Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: message,
      });
}

  function showSuccess(message) {
      Swal.fire({
          icon: 'success',
          title: 'Success',
          text: message,
          timer: 2000,
          showConfirmButton: false
      });
  }

  function updateStats(allData) {
    const waitingCount = allData.filter(
      (k) =>
        k.current_approval &&
        k.current_approval.approval_level === "PPK" &&
        k.current_approval.status === "Aktif"
    ).length;
    const acceptedCount = allData.filter((k) => {
      const ppkApproval = k.approvals?.find((a) => a.approval_level === "PPK");
      return ppkApproval && ppkApproval.status === "Disetujui";
    }).length;

    const waitingEl = document.getElementById("waitingCount");
    const acceptedEl = document.getElementById("acceptedCount");

    if (waitingEl) waitingEl.textContent = waitingCount;
    if (acceptedEl) acceptedEl.textContent = acceptedCount;
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  fetchKegiatan();
  setupSearch();
  fetchVideos();

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
        let videoUrl = video.path_media || video.url || '';
        let embedUrl = videoUrl;
        
        // Simple YouTube URL to Embed URL converter
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            let videoId = '';
            if (videoUrl.includes('youtube.com/watch?v=')) {
                videoId = videoUrl.split('watch?v=')[1].split('&')[0];
            } else if (videoUrl.includes('youtu.be/')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (videoUrl.includes('youtube.com/embed/')) {
                videoId = videoUrl.split('embed/')[1].split('?')[0];
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
        <iframe src="${embedUrl}" title="${video.judul_panduan || 'Video Panduan'}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius: 12px;"></iframe>
      `;
      
      col.appendChild(videoCard);
      container.appendChild(col);
    });
  }

  // === NEW LOGIC: Check for overdue activities for PPK after dashboard renders ===
  (async () => {
    try {
      const overdueData = await kegiatanService.getOverdueKegiatanForPpk();
      if (overdueData && overdueData.count > 0) {
        // Ensure FlasherNotification is loaded and available
        if (window.flasher && typeof window.flasher.showOverdueKegiatanNotification === 'function') {
          window.flasher.showOverdueKegiatanNotification(overdueData);
        } else {
          console.warn("FlasherNotification or showOverdueKegiatanNotification method not found.");
        }
      }
    } catch (overdueError) {
      console.error("Failed to fetch overdue activities for PPK:", overdueError);
    }
  })();
  // === END NEW LOGIC ===
}