// alerts.js
// SweetAlert2 modal examples with ULTRA COMPACT & BEAUTIFUL STYLING

// =========================================
// INJECT CUSTOM CSS FOR SWEETALERT2
// =========================================
(function injectCustomSwalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ========================================== */
    /* SWEETALERT2 ULTRA COMPACT BEAUTIFUL STYLING */
    /* ========================================== */
    
    /* Modal Container - ULTRA COMPACT */
    .swal2-popup {
      border-radius: 16px !important;
      padding: 1.25rem !important;
      max-width: 380px !important;
      width: 92% !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 
                  0 3px 12px rgba(0, 0, 0, 0.08) !important;
      backdrop-filter: blur(10px);
      background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%) !important;
    }

    /* Modal Title - COMPACT & BOLD */
    .swal2-title {
      font-size: 1.125rem !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      margin-bottom: 0.5rem !important;
      margin-top: 0 !important;
      line-height: 1.3 !important;
      letter-spacing: -0.01em !important;
    }

    /* Modal Content Text - COMPACT */
    .swal2-html-container {
      font-size: 0.875rem !important;
      color: #64748b !important;
      line-height: 1.5 !important;
      margin: 0 0 1rem 0 !important;
      font-weight: 400 !important;
    }

    /* Icons - COMPACT WITH GRADIENT BACKGROUNDS */
    .swal2-icon {
      margin: 0 auto 0.75rem auto !important;
      width: 60px !important;
      height: 60px !important;
      border-width: 3px !important;
    }

    /* Success Icon - PERFECT CHECKMARK */
    .swal2-icon.swal2-success {
      border-color: #10B981 !important;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
    }

    .swal2-icon.swal2-success [class^='swal2-success-line'] {
      background-color: #10B981 !important;
      height: 3.5px !important;
      border-radius: 2px !important;
    }

    .swal2-icon.swal2-success [class^='swal2-success-line'][class$='tip'] {
      width: 21px !important;
      left: 11px !important;
      top: 31px !important;
      transform: rotate(45deg) !important;
    }

    .swal2-icon.swal2-success [class^='swal2-success-line'][class$='long'] {
      width: 33px !important;
      right: 6px !important;
      top: 27px !important;
      transform: rotate(-45deg) !important;
    }

    .swal2-icon.swal2-success .swal2-success-ring {
      border-color: rgba(16, 185, 129, 0.25) !important;
    }
    
    .swal2-icon.swal2-success .swal2-success-fix {
      background-color: transparent !important;
      width: 7px !important;
      left: 28px !important;
      top: 19px !important;
      height: 90px !important;
    }

    /* Error Icon - FIXED X SHAPE */
    .swal2-icon.swal2-error {
      border-color: #EF4444 !important;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
    }

    .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
      background-color: #EF4444 !important;
      height: 3px !important;
    }

    .swal2-icon.swal2-error [class^='swal2-x-mark-line'][class$='left'] {
      width: 30px !important;
      left: 14px !important;
      top: 28px !important;
    }

    .swal2-icon.swal2-error [class^='swal2-x-mark-line'][class$='right'] {
      width: 30px !important;
      right: 14px !important;
      top: 28px !important;
    }

    /* Warning Icon */
    .swal2-icon.swal2-warning {
      border-color: #F59E0B !important;
      color: #F59E0B !important;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
    }

    .swal2-icon.swal2-warning .swal2-icon-content {
      font-size: 2.5rem !important;
    }

    /* Info Icon */
    .swal2-icon.swal2-info {
      border-color: #03C9D7 !important;
      color: #03C9D7 !important;
      background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%) !important;
    }

    /* Question Icon */
    .swal2-icon.swal2-question {
      border-color: #8B5CF6 !important;
      color: #8B5CF6 !important;
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%) !important;
    }

    /* Buttons Container - COMPACT */
    .swal2-actions {
      gap: 0.625rem !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    /* Confirm Button - MODERN & COMPACT */
    .swal2-confirm {
      background: linear-gradient(135deg, #03C9D7 0%, #0298a3 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 0.625rem 1.5rem !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      box-shadow: 0 2px 8px rgba(3, 201, 215, 0.3) !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer !important;
      letter-spacing: 0.02em !important;
    }

    .swal2-confirm:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(3, 201, 215, 0.4) !important;
      background: linear-gradient(135deg, #00b8c7 0%, #028792 100%) !important;
    }

    .swal2-confirm:active {
      transform: translateY(0) !important;
    }

    /* Cancel Button - MODERN & COMPACT */
    .swal2-cancel {
      background: #F1F5F9 !important;
      color: #64748b !important;
      border: 1.5px solid #E2E8F0 !important;
      border-radius: 8px !important;
      padding: 0.625rem 1.5rem !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      box-shadow: none !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer !important;
      letter-spacing: 0.02em !important;
    }

    .swal2-cancel:hover {
      background: #E2E8F0 !important;
      border-color: #CBD5E1 !important;
      color: #475569 !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    }

    .swal2-cancel:active {
      transform: translateY(0) !important;
    }

    /* Deny Button - MODERN & COMPACT */
    .swal2-deny {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 0.625rem 1.5rem !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      cursor: pointer !important;
      letter-spacing: 0.02em !important;
    }

    .swal2-deny:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
    }

    /* Input Fields - COMPACT & MODERN */
    .swal2-input, 
    .swal2-textarea {
      border: 2px solid #E5E7EB !important;
      border-radius: 8px !important;
      padding: 0.75rem !important;
      font-size: 0.875rem !important;
      transition: all 0.3s ease !important;
      background: #F9FAFB !important;
      margin: 0.5rem 0 !important;
    }

    .swal2-input:focus, 
    .swal2-textarea:focus {
      border-color: #03C9D7 !important;
      box-shadow: 0 0 0 4px rgba(3, 201, 215, 0.1) !important;
      background: white !important;
      outline: none !important;
    }

    .swal2-textarea {
      min-height: 100px !important;
      resize: vertical !important;
    }

    /* Validation Message - COMPACT */
    .swal2-validation-message {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%) !important;
      color: #DC2626 !important;
      border-radius: 8px !important;
      padding: 0.625rem 0.875rem !important;
      border-left: 4px solid #EF4444 !important;
      font-weight: 500 !important;
      font-size: 0.8125rem !important;
      margin-top: 0.5rem !important;
    }

    /* Timer Progress Bar */
    .swal2-timer-progress-bar {
      background: linear-gradient(90deg, #03C9D7 0%, #0298a3 100%) !important;
      height: 4px !important;
    }

    /* Loading Spinner */
    .swal2-loader {
      border-color: #03C9D7 transparent #03C9D7 transparent !important;
    }

    /* Close Button - COMPACT */
    .swal2-close {
      color: #9CA3AF !important;
      font-size: 1.75rem !important;
      width: 2rem !important;
      height: 2rem !important;
      transition: all 0.2s ease !important;
      top: 0.875rem !important;
      right: 0.875rem !important;
    }

    .swal2-close:hover {
      color: #EF4444 !important;
      transform: scale(1.15) !important;
    }

    /* Backdrop */
    .swal2-container {
      backdrop-filter: blur(4px) !important;
      background: rgba(15, 23, 42, 0.6) !important;
    }

    /* Footer - COMPACT */
    .swal2-footer {
      border-top: 1px solid #E5E7EB !important;
      padding-top: 0.875rem !important;
      margin-top: 0.875rem !important;
      color: #6B7280 !important;
      font-size: 0.8125rem !important;
    }

    .swal2-footer a {
      color: #03C9D7 !important;
      text-decoration: none !important;
      font-weight: 600 !important;
      transition: color 0.3s ease !important;
    }

    .swal2-footer a:hover {
      color: #0298a3 !important;
      text-decoration: underline !important;
    }

    /* Progress Steps - COMPACT */
    .swal2-progress-steps {
      margin-bottom: 1.25rem !important;
    }

    .swal2-progress-step {
      background: #E5E7EB !important;
      color: #6B7280 !important;
      border-radius: 50% !important;
      width: 2.25rem !important;
      height: 2.25rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-weight: 600 !important;
      font-size: 0.875rem !important;
      transition: all 0.3s ease !important;
    }

    .swal2-progress-step.swal2-active-progress-step {
      background: linear-gradient(135deg, #03C9D7 0%, #0298a3 100%) !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(3, 201, 215, 0.4) !important;
      transform: scale(1.1) !important;
    }

    .swal2-progress-step-line {
      background: #E5E7EB !important;
      height: 2px !important;
    }

    /* Toast Notifications - COMPACT */
    .swal2-toast {
      border-radius: 12px !important;
      padding: 0.875rem 1.25rem !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    }

    .swal2-toast .swal2-title {
      font-size: 0.9375rem !important;
      margin: 0 !important;
    }

    /* Responsive - MOBILE OPTIMIZATION */
    @media (max-width: 640px) {
      .swal2-popup {
        padding: 1rem !important;
        max-width: 340px !important;
        border-radius: 14px !important;
      }

      .swal2-title {
        font-size: 1rem !important;
        margin-bottom: 0.375rem !important;
      }

      .swal2-html-container {
        font-size: 0.8125rem !important;
        margin-bottom: 0.875rem !important;
      }

      .swal2-icon {
        width: 55px !important;
        height: 55px !important;
        margin-bottom: 0.625rem !important;
      }

      .swal2-confirm,
      .swal2-cancel,
      .swal2-deny {
        padding: 0.5rem 1.25rem !important;
        font-size: 0.8125rem !important;
      }

      .swal2-actions {
        gap: 0.5rem !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

// =========================================
// SWEETALERT2 MODAL EXAMPLES
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  // Basic Alerts
  document.getElementById("basic-alert")?.addEventListener("click", () => {
    Swal.fire({
      text: "Any fool can use a computer!",
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("with-title")?.addEventListener("click", () => {
    Swal.fire({
      title: "The Internet?",
      text: "That thing is still around?",
      icon: "question",
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("footer-alert")?.addEventListener("click", () => {
    Swal.fire({
      icon: "info",
      title: "Oops...",
      text: "Something went wrong!",
      footer: '<a href="#">Why do I have this issue?</a>',
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("html-alert")?.addEventListener("click", () => {
    Swal.fire({
      title: "<strong>HTML <u>example</u></strong>",
      icon: "info",
      html: "You can use <b>bold text</b>, <a href='#'>links</a>, and other HTML tags",
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: "<i class='fa fa-thumbs-up'></i> Great!",
      cancelButtonText: "<i class='fa fa-thumbs-down'></i>",
      confirmButtonColor: "#03C9D7",
    });
  });

  // Positions
  const positions = ["top-start", "top-end", "bottom-start", "bottom-end"];
  positions.forEach((pos) => {
    document.getElementById(`position-${pos}`)?.addEventListener("click", () => {
      Swal.fire({
        position: pos,
        icon: "success",
        title: `Alert at ${pos}`,
        showConfirmButton: false,
        timer: 1500,
        confirmButtonColor: "#03C9D7",
      });
    });
  });

  // Animation examples
  const animations = {
    "bounce-in-animation": "animate__bounceIn",
    "fade-in-animation": "animate__fadeIn",
    "flip-x-animation": "animate__flipInX",
    "tada-animation": "animate__tada",
    "shake-animation": "animate__shakeX",
  };
  for (const [id, anim] of Object.entries(animations)) {
    document.getElementById(id)?.addEventListener("click", () => {
      Swal.fire({
        title: "Custom animation",
        showClass: { popup: `animate__animated ${anim}` },
        hideClass: { popup: "animate__animated animate__fadeOutUp" },
        confirmButtonColor: "#03C9D7",
      });
    });
  }

  // Type examples
  const types = ["success", "info", "warning", "error", "question"];
  types.forEach((type) => {
    document.getElementById(`type-${type}`)?.addEventListener("click", () => {
      Swal.fire({
        icon: type,
        title: `${type.toUpperCase()}!`,
        text: `This is a ${type} alert.`,
        confirmButtonColor: "#03C9D7",
      });
    });
  });

  // Custom Options
  document.getElementById("custom-image")?.addEventListener("click", () => {
    Swal.fire({
      title: "Sweet!",
      text: "Modal with a custom image.",
      imageUrl: "https://unsplash.it/400/200",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image",
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("auto-close")?.addEventListener("click", () => {
    Swal.fire({
      title: "Auto close alert!",
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => Swal.showLoading(),
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("outside-click")?.addEventListener("click", () => {
    Swal.fire({
      title: "Click outside to close",
      allowOutsideClick: true,
      confirmButtonColor: "#03C9D7",
    });
  });

  document.getElementById("progress-steps")?.addEventListener("click", async () => {
    const steps = ["1", "2", "3"];
    const swalQueueStep = Swal.mixin({
      confirmButtonText: "Next →",
      progressSteps: steps,
      showCancelButton: true,
      confirmButtonColor: "#03C9D7",
    });

    let result;
    for (let i = 0; i < steps.length; i++) {
      result = await swalQueueStep.fire({
        title: `Step ${i + 1}`,
        currentProgressStep: i,
      });
      if (result.dismiss) break;
    }
    if (result.value) Swal.fire("All done!", "", "success");
  });

  // Confirm dialogs
  document.getElementById("confirm-text")?.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#03C9D7",
    }).then((result) => {
      if (result.isConfirmed)
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          confirmButtonColor: "#03C9D7",
        });
    });
  });

  document.getElementById("confirm-color")?.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03C9D7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed)
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          confirmButtonColor: "#03C9D7",
        });
    });
  });
});

// ===============================
// REUSABLE ALERT FUNCTIONS (ULTRA COMPACT VERSION)
// ===============================

// Simple success alert
window.showSuccess = function (message) {
  Swal.fire({
    icon: "success",
    title: "Berhasil!",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#03C9D7"
  });
};

// Simple error alert
window.showError = function (message) {
  Swal.fire({
    icon: "error",
    title: "Gagal!",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#03C9D7"
  });
};

// Simple info alert
window.showInfo = function (message) {
  Swal.fire({
    icon: "info",
    title: "Informasi",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#03C9D7"
  });
};

// Warning alert
window.showWarning = function (message) {
  Swal.fire({
    icon: "warning",
    title: "Peringatan!",
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#03C9D7"
  });
};

// Confirm dialog
window.confirmAction = async function (title, text, confirmText = "Ya", cancelText = "Batal") {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#03C9D7",
    cancelButtonColor: "#6B7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
  return result.isConfirmed;
};

// Textarea prompt
window.promptTextarea = async function (title, placeholder = "", required = false) {
  const result = await Swal.fire({
    title: title,
    input: "textarea",
    inputPlaceholder: placeholder,
    inputValidator: (value) => {
      if (required && (!value || value.trim() === "")) {
        return "Field ini wajib diisi!";
      }
    },
    showCancelButton: true,
    confirmButtonColor: "#03C9D7",
    cancelButtonColor: "#6B7280",
    confirmButtonText: "Submit",
    cancelButtonText: "Batal"
  });

  return result.value;
};

// Number input prompt
window.promptNumber = async function (title, min = 1) {
  const result = await Swal.fire({
    title: title,
    input: "number",
    inputAttributes: {
      min: min,
      step: 1,
    },
    showCancelButton: true,
    confirmButtonColor: "#03C9D7",
    cancelButtonColor: "#6B7280",
    confirmButtonText: "Submit",
    cancelButtonText: "Batal"
  });

  return result.value;
};

// Toast notification
window.showToast = function (message, icon = 'success', position = 'top-end') {
  Swal.fire({
    toast: true,
    position: position,
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Loading modal
window.showLoading = function (title = 'Loading...', text = 'Mohon tunggu sebentar') {
  Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close modal
window.closeModal = function () {
  Swal.close();
};