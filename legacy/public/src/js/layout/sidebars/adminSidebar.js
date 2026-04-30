// frontend/src/layout/sidebars/adminSidebar.js

export const adminSidebar = `
<!-- Styles moved to /assets/css/modern-sidebar-fixes.css -->

<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme" style="z-index: 1000 !important;">
  <div class="app-brand demo">
    <a href="/admin/user-management" class="app-brand-link">
      <span class="app-brand-logo demo">
        <img src="/assets/img/logo/logo.svg" alt="Logo" class="logo-collapsed">
        <img src="/assets/img/logo/logo2.svg" alt="Logo Extended" class="logo-expanded">
      </span>
    </a>
  </div>

  <ul class="menu-inner">
    <!-- User Management -->
    <li class="menu-item">
      <a href="/admin/user-management" class="menu-link" data-tooltip="User Management">
        <span class="menu-icon">
          <i class="ti ti-users">&#xebf2;</i>
        </span>
        <span class="menu-text">Manajemen Akun</span>
      </a>
    </li>

    <!-- Guide Management -->
    <li class="menu-item">
      <a href="/admin/guide-management" class="menu-link" data-tooltip="Panduan">
        <span class="menu-icon">
          <i class="ti ti-book">&#xea39;</i>
        </span>
        <span class="menu-text">Manajemen Panduan</span>
      </a>
    </li>

    <!-- Log History -->
    <li class="menu-item">
      <a href="/admin/log-history" class="menu-link" data-tooltip="Log History">
        <span class="menu-icon">
          <i class="ti ti-history">&#xebea;</i>
        </span>
        <span class="menu-text">Riwayat Aktivitas</span>
      </a>
    </li>
  </ul>

  <!-- User Profile Section -->
  <div class="user-profile-section">
    <div class="user-profile-card" id="user-profile-card" data-user-name="">
      <div class="user-profile-header">
        <div class="user-avatar" id="user-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-info">
          <p class="user-name" id="user-name"></p>
          <p class="user-role" id="user-role"></p>
        </div>
      </div>
      <div class="user-profile-details">
        <p class="user-email" id="user-email">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span></span>
        </p>
      </div>
    </div>
  </div>

  <!-- Logout Section -->
  <div class="logout-section">
    <a href="#" class="menu-link" id="logout-btn" data-tooltip="Logout">
      <span class="menu-icon">
        <i class="ti ti-logout">&#xeba8;</i>
      </span>
      <span class="menu-text">Keluar</span>
    </a>
  </div>
</aside>

<script>
  /* eslint-disable */
  // @ts-nocheck
  
  // ============== GLOBAL FUNCTIONS - Available immediately ==============
  
  // Function to load user data
  function loadUserData() {
    console.log('[ADMIN SIDEBAR] 🚀 loadUserData() called');
    const storedUserData = localStorage.getItem('userData');
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('[ADMIN SIDEBAR] 💾 Using cached data:', userData);
        updateUserProfile(userData);
        fetchUserDataFromAPI();
      } catch (e) {
        console.error('[ADMIN SIDEBAR] ❌ Error parsing user data:', e);
        fetchUserDataFromAPI();
      }
    } else {
      console.log('[ADMIN SIDEBAR] 📡 No cached data, fetching from API...');
      fetchUserDataFromAPI();
    }
  }
  
  // Function to fetch user data from API
  function fetchUserDataFromAPI() {
    const token = localStorage.getItem('token');
    
    console.log('[ADMIN SIDEBAR] 🔄 Fetching user data from API...');
    console.log('[ADMIN SIDEBAR] 🔑 Token exists:', !!token);
    
    if (!token) {
      console.error('[ADMIN SIDEBAR] ❌ No authentication token found');
      updateUserProfile({ name: 'User', email: 'user@email.com', role: 'Admin' });
      return;
    }
    
    console.log('[ADMIN SIDEBAR] 📡 Calling /api/auth/profile...');
    fetch('/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('[ADMIN SIDEBAR] 📥 API Response status:', response.status);
        if (!response.ok) throw new Error('API responded with status: ' + response.status);
        return response.json();
      })
      .then(result => {
        console.log('[ADMIN SIDEBAR] ✅ API Result:', result);
        
        if (result.success && result.data) {
          const userData = {
            name: result.data.nama_lengkap || 'User',
            email: result.data.email || 'user@email.com',
            role: (result.data.roles && result.data.roles[0]) || result.data.role_name || 'Admin',
            username: result.data.username || ''
          };
          
          console.log('[ADMIN SIDEBAR] 📦 User data prepared:', userData);
          localStorage.setItem('userData', JSON.stringify(userData));
          updateUserProfile(userData);
          console.log('[ADMIN SIDEBAR] ✨ Profile updated successfully!');
        } else {
          throw new Error('Invalid API response format');
        }
      })
      .catch(error => {
        console.error('[ADMIN SIDEBAR] ❌ Error fetching user data:', error);
        updateUserProfile({ name: 'User', email: 'user@email.com', role: 'Admin' });
      });
  }
  
  // Function to update user profile in sidebar
  function updateUserProfile(userData) {
    console.log('[ADMIN SIDEBAR] 🎨 Updating profile UI with:', userData);
    
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    const userAvatarEl = document.getElementById('user-avatar');
    const userProfileCard = document.getElementById('user-profile-card');
    
    if (userData.name && userNameEl) {
      userNameEl.textContent = userData.name;
      console.log('[ADMIN SIDEBAR] ✅ Updated name:', userData.name);
      
      const initials = userData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
      
      if (userAvatarEl) {
        userAvatarEl.textContent = initials;
        console.log('[ADMIN SIDEBAR] ✅ Updated avatar:', initials);
      }
      
      if (userProfileCard) {
        userProfileCard.setAttribute('data-user-name', userData.name);
      }
    }
    
    if (userData.email && userEmailEl) {
      const emailSpan = userEmailEl.querySelector('span');
      if (emailSpan) {
        emailSpan.textContent = userData.email;
        console.log('[ADMIN SIDEBAR] ✅ Updated email:', userData.email);
      }
    }
    
    if (userData.role && userRoleEl) {
      userRoleEl.textContent = userData.role;
      console.log('[ADMIN SIDEBAR] ✅ Updated role:', userData.role);
    }
    
    console.log('[ADMIN SIDEBAR] 🎉 Profile update complete!');
  }
  
  // Expose functions to window IMMEDIATELY
  window.adminSidebarDebug = {
    loadUserData: loadUserData,
    fetchUserDataFromAPI: fetchUserDataFromAPI,
    updateUserProfile: updateUserProfile
  };
  
  console.log('[ADMIN SIDEBAR] 🛠️ Debug tools ready! Available via window.adminSidebarDebug');
  
  // ============== DOM EVENT LISTENERS ==============
  
  // Sidebar toggle functionality
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[ADMIN SIDEBAR] 🎬 DOMContentLoaded fired');
    
    const sidebar = document.getElementById('layout-menu');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const userProfileCard = document.getElementById('user-profile-card');
    
    // User Profile Card Toggle
    if (userProfileCard) {
      userProfileCard.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Only allow expansion when sidebar is expanded on desktop
        const isDesktop = window.innerWidth >= 1200;
        const isSidebarExpanded = sidebar.classList.contains('sidebar-expanded-js');
        
        if (!isDesktop || isSidebarExpanded) {
          this.classList.toggle('expanded');
        }
      });
    }
    
    // Load user data with delay to ensure DOM is fully ready
    setTimeout(function() {
      console.log('[ADMIN SIDEBAR] ⏰ Delayed load triggered');
      loadUserData();
    }, 200);
    
    // Set active menu based on current URL
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-link[href]');
    
    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && currentPath.includes(href)) {
        link.classList.add('active');
        link.closest('.menu-item').classList.add('active');
      }
    });
    
    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin logout?')) {
          // Clear localStorage
          localStorage.removeItem('userData');
          localStorage.removeItem('token');
          // Redirect to logout
          window.location.href = '/logout';
        }
      });
    }
    
    // Close user profile when clicking outside (mobile)
    document.addEventListener('click', function(e) {
      if (userProfileCard && !userProfileCard.contains(e.target)) {
        userProfileCard.classList.remove('expanded');
      }
    });
  });
  
  // Backup: Also try on window load
  window.addEventListener('load', function() {
    console.log('[ADMIN SIDEBAR] 🪟 Window load fired - checking data...');
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && !userNameEl.textContent.trim()) {
      console.log('[ADMIN SIDEBAR] ⚠️ User name still empty, forcing reload...');
      loadUserData();
    } else if (userNameEl) {
      console.log('[ADMIN SIDEBAR] ✅ User name already populated:', userNameEl.textContent);
    }
  });

</script>
`;
