// frontend/src/router.js
import { renderLoginPage } from "./pages/auth/LoginPage.js";
import { renderForgotPasswordPage } from "./pages/auth/ForgotPasswordPage.js";
import { renderLandingPage } from "./pages/LandingPage/LandingPage.js";
import { renderPengusulDashboardPage } from "./pages/Pengusul/DashboardPage.js";
import { renderUserManagementPage } from "./pages/Admin/UserManagementPage.js";
import { renderDashboardVerifikator } from "./pages/Verifikator/Dashboard.js";
import { renderWadirDashboardPage } from "./pages/Wadir/Dashboard.js";
import { renderPpkDashboardPage } from "./pages/Ppk/Dashboard.js";
import { renderBendaharaDashboardPage } from "./pages/Bendahara/Dashboard.js";
import { DirekturDashboardPage } from "./pages/Direktur/DashboardPage.js";
import { renderNotFoundPage } from "./pages/NotFoundPage.js";
import { renderUsulanKakPage } from "./pages/Pengusul/StepUsulanKak.js";
import { renderPreviewKakPage } from "./pages/Pengusul/PreviewKak.js";
import { renderMengajukanKegiatanPage } from "./pages/Pengusul/MengajukanKegiatanPage.js";
import { renderPencairanDanaPage } from "./pages/Bendahara/PencairanDanaPage.js";
import { renderMonitoringUsulanPage } from "./pages/Pengusul/MonitoringUsulan.js";
import { renderInputLpjPage } from "./pages/shared/InputLpj.js";
import { renderUnauthorizedPage } from "./pages/UnauthorizedPage.js";
import { renderRevisiKakPage } from "./pages/shared/RevisiKak.js";
import { renderMonitoringKegiatanPage } from "./pages/shared/MonitoringKegiatan.js";
import { renderRiwayatKAKPage } from "./pages/shared/RiwayatKAK.js";
import { renderDetailKegiatanPage } from "./pages/shared/DetailKegiatan.js";
import { renderDaftarLpjPage } from "./pages/shared/MonitorLpj.js";
import { renderRevisiLpjPage } from "./pages/Bendahara/RevisiLpj.js";
import { renderGuideManagementPage } from "./pages/Admin/GuideManagementPage.js";
import { renderLogHistoryPage } from "./pages/Admin/LogHistoryPage.js";


function getCurrentUserRole() {
  return localStorage.getItem("userRole") || "guest";
}

// Function to fetch and display flasher notifications
async function fetchAndDisplayFlasherNotifications(userRole) {
  if (userRole === "PPK" || userRole === "Wadir") {
    try {
      const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
      if (!token) {
        console.warn('No authentication token found for flasher notifications.');
        return;
      }

      const response = await fetch('/api/dashboard/flasher-notifications', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch flasher notifications:', response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        data.data.forEach(message => {
          window.showToast(message, icon, 'top-end'); // Use 'warning' icon for overdue notices
        });
      }
    } catch (error) {
      console.error('Error fetching flasher notifications:', error);
    }
  }
}

