/**
 * Flasher Notification System
 * Menampilkan notifikasi sebagai toast yang dapat dilihat tanpa interaksi modal
 */

export class FlasherNotification {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  /**
   * Inisialisasi container untuk flasher notifications
   */
  initContainer() {
    let container = document.getElementById("flasher-notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "flasher-notification-container";
      container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 420px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Tampilkan notifikasi flasher
   * @param {string} message - Pesan yang akan ditampilkan
   * @param {string} type - Tipe notifikasi: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Durasi tampil dalam ms (default: 3000)
   */
  show(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `flasher-notification flasher-${type}`;
    notification.style.cssText = `
      padding: 20px 24px;
      border-radius: 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: auto;
      max-width: 100%;
      word-wrap: break-word;
      white-space: pre-wrap;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border: 1px solid;
      font-weight: 500;
      letter-spacing: 0.2px;
      position: relative;
      overflow: hidden;
    `;

    // Set warna berdasarkan type dengan tema modern dan vibrant
    const colors = {
      success: {
        bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))",
        text: "#ffffff",
        border: "rgba(255, 255, 255, 0.3)",
        icon: "✓",
        accent: "#10b981",
      },
      error: {
        bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
        text: "#ffffff",
        border: "rgba(255, 255, 255, 0.3)",
        icon: "✕",
        accent: "#ef4444",
      },
      warning: {
        bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))",
        text: "#ffffff",
        border: "rgba(255, 255, 255, 0.3)",
        icon: "⚠",
        accent: "#f59e0b",
      },
      info: {
        bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
        text: "#ffffff",
        border: "rgba(255, 255, 255, 0.3)",
        icon: "ℹ",
        accent: "#3b82f6",
      },
    };

    const color = colors[type] || colors.info;
    notification.style.background = color.bg;
    notification.style.color = color.text;
    notification.style.borderColor = color.border;

    // Progress bar
    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: rgba(255, 255, 255, 0.4);
      width: 100%;
      transform-origin: left;
      animation: shrinkProgress ${duration}ms linear forwards;
      border-radius: 0 0 16px 16px;
    `;
    notification.appendChild(progressBar);

    // Icon container
    const iconDiv = document.createElement("div");
    iconDiv.style.cssText = `
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      font-weight: 600;
    `;
    iconDiv.textContent = color.icon;
    notification.appendChild(iconDiv);

    // Content wrapper
    const contentDiv = document.createElement("div");
    contentDiv.style.cssText = "flex: 1; padding-top: 4px;";
    contentDiv.textContent = message;
    notification.appendChild(contentDiv);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: ${color.text};
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
      flex-shrink: 0;
      font-weight: 600;
    `;
    closeBtn.onmouseover = () => {
      closeBtn.style.background = "rgba(255, 255, 255, 0.3)";
      closeBtn.style.transform = "rotate(90deg) scale(1.1)";
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
      closeBtn.style.transform = "rotate(0deg) scale(1)";
    };

    const closeNotification = () => {
      notification.style.animation =
        "slideOutRight 0.4s cubic-bezier(0.6, 0, 0.8, 0.4) forwards";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    };

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearTimeout(timeout);
      closeNotification();
    });

    notification.appendChild(closeBtn);

    this.container.appendChild(notification);

    // Auto remove after duration
    const timeout = setTimeout(() => {
      if (notification.parentNode) {
        closeNotification();
      }
    }, duration);

    return notification;
  }

  /**
   * Shortcut untuk success notification
   */
  success(message, duration = 3000) {
    return this.show(message, "success", duration);
  }

  /**
   * Shortcut untuk error notification
   */
  error(message, duration = 3000) {
    return this.show(message, "error", duration);
  }

  /**
   * Shortcut untuk warning notification
   */
  warning(message, duration = 3000) {
    return this.show(message, "warning", duration);
  }

  /**
   * Shortcut untuk info notification
   */
  info(message, duration = 3000) {
    return this.show(message, "info", duration);
  }

  /**
   * Tampilkan notifikasi untuk kegiatan overdue PPK
   * @param {Object} overdueData - Objek berisi count dan names dari kegiatan overdue
   * @param {number} overdueData.count - Jumlah kegiatan overdue
   * @param {Object[]} overdueData.kegiatan - Array objek kegiatan overdue, masing-masing dengan nama_kegiatan dan overdue_days
   * @param {number} duration - Durasi tampil dalam ms (default: 10000)
   */
  showOverdueKegiatanNotification(overdueData, duration = 10000) {
    const { count, kegiatan } = overdueData;
    if (count === 0 || !kegiatan || kegiatan.length === 0) {
      return;
    }

    kegiatan.forEach((item) => {
      const message = `Kegiatan "${item.nama_kegiatan}" belum diperiksa sejak ${item.overdue_days} hari yang lalu, silakan dicek segera.`;
      this.show(message, "warning", duration);
    });
  }

  /**
   * Clear semua notifikasi
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}

// Buat singleton instance dan expose ke global window
window.flasher = new FlasherNotification();

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideInRight {
    0% {
      transform: translateX(450px) scale(0.9);
      opacity: 0;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    0% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateX(450px) scale(0.9);
      opacity: 0;
    }
  }

  @keyframes shrinkProgress {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  .flasher-notification {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .flasher-notification:hover {
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18), 0 6px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px) scale(1.02);
  }

  .flasher-notification button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .flasher-notification button:active {
    transform: scale(0.9) !important;
  }

  /* Glassmorphism effect untuk container */
  #flasher-notification-container::before {
    content: '';
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  }

  /* Stacking effect untuk multiple notifications */
  .flasher-notification:nth-child(n+2) {
    margin-top: -4px;
  }

  @media (max-width: 768px) {
    #flasher-notification-container {
      max-width: calc(100vw - 32px) !important;
      right: 16px !important;
      top: 16px !important;
    }

    .flasher-notification {
      font-size: 14px !important;
      padding: 18px 20px !important;
      border-radius: 14px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flasher-notification {
      animation: none !important;
    }
    
    @keyframes slideInRight {
      from, to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  }
`;
document.head.appendChild(style);

export default window.flasher;
