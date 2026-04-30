// frontend/src/layouts/DashboardLayout.js

import { adminSidebar } from "./sidebars/adminSidebar.js";
import { pengusulSidebar } from "./sidebars/pengusulSidebar.js";
import { verifikatorSidebar } from "./sidebars/VerifikatorSidebar.js";
import { wadirSidebar } from "./sidebars/WadirSidebar.js";
import { ppkSidebar } from "./sidebars/PpkSidebar.js";
import { bendaharaSidebar } from "./sidebars/BendaharaSidebar.js";
import { rektoratSidebar } from "./sidebars/RektoratSidebar.js";

// Header Component is now an empty spacer to push content down
export const header = `<div style="height: 2.5rem;"></div>`;

export const footer = `<footer class="content-footer footer bg-footer-theme"></footer>`;

export function renderDashboardLayout(content, userRole) {
  console.log("renderDashboardLayout is running with role:", userRole);
  const rootElement = document.getElementById("root");

  let dynamicSidebar = "";
  switch (userRole) {
    case "Admin": dynamicSidebar = adminSidebar; break;
    case "Pengusul": dynamicSidebar = pengusulSidebar; break;
    case "Verifikator": dynamicSidebar = verifikatorSidebar; break;
    case "Wadir": dynamicSidebar = wadirSidebar; break;
    case "PPK": dynamicSidebar = ppkSidebar; break;
    case "Bendahara": dynamicSidebar = bendaharaSidebar; break;
    case "Rektorat": dynamicSidebar = rektoratSidebar; break;
    default:
      dynamicSidebar = `
        <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme" style="width: 260px;">
          <div class="app-brand demo">
            <a href="index.html" class="app-brand-link">
              <span class="app-brand-logo demo"><img src="/assets/img/logo/logo.svg" alt="SIGAP PNJ" width="32"></span>
              <span class="app-brand-text demo menu-text fw-bold">SIGAP PNJ</span>
            </a>
          </div>
          <ul class="menu-inner py-1">
            <li class="menu-item active"><a href="/dashboard" class="menu-link"><i class="menu-icon tf-icons ti ti-smart-home"></i><div>Dashboard</div></a></li>
          </ul>
        </aside>`;
      break;
  }

  const layoutHTML = `
    <div class="layout-wrapper">
      ${dynamicSidebar}

      <div class="layout-page" id="main-layout-page">
        
        ${header}

        <div class="content-wrapper">
          <div class="container-fluid-full">
            ${content}
          </div>
          ${footer}
        </div>
      </div>

      <div class="layout-overlay" id="layout-overlay"></div>

      <div class="menu-mobile-toggler d-xl-none">
        <button class="mobile-toggle-btn" id="mobile-menu-btn" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

  rootElement.innerHTML = layoutHTML;
  initializeSidebar();
  initializeMobileMenuToggle();
  initializeLogout();
  setupPengusulSidebarInteractivity(userRole);
  
  // Execute sidebar scripts manually (since innerHTML doesn't execute <script> tags)
  executeSidebarScripts(dynamicSidebar);
}

function initializeSidebar() {
  const menu = document.getElementById("layout-menu");
  if (!menu) return;

  const currentPath = window.location.pathname;
  const menuLinks = menu.querySelectorAll(".menu-link");
  
  menuLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href === currentPath) {
      const menuItem = link.closest(".menu-item");
      if (menuItem) {
        menuItem.classList.add("active");
        const parentSubmenu = menuItem.closest(".menu-submenu");
        if (parentSubmenu) {
          const parentMenuItem = parentSubmenu.closest(".menu-item");
          if (parentMenuItem) {
            parentMenuItem.classList.add("open");
          }
        }
      }
    }
  });

  const menuToggles = menu.querySelectorAll(".menu-link.menu-toggle");
  menuToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const menuItem = toggle.closest(".menu-item");
      if (menuItem) {
        menuItem.classList.toggle("open");
      }
    });
  });
}

function initializeMobileMenuToggle() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenuTogglerDiv = document.querySelector(".menu-mobile-toggler"); // Get the wrapper div
  const layoutMenu = document.getElementById("layout-menu");
  const overlay = document.getElementById("layout-overlay");

  if (!mobileMenuBtn || !layoutMenu) return;

  const openMenu = () => {
    layoutMenu.classList.add("show");
    overlay?.classList.add("show");
    mobileMenuTogglerDiv?.classList.add("moved"); // Add class to move button
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    layoutMenu.classList.remove("show");
    overlay?.classList.remove("show");
    mobileMenuTogglerDiv?.classList.remove("moved"); // Remove class
    document.body.style.overflow = "";
  };

  mobileMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (layoutMenu.classList.contains("show")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay?.addEventListener("click", closeMenu);

  if (window.innerWidth < 1200) {
    layoutMenu.querySelectorAll(".menu-link:not(.menu-toggle)").forEach(link => {
      link.addEventListener("click", closeMenu);
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200) {
      closeMenu();
    }
  });
}

function initializeLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
  });
}

function setupPengusulSidebarInteractivity(userRole) {
  // Delay untuk memastikan sidebar sudah di-render
  setTimeout(() => {
    const sidebar = document.getElementById("layout-menu");
    const mainContent = document.getElementById("main-layout-page");
    if (!sidebar || !mainContent) {
      console.error("Sidebar atau mainContent tidak ditemukan!");
      return;
    }

    console.log(`[${userRole}] Setting up sidebar with MOUSE HOVER interactivity...`);

    // SEMUA ROLE PAKAI MOUSE HOVER (sama seperti Pengusul)
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        mainContent.classList.add('sidebar-collapsed-content');
        mainContent.classList.remove('sidebar-expanded-content');
        sidebar.classList.remove('sidebar-expanded-js');
      } else {
        mainContent.classList.remove('sidebar-expanded-content', 'sidebar-collapsed-content');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse ENTER - expand sidebar
    sidebar.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 1200) {
        console.log(`[${userRole}] mouseenter - expanding sidebar`);
        sidebar.classList.add('sidebar-expanded-js');
        mainContent.classList.remove('sidebar-collapsed-content');
        mainContent.classList.add('sidebar-expanded-content');
      }
    });

    // Mouse LEAVE - collapse sidebar
    sidebar.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 1200) {
        console.log(`[${userRole}] mouseleave - collapsing sidebar`);
        sidebar.classList.remove('sidebar-expanded-js');
        mainContent.classList.remove('sidebar-expanded-content');
        mainContent.classList.add('sidebar-collapsed-content');
      }
    });
  }, 100);
}

// Execute scripts from sidebar templates (since innerHTML doesn't run <script> tags)
function executeSidebarScripts(sidebarTemplate) {
  console.log('[APPLAYOUT] 🚀 Executing sidebar scripts...');
  
  if (!sidebarTemplate) {
    console.warn('[APPLAYOUT] ⚠️ No sidebar template provided');
    return;
  }
  
  // Extract script content from template string
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...sidebarTemplate.matchAll(scriptRegex)];
  
  console.log('[APPLAYOUT] 📜 Found', matches.length, 'script blocks in template');
  
  if (matches.length === 0) {
    console.warn('[APPLAYOUT] ⚠️ No script tags found in sidebar template');
    return;
  }
  
  // Execute each script
  matches.forEach((match, index) => {
    const scriptContent = match[1]; // Get captured group (script content)
    
    try {
      console.log('[APPLAYOUT] ⚡ Executing script block', index + 1);
      
      // Use eval instead of Function constructor to maintain scope
      // eslint-disable-next-line no-eval
      eval(scriptContent);
      
      console.log('[APPLAYOUT] ✅ Script block', index + 1, 'executed successfully');
    } catch (error) {
      console.error('[APPLAYOUT] ❌ Error executing script block', index + 1, ':', error);
      console.error('Script content preview:', scriptContent.substring(0, 200));
    }
  });
}
