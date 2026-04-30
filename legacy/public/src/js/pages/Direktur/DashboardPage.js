// frontend/src/pages/Direktur/DashboardPage.js (PART 1/4)

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function DirekturDashboardPage(path, userRole) {

  // --- 1. SUPERIOR ICON SET ---
  const icons = {
    trend: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    money: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    rupiah: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" font-weight="bold" stroke="none" fill="currentColor">Rp</text></svg>`,
    pie: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
    check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    doc: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    process: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H2c-1.1 0-2-.9-2-2V2z"></path><path d="M6 1v3"></path><path d="M10 1v3"></path><path d="M14 1v3"></path></svg>`,
    building: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="12" y1="22" x2="12" y2="22.01"></line><line x1="12" y1="2" x2="12" y2="4"></line></svg>`,
    alert: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    award: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    trendingUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    download: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
  };

  // --- 2. STYLING & HTML STRUCTURE (GABUNGAN) ---
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
        .exec-dashboard {
          padding-right: 1rem;
        }
      }

      :root {
        --text-main: #0f172a; --text-muted: #64748b;
        --cyan-primary: #06b6d4; --cyan-dark: #0891b2; --cyan-light: #ecfeff;
        --cyan-glow: rgba(6, 182, 212, 0.4);
        --card-radius: 16px;
      }

      .exec-dashboard {
        background: transparent !important; padding: 2rem;
        font-family: 'Inter', system-ui, sans-serif;
        color: var(--text-main); overflow-x: hidden;
      }

      @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

      /* HEADER */
      .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; animation: fadeInUp 0.5s ease-out; }
      .header-title h2 { font-size: 2.25rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
      .header-title p { color: var(--text-muted); margin-top: 0.25rem; font-size: 1rem; font-weight: 500; }

      /* FILTERS & BUTTONS */
      .filter-group { display: flex; background: rgba(255,255,255,0.8); padding: 4px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
      .filter-btn { padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: all 0.2s; }
      .filter-btn:hover { color: var(--cyan-primary); background: var(--cyan-light); }
      .filter-btn.active { background: var(--cyan-primary); color: white; box-shadow: 0 4px 12px var(--cyan-glow); }
      
      .action-btn { 
        padding: 8px 16px; border-radius: 10px; background: white; border: 1px solid #e2e8f0; 
        color: var(--text-muted); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
        transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .action-btn:hover { border-color: var(--cyan-primary); color: var(--cyan-primary); transform: translateY(-2px); }

      /* CARDS */
      .holo-card { border-radius: var(--card-radius); position: relative; overflow: hidden; transition: transform 0.3s; animation: fadeInUp 0.6s ease-out backwards; }
      .holo-card:hover { transform: translateY(-5px); }

      /* White Glass */
      .card-glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 10px 30px -5px rgba(6, 182, 212, 0.15); }
      .card-glass:hover { box-shadow: 0 20px 40px -5px rgba(6, 182, 212, 0.25); border-color: #a5f3fc; }
      .card-glass .stat-label { color: var(--cyan-dark); }
      .card-glass .stat-value { color: var(--cyan-primary); }
      .card-glass .stat-icon-box { background: rgba(6, 182, 212, 0.1); color: var(--cyan-primary); }

      /* Cyan Filled */
      .card-cyan-filled { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); box-shadow: 0 10px 30px -5px rgba(6, 182, 212, 0.4); border: none; color: white; }
      .card-cyan-filled:hover { box-shadow: 0 15px 40px -5px rgba(6, 182, 212, 0.6); }
      .card-cyan-filled .stat-label { color: rgba(255,255,255,0.9); }
      .card-cyan-filled .stat-value { color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .card-cyan-filled .stat-icon-box { background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(5px); }

      /* Common Stat Text */
      .stat-content { padding: 1.75rem; display: flex; justify-content: space-between; align-items: flex-start; }
      .stat-info { display: flex; flex-direction: column; }
      .stat-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
      .stat-value { font-size: 2.25rem; font-weight: 700; line-height: 1.1; }
      .stat-icon-box { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }

      /* GRIDS */
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
      .layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
      .unit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }

      /* PANELS */
      .glass-panel { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: var(--card-radius); padding: 1.5rem; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.8); animation: fadeInUp 0.7s ease-out backwards; }
      .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
      .panel-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
      .panel-icon { padding: 6px; background: rgba(6, 182, 212, 0.1); border-radius: 8px; color: var(--cyan-primary); }

      /* SECTION DIVIDER */
      .section-divider { display: flex; align-items: center; gap: 1rem; margin: 2.5rem 0 1.5rem 0; animation: fadeInUp 0.8s ease-out backwards; }
      .section-label { font-size: 1.1rem; font-weight: 700; color: var(--cyan-dark); display: flex; align-items: center; gap: 10px; background: white; padding: 0.5rem 1.25rem; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
      .section-line { height: 2px; flex: 1; background: linear-gradient(90deg, var(--cyan-primary), transparent); opacity: 0.3; }

      /* INTERACTIVE UNIT CARDS */
      .unit-card { cursor: pointer; transition: 0.3s; }
      .unit-card:hover { transform: translateY(-8px) scale(1.02); border-color: var(--cyan-primary); }
      .unit-head { padding: 1.25rem; background: rgba(255,255,255,0.5); border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
      .unit-name { font-weight: 700; font-size: 1rem; color: #0f172a; }
      .unit-arrow { opacity: 0; transform: translateX(-10px); transition: 0.3s; color: var(--cyan-primary); }
      .unit-card:hover .unit-arrow { opacity: 1; transform: translateX(0); }
      .unit-body { padding: 1.25rem; }
      .data-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.9rem; }
      .u-label { color: #64748b; } .u-val { font-weight: 700; color: #0f172a; }

      /* ACTIVITY & ALERTS */
      .act-item { display: flex; gap: 1rem; padding: 0.75rem; border-radius: 12px; margin-bottom: 0.5rem; transition: 0.2s; border: 1px solid transparent; }
      .act-item:hover { background: var(--cyan-light); }
      .act-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; box-shadow: 0 0 8px currentColor; }
      .alert-item { background: #fef2f2; border-color: #fee2e2; }
      .alert-item:hover { background: #fee2e2; }
      .alert-dot { animation: pulse 2s infinite; }

      /* MODAL STYLES */
      .modal-backdrop { 
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
        z-index: 9999; display: none; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.3s ease;
      }
      .modal-backdrop.open { display: flex; opacity: 1; }
      .modal-content {
        background: white; width: 90%; max-width: 600px; border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transform: scale(0.95); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; max-height: 85vh;
      }
      .modal-backdrop.open .modal-content { transform: scale(1); }
      .modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
      .modal-body { padding: 1.5rem; overflow-y: auto; }
      .modal-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: 0.2s; }
      .modal-close:hover { background: #e2e8f0; color: #ef4444; }

      @media (max-width: 1400px) { .unit-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 1024px) { 
        .layout-grid, .unit-grid, .stats-grid { grid-template-columns: 1fr; } 
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) { 
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; } 
        .stats-grid { grid-template-columns: 1fr; }
        .exec-dashboard { padding: 1rem; }
      }
    </style>

    <div class="exec-dashboard">
      
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Dashboard Direktur</h2>
          <p>Monitoring Kinerja & Anggaran Terkini</p>
        </div>
        
        <div style="display:flex; gap:1rem; align-items:center;">
          <div class="filter-group" id="periodSelector">
            <button class="filter-btn" data-period="3months">3 Bln</button>
            <button class="filter-btn active" data-period="6months">6 Bln</button>
            <button class="filter-btn" data-period="1year">1 Thn</button>
            <button class="filter-btn" data-period="year">Tahun Ini</button>
            <button class="filter-btn" data-period="all">Semua</button>
          </div>
        </div>
      </div>

      <div id="aiInsightBox" style="display:none; margin-bottom: 2rem; animation: fadeInUp 0.5s ease-out;"></div>

      <div class="stats-grid" id="heroStats">
        ${[1, 2, 3, 4].map(i => `
          <div class="holo-card card-glass" style="height: 140px; padding: 1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="width:48px; height:48px; background:#e2e8f0; border-radius:12px;"></div>
            <div>
               <div style="height:24px; background:#e2e8f0; width:60%; border-radius:4px; margin-bottom:8px;"></div>
               <div style="height:16px; background:#e2e8f0; width:40%; border-radius:4px;"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="insightBox"></div>

      <div class="layout-grid">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title"><span class="panel-icon">${icons.trend}</span> Trend Realisasi & Kegiatan</div>
            </div>
            <div style="height: 350px; width: 100%; position: relative;">
              <canvas id="trendsChart"></canvas>
            </div>
          </div>
          <div class="glass-panel" style="min-height: 300px;">
             <div class="panel-header">
              <div class="panel-title"><span class="panel-icon">${icons.process}</span> Komparasi Unit/Jurusan</div>
            </div>
            <div style="height: 280px; width: 100%; position: relative;">
              <canvas id="jurusanChart"></canvas>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="glass-panel">
             <div class="panel-header">
              <div class="panel-title"><span class="panel-icon">${icons.pie}</span> Komposisi Dana</div>
            </div>
            <div style="height: 250px; position: relative; display: flex; justify-content: center; align-items: center;">
              <canvas id="danaChart"></canvas>
               <div id="danaEmptyState" style="display:none; text-align:center; position:absolute; color:#94a3b8;">
                <div style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.5;">🍩</div>
                <div style="font-weight:600; font-size:0.9rem;">Data Kosong</div>
              </div>
            </div>
          </div>
          <div class="glass-panel" style="flex: 1;">
            <div class="panel-header">
              <div class="panel-title">
                <span class="panel-icon" style="color:#ef4444; background:rgba(239, 68, 68, 0.1)">${icons.alert}</span> 
                Perlu Perhatian
              </div>
            </div>
            <div id="priorityFeed" style="max-height: 400px; overflow-y: auto; padding-right: 5px;"></div>
          </div>
        </div>
      </div>

      <div class="section-divider">
        <div class="section-label">
          <span style="color:var(--cyan-primary)">${icons.doc}</span> Detail Performa Unit
        </div>
        <div class="section-line"></div>
      </div>
      <div class="unit-grid" id="jurusanGrid"></div>

      <div class="section-divider">
        <div class="section-label">
          <span style="color:var(--cyan-primary)">🎥</span> Video Panduan
        </div>
        <div class="section-line"></div>
      </div>
      <div id="videoGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1.5rem; margin-bottom: 2rem;"></div>

    </div>

    <div class="modal-backdrop" id="unitDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="panel-icon" style="background:var(--cyan-light); color:var(--cyan-primary)">${icons.building}</div>
            <div>
              <h3 id="modalTitle" style="margin:0; font-size:1.1rem; color:var(--text-main);">Detail Jurusan</h3>
              <p id="modalSubtitle" style="margin:0; font-size:0.85rem; color:var(--text-muted);">Statistik lengkap</p>
            </div>
          </div>
          <button class="modal-close" id="closeModal">${icons.close}</button>
        </div>
        <div class="modal-body" id="modalBody">
          <div style="text-align:center; padding:2rem; color:#cbd5e1;">${window.createLoadingState ? window.createLoadingState('Memuat statistik...', '#00BCD4', '40px') : 'Loading...'}</div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // ... (Lanjutan dari renderDashboardLayout di Part 2)

  // =================================================================
  // 3. LOGIC & STATE MANAGEMENT
  // =================================================================
  let state = {
    period: '6months',
    data: null,
    charts: {},
    selectedUnit: null // Untuk menyimpan data unit yang sedang diklik (Modal)
  };

  function initDashboard() {
    // Safety check untuk Chart.js
    if (typeof Chart === 'undefined') {
      setTimeout(initDashboard, 150);
      return;
    }

    // Set Global Chart Defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = '#f1f5f9';

    initEventListeners();
    fetchData();
  }

  function initEventListeners() {
    // 1. Period Selector
    const sel = document.getElementById('periodSelector');
    if (sel) {
      sel.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          state.period = e.target.dataset.period;
          fetchData();
        }
      });
    }

    // 2. Export Button (Simulasi Print)
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.print(); // Cara termudah dan paling "native" untuk PDF
      });
    }

    // 3. Modal Close Logic
    const modalBackdrop = document.getElementById('unitDetailModal');
    const closeBtn = document.getElementById('closeModal');

    function closeModal() {
      modalBackdrop.classList.remove('open');
      setTimeout(() => { modalBackdrop.style.display = 'none'; }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }
  }

  async function fetchData() {
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      // Menggunakan endpoint existing
      const res = await fetch(`/api/dashboard/direktur?period=${state.period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success && json.data) {
        state.data = json.data;
        renderAll();
      }
    } catch (e) {
      console.error("Fetch Error", e);
    }
  }

  function renderAll() {
    renderAiSummary();     // NEW: Artificial Intelligence Summary
    renderHeroStats();     // Kartu Atas
    renderInsights();      // 3 Kartu Analisis
    renderPriorityFeed();  // NEW: Feed yang diprioritaskan
    renderTrends();        // Chart 1
    renderJurusanChart();  // Chart 2
    renderDanaChart();     // Chart 3
    renderUnitGrid();      // NEW: Interactive Grid
    renderVideos();        // Video Panduan
  }

  // =================================================================
  // 4. INTELLIGENT RENDERERS
  // =================================================================

  // --- A. AI EXECUTIVE SUMMARY (Fitur 11/10) ---
  function renderAiSummary() {
    const container = document.getElementById('aiInsightBox');
    if (!container || !state.data) return;

    const { overview, by_jurusan, trends } = state.data;

    // 1. Analisis Kinerja
    const isGood = overview.persentase_serapan > 50;
    const bestUnit = [...by_jurusan].sort((a, b) => b.persentase_serapan - a.persentase_serapan)[0];
    const worstUnit = [...by_jurusan].sort((a, b) => a.persentase_serapan - b.persentase_serapan)[0];

    // 2. Analisis Tren (Growth)
    const currentTotal = trends[trends.length - 1]?.total_kegiatan || 0;
    const prevTotal = trends[trends.length - 2]?.total_kegiatan || 0;
    const isGrowing = currentTotal >= prevTotal;

    // 3. Generate Kalimat "Pintar"
    let summaryHTML = '';

    // Tentukan Mood & Pesan
    if (isGood) {
      summaryHTML = `
        <div style="background: linear-gradient(135deg, #ecfeff 0%, #fff 100%); border-left: 4px solid #06b6d4; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; gap: 1rem; align-items: start;">
          <div style="background:#06b6d4; color:white; padding:8px; border-radius:50%; margin-top:2px;">✨</div>
          <div>
            <h4 style="margin:0 0 0.5rem 0; color:#155e75; font-size:1rem; font-weight:700;">Executive Summary: Kinerja Positif</h4>
            <p style="margin:0; color:#475569; font-size:0.95rem; line-height:1.5;">
              Realisasi anggaran berjalan <strong>sangat baik</strong> (${overview.persentase_serapan}%). 
              Apresiasi untuk <strong>${bestUnit?.nama_jurusan || 'Semua Unit'}</strong> yang memimpin efisiensi. 
              Tren kegiatan ${isGrowing ? 'sedang meningkat' : 'stabil'}, pertahankan momentum ini.
            </p>
          </div>
        </div>
      `;
    } else {
      summaryHTML = `
        <div style="background: #ffffff; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; gap: 1rem; align-items: start;">
          <div style="background:#fef3c7; color:#d97706; padding:8px; border-radius:50%; margin-top:2px;">⚠️</div>
          <div>
            <h4 style="margin:0 0 0.5rem 0; color:#92400e; font-size:1rem; font-weight:700;">Executive Summary: Perlu Perhatian</h4>
            <p style="margin:0; color:#475569; font-size:0.95rem; line-height:1.5;">
              Serapan anggaran masih di angka <strong>${overview.persentase_serapan}%</strong>. 
              Mohon tinjau <strong>${worstUnit?.nama_jurusan || 'Unit Terkait'}</strong> untuk akselerasi kegiatan. 
              Pastikan tidak ada bottleneck administrasi pada kegiatan yang sedang berlangsung.
            </p>
          </div>
        </div>
      `;
    }

    container.innerHTML = summaryHTML;
    container.style.display = 'block';
  }

  // --- B. PRIORITY FEED (Pengganti Recent Activity Biasa) ---
  // --- B. PRIORITY FEED (BOTTLENECK DETECTOR) ---
  function renderPriorityFeed() {
    const container = document.getElementById('priorityFeed');
    if (!container) return;

    const { recent_activities } = state.data;

    // Filter: Hanya ambil yang statusnya 'Aktif' (Sedang Menunggu)
    const activeItems = recent_activities.filter(a => a.status === 'Aktif');

    if (!activeItems || activeItems.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:3rem 1rem; color:#94a3b8;"><div style="font-size:2rem; margin-bottom:0.5rem;">👍</div><div style="font-weight:600;">Lancar Jaya</div><div style="font-size:0.85rem;">Tidak ada antrian yang macet.</div></div>`;
      return;
    }

    // HELPER: Hitung selisih hari
    const getDaysStuck = (dateStr) => {
      if (!dateStr) return 0;
      // Convert SQL date (YYYY-MM-DD HH:MM:SS) to JS Date object
      const lastUpdate = new Date(dateStr.replace(' ', 'T'));
      const now = new Date();
      const diffTime = Math.abs(now - lastUpdate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // LOGIKA SORTIR:
    // Urutkan berdasarkan "Paling Lama Macet" dulu, baru Level Jabatan
    const sortedActs = [...activeItems].sort((a, b) => {
      const daysA = getDaysStuck(a.created_at);
      const daysB = getDaysStuck(b.created_at);
      return daysB - daysA; // Yang harinya paling besar di paling atas
    });

    container.innerHTML = sortedActs.map(act => {
      const days = getDaysStuck(act.created_at);

      // LOGIKA TAMPILAN BERDASARKAN DURASI MACET
      let style = { color: '#3b82f6', bg: 'background:#eff6ff;', icon: '⏳', label: 'BARU' }; // Default Biru
      let warningBadge = '';

      if (days > 7) {
        // KRITIS (Lebih dari seminggu)
        style = {
          color: '#ef4444', // Merah
          bg: 'background:#fef2f2;',
          icon: '🔥',
          label: 'KRITIS'
        };
        warningBadge = `<span style="background:#fee2e2; color:#ef4444; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:800; border:1px solid #fecaca;">STUCK ${days} HARI</span>`;
      }
      else if (days > 3) {
        // WARNING (Lebih dari 3 hari)
        style = {
          color: '#f97316', // Oranye
          bg: 'background:#fff7ed;',
          icon: '⚠️',
          label: 'LAMBAT'
        };
        warningBadge = `<span style="background:#ffedd5; color:#c2410c; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:800; border:1px solid #fed7aa;">${days} HARI</span>`;
      }
      else {
        // NORMAL
        warningBadge = `<span style="background:#dbeafe; color:#1e40af; font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:800;">${days} HARI</span>`;
      }

      // Deteksi Posisi Macetnya dimana
      let posisi = `di meja <strong>${act.approval_level}</strong>`;
      if (act.approval_level === 'Wadir2') posisi = `menunggu <strong>Wadir 2</strong>`;
      if (act.approval_level === 'PPK') posisi = `verifikasi <strong>PPK</strong>`;

      return `
        <div class="act-item" style="${style.bg} border-left: 4px solid ${style.color}; padding: 12px; margin-bottom: 10px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.03); transition:0.2s;">
          <div style="flex:1;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div style="display:flex; gap:6px; align-items:center;">
                ${warningBadge}
                <span style="font-size:0.7rem; color:#64748b;">di ${act.approval_level}</span>
              </div>
              <span style="font-size:1rem;">${style.icon}</span>
            </div>

            <div style="font-weight:700; font-size:0.9rem; color:#1e293b; line-height:1.3; margin-bottom:4px;">
              ${act.nama_kegiatan}
            </div>

            <div style="font-size:0.8rem; color:#475569;">
              Sudah ${days} hari tertahan ${posisi}.
            </div>
            
            <div style="font-size:0.7rem; color:#94a3b8; margin-top:6px; padding-top:6px; border-top:1px dashed rgba(0,0,0,0.05); font-style:italic;">
              Pengusul: ${act.jurusan}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Helpers untuk Priority Feed
  function getPriorityScore(status) {
    if (status === 'Ditolak') return 3;
    if (status === 'Revisi') return 2;
    if (status === 'Pending') return 1;
    return 0; // Disetujui
  }

  function getStatusStyle(status) {
    if (status === 'Ditolak') return { color: '#ef4444', bgClass: 'alert-item', label: 'Ditolak / Masalah' };
    if (status === 'Revisi') return { color: '#f59e0b', bgClass: '', label: 'Perlu Revisi' };
    if (status === 'Disetujui') return { color: '#10b981', bgClass: '', label: 'Selesai' };
    return { color: '#3b82f6', bgClass: '', label: 'Sedang Proses' }; // Default/Pending
  }

  // ... (Lanjutan dari fungsi di Part 3)

  // =================================================================
  // 5. VISUALIZATION RENDERERS (Charts)
  // =================================================================

  // --- C. HERO STATS RENDERER (4 Kartu Atas) ---
  function renderHeroStats() {
    const container = document.getElementById('heroStats');
    if (!container) return;
    const { overview } = state.data;
    if (!overview) return;

    // Pattern: Cyan Filled | White Glass | Cyan Filled | White Glass
    const cards = [
      { label: 'Total Pengajuan', val: overview.total_kak, icon: icons.doc, type: 'card-cyan-filled', delay: '0s' },
      { label: 'Kegiatan Selesai', val: overview.kegiatan_selesai, icon: icons.check, type: 'card-glass', delay: '0.1s' },
      { label: 'Total Anggaran', val: formatMoney(overview.dana_diminta), icon: icons.rupiah, type: 'card-cyan-filled', delay: '0.2s' },
      { label: 'Realisasi Dana', val: formatMoney(overview.dana_terserap), icon: icons.pie, type: 'card-glass', delay: '0.3s' }
    ];

    container.innerHTML = cards.map(c => `
      <div class="holo-card ${c.type} stat-content" style="animation-delay: ${c.delay}">
        <div class="stat-info">
          <div class="stat-label">${c.label}</div>
          <div class="stat-value">${c.val}</div>
          <div style="font-size:0.75rem; opacity:0.8; margin-top:8px;">Update Realtime</div>
        </div>
        <div class="stat-icon-box">${c.icon}</div>
      </div>
    `).join('');
  }

  // --- D. INSIGHTS RENDERER (3 Kartu Tengah) ---
  function renderInsights() {
    const box = document.getElementById('insightBox');
    if (!box) return;

    const { by_jurusan, trends } = state.data;

    // Logic Sederhana untuk Insight
    // 1. Cari yang serapannya paling tinggi
    const best = [...by_jurusan].sort((a, b) => b.persentase_serapan - a.persentase_serapan)[0] || { nama_jurusan: '-', persentase_serapan: 0 };

    // 2. Cari yang gap (sisa) anggarannya paling besar
    const worst = [...by_jurusan].sort((a, b) => (b.dana_diminta - b.dana_terserap) - (a.dana_diminta - a.dana_terserap))[0] || { nama_jurusan: '-', dana_diminta: 0, dana_terserap: 0 };

    // 3. Hitung Growth (Budget Growth from API)
    const growth = state.data.overview.budget_growth || 0;

    box.innerHTML = `
    <div style="
      margin-bottom:2rem; 
      display:grid; 
      grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
      gap:1.5rem;
    ">

      <div class="holo-card card-glass stat-content">
        <div class="stat-info">
          <div class="stat-label">Serapan Terbaik</div>
          <div class="stat-value" style="font-size:1.6rem;">${best.nama_jurusan}</div>
          <div style="color:#10b981; font-weight:600; margin-top:4px;">${best.persentase_serapan}% Serapan</div>
        </div>
        <div class="stat-icon-box">${icons.award}</div>
      </div>

      <div class="holo-card card-cyan-filled stat-content">
        <div class="stat-info">
          <div class="stat-label">Sisa Anggaran Terbesar</div>
          <div class="stat-value" style="font-size:1.6rem;">${worst.nama_jurusan}</div>
          <div style="opacity:0.9; font-weight:500; margin-top:4px;">Sisa ${formatMoneyShort(worst.dana_diminta - worst.dana_terserap)}</div>
        </div>
        <div class="stat-icon-box">${icons.alert}</div>
      </div>

      <div class="holo-card card-glass stat-content">
        <div class="stat-info">
          <div class="stat-label">Tren Anggaran</div>
          <div class="stat-value" style="font-size:2rem;">${growth > 0 ? '+' : ''}${growth}%</div>
          <div style="color:#64748b; font-weight:500; margin-top:4px;">vs Periode Lalu</div>
        </div>
        <div class="stat-icon-box">${icons.trendingUp}</div>
      </div>

    </div>
    `;
  }

  function renderTrends() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    if (state.charts.trends) state.charts.trends.destroy();

    const { trends } = state.data;

    state.charts.trends = new Chart(ctx, {
      type: 'bar', // Ubah jadi BAR agar perbandingannya tegas
      data: {
        labels: trends.map(t => t.periode),
        datasets: [
          {
            label: 'Rencana Anggaran (Juta)',
            data: trends.map(t => t.dana_diminta / 1000000),
            backgroundColor: '#e2e8f0', // Abu-abu (Target/Background)
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            order: 2 // Di belakang
          },
          {
            label: 'Realisasi Serapan (Juta)',
            data: trends.map(t => t.dana_terserap / 1000000), // Data baru dari backend
            backgroundColor: '#06b6d4', // Cyan (Realisasi)
            borderRadius: 4,
            barPercentage: 0.4, // Lebih kurus biar "numpuk" di depan
            categoryPercentage: 0.7,
            order: 1 // Di depan
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            mode: 'index', intersect: false, // Tooltip muncul dua-duanya
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} Jt`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9', borderDash: [5, 5] },
            beginAtZero: true,
            ticks: { callback: (val) => val + ' Jt' } // Format sumbu Y
          }
        }
      }
    });
  }

  function renderJurusanChart() {
    const ctx = document.getElementById('jurusanChart');
    if (!ctx) return;
    if (state.charts.jurusan) state.charts.jurusan.destroy();

    const { by_jurusan } = state.data;

    // Sortir data agar bar terpanjang ada di paling atas (descending)
    const sortedData = [...by_jurusan].sort((a, b) => b.kak_diajukan - a.kak_diajukan);

    // Gradient Bar (Horizontal: Kiri ke Kanan)
    const chartCtx = ctx.getContext('2d');
    const gradient = chartCtx.createLinearGradient(0, 0, 400, 0); // Ubah arah gradien
    gradient.addColorStop(0, '#22d3ee'); // Light Cyan
    gradient.addColorStop(1, '#06b6d4'); // Dark Cyan

    state.charts.jurusan = new Chart(ctx, {
      type: 'bar',
      data: {
        // Label disingkat agar rapi
        labels: sortedData.map(j => j.nama_jurusan
          .replace('Teknik Informatika Komputer', 'TIK')
          .replace('Teknik ', 'T. ')
          .replace('Administrasi ', 'Adm. ')
          .replace('Grafika dan Penerbitan', 'Grafika')
        ),
        datasets: [{
          label: 'Jumlah Pengajuan',
          data: sortedData.map(j => j.kak_diajukan),
          backgroundColor: gradient,
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }]
      },
      options: {
        indexAxis: 'y', // PENTING: Membuat bar jadi horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#0f172a',
            bodyColor: '#334155',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false }, // Hapus grid vertikal
            ticks: { precision: 0 } // Hindari angka desimal (misal 1.5 dokumen)
          },
          y: {
            grid: { display: false, drawBorder: false }, // Hapus grid horizontal
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
              color: '#64748b'
            }
          }
        }
      }
    });
  }

  function renderDanaChart() {
    const ctx = document.getElementById('danaChart');
    if (!ctx) return;
    if (state.charts.dana) state.charts.dana.destroy();

    const { by_jurusan } = state.data;
    const values = by_jurusan.map(j => j.dana_terserap);

    // Check Empty Data
    const total = values.reduce((a, b) => a + b, 0);
    const emptyState = document.getElementById('danaEmptyState');
    if (emptyState) emptyState.style.display = total === 0 ? 'block' : 'none';

    if (total === 0) {
      state.charts.dana = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [1], backgroundColor: ['#f1f5f9'], borderWidth: 0 }] },
        options: { cutout: '75%', plugins: { tooltip: { enabled: false }, legend: { display: false } } }
      });
      return;
    }

    state.charts.dana = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: by_jurusan.map(j => j.nama_jurusan),
        datasets: [{
          data: values,
          backgroundColor: [
            '#06b6d4', '#22d3ee', '#3b82f6', '#8b5cf6', // Cool tones
            '#ec4899', '#f43f5e', '#f59e0b', '#10b981'  // Warm/Accent tones
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${formatMoney(ctx.raw)}` }
          }
        }
      }
    });
  }

  // =================================================================
  // 6. INTERACTIVE UNIT GRID & MODAL
  // =================================================================

  function renderUnitGrid() {
    const container = document.getElementById('jurusanGrid');
    if (!container) return;

    const { by_jurusan } = state.data;

    if (!by_jurusan || by_jurusan.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#94a3b8;">Data unit tidak tersedia.</div>`;
      return;
    }

    const sortedUnits = [...by_jurusan].sort((a, b) => {
      if (a.nama_jurusan === 'Unit Lain') return 1;
      if (b.nama_jurusan === 'Unit Lain') return -1;
      return a.nama_jurusan.localeCompare(b.nama_jurusan);
    });

    container.innerHTML = sortedUnits.map((j, index) => `
      <div class="holo-card card-glass unit-card" data-index="${index}">
        <div class="unit-head">
          <div class="unit-name">${j.nama_jurusan}</div>
          <div class="unit-arrow">➔</div>
        </div>
        <div class="unit-body">
          <div class="data-row">
            <span class="u-label">Total KAK</span>
            <span class="u-val">${j.kak_diajukan}</span>
          </div>
          <div class="data-row">
            <span class="u-label">Anggaran</span>
            <span class="u-val" style="color:#0891b2">${formatMoneyShort(j.dana_diminta)}</span>
          </div>
          <div class="data-row">
            <span class="u-label">Realisasi</span>
            <span class="u-val" style="color:#10b981">${formatMoneyShort(j.dana_terserap)}</span>
          </div>
          
          <div style="margin-top: 1rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
              <span style="color:#64748b;">Efisiensi</span>
              <span style="font-weight:700; color:${j.persentase_serapan > 50 ? '#06b6d4' : '#f59e0b'}">${j.persentase_serapan}%</span>
            </div>
            <div style="height:6px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
              <div style="height:100%; width:${j.persentase_serapan}%; background: linear-gradient(90deg, #06b6d4, #3b82f6);"></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Click Events for Drill-Down
    const cards = container.querySelectorAll('.unit-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const index = card.getAttribute('data-index');
        openUnitModal(sortedUnits[index]);
      });
    });
  }

  function renderVideos() {
    const container = document.getElementById('videoGrid');
    if (!container) return;

    const { videos } = state.data;

    if (!videos || videos.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#94a3b8; padding: 2rem;">Belum ada video panduan.</div>`;
      return;
    }

    container.innerHTML = videos.map(video => {
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

        return `
        <div class="holo-card card-glass" style="padding: 0; overflow: hidden; height: 200px;">
           <iframe src="${embedUrl}" title="${video.judul_panduan || video.title || 'Video Panduan'}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%;"></iframe>
        </div>
        `;
    }).join('');
  }

  // --- MODAL LOGIC (The "Amaze" Feature) ---
  function openUnitModal(unit) {
    const modal = document.getElementById('unitDetailModal');
    const title = document.getElementById('modalTitle');
    const sub = document.getElementById('modalSubtitle');
    const body = document.getElementById('modalBody');

    if (!modal) return;

    // Set Header
    title.textContent = unit.nama_jurusan;
    sub.textContent = `Detail performa & riwayat kegiatan`;

    // Filter Activities for this Unit (Client-side filtering for demo)
    // In real app, you might fetch specific detail here
    const unitActivities = state.data.recent_activities.filter(act =>
      act.jurusan === unit.nama_jurusan || unit.nama_jurusan.includes(act.jurusan)
    );

    const sisaAnggaran = unit.dana_diminta - unit.dana_terserap;

    // Build Modal Content
    body.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="padding:1rem; background:#f8fafc; border-radius:12px; text-align:center;">
          <div style="font-size:0.8rem; color:#64748b;">Sisa Anggaran</div>
          <div style="font-size:1.2rem; font-weight:700; color:#ef4444;">${formatMoney(sisaAnggaran)}</div>
        </div>
        <div style="padding:1rem; background:#f8fafc; border-radius:12px; text-align:center;">
          <div style="font-size:0.8rem; color:#64748b;">Status KAK</div>
          <div style="font-size:1.2rem; font-weight:700; color:#3b82f6;">${unit.kak_diajukan} Dokumen</div>
        </div>
      </div>

      <h4 style="font-size:0.95rem; margin-bottom:1rem; color:#1e293b;">Riwayat Aktivitas Unit</h4>
      <div style="max-height:300px; overflow-y:auto;">
        ${unitActivities.length > 0 ? unitActivities.map(act => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; border-bottom:1px solid #f1f5f9;">
            <div>
              <div style="font-weight:600; font-size:0.9rem; color:#334155;">${act.nama_kegiatan}</div>
              <div style="font-size:0.8rem; color:${act.status === 'Ditolak' ? '#ef4444' : '#10b981'}">${act.deskripsi_status || act.status}</div>
            </div>
            <div style="font-size:0.75rem; color:#94a3b8;">${act.time_ago}</div>
          </div>
        `).join('') : '<div style="text-align:center; color:#cbd5e1; padding:1rem;">Belum ada aktivitas tercatat untuk unit ini.</div>'}
      </div>
    `;

    // Show
    modal.style.display = 'flex';
    // Small delay to allow display:flex to apply before adding opacity class for transition
    setTimeout(() => { modal.classList.add('open'); }, 10);
  }

  // =================================================================
  // 7. UTILITIES & INIT
  // =================================================================

  function formatMoney(val) {
    if (val >= 1000000000) return 'Rp ' + (val / 1000000000).toFixed(2) + ' M';
    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(2) + ' Jt';
    return 'Rp ' + val.toLocaleString('id-ID');
  }

  function formatMoneyShort(val) {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'Jt';
    if (val === 0) return '0';
    return (val / 1000).toFixed(0) + 'k';
  }

  // Start the Engine
  setTimeout(initDashboard, 100);
}