// Public routes - accessible without login
const publicRoutes = {
  "/": renderLandingPage,
  "/login": renderLoginPage,
  "/forgot-password": renderForgotPasswordPage,
  "/logout": () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

const roleBasedRoutes = {
  guest: {
    "/": renderLandingPage,
    "/login": renderLoginPage,
    "/forgot-password": renderForgotPasswordPage,
  },
  Admin: {
    "/user-management": renderUserManagementPage,
    "/kegiatan/view": renderMengajukanKegiatanPage,
    "/guide-management": renderGuideManagementPage,
    "/settings": renderNotFoundPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
    "/log-history": renderLogHistoryPage,
  },
  Pengusul: {
    "/dashboard": renderPengusulDashboardPage,
    "/usulan/new": renderUsulanKakPage,
    "/usulan/": renderUsulanKakPage,
    "/usulan": renderMonitoringUsulanPage,
    "/preview-kak": renderPreviewKakPage,
    "/kegiatan/view": renderMengajukanKegiatanPage,
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/kegiatan/lpj": renderDaftarLpjPage,
    "/kegiatan/lpj/new": renderInputLpjPage,
    "/kegiatan/lpj/revisi/": renderRevisiLpjPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/usulan/revisi/": renderRevisiKakPage,
    "/pengaturan": renderNotFoundPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
  },
  Verifikator: {
    "/dashboard": renderDashboardVerifikator,
    "/usulan": renderDashboardVerifikator,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/pengaturan": renderNotFoundPage,
    "/revisi/": renderRevisiKakPage,
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
  },
  Wadir: {
    "/dashboard": renderWadirDashboardPage,
    "/kegiatan/approve": renderWadirDashboardPage,
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/pengaturan": renderNotFoundPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
  },
  PPK: {
    "/dashboard": renderPpkDashboardPage,
    "/kegiatan/approve": renderPpkDashboardPage,
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/pengaturan": renderNotFoundPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
  },
  Bendahara: {
    "/dashboard": renderBendaharaDashboardPage,
    "/kegiatan/pencairan": renderPencairanDanaPage,
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/kegiatan/lpj": renderDaftarLpjPage,
    "/kegiatan/lpj/revisi/": renderRevisiLpjPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/pengaturan": renderNotFoundPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
    "/kegiatan/lpj/detail/": renderInputLpjPage,
  },
  Rektorat: {
    "/dashboard": (path, userRole) => DirekturDashboardPage(path, userRole),
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
  },
  Direktur: {
    "/dashboard": (path, userRole) => DirekturDashboardPage(path, userRole),
    "/kegiatan/monitoring": renderMonitoringKegiatanPage,
    "/riwayat": renderRiwayatKAKPage,
    "/riwayat/detail/": renderDetailKegiatanPage,
    "/kegiatan/detail/": renderDetailKegiatanPage,
  },
};

export function router() {
  const path = window.location.pathname;
  const userRole = getCurrentUserRole();

  // Handle public routes first
  if (publicRoutes[path]) {
    publicRoutes[path]();
    return;
  }

  // Handle role-based routes
  const pathSegments = path.split("/").filter((segment) => segment);

  if (pathSegments.length > 0) {
    const urlRoleSegment = pathSegments[0].toLowerCase();

    // Find the role key from the URL
    const roleFromUrl = Object.keys(roleBasedRoutes).find(
      (k) => k.toLowerCase() === urlRoleSegment
    );

    // 1. Check if the role from the URL is valid
    if (!roleFromUrl) {
      renderNotFoundPage(userRole);
      return;
    }

    // 2. Security Check
    if (userRole === "guest" || userRole !== roleFromUrl) {
      renderUnauthorizedPage();
      return;
    }

    // 3. If authorized, find the best matching page
    const pagePath = "/" + pathSegments.slice(1).join("/");
    const roleRoutes = roleBasedRoutes[userRole];

    // Check for exact match first
    if (roleRoutes[pagePath]) {
      roleRoutes[pagePath](path, userRole);
      // After rendering the dashboard for PPK/Wadir, fetch and display flasher notifications
      if (userRole === "PPK" || userRole === "Wadir" && pagePath === "/dashboard") {
        fetchAndDisplayFlasherNotifications(userRole);
      }
      return;
    }

    // Check for prefix match (for routes with IDs)
    const matchedKey = Object.keys(roleRoutes)
      .sort((a, b) => b.length - a.length)
      .find((key) => pagePath.startsWith(key));

    if (matchedKey) {
      const handler = roleRoutes[matchedKey];
      // Pass the full path and userRole to the page handler
      handler(path, userRole);
      // After rendering the dashboard for PPK/Wadir, fetch and display flasher notifications
      if (userRole === "PPK" || userRole === "Wadir" && pagePath.startsWith("/dashboard")) { // check for dashboard prefix
        fetchAndDisplayFlasherNotifications(userRole);
      }
      return;
    }
  }

  // If no route is matched, render Not Found page
  renderNotFoundPage(userRole);
}
