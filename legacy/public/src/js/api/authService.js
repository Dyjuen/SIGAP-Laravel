// frontend/src/api/authService.js

const API_BASE_URL = "/api";

/**
 * Auth Service - Handle all authentication related API calls
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { username, password, remember_me }
   * @returns {Promise<Object>} Response with user data and token
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Store token in memory or storage based on remember_me
      if (data.data && data.data.token) {
        this.setToken(data.data.token, credentials.remember_me);
        
        // Store user data
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear all stored data
      this.clearAuth();

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Clear auth even if API call fails
      this.clearAuth();
      throw error;
    }
  },

  /**
   * Get user profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil profile");
      }

      // Update stored user data
      if (data.data) {
        this.setUser(data.data);
      }

      return data;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - { nama_lengkap, email, unit_kerja_id }
   * @returns {Promise<Object>}
   */
  async updateProfile(profileData) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal update profile");
      }

      // Update stored user data
      if (data.data) {
        this.setUser(data.data);
      }

      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - { current_password, new_password, new_password_confirmation }
   * @returns {Promise<Object>}
   */
  async changePassword(passwordData) {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal ubah password");
      }

      return data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  /**
   * Refresh token
   * @returns {Promise<Object>}
   */
  async refreshToken() {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal refresh token");
      }

      // Update token
      if (data.data && data.data.token) {
        this.setToken(data.data.token, this.isRememberMe());
      }

      return data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // ============================================
  // TOKEN & USER DATA MANAGEMENT
  // ============================================

  /**
   * Store token
   * @param {string} token
   * @param {boolean} rememberMe - If true, store in localStorage, else memory only
   */
  setToken(token, rememberMe = false) {
    if (rememberMe) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("remember_me", "true");
    } else {
      // Store in memory (sessionStorage)
      sessionStorage.setItem("auth_token", token);
      localStorage.removeItem("remember_me");
    }
  },

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return (
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token")
    );
  },

  /**
   * Check if remember me is enabled
   * @returns {boolean}
   */
  isRememberMe() {
    return localStorage.getItem("remember_me") === "true";
  },

  /**
   * Store user data
   * @param {Object} user
   */
  setUser(user) {
    if (this.isRememberMe()) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("auth_user", JSON.stringify(user));
    }
  },

  /**
   * Get stored user data
   * @returns {Object|null}
   */
  getUser() {
    const userStr =
      localStorage.getItem("auth_user") ||
      sessionStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("remember_me");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
  },

  /**
   * Get user roles
   * @returns {Array}
   */
  getUserRoles() {
    const user = this.getUser();
    return user?.roles || [];
  },

  /**
   * Check if user has specific role
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    const roles = this.getUserRoles();
    return roles.includes(role);
  },

  /**
   * Forgot Password - Request password reset
   * @param {Object} data - { username, email }
   * @returns {Promise<Object>}
   */
  async forgotPassword(data) {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Forgot password request failed');
      }

      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
};