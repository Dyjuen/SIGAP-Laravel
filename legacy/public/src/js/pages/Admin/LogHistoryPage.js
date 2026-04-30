// frontend/src/pages/admin/LogHistoryPage.js

import { renderDashboardLayout } from '../../layout/AppLayout.js';

export function renderLogHistoryPage(path, userRole) {
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
        .log-history-page {
          padding-right: 1rem;
        }
      }

      :root {
        --primary-color: #00bcd4;
        --grey-100: #f8f9fa;
        --grey-200: #e9ecef;
        --grey-400: #ced4da;
        --grey-500: #adb5bd;
        --grey-700: #495057;
        --grey-800: #343a40;
        --grey-900: #212529;
      }
      
      .log-history-page {
        padding: 1.5rem;
        min-height: 100vh;
      }

      /* Filter Section */
      .filter-section {
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem; /* Equivalent to 12px */
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
        border: 1px solid var(--grey-200);
      }
      
      .filter-section .form-label {
        font-size: 0.75rem; /* Slightly smaller for labels */
        font-weight: 600;
        color: var(--grey-700);
        margin-bottom: 0.25rem;
      }



      /* Log Card Styles */
      .log-card {
        background: white;
        border-radius: 0.75rem; /* Consistent border-radius */
        padding: 1.25rem 1.5rem; /* Slightly more padding */
        box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* Softer, more pronounced shadow */
        border: 1px solid var(--grey-200);
        margin-bottom: 1rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        transition: all 0.2s ease;
      }
      
      .log-card:hover {
        box-shadow: 0 6px 16px rgba(0,0,0,0.1); /* More pronounced hover shadow */
        transform: translateY(-3px); /* Slightly more lift */
        border-color: var(--primary-color); /* Highlight on hover */
      }

      .log-icon {
        flex-shrink: 0;
        width: 40px; /* Slightly larger icon */
        height: 40px;
        border-radius: 10px; /* More rounded corners */
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #e0f7fa; /* Lighter background for primary color */
        color: var(--primary-color); /* Use primary color for icon */
      }
      
      .log-details {
        flex-grow: 1;
      }

      .log-description {
        font-weight: 500;
        color: var(--grey-800);
        margin-bottom: 0.25rem;
      }
      
      .log-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.8rem;
        color: var(--grey-500);
      }
      
      .log-meta .dot {
        padding: 0 0.25rem;
      }
      
      .badge-role {
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .role-admin { background-color: #e0f2fe; color: #0284c7; }
      .role-verifikator { background-color: #fef9c3; color: #ca8a04; }
      .role-pengusul { background-color: #dcfce7; color: #16a34a; }
      .role-ppk { background-color: #fce7f3; color: #db2777; }
      .role-wadir { background-color: #f3e8ff; color: #9333ea; }
      .role-bendahara { background-color: #fff7ed; color: #ea580c; }
      .role-rektorat { background-color: #fee2e2; color: #dc2626; }
      .role-system { background-color: #e5e7eb; color: #4b5563; }

      .note-quote {
        background-color: #f8f9fa;
        border-left: 4px solid #e9ecef;
        padding: 0.75rem 1rem;
        margin-top: 0.75rem;
        font-style: italic;
        color: #495057;
      }
      
      .note-quote strong {
        font-style: normal;
        font-weight: 600;
      }

      h2.text-2xl {
        font-size: 1.75rem; /* Adjust heading size */
        font-weight: 700;
        color: var(--grey-900);
      }

      /* Pagination */
      .pagination-container { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 0; border-top: 1px solid var(--grey-200); margin-top: 1.5rem; }
      .pagination { list-style: none; display: flex; gap: 0.25rem; margin: 0; padding: 0; }
      .pagination .page-link {
        padding: 0.4rem 0.65rem; /* Slightly smaller padding */
        border: 1px solid var(--grey-300); /* Lighter border */
        border-radius: 6px; /* Slightly less rounded */
        color: var(--grey-700);
        text-decoration: none;
        font-weight: 500;
        min-width: 34px; /* Slightly smaller min-width */
        text-align: center;
        display: inline-block;
        transition: all 0.2s ease;
        font-size: 0.875rem; /* Smaller font size */
      }
      .pagination .page-link:hover { background: var(--grey-100); border-color: var(--primary-color); color: var(--primary-color); }
      .pagination .page-item.active .page-link { background: var(--primary-color); color: white; border-color: var(--primary-color); }
      .pagination .page-item.disabled .page-link { opacity: 0.5; cursor: not-allowed; }

      /* Loading/Empty State */
      .state-placeholder { text-align: center; padding: 3rem 1rem; color: var(--grey-500); background: white; border-radius: 12px; border: 1px solid var(--grey-200); }
      .spinner {
        width: 1.5rem; height: 1.5rem; border: 2px solid var(--grey-200);
        border-top-color: var(--primary-color); border-radius: 50%;
        animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Animation */
      @keyframes slideUpFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .log-history-page {
            padding: 1rem;
        }
        .filter-section .row.g-2 {
            flex-direction: column;
        }
        .filter-section .col-md-3, .filter-section .col-md-6 {
            width: 100%;
        }
        .log-card {
            flex-direction: column;
            align-items: flex-start;
        }
        .log-icon {
            margin-bottom: 0.5rem;
        }
        .log-meta {
            flex-wrap: wrap;
        }
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
        }
      }
    </style>

    <div class="log-history-page p-4">
      <!-- Header Section -->
      <div class="page-header-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 0 0.5rem; opacity: 0; animation: slideInRight 0.6s ease-out forwards;">
        <div>
          <h2 class="text-4xl font-bold text-gray-800">Riwayat Pengguna</h2>
          <p class="text-lg text-gray-600" style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 14px;">Pantau seluruh kegiatan yang tercatat dalam sistem</p>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Peran</label>
            <select id="roleFilter" class="form-select">
              <option value="">Semua Peran</option>
              <option value="Admin">Admin</option>
              <option value="Verifikator">Verifikator</option>
              <option value="Pengusul">Pengusul</option>
              <option value="PPK">PPK</option>
              <option value="Wadir">Wadir</option>
              <option value="Bendahara">Bendahara</option>
              <option value="Rektorat">Rektorat</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Tipe Riwayat</label>
            <select id="logTypeFilter" class="form-select">
              <option value="">Semua Tipe</option>
              <option value="KAK_STATUS">Perubahan Status KAK</option>
              <option value="KEGIATAN_STATUS">Perubahan Status Kegiatan</option>
              <option value="KAK_APPROVAL">Approval KAK</option>
              <option value="KEGIATAN_APPROVAL">Approval Kegiatan</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tanggal</label>
            <div class="input-group">
              <input type="date" id="startDate" class="form-control">
              <span class="input-group-text bg-light text-muted">→</span>
              <input type="date" id="endDate" class="form-control">
            </div>
          </div>
        </div>
      </div>

      <!-- Log Cards Container -->
      <div id="logContainer">
        <!-- Data will be populated here -->
      </div>

      <!-- Pagination -->
       <div class="pagination-container">
          <div class="pagination-info text-sm text-gray-500">
            Menampilkan <span id="showingStart">1</span> dari <span id="showingEnd">10</span> dengan total <span id="totalRecords">0</span> entri
          </div>
          <ul class="pagination" id="paginationList"></ul>
        </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);
  
  const state = {
    page: 1, limit: 15, total: 0, totalPages: 1, loading: false,
    filters: { role: '', logType: '', startDate: '', endDate: '' }
  };

  const elements = {
    container: document.getElementById('logContainer'),
    roleFilter: document.getElementById('roleFilter'),
    logTypeFilter: document.getElementById('logTypeFilter'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    showingStart: document.getElementById('showingStart'),
    showingEnd: document.getElementById('showingEnd'),
    totalRecords: document.getElementById('totalRecords')
  };

  let searchTimeout;

  async function fetchLogs() {
    state.loading = true;
    renderLogCards();

    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      const queryParams = new URLSearchParams({
        page: state.page,
        limit: state.limit,
        role: state.filters.role,
        log_type: state.filters.logType,
        start_date: state.filters.startDate,
        end_date: state.filters.endDate
      });

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error((await response.json().catch(()=>({}))).message || `Server error: ${response.status}`);

      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Error fetching logs');
      
      state.logs = result.data;
      state.total = result.pagination.total;
      state.totalPages = result.pagination.total_pages;

    } catch (error) {
      console.error('Error:', error);
      state.error = error.message;
    } finally {
      state.loading = false;
      renderLogCards();
      updatePagination();
    }
  }
  
  function getRoleClass(roleName) {
    if (!roleName) return 'role-system';
    return `role-${roleName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  function getLogIcon(logType) {
    const icons = {
      'KAK_STATUS': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
      'KEGIATAN_STATUS': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>`,
      'KAK_APPROVAL': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
      'KEGIATAN_APPROVAL': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    };
    return icons[logType] || `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }

  function renderLogCards() {
    const container = elements.container;
    if (state.loading) {
      container.innerHTML = `<div class="state-placeholder"><div class="spinner"></div>Loading log data...</div>`;
      return;
    }
    if (state.error) {
      container.innerHTML = `<div class="state-placeholder text-danger">${state.error}</div>`;
      return;
    }
    if (!state.logs || state.logs.length === 0) {
      container.innerHTML = `<div class="state-placeholder">No logs found for the selected criteria.</div>`;
      return;
    }

    container.innerHTML = state.logs.map((log, index) => {
      const logTypeClass = log.log_type.toLowerCase().replace('_', '-');
      return `
      <div class="log-card" style="animation: slideUpFadeIn 0.3s ease-out ${0.05 * index}s both;">
        <div class="log-icon">${getLogIcon(log.log_type)}</div>
        <div class="log-details">
          <div class="log-description">${log.description}</div>
          <div class="log-meta">
            <span class="badge-role ${getRoleClass(log.user_role)}">${log.user_role || 'System'}</span>
            <span class="user-name">${log.user_name || ''}</span>
            <span class="dot">•</span>
            <span class="log-timestamp">${formatDate(log.created_at)}</span>
          </div>
          ${log.catatan ? `<div class="note-quote"><strong>Catatan:</strong> ${log.catatan}</div>` : ''}
        </div>
      </div>
    `}).join('');
  }

  function setupPagination() {
    const container = document.getElementById("paginationList");
    if (!container || state.totalPages <= 1) {
      document.querySelector('.pagination-container').style.display = 'none';
      return;
    };
    document.querySelector('.pagination-container').style.display = 'flex';
    container.innerHTML = "";

    const maxPages = 5;
    let start = Math.max(1, state.page - Math.floor(maxPages / 2));
    let end = Math.min(state.totalPages, start + maxPages - 1);
    if (end - start + 1 < maxPages) start = Math.max(1, end - maxPages + 1);

    const addPageLink = (text, page, disabled = false, active = false) => {
      container.innerHTML += `<li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}"><a class="page-link" href="#" data-page="${page}">${text}</a></li>`;
    };

    addPageLink('«', 1, state.page === 1);
    addPageLink('‹', state.page - 1, state.page === 1);
    for (let i = start; i <= end; i++) addPageLink(i, i, false, i === state.page);
    addPageLink('›', state.page + 1, state.page === state.totalPages);
    addPageLink('»', state.totalPages, state.page === state.totalPages);

    container.querySelectorAll(".page-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        if (!isNaN(page) && !link.parentElement.classList.contains('disabled')) changePage(page);
      });
    });
  }

  function changePage(page) {
    if (page < 1 || page > state.totalPages || page === state.page) return;
    state.page = page;
    fetchLogs();
  }

  function updatePagination() {
    const start = state.total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.total);
    elements.showingStart.textContent = start;
    elements.showingEnd.textContent = end;
    elements.totalRecords.textContent = state.total;
    setupPagination();
  }

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium', timeStyle: 'short'
    }).format(new Date(dateString));
  }
  
  const debounceFetch = (callback, delay) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(callback, delay);
  };
  
  ['roleFilter', 'logTypeFilter', 'startDate', 'endDate'].forEach(id => {
    elements[id].addEventListener(id.includes('Date') ? 'change' : 'input', e => {
      debounceFetch(() => {
        state.filters[id.replace('Filter', '').replace('Input','')] = e.target.value;
        state.page = 1;
        fetchLogs();
      }, id.includes('Date') || id.includes('Filter') ? 0 : 500);
    });
  });

  fetchLogs();
}
