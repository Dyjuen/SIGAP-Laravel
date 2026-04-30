// frontend/src/auth/authGuard.js

import { authService } from "../api/authService.js";

/**
 * Auth Guard - Protect routes and check authentication
 */
export const authGuard = {
  /**
   * Check if user is logged in
   * Redirect to login if not authenticated
   * @param {string} redirectUrl - URL to redirect after login
   * @returns {boolean}
   */
  requireAuth(redirectUrl = null) {
    if (!authService.isAuthenticated()) {
      // Store intended URL for redirect after login
      if (redirectUrl) {
        sessionStorage.setItem("redirect_after_login", redirectUrl);
      } else {
        sessionStorage.setItem(
          "redirect_after_login",
          window.location.pathname
        );
      }

      // Redirect to login
      window.location.href = "/login";
      return false;
    }

    return true;
  },

  /**
   * Check if user has required role
   * Redirect to 403 page if not authorized
   * @param {string|Array} allowedRoles - Single role or array of roles
   * @returns {boolean}
   */
  requireRole(allowedRoles) {
    if (!this.requireAuth()) {
      return false;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRoles = authService.getUserRoles();

    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      // Redirect to 403 forbidden page
      window.location.href = "/403";
      return false;
    }

    return true;
  },

  /**
   * Check if user is guest (not logged in)
   * Redirect to dashboard if already authenticated
   */
  requireGuest() {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      const roles = user?.roles || [];

      // Redirect based on role
      let redirectPath = "/dashboard";

      if (roles.includes("Admin")) {
        redirectPath = "/user-management";
      } else if (roles.includes("Verifikator")) {
        redirectPath = "/verifikator/dashboard";
      } else if (roles.includes("Wadir")) {
        redirectPath = "/wadir/dashboard";
      } else if (roles.includes("PPK")) {
        redirectPath = "/ppk/dashboard";
      } else if (roles.includes("Bendahara")) {
        redirectPath = "/bendahara/dashboard";
      }

      window.location.href = redirectPath;
      return false;
    }

    return true;
  },

  /**
   * Handle redirect after login
   */
  handleRedirectAfterLogin() {
    const redirectUrl = sessionStorage.getItem("redirect_after_login");

    if (redirectUrl) {
      sessionStorage.removeItem("redirect_after_login");
      window.location.href = redirectUrl;
    } else {
      // Default redirect based on role
      const user = authService.getUser();
      const roles = user?.roles || [];

      let redirectPath = "/dashboard";

      if (roles.includes("Admin")) {
        redirectPath = "/user-management";
      } else if (roles.includes("Verifikator")) {
        redirectPath = "/verifikator/dashboard";
      } else if (roles.includes("Wadir")) {
        redirectPath = "/wadir/dashboard";
      } else if (roles.includes("PPK")) {
        redirectPath = "/ppk/dashboard";
      } else if (roles.includes("Bendahara")) {
        redirectPath = "/bendahara/dashboard";
      }

      window.location.href = redirectPath;
    }
  },

  /**
   * Initialize auth guard for current page
   * Call this at the beginning of protected pages
   */
  init() {
    // Check if current path is public
    const publicPaths = ["/login", "/register", "/forgot-password", "/"];

    const currentPath = window.location.pathname;

    // If not public path, require authentication
    if (!publicPaths.includes(currentPath)) {
      this.requireAuth(currentPath);
    }

    // Auto refresh token if about to expire
    this.setupTokenRefresh();
  },

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    // Check token expiry every 5 minutes
    setInterval(async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.error("Token refresh failed:", error);
          // If refresh fails, logout user
          authService.clearAuth();
          window.location.href = "/login";
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  },
};

// Auto initialize on page load
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    authGuard.init();
  });
}