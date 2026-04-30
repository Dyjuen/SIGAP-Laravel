// public/src/js/api/kegiatanService.js

const API_BASE_URL = "/api";

export const kegiatanService = {
  /**
   * Mengambil daftar kegiatan overdue untuk persetujuan PPK.
   * @returns {Promise<Object>} Response dengan count dan names dari kegiatan overdue.
   */
  async getOverdueKegiatanForPpk() {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        console.warn(
          "Token tidak ditemukan. Tidak dapat mengambil kegiatan overdue."
        );
        return { count: 0, names: [] };
      }

      const response = await fetch(`${API_BASE_URL}/kegiatan/overdue-ppk`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const errorBody = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch (e) {
          errorData = { message: errorBody || "Unknown error" };
        }
        console.error("Gagal mengambil kegiatan overdue:", errorData.message);
        return { count: 0, names: [] };
      }

      const data = JSON.parse(errorBody);
      return data.data; // Mengembalikan objek { count, names, kegiatan }
    } catch (error) {
      console.error("Error saat mengambil kegiatan overdue:", error);
      return { count: 0, names: [] };
    }
  },

  /**
   * Mengambil daftar kegiatan overdue untuk persetujuan Wadir.
   * @returns {Promise<Object>} Response dengan count dan names dari kegiatan overdue.
   */
  async getOverdueKegiatanForWadir() {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        console.warn(
          "Token tidak ditemukan. Tidak dapat mengambil kegiatan overdue."
        );
        return { count: 0, names: [] };
      }

      const response = await fetch(`${API_BASE_URL}/kegiatan/overdue-wadir`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const errorBody = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch (e) {
          errorData = { message: errorBody || "Unknown error" };
        }
        console.error("Gagal mengambil kegiatan overdue:", errorData.message);
        return { count: 0, names: [] };
      }

      const data = JSON.parse(errorBody);
      return data.data; // Mengembalikan objek { count, names, kegiatan }
    } catch (error) {
      console.error("Error saat mengambil kegiatan overdue:", error);
      return { count: 0, names: [] };
    }
  },

  /**
   * Mengambil daftar KAK overdue untuk persetujuan Verifikator.
   * @returns {Promise<Object>} Response dengan count, names, dan kaks dari KAK overdue.
   */
  async getOverdueKakForVerifikator() {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        console.warn(
          "Token tidak ditemukan. Tidak dapat mengambil KAK overdue."
        );
        return { count: 0, names: [], kaks: [] };
      }

      const response = await fetch(`${API_BASE_URL}/kak/overdue-verifikator`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const errorBody = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch (e) {
          errorData = { message: errorBody || "Unknown error" };
        }
        console.error("Gagal mengambil KAK overdue:", errorData.message);
        return { count: 0, names: [], kaks: [] };
      }

      const data = JSON.parse(errorBody);
      return data.data; // Mengembalikan objek { count, names, kaks }
    } catch (error) {
      console.error("Error saat mengambil KAK overdue:", error);
      return { count: 0, names: [], kaks: [] };
    }
  },

  /**
   * Mengambil daftar LPJ overdue untuk persetujuan Bendahara.
   * @returns {Promise<Object>} Response dengan count dan lpjs dari LPJ overdue.
   */
  async getOverdueLpjForBendahara() {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        console.warn(
          "Token tidak ditemukan. Tidak dapat mengambil LPJ overdue."
        );
        return { count: 0, names: [], lpjs: [] };
      }

      const response = await fetch(`${API_BASE_URL}/lpj/overdue-bendahara`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const errorBody = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(errorBody);
        } catch (e) {
          errorData = { message: errorBody || "Unknown error" };
        }
        console.error("Gagal mengambil LPJ overdue:", errorData.message);
        return { count: 0, names: [], lpjs: [] };
      }

      const data = JSON.parse(errorBody);
      return data.data; // Mengembalikan objek { count, names, lpjs }
    } catch (error) {
      console.error("Error saat mengambil LPJ overdue:", error);
      return { count: 0, names: [], lpjs: [] };
    }
  },
};
