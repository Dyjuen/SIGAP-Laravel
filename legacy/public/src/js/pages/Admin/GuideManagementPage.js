// frontend/src/pages/Admin/GuideManagementPage.js

import { renderDashboardLayout } from '../../layout/AppLayout.js';
import { adminSidebar } from '../../layout/sidebars/adminSidebar.js';

export function renderGuideManagementPage(path, userRole) {
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
        .guide-management-page {
          padding-right: 1rem;
        }
      }

      /* Design System */
      :root {
        --primary-color: #00bcd4;
        --primary-dark: #0097a7;
        --primary-light: #4dd0e1;
      }

      /* Animations */
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes modalFadeInScale {
        from { 
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to { 
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes backdropFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Animations */
      .guide-management-page {
        animation: fadeInUp 0.5s ease-out;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1F2937;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        font-size: 0.95rem;
        color: #6B7280;
      }

      /* Card Styles */
      .guide-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        transition: all 0.3s ease;
      }

      .guide-card:hover {
        box-shadow: 0 10px 25px rgba(0, 188, 212, 0.15);
        transform: translateY(-2px);
      }

      /* Modal Styles */
      .modal-backdrop {
        background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 151, 167, 0.1));
      }

      .modal-backdrop.show {
        opacity: 0.7 !important;
        backdrop-filter: blur(8px);
        animation: backdropFadeIn 0.3s ease-out;
      }

      /* Modal Animations - Bootstrap Style */
      .modal.fade .modal-dialog {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        transform: translateY(-50px);
        opacity: 0;
      }

      .modal.show .modal-dialog {
        transform: translateY(0);
        opacity: 1;
      }

      /* Modal Content Animation */
      .modal.show .modal-content {
        animation: modalContentBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes modalContentBounce {
        0% {
          transform: scale(0.7);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .modal-content {
        border: none !important;
        border-radius: 24px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      }

      .modal-header-gradient {
        background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%);
        color: #1F2937;
        border: none;
        padding: 1.5rem 2rem;
      }

      .modal-header-gradient .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffffff;
      }

      .modal-header-gradient .modal-subtitle {
        font-size: 0.9rem;
        font-weight: 400;
        color: #ffffff; /* Set to white */
        margin-top: 0.25rem;
      }

      .modal-header-gradient .btn-close {
        /* Absolute Positioning Approach */
        position: absolute;
        top: 50%;
        right: 3rem !important; /* Force position */
        transform: translateY(calc(-50% + 40px)); /* Move down even more */
        
        /* Styling */
        background: transparent;
        opacity: 0.7;
        width: 36px; /* Smaller box */
        height: 36px; /* Smaller box */
        border-radius: 10px; /* Slightly smaller radius for smaller box */
        border: 1px solid rgba(255, 255, 255, 0.3); /* Visible glassy border */
        transition: none !important;
        animation: none !important;
        z-index: 10; /* High z-index */

        /* Flex properties for centering the SVG inside */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-header-gradient .btn-close:hover {
        /* Simple border-only hover effect */
        opacity: 1;
        border-color: rgba(0, 0, 0, 0.2);
        transform: translateY(calc(-50% + 40px)) !important; /* Prevent global CSS from resetting transform */
      }
      
      /* This rule explicitly prevents any other CSS from adding an 'X' */
      .modal-header-gradient .btn-close::before,
      .modal-header-gradient .btn-close::after {
          content: none !important;
      }

      .modal-header-gradient .btn-close svg {
          width: 1.25rem;
          height: 1.25rem;
          stroke: white; /* White 'X' icon */
          stroke-width: 2.5;
      }

      .modal-body-modern {
        padding: 2.5rem !important;
        background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
        position: relative;
      }

      .modal-body-modern::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.2), transparent);
      }

      .modal-footer-modern {
        padding: 1.75rem 2.5rem !important;
        background: linear-gradient(to top, #fafafa, #ffffff);
        border: none;
        gap: 1rem;
        position: relative;
        display: flex;
        justify-content: flex-end;
      }

      .modal-footer-modern::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.2), transparent);
      }

      /* Form Styles */
      .glass-input-wrapper {
        position: relative;
      }

      .modal-body-modern label {
        transition: color 0.2s ease;
      }

      .modal-body-modern .glass-input-wrapper:focus-within + label,
      .modal-body-modern label:hover {
        color: var(--primary-color);
      }

      .glass-input-wrapper input,
      .glass-input-wrapper select,
      .glass-input-wrapper textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        background: white;
      }

      .glass-input-wrapper input:focus,
      .glass-input-wrapper select:focus,
      .glass-input-wrapper textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
        transform: translateY(-2px);
      }

      /* Form input animations */
      @keyframes inputFocus {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
      }

      .glass-input-wrapper input:focus,
      .glass-input-wrapper select:focus {
        animation: inputFocus 0.3s ease;
      }

      /* ========== FORM STAGGERED ANIMATION ========== */
      .form-group-animate {
          animation: fadeInUp 0.5s ease-out backwards;
      }

      .form-group-animate:nth-child(1) { animation-delay: 0.1s; }
      .form-group-animate:nth-child(2) { animation-delay: 0.15s; }
      .form-group-animate:nth-child(3) { animation-delay: 0.2s; }
      .form-group-animate:nth-child(4) { animation-delay: 0.25s; }
      .form-group-animate:nth-child(5) { animation-delay: 0.3s; }
      .form-group-animate:nth-child(6) { animation-delay: 0.35s; }

      .file-upload-area {
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .file-upload-area:hover {
        border-color: var(--primary-color);
        background: rgba(0, 188, 212, 0.02);
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
      }

      .file-upload-area.dragover {
        border-color: var(--primary-color);
        background: rgba(0, 188, 212, 0.05);
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(0, 188, 212, 0.2);
      }

      /* Button Styles */
      .btn-modern-primary {
        background: linear-gradient(135deg, #2196F3, #64B5F6);
        border: none;
        color: white;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 0.875rem 2rem;
        border-radius: 14px;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
        box-shadow: 
            0 4px 15px rgba(33, 150, 243, 0.4),
            0 0 0 0 rgba(33, 150, 243, 0.5);
        animation: buttonPulse 2s infinite;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      @keyframes buttonPulse {
        0%, 100% {
            box-shadow: 
                0 4px 15px rgba(33, 150, 243, 0.4),
                0 0 0 0 rgba(33, 150, 243, 0.5);
        }
        50% {
            box-shadow: 
                0 4px 20px rgba(33, 150, 243, 0.5),
                0 0 0 8px rgba(33, 150, 243, 0);
        }
      }

      .btn-modern-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
      }

      .btn-modern-primary:hover::before {
        left: 100%;
      }

      .btn-modern-primary:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 
            0 8px 25px rgba(33, 150, 243, 0.5),
            0 0 0 0 rgba(33, 150, 243, 0);
      }

      .btn-modern-primary:active {
        transform: translateY(-1px) scale(0.98);
      }

      .btn-modern-primary:focus,
      .btn-modern-primary:active {
        color: white !important;
      }

      .btn-modern-cancel {
        background: white;
        border: 2px solid #E5E7EB;
        color: #6B7280;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.875rem 1.75rem;
        border-radius: 14px;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn-modern-cancel::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(107, 114, 128, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .btn-modern-cancel:hover::before {
        width: 300px;
        height: 300px;
      }

      .btn-modern-cancel:hover {
        border-color: #9CA3AF;
        color: #374151;
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }


      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 3rem;
        color: #9CA3AF;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .empty-state svg {
        width: 80px;
        height: 80px;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      /* Loading Spinner */
      .spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }

      /* ========== SEARCH INPUT DESIGN ========== */
      .search-input-wrapper {
          position: relative;
      }

      .search-input-wrapper input {
          width: 100%;
          padding: 0.875rem 3rem 0.875rem 3rem;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1F2937;
          background: white;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          outline: none;
      }

      .search-input-wrapper input::placeholder {
          color: #9CA3AF;
          font-weight: 400;
      }

      .search-input-wrapper input:focus {
          border-color: var(--primary-color);
          background: #F0F8FF;
          box-shadow: 
              0 0 0 4px rgba(0, 188, 212, 0.1),
              0 5px 15px rgba(0, 188, 212, 0.15);
          transform: translateY(-2px);
      }

      .search-input-wrapper.has-value input {
          padding-right: 3.5rem;
      }

      .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
          pointer-events: none;
          transition: color 0.3s;
      }

      .search-input-wrapper input:focus ~ .search-icon,
      .search-input-wrapper.has-value .search-icon {
          color: var(--primary-color);
      }

      .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
      }

      .search-input-wrapper.has-value .clear-search {
          opacity: 0.6;
          pointer-events: auto;
      }

      .clear-search:hover {
          opacity: 1 !important;
          background: rgba(239, 68, 68, 0.1);
      }

      .clear-search svg {
          color: #6B7280;
      }

      .clear-search:hover svg {
          color: #EF4444;
      }

      /* Preview Modal Styles */
      .swal-lg {
        width: 90% !important;
        max-width: 1000px !important;
      }

      .swal-lg .swal2-html-container {
        max-height: 70vh !important;
        overflow-y: auto !important;
      }

      .swal-lg embed,
      .swal-lg iframe {
        border-radius: 8px;
      }

      /* Pagination */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-top: 1px solid #f1f5f9;
        background: white;
        animation: fadeIn 0.5s ease-out;
        animation-delay: 0.7s;
        animation-fill-mode: backwards;
        border-bottom-left-radius: 18px;
        border-bottom-right-radius: 18px;
        margin-top: 1.5rem;
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
        min-width: 36px;
        height: 36px;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid #E5E7EB;
        background: white;
        color: #374151;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
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
        background: linear-gradient(90deg, transparent, rgba(3, 201, 215, 0.2), transparent);
        transition: left 0.5s;
      }

      .pagination .page-link:hover {
        background: #F3F4F6;
        border-color: #03C9D7;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(3, 201, 215, 0.2);
      }

      .pagination .page-link:hover::before {
        left: 100%;
      }

      .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #03C9D7, #02b3c4);
        color: white;
        border-color: #03C9D7;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.4);
        transform: scale(1.1);
      }

      .pagination .page-item.disabled .page-link {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Loading/Empty State */
      .state-placeholder { text-align: center; padding: 3rem 1rem; color: #9ca3af; background: white; border-radius: 12px; border: 1px solid #e5e7eb; }
      .spinner {
        width: 1.5rem; height: 1.5rem; border: 2px solid #e5e7eb;
        border-top-color: var(--primary-color); border-radius: 50%;
        animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Animation */
      .fade-transition {
        transition: opacity 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideUpFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Number Badge */
      .number-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        background: white;
        color: #4b5563;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.875rem;
        text-align: center;
        padding: 0.25rem 0.5rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .d-flex.justify-content-between.align-items-center.mb-4 {
          flex-direction: column;
          align-items: stretch !important;
          gap: 1rem;
        }
        .search-input-wrapper {
          width: 100% !important;
        }
        .btn {
          width: 100%;
        }
        .guide-management-page {
          padding: 1rem;
        }
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
            align-items: center !important;
        }
      }
    </style>

    <div class="guide-management-page">
      <!-- Page Header -->
      <!-- Header Section -->
      <div class="page-header-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 0 0.5rem; opacity: 0; animation: slideInRight 0.6s ease-out forwards;">
        <div>
          <h2 class="text-4xl font-bold text-gray-800">Manajemen Panduan</h2>
          <p class="text-lg text-gray-600" style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 14px;">Kelola panduan dan video tutorial untuk setiap peran pengguna</p>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <!-- Search Section -->
        <div class="search-input-wrapper" style="width: 300px;">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Cari panduan..."
            autocomplete="off"
          />
          <button class="clear-search" id="clearSearch" title="Clear search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addGuideModal">
          <i class="ti me-2">&#xeb0b;</i>Tambah Panduan
        </button>
      </div>

      <!-- Guides Table -->
      <div class="card card-datatable table-responsive p-0">
        <table class="table" style="border-collapse: separate; border-spacing: 0 1rem; padding: 0 1.5rem;">
          <thead>
            <tr>
              <th style="width: 80px;">No.</th>
              <th>Judul</th>
              <th>Peran</th>
              <th>Media</th>
              <th style="text-align: center;">Aksi</th>
            </tr>
          </thead>
          <tbody id="guidesTableBody">
            <tr>
              <td colspan="5">
                <div class="spinner-container">
                  ${window.createLoadingState ? window.createLoadingState('Memuat panduan...') : '<div class="text-center">Memuat...</div>'}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-container">
            <div class="pagination-info text-sm text-gray-500">
              Menampilkan <span id="showingStartGuide">1</span> dari <span id="showingEndGuide">10</span> dengan total <span id="totalRecordsGuide">0</span> entri
            </div>
            <ul class="pagination" id="paginationListGuide"></ul>
          </div>
      </div>
    </div>

    <!-- Add Guide Modal -->
    <div class="modal fade" id="addGuideModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-gradient">
            <div>
              <h5 class="modal-title">Tambah Panduan Baru</h5>
              <p class="modal-subtitle mb-0">Unggah PDF dan link video tutorial</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body modal-body-modern">
            <div id="addGuideError" class="alert alert-danger" style="display: none; margin-bottom: 1.5rem;"></div>
            <form id="addGuideForm">
              <div class="row g-3">
                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Judul Panduan</label>
                  <div class="glass-input-wrapper">
                    <input type="text" id="addTitle" placeholder="Contoh: Panduan Pengajuan KAK" required>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Peran Pengguna</label>
                  <div class="glass-input-wrapper">
                    <select id="addRole" required>
                      <option value="">Pilih Peran</option>
                      <option value="3">Pengusul</option>
                      <option value="2">Verifikator</option>
                      <option value="4">PPK</option>
                      <option value="5">Wadir II</option>
                      <option value="6">Bendahara</option>
                    </select>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Tipe Media</label>
                  <div class="d-flex gap-3">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="addTipeMedia" id="addTipeMediaDoc" value="document" checked>
                      <label class="form-check-label" for="addTipeMediaDoc">
                        Dokumen (PDF/DOCX)
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="addTipeMedia" id="addTipeMediaVideo" value="video">
                      <label class="form-check-label" for="addTipeMediaVideo">
                        Video (YouTube Link)
                      </label>
                    </div>
                  </div>
                </div>

                <div class="col-12 form-group-animate" id="addDocSection">
                  <label class="form-label fw-semibold">File Dokumen</label>
                  <div class="file-upload-area" id="pdfUploadArea">
                    <input type="file" id="addPdfFile" accept=".pdf,.docx" style="display: none;">
                    <i class="ti" style="font-size: 2.5rem; color: #00bcd4; display: block; margin-bottom: 0.5rem;">&#xea76;</i>
                    <p class="mb-1 fw-semibold">Klik atau drag & drop file</p>
                    <p class="text-muted small mb-0">PDF, DOCX (Maks. 10MB)</p>
                  </div>
                  <div id="pdfFileName" class="mt-2 text-success small" style="display: none;"></div>
                </div>

                <div class="col-12 form-group-animate" id="addVideoSection" style="display: none;">
                  <label class="form-label fw-semibold">Link Video (YouTube)</label>
                  <div class="glass-input-wrapper">
                    <input type="url" id="addVideoUrl" placeholder="https://www.youtube.com/watch?v=...">
                  </div>
                  <small class="text-muted">Gunakan URL YouTube, bukan URL embed</small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer modal-footer-modern">
            <button type="button" class="btn btn-modern-cancel" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-modern-primary" id="btnSaveGuide">Simpan Panduan</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Guide Modal -->
    <div class="modal fade" id="editGuideModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header modal-header-gradient">
            <div>
              <h5 class="modal-title">Edit Panduan</h5>
              <p class="modal-subtitle mb-0" style="font-size: 0.9rem; color: #ffffffff; margin-top: 0.25rem;">Perbarui informasi panduan</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body modal-body-modern">
            <div id="editGuideError" class="alert alert-danger" style="display: none; margin-bottom: 1.5rem;"></div>
            <form id="editGuideForm">
              <input type="hidden" id="editGuideId">
              <div class="row g-3">
                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Judul Panduan</label>
                  <div class="glass-input-wrapper">
                    <input type="text" id="editTitle" required>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Role Pengguna</label>
                  <div class="glass-input-wrapper">
                    <select id="editRole" required>
                      <option value="">Pilih Role</option>
                      <option value="3">Pengusul</option>
                      <option value="2">Verifikator</option>
                      <option value="4">PPK</option>
                      <option value="5">Wadir II</option>
                      <option value="6">Bendahara</option>
                    </select>
                  </div>
                </div>

                <div class="col-12 form-group-animate">
                  <label class="form-label fw-semibold">Tipe Media</label>
                  <div class="d-flex gap-3">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="editTipeMedia" id="editTipeMediaDoc" value="document" checked>
                      <label class="form-check-label" for="editTipeMediaDoc">
                        Dokumen (PDF/DOCX)
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="editTipeMedia" id="editTipeMediaVideo" value="video">
                      <label class="form-check-label" for="editTipeMediaVideo">
                        Video (YouTube Link)
                      </label>
                    </div>
                  </div>
                </div>

                <div class="col-12 form-group-animate" id="editDocSection">
                  <label class="form-label fw-semibold">File Dokumen (Kosongkan jika tidak diubah)</label>
                  <div class="file-upload-area" id="editPdfUploadArea">
                    <input type="file" id="editPdfFile" accept=".pdf,.docx" style="display: none;">
                    <i class="ti" style="font-size: 2.5rem; color: #00bcd4; display: block; margin-bottom: 0.5rem;">&#xea76;</i>
                    <p class="mb-1 fw-semibold">Klik atau drag & drop file PDF baru</p>
                    <p class="text-muted small mb-0">PDF, DOCX (Maks. 10MB)</p>
                  </div>
                  <div id="editPdfFileName" class="mt-2 text-success small" style="display: none;"></div>
                  <div id="currentPdfInfo" class="mt-2 text-info small"></div>
                </div>

                <div class="col-12 form-group-animate" id="editVideoSection" style="display: none;">
                  <label class="form-label fw-semibold">Link Video (YouTube)</label>
                  <div class="glass-input-wrapper">
                    <input type="url" id="editVideoUrl" placeholder="https://www.youtube.com/watch?v=...">
                  </div>
                  <small class="text-muted">Gunakan URL YouTube, bukan URL embed</small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer modal-footer-modern">
            <button type="button" class="btn btn-modern-cancel" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-modern-primary" id="btnUpdateGuide">Update Panduan</button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // State
  let guides = [];
  let filteredGuides = [];
  let addModalInstance = null;
  let editModalInstance = null;
  const state = {
    page: 1,
    limit: 10, // Jumlah item per halaman
    total: 0,
    totalPages: 1,
  };

  // API Helper
  async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' })
    };

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const data = await response.json();
    if (!response.ok) {
      // Handle validation errors (422)
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ');
        throw new Error(errorMessages || data.message || 'Validasi gagal');
      }
      throw new Error(data.message || 'Terjadi kesalahan');
    }
    return data;
  }

  // Role mapping
  const roleNames = {
    1: 'Admin',
    2: 'Verifikator',
    3: 'Pengusul',
    4: 'PPK',
    5: 'Wadir II',
    6: 'Bendahara',
    7: 'Direktur'
  };

  const roleBadgeClasses = {
    1: 'badge bg-light text-dark',  // Admin
    2: 'badge bg-info',             // Verifikator
    3: 'badge bg-primary',          // Pengusul
    4: 'badge bg-success',          // PPK
    5: 'badge bg-warning',          // Wadir
    6: 'badge bg-danger',           // Bendahara
    7: 'badge bg-secondary'         // Rektorat/Direktur
  };

  // Fetch guides
  async function fetchGuides() {
    const tbody = document.getElementById('guidesTableBody');
    tbody.innerHTML = window.createTableLoadingRow
      ? window.createTableLoadingRow(6, 'Memuat panduan...')
      : '<tr><td colspan="6" class="text-center">Memuat...</td></tr>';

    // Show pagination container during loading
    const paginationContainer = document.querySelector('.pagination-container');
    if (paginationContainer) {
      paginationContainer.style.display = 'flex';
    }

    try {
      const response = await apiRequest('/panduan');
      guides = response.data || [];

      // Update state with pagination data
      state.total = guides.length;
      state.totalPages = Math.ceil(state.total / state.limit);

      // If current page is greater than total pages, go to last page
      if (state.page > state.totalPages && state.totalPages > 0) {
        state.page = state.totalPages;
      } else if (state.totalPages === 0) {
        state.page = 1; // Reset to first page if no data
      }

      // Filter guides if needed
      filteredGuides = guides;
      renderGuidesTable();
      updatePagination();
    } catch (error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <p class="mb-0">Gagal memuat panduan: ${error.message}</p>
          </td>
        </tr>
      `;
      // Hide pagination on error
      if (paginationContainer) {
        paginationContainer.style.display = 'none';
      }
    }
  }

  function renderGuidesTable(filteredGuides = null) {
    const tbody = document.getElementById('guidesTableBody');
    let guidesToRender = filteredGuides || guides;

    // Update state if we have filtered guides
    if (filteredGuides !== null) {
      state.total = filteredGuides.length;
      state.totalPages = Math.ceil(state.total / state.limit);
    }

    // Apply pagination to guidesToRender
    const startIndex = (state.page - 1) * state.limit;
    const endIndex = startIndex + state.limit;
    guidesToRender = guidesToRender.slice(startIndex, endIndex);

    if (guidesToRender.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p>Belum ada panduan</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Update content immediately with animation instead of fade out/in
    tbody.innerHTML = guidesToRender.map((guide, index) => {
      const actualIndex = (state.page - 1) * state.limit + index + 1; // Actual index across all pages

      let mediaCell = '<span class="text-muted">Tidak ada media</span>';
      if (guide.path_media) {
        if (guide.tipe_media === 'document') {
          const fileName = guide.path_media.split('/').pop();
          mediaCell = `
            <div>
              <small class="d-block mb-2">
                <i class="ti me-1">&#xea76;</i>${fileName}
              </small>
              <button class="btn btn-sm btn-outline-primary" onclick="window.previewGuideDocument('${guide.panduan_id}')">
                <i class="ti me-1">&#xebcc;</i>Pratinjau
              </button>
            </div>
          `;
        } else if (guide.tipe_media === 'video') {
          mediaCell = `
            <button class="btn btn-sm btn-outline-danger" onclick="window.previewGuideVideo('${guide.path_media}')">
              <i class="ti me-1">&#xeae4;</i>Tonton Video
            </button>
          `;
        }
      } else if (guide.tipe_media === 'document') {
        // Document type but no file
        mediaCell = `<span class="text-warning small"><i class="ti me-1">&#xeb90;</i>File tidak tersedia</span>`;
      } else if (guide.tipe_media === 'video') {
        // Video type but no URL
        mediaCell = `<span class="text-warning small"><i class="ti me-1">&#xeb90;</i>URL tidak tersedia</span>`;
      }

      return `
        <tr style="animation: slideUpFadeIn 0.3s ease-out ${0.05 * index}s both;">
          <td>
            <span class="number-badge">${actualIndex}</span>
          </td>
          <td>
            <div class="fw-semibold">${guide.judul_panduan || '-'}</div>
          </td>
          <td>
            <span class="badge ${roleBadgeClasses[guide.target_role_id] || 'badge-secondary'}">
              ${roleNames[guide.target_role_id] || 'Unknown'}
            </span>
          </td>
          <td>${mediaCell}</td>
          <td style="text-align: center;">
            <button class="btn btn-sm btn-primary me-1" onclick="window.editGuide(${guide.panduan_id})" data-bs-toggle="tooltip" title="Edit Panduan">
              <i class="ti">&#xeb04;</i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.deleteGuide(${guide.panduan_id})" data-bs-toggle="tooltip" title="Hapus">
              <i class="ti">&#xeb55;</i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Initialize tooltips for action buttons
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  // File upload handling
  function setupFileUpload(uploadAreaId, fileInputId, fileNameDisplayId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(fileInputId);
    const fileNameDisplay = document.getElementById(fileNameDisplayId);

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragleave');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        if (allowedTypes.includes(files[0].type)) {
          fileInput.files = files;
          showFileName(files[0], fileNameDisplay);
        } else {
          Swal.fire('Error', 'Hanya file PDF dan DOCX yang diizinkan.', 'error');
        }
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        if (allowedTypes.includes(e.target.files[0].type)) {
          showFileName(e.target.files[0], fileNameDisplay);
        } else {
          Swal.fire('Error', 'Hanya file PDF dan DOCX yang diizinkan.', 'error');
          e.target.value = ''; // Clear the input
        }
      }
    });
  }

  function showFileName(file, displayElement) {
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('Error', 'File terlalu besar. Maksimal 10MB.', 'error');
      return;
    }
    displayElement.textContent = `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    displayElement.style.display = 'block';
    return true;
  }

  // Add guide
  async function addGuide() {
    const title = document.getElementById('addTitle').value.trim();
    const roleId = document.getElementById('addRole').value;
    const tipeMedia = document.querySelector('input[name="addTipeMedia"]:checked').value;

    if (!title || !roleId) {
      const errorAlert = document.getElementById('addGuideError');
      errorAlert.textContent = 'Judul dan Role wajib diisi';
      errorAlert.style.display = 'block';
      document.querySelector('#addGuideModal .modal-body').scrollTop = 0;
      return;
    }

    // Validate Media
    if (tipeMedia === 'document') {
      const docFile = document.getElementById('addPdfFile').files[0];
      if (!docFile) {
        const errorAlert = document.getElementById('addGuideError');
        errorAlert.textContent = 'File Dokumen wajib diunggah';
        errorAlert.style.display = 'block';
        document.querySelector('#addGuideModal .modal-body').scrollTop = 0;
        return;
      }
    } else if (tipeMedia === 'video') {
      const videoUrl = document.getElementById('addVideoUrl').value.trim();
      if (!videoUrl) {
        const errorAlert = document.getElementById('addGuideError');
        errorAlert.textContent = 'Link Video wajib diisi';
        errorAlert.style.display = 'block';
        document.querySelector('#addGuideModal .modal-body').scrollTop = 0;
        return;
      }
    }

    const formData = new FormData();
    formData.append('judul_panduan', title);
    formData.append('target_role_id', roleId);
    formData.append('tipe_media', tipeMedia);

    if (tipeMedia === 'document') {
      const docFile = document.getElementById('addPdfFile').files[0];
      formData.append('path_media', docFile);
    } else if (tipeMedia === 'video') {
      const videoUrl = document.getElementById('addVideoUrl').value.trim();
      formData.append('path_media', videoUrl);
    }

    // Debug: Log FormData contents
    console.log('FormData being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    const btnSave = document.getElementById('btnSaveGuide');
    if (window.setButtonLoading) {
      window.setButtonLoading(btnSave, true, 'Menyimpan...');
    }

    try {
      await apiRequest('/panduan', {
        method: 'POST',
        body: formData,
        isFormData: true
      });

      // Success - hide modal first
      addModalInstance.hide();
      
      if (window.setButtonLoading) {
        window.setButtonLoading(btnSave, false);
      }

      document.getElementById('addGuideForm').reset();
      document.getElementById('pdfFileName').style.display = 'none';
      toggleMediaInputs('add'); // Reset to default view

      state.page = 1; // Reset ke halaman pertama setelah penambahan
      await Swal.fire('Berhasil!', 'Panduan berhasil ditambahkan', 'success');
      fetchGuides(); // Muat ulang data dengan halaman pertama
    } catch (error) {
      // Error - keep modal open and show error in modal
      if (window.setButtonLoading) {
        window.setButtonLoading(btnSave, false);
      }
      
      console.error('Error adding guide:', error);
      const errorAlert = document.getElementById('addGuideError');
      errorAlert.textContent = error.message;
      errorAlert.style.display = 'block';
      
      // Scroll to top of modal to show error
      document.querySelector('#addGuideModal .modal-body').scrollTop = 0;
    }
  }

  // Edit guide
  window.editGuide = async function(id) {
    const guide = guides.find(g => g.panduan_id == id);
    if (!guide) return;

    document.getElementById('editGuideId').value = guide.panduan_id;
    document.getElementById('editTitle').value = guide.judul_panduan || '';
    document.getElementById('editRole').value = guide.target_role_id || '';

    if (guide.tipe_media === 'video') {
      document.getElementById('editTipeMediaVideo').checked = true;
      document.getElementById('editVideoUrl').value = guide.path_media || '';
      document.getElementById('currentPdfInfo').textContent = '';
    } else { // 'document' or other/null cases
      document.getElementById('editTipeMediaDoc').checked = true;
      document.getElementById('editVideoUrl').value = '';
      if (guide.path_media) {
        const fileName = guide.path_media.split('/').pop();
        document.getElementById('currentPdfInfo').textContent = `✓ File saat ini: ${fileName}`;
      } else {
        document.getElementById('currentPdfInfo').textContent = 'Belum ada file';
      }
    }
    
    toggleMediaInputs('edit');

    document.getElementById('editPdfFileName').style.display = 'none';
    document.getElementById('editPdfFile').value = '';

    editModalInstance.show();
  };

  // Update guide
  async function updateGuide() {
    const id = document.getElementById('editGuideId').value;
    const title = document.getElementById('editTitle').value.trim();
    const roleId = document.getElementById('editRole').value;
    const tipeMedia = document.querySelector('input[name="editTipeMedia"]:checked').value;

    if (!title || !roleId) {
      const errorAlert = document.getElementById('editGuideError');
      errorAlert.textContent = 'Judul dan Role wajib diisi';
      errorAlert.style.display = 'block';
      document.querySelector('#editGuideModal .modal-body').scrollTop = 0;
      return;
    }

    // Validate video URL if tipe_media is video
    if (tipeMedia === 'video') {
      const videoUrl = document.getElementById('editVideoUrl').value.trim();
      if (!videoUrl) {
        const errorAlert = document.getElementById('editGuideError');
        errorAlert.textContent = 'Link Video wajib diisi';
        errorAlert.style.display = 'block';
        document.querySelector('#editGuideModal .modal-body').scrollTop = 0;
        return;
      }
    }

    const formData = new FormData();
    formData.append('judul_panduan', title);
    formData.append('target_role_id', roleId);
    formData.append('tipe_media', tipeMedia);
    formData.append('_method', 'PUT');

    if (tipeMedia === 'document') {
      const docFile = document.getElementById('editPdfFile').files[0];
      // Only append file if user selected a new one
      if (docFile) {
        formData.append('path_media', docFile);
      }
      // If no new file, backend will keep existing file
    } else if (tipeMedia === 'video') {
      const videoUrl = document.getElementById('editVideoUrl').value.trim();
      formData.append('path_media', videoUrl);
    }

    const btnUpdate = document.getElementById('btnUpdateGuide');
    if (window.setButtonLoading) {
      window.setButtonLoading(btnUpdate, true, 'Menyimpan...');
    }

    try {
      await apiRequest(`/panduan/${id}`, {
        method: 'POST',
        body: formData,
        isFormData: true
      });

      if (window.setButtonLoading) {
        window.setButtonLoading(btnUpdate, false);
      }

      // Hide modal before showing alert
      editModalInstance.hide();
      await Swal.fire('Berhasil!', 'Panduan berhasil diperbarui', 'success');
      fetchGuides(); // Muat ulang data
    } catch (error) {
      if (window.setButtonLoading) {
        window.setButtonLoading(btnUpdate, false);
      }
      
      // Show error in modal instead of hiding it
      console.error('Error updating guide:', error);
      const errorAlert = document.getElementById('editGuideError');
      errorAlert.textContent = error.message;
      errorAlert.style.display = 'block';
      
      // Scroll to top of modal to show error
      document.querySelector('#editGuideModal .modal-body').scrollTop = 0;
    }
  }

  // Delete guide
  window.deleteGuide = async function(id) {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data panduan ini akan dihapus secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiRequest(`/panduan/${id}`, { method: 'DELETE' });
        await Swal.fire('Berhasil!', 'Panduan berhasil dihapus!', 'success');
        // Load data again, staying on current page or going to previous page if needed
        // Decrement total count and check if we need to go to previous page
        state.total = Math.max(0, state.total - 1);
        state.totalPages = Math.ceil(state.total / state.limit);

        // If current page is greater than total pages after deletion, go to previous page
        if (state.page > state.totalPages && state.totalPages > 0) {
          state.page = state.totalPages;
        } else if (state.totalPages === 0) {
          state.page = 1; // Reset to first page if no data left
        }

        fetchGuides();
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Pagination functions
  function setupGuidePagination() {
    const container = document.getElementById("paginationListGuide");
    if (!container || state.totalPages <= 1) {
      document.querySelector('.pagination-container').style.display = 'none';
      return;
    }
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
        if (!isNaN(page) && !link.parentElement.classList.contains('disabled')) changeGuidePage(page);
      });
    });
  }

  function changeGuidePage(page) {
    if (page < 1 || page > state.totalPages || page === state.page) return;
    state.page = page;
    fetchGuides(); // Reload the guides with the new page
  }

  function updatePagination() {
    const start = state.total === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.total);
    const showingStart = document.getElementById('showingStartGuide');
    const showingEnd = document.getElementById('showingEndGuide');
    const totalRecords = document.getElementById('totalRecordsGuide');

    if (showingStart) showingStart.textContent = start;
    if (showingEnd) showingEnd.textContent = end;
    if (totalRecords) totalRecords.textContent = state.total;
    setupGuidePagination();
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = guides.filter(g =>
      (g.judul_panduan || '').toLowerCase().includes(query) ||
      (roleNames[g.target_role_id] || '').toLowerCase().includes(query)
    );

    // Update filtered guides and reset to page 1
    filteredGuides = filtered;
    state.page = 1;
    state.total = filtered.length;
    state.totalPages = Math.ceil(state.total / state.limit);

    renderGuidesTable(filtered);
    updatePagination();
  });

  // Initialize modals
  addModalInstance = new bootstrap.Modal(document.getElementById('addGuideModal'));
  editModalInstance = new bootstrap.Modal(document.getElementById('editGuideModal'));

  // Auto-focus first input when modals open
  document.getElementById('addGuideModal').addEventListener('shown.bs.modal', function() {
    document.getElementById('addGuideError').style.display = 'none';
    document.getElementById('addTitle').focus();
  });
  
  document.getElementById('editGuideModal').addEventListener('shown.bs.modal', function() {
    document.getElementById('editGuideError').style.display = 'none';
    document.getElementById('editTitle').focus();
  });

  // Keyboard shortcuts for modals
  document.getElementById('addGuideModal').addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      addModalInstance.hide();
    }
  });

  document.getElementById('editGuideModal').addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      editModalInstance.hide();
    }
  });

  // Setup file uploads
  setupFileUpload('pdfUploadArea', 'addPdfFile', 'pdfFileName');
  setupFileUpload('editPdfUploadArea', 'editPdfFile', 'editPdfFileName');

  // Event listeners
  document.getElementById('btnSaveGuide').addEventListener('click', addGuide);
  document.getElementById('btnUpdateGuide').addEventListener('click', updateGuide);

  // Preview functions
  window.previewGuideDocument = async function(panduan_id) {
    const guide = guides.find(g => g.panduan_id == panduan_id);
    if (!guide || !guide.path_media) {
      Swal.fire('Error', 'File tidak ditemukan', 'error');
      return;
    }

    Swal.fire({
      title: 'Memproses Dokumen...',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/panduan/${panduan_id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil file (${response.status})`);
      }

      const contentType = response.headers.get('content-type');
      
      // Check if it's a PDF
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        Swal.close();
        
        // Open PDF in new tab
        window.open(objectUrl, '_blank');
        
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      } else {
        // For other file types, trigger download
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const fileName = guide.path_media.split('/').pop();
        
        Swal.close();
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message || 'Gagal memuat dokumen', 'error');
    }
  };

  window.previewGuideVideo = function(videoUrl) {
    // Convert YouTube URL to embed URL
    let embedUrl = videoUrl;
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Extract video ID from various YouTube URL formats
      let videoId = '';
      
      if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('watch?v=')[1].split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    const previewContent = `
      <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
        <iframe 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
          src="${embedUrl}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;

    Swal.fire({
      title: 'Video Tutorial',
      html: previewContent,
      width: '90%',
      didOpen: (modal) => {
        modal.classList.add('swal-lg');
      }
    });
  };

  // --- Media Type Logic ---
  function toggleMediaInputs(modalType) {
    const docSection = document.getElementById(`${modalType}DocSection`);
    const videoSection = document.getElementById(`${modalType}VideoSection`);
    const selectedRadio = document.querySelector(`input[name="${modalType}TipeMedia"]:checked`);

    if (selectedRadio && selectedRadio.value === 'document') {
      docSection.style.display = 'block';
      videoSection.style.display = 'none';
      document.getElementById(`${modalType}VideoUrl`).value = '';
    } else if (selectedRadio && selectedRadio.value === 'video') {
      docSection.style.display = 'none';
      videoSection.style.display = 'block';
      const fileInput = document.getElementById(`${modalType}PdfFile`);
      if (fileInput) {
        fileInput.value = '';
      }
      const fileNameDisplay = document.getElementById(`${modalType}PdfFileName`);
      if (fileNameDisplay) {
          fileNameDisplay.style.display = 'none';
      }
    }
  }

  document.querySelectorAll('input[name="addTipeMedia"]').forEach(radio => {
    radio.addEventListener('change', () => toggleMediaInputs('add'));
  });

  document.querySelectorAll('input[name="editTipeMedia"]').forEach(radio => {
    radio.addEventListener('change', () => toggleMediaInputs('edit'));
  });

  // --- End Media Type Logic ---

  // Initial load
  fetchGuides();
}