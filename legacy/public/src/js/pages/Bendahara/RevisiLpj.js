// public/srcsrc/js/pages/bendahara/RevisiLpj.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

// Module-level variables to hold references to the event handlers
let currentBodyClickHandler = null;
let currentBodyChangeHandler = null;

export function renderRevisiLpjPage(path, userRole) {
  console.log("Rendering Revisi LPJ page for userRole:", userRole);
  const isBendahara = userRole.toLowerCase() === "bendahara";
  const isPengusul = userRole.toLowerCase() === "pengusul";

  // ==============================================
  // HELPER FUNCTIONS (Defined Locally)
  // ==============================================
  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const headers = { ...options.headers };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const config = { ...options, headers };
    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || "API request failed");
      }
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      Swal.fire({ icon: "error", title: "API Error", text: error.message });
      throw error;
    }
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rp 0";
    // Convert to string to ensure replace works
    let cleanAmount = String(amount);
    // Remove all characters except digits and a single decimal point
    // This handles values like "15000000.00" or "15000000"
    cleanAmount = cleanAmount.replace(/[^0-9.]/g, "");

    // Convert to float
    const number = parseFloat(cleanAmount);
    if (isNaN(number)) return "Rp 0"; // Handle cases where parsing fails

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const state = {
    satuan: [],
    anggaran: [],
    lampiran: [],
    kegiatan_lpj_status: null, // New state for LPJ status
  };

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
        .revisi-lpj-page {
          padding-right: 1rem;
        }
      }

      /* Border Drawing Animation - SUPER SMOOTH VERSION with POP-UP */
      .border-hover-draw {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Subtle pop-up effect saat hover */
      .border-hover-draw:hover {
        transform: translateY(-4px) scale(1.01);
      }

      .border-hover-draw::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 8px;
        padding: 2px;
        background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        
        /* Default state: hidden di tengah bawah */
        clip-path: polygon(
          50% 100%, 50% 100%,
          50% 100%, 50% 100%,
          50% 100%, 50% 100%,
          50% 100%, 50% 100%
        );
        
        /* Smooth reverse animation by default */
        animation: borderDrawReverse 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* Override for lampiran-item with comment */
      .lampiran-item.has-comment.border-hover-draw::before {
        background: linear-gradient(135deg, #EF4444, #DC2626, #EF4444); /* Red gradient */
      }

      /* Forward animation saat hover - SUPER SMOOTH */
      .border-hover-draw:hover::before {
        animation: borderDrawForward 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* ====== FORWARD ANIMATION (Mouse IN) ====== */
      /* Bawah → Kiri/Kanan → Atas */
      @keyframes borderDrawForward {
        0% {
          /* Start: titik tengah bawah */
          clip-path: polygon(
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%
          );
        }
        
        30% {
          /* Garis bawah expand smooth ke kiri-kanan */
          clip-path: polygon(
            0% 100%, 0% 100%,
            0% 100%, 50% 100%,
            50% 100%, 100% 100%,
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Border kiri & kanan naik bersamaan ke atas (SMOOTH!) */
          clip-path: polygon(
            0% 100%, 0% 0%,
            0% 0%, 50% 0%,
            50% 0%, 100% 0%,
            100% 0%, 100% 100%
          );
        }
        
        100% {
          /* Complete: border penuh dengan slight overshoot */
          clip-path: polygon(
            0% 100%, 0% 0%,
            0% 0%, 50% 0%,
            50% 0%, 100% 0%,
            100% 0%, 100% 100%
          );
        }
      }

      /* ====== REVERSE ANIMATION (Mouse OUT) ====== */
      /* Atas → Kiri/Kanan → Bawah */
      @keyframes borderDrawReverse {
        0% {
          /* Start: border penuh */
          clip-path: polygon(
            0% 100%, 0% 0%,
            0% 0%, 50% 0%,
            50% 0%, 100% 0%,
            100% 0%, 100% 100%
          );
        }
        
        30% {
          /* Garis atas & border kiri-kanan turun smooth */
          clip-path: polygon(
            0% 100%, 0% 100%,
            0% 100%, 50% 100%,
            50% 100%, 100% 100%,
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Garis bawah mulai menyusut ke tengah */
          clip-path: polygon(
            25% 100%, 25% 100%,
            25% 100%, 50% 100%,
            50% 100%, 75% 100%,
            75% 100%, 75% 100%
          );
        }
        
        100% {
          /* End: hilang di tengah bawah */
          clip-path: polygon(
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%
          );
        }
      }

      /* Bonus: Input subtle lift + shadow + glow saat hover */
      .border-hover-draw:hover input,
      .border-hover-draw:hover textarea,
      .border-hover-draw:hover select {
        border-color: rgba(0, 188, 212, 0.4) !important;
        box-shadow: 
          0 8px 24px rgba(0, 188, 212, 0.12),
          0 0 0 1px rgba(0, 188, 212, 0.1);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* ====== MAIN STEP CONTENT - Border Drawing + Pop-Up ====== */
      .main-step-content {
        display: none;
        position: relative;
      }

      .main-step-content.active {
        display: block;
        animation: 
          fadeIn 0.6s ease-out,
          popUpEntry 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Wrapper untuk border animation */
      .main-step-content.active > .bg-white {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Border drawing effect (made smoother to match .border-hover-draw) */
      .main-step-content.active > .bg-white::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 16px;
        padding: 2px;
        background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: -1;
        opacity: 0;

        /* Default hidden (center-bottom) */
        clip-path: polygon(
          50% 100%, 50% 100%,
          50% 100%, 50% 100%,
          50% 100%, 50% 100%,
          50% 100%, 50% 100%
        );

        /* Smoother animation + slightly longer so it feels natural on page load */
        animation: 
          mainStepBorderDraw 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.15s forwards,
          borderFadeIn 0.35s ease-out 0.15s forwards;
      }

      /* Pop-up subtle saat hover */
      .main-step-content.active > .bg-white:hover {
        transform: translateY(-6px) scale(1.005);
      }

      .main-step-content.active > .bg-white:hover::before {
        opacity: 1;
      }

      /* Animasi pop-up entry */
      @keyframes popUpEntry {
        0% {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Border drawing untuk main step */
      @keyframes mainStepBorderDraw {
        /* 0%: hidden center-bottom */
        0% {
          clip-path: polygon(
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%,
            50% 100%, 50% 100%
          );
        }

        /* 20%: bottom expands smoothly left-right */
        20% {
          clip-path: polygon(
            0% 100%, 0% 100%,
            0% 100%, 50% 100%,
            50% 100%, 100% 100%,
            100% 100%, 100% 100%
          );
        }

        /* 45%: sides start rising (soft corner formation) */
        45% {
          clip-path: polygon(
            0% 100%, 0% 65%,
            0% 65%, 50% 65%,
            50% 65%, 100% 65%,
            100% 65%, 100% 100%
          );
        }

        /* 75%: sides rise higher (near final) */
        75% {
          clip-path: polygon(
            0% 100%, 0% 30%,
            0% 30%, 50% 30%,
            50% 30%, 100% 30%,
            100% 30%, 100% 100%
          );
        }

        /* 100%: complete border */
        100% {
          clip-path: polygon(
            0% 100%, 0% 0%,
            0% 0%, 50% 0%,
            50% 0%, 100% 0%,
            100% 0%, 100% 100%
          );
        }
      }

      /* Border fade in */
      @keyframes borderFadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 0.8;
        }
      }

      /* Hover enhancement untuk main step */
      .main-step-content.active > .bg-white:hover::before {
        opacity: 1 !important;
        animation: none; /* Stop animation saat hover */
        clip-path: polygon(
          0% 100%, 0% 0%,
          0% 0%, 50% 0%,
          50% 0%, 100% 0%,
          100% 0%, 100% 100%
        );
      }

      /* FadeIn animation for step content */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .dynamic-field-item {
        transition: all 0.4s ease-in-out;
        overflow: hidden;
    }

    .dynamic-field-item.new-item-animation {
        animation: slide-in 0.4s ease-out;
    }
    
    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
        }
        to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px; /* Adjust based on content */
        }
    }

    .dynamic-field-item.removing {
      animation: slide-out 0.4s ease-out forwards;
    }

    @keyframes slide-out {
        from {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px; /* Adjust based on content */
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
            margin-top: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
            border: none;
        }
    }
      /* Lampiran comment button */
      .lampiran-comment-btn {
        width: 36px;
        height: 36px;
        background: #E0F7FA;
        color: #00BCD4;
        border: 2px solid #B2EBF2;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
        font-size: 0.9rem;
      }
      
      .lampiran-comment-btn:hover {
        background: #00BCD4;
        color: white;
        transform: scale(1.1);
      }
      
      .lampiran-comment-btn.has-comment {
        background: #FEE2E2;
        color: #EF4444;
        border-color: #FCA5A5;
        animation: pulse-comment 2s infinite;
      }
      
      .lampiran-comment-btn.has-comment:hover {
        background: #EF4444;
        color: white;
      }
      
      @keyframes pulse-comment {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      }
      
      /* Lampiran item container */
      .lampiran-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 6px;
        transition: all 0.2s ease;
      }
      
      .lampiran-item:hover {
        background: #F3F4F6;
      }
      
      .lampiran-item.has-comment {
        /* border-color: #FCA5A5; Removed as per user request */
        background-color: #FEF2F2;
      }
      .lampiran-item.has-comment:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        border-color: #F87171; /* A slightly darker red for the border */
        background-color: #FEE2E2; /* A light red for the background */
      }
      
      .lampiran-item.archived-lampiran {
        opacity: 0.6;
      }
      .lampiran-item.archived-lampiran .lampiran-content {
        text-decoration: line-through;
      }
      .lampiran-item.archived-lampiran .btn-delete-lampiran {
        display: none; /* Hide action buttons for archived items */
      }

      /* Enhanced File Upload Styling */

      /* Add File Button */
      .btn-add-lampiran {
        background: linear-gradient(135deg, #00BCD4, #0097A7);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.25rem;
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative; /* Needed for pseudo-element */
        overflow: hidden; /* Hide pseudo-element overflow */
      }
      .btn-add-lampiran:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
        color: white;
      }
      .btn-add-lampiran::after {
        content: '';
        position: absolute;
        top: 0;
        left: -120%; /* Start further off-screen for subtle entry */
        width: 150%; /* Make wider to cover button more naturally with gradient */
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%); /* Softer gradient */
                          transform: skewX(-10deg); /* Less slanted */
                          transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1); /* Longer transition */
                          z-index: 1; /* Above button content but below text/icon */      }
      .btn-add-lampiran:hover::after {
        left: 120%; /* Slide across to the right, matching new width */
      }

      /* Uploaded File Item */
      .lampiran-item {
        border: 1px solid #E5E7EB; /* Re-add small static border */
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background-color: #FFFFFF;
        transition: all 0.3s ease;
      }


      /* Make sure content is above the pseudo-element */
      .lampiran-content, .lampiran-item > .flex {
        position: relative;
      }
      .lampiran-item.has-comment {
        /* border-left: 4px solid #FCA5A5; Removed as per user request */
        background: #FEF2F2;
      }

      /* Pending File Item */
      .pending-lampiran {
        background-color: #EFF6FF;
        border-color: #BFDBFE;
      }

      /* Delete/Cancel Buttons */
      .btn-delete-lampiran, .btn-cancel-upload {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #EF4444; /* Solid Red background */
        color: white; /* White icon */
        border: none; /* No border needed */
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .btn-delete-lampiran:hover, .btn-cancel-upload:hover {
        background: linear-gradient(135deg, #F87171, #DC2626); /* Lighter to darker red gradient on hover */
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }


      .modal-content {
        border-radius: 16px;
        border: none;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .modal-header {
        border-bottom: 2px solid #F3F4F6;
        padding: 1.5rem;
        background: linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%);
        border-radius: 16px 16px 0 0;
      }
      
      .modal-title {
        color: #374151;
        font-weight: 700;
        font-size: 1.25rem;
      }
      
      .modal-body {
        padding: 2rem;
      }
      
      .form-control {
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        padding: 1rem;
        font-size: 0.95rem;
        transition: all 0.3s ease;
      }
      
      .form-control:focus {
        border-color: #00BCD4;
        box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
        outline: none;
      }

      /* Comment Detail Modal Styling - SAME AS REVISIKAK */
      #lampiranCommentModal .modal-dialog {
        max-width: 750px;
      }

      #lampiranCommentModal .modal-content {
        border: none;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      #lampiranCommentModal .modal-header {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        border: none;
        padding: 1.75rem 2rem;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem;
        flex-wrap: nowrap;
      }

      #lampiranCommentModal .modal-title {
        color: white;
        font-size: 1.5rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 !important;
        flex: 1;
        white-space: normal; /* Changed from nowrap */
        word-break: break-word; /* Added to handle long filenames */
        line-height: 1.2;
      }

      #lampiranCommentModal .modal-title i {
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }

      /* Custom close button - PERFECT VERSION */
      #lampiranCommentModal .btn-close {
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        opacity: 1;
        position: relative;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        margin: -4px 0 0 0;
        cursor: pointer;
        flex-shrink: 0;
        transition: none !important;
        transform: none !important;
        box-shadow: none !important;
      }

      #lampiranCommentModal .btn-close:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        transform: none !important;
        box-shadow: none !important;
      }

      /* X marks using pseudo-elements - PERFECT CROSS */
      #lampiranCommentModal .btn-close::before,
      #lampiranCommentModal .btn-close::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 2.5px;
        background: white;
        border-radius: 2px;
        transition: all 0.3s ease;
      }

      #lampiranCommentModal .btn-close::before {
        transform: translate(-50%, -50%) rotate(45deg);
      }

      #lampiranCommentModal .btn-close::after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      #lampiranCommentModal .btn-close:hover::before,
      #lampiranCommentModal .btn-close:hover::after {
        background: white;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
      }

      /* Remove default Bootstrap close button styles */
      #lampiranCommentModal .btn-close:focus {
        box-shadow: none;
        outline: none;
      }

      #lampiranCommentModal .modal-body {
        padding: 2rem;
        max-height: 60vh;
        overflow-y: auto;
        background: linear-gradient(to bottom, #FAFAFA 0%, #F5F5F5 100%);
      }

      /* Completely hide scrollbar */
      #lampiranCommentModal .modal-body::-webkit-scrollbar {
        display: none;
      }

      #lampiranCommentModal .modal-body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .action-buttons {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        margin-top: 2rem;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .comment-count {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00897B 0%, #004D40 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1rem;
        box-shadow: 0 8px 20px rgba(0, 137, 123, 0.4);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .comment-count i {
        font-size: 1.5rem;
      }
      
      .form-control-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        border-radius: 0.5rem;
      }

      .info-box {
        padding: 1rem;
        border-radius: 8px;
        background: #EFF6FF;
        border-left: 4px solid #3B82F6;
        margin-top: 1rem;
      }
      
      .info-box-text {
        font-size: 0.875rem;
        color: #1E40AF;
      }

      /* Custom Button Styles for RevisiLpj */
      .lpj-custom-btn {
        padding: 1rem 2.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center; /* Center horizontally */
        gap: 0.5rem;
        position: relative; /* Needed for pseudo-element */
        overflow: hidden; /* Hide pseudo-element overflow */
      }
      .lpj-custom-btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: -120%; /* Start further off-screen for subtle entry */
        width: 150%; /* Make wider to cover button more naturally with gradient */
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%); /* Softer gradient */
        transform: skewX(-10deg); /* Less slanted */
        transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1); /* Longer transition */
        z-index: 1; /* Above button content but below text/icon */
      }
      .lpj-custom-btn:hover::after {
        left: 120%; /* Slide across to the right, matching new width */
      }

      .lpj-custom-btn.btn-back-style {
        background: #F3F4F6;
        color: #6B7280;
        border: 2px solid #E5E7EB;
      }
      .lpj-custom-btn.btn-back-style:hover {
        background: #E5E7EB;
        color: #374151;
      }

      .lpj-custom-btn.btn-revise-style {
        background: linear-gradient(135deg, #EF5350 0%, #E53935 100%); /* Material Red gradient for revision */
        color: white;
      }
      .lpj-custom-btn.btn-revise-style:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4); /* Material Red shadow */
      }

      .lpj-custom-btn.btn-approve-style {
        background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%); /* Material Green gradient for approval */
        color: white;
      }
      .lpj-custom-btn.btn-approve-style:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(67, 160, 71, 0.4); /* Material Green shadow */
      }

      .lpj-custom-btn.btn-complete-style {
        background: linear-gradient(135deg, #29B6F6 0%, #039BE5 100%); /* Material Light Blue gradient for complete */
        color: white;
      }
      .lpj-custom-btn.btn-complete-style:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(3, 155, 229, 0.4); /* Material Light Blue shadow */
      }

      /* Resubmit button for Pengusul */
      .lpj-custom-btn.btn-resubmit-style {
        background: linear-gradient(135deg, #29B6F6 0%, #039BE5 100%); /* Material Light Blue gradient */
        color: white;
      }
      .lpj-custom-btn.btn-resubmit-style:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(3, 155, 229, 0.4); /* Material Light Blue shadow */
      }
      /* Spectacular Divider */
      .spectacular-divider {
        position: relative;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
      }
      .spectacular-divider::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.3), #00BCD4, rgba(0, 188, 212, 0.3), transparent);
        border-radius: 100%;
        opacity: 0.8;
        box-shadow: 0 2px 4px rgba(0, 188, 212, 0.2);
      }
      /* Spectacular Total Card */
      .spectacular-total-card {
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        border: 1px solid rgba(0, 188, 212, 0.2);
        border-radius: 20px;
        padding: 2rem 2.5rem;
        margin-top: 3rem;
        box-shadow: 0 20px 40px -10px rgba(0, 188, 212, 0.15);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
      }
      .spectacular-total-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #00BCD4, #00E5FF);
      }
      .spectacular-total-card::after {
        content: '';
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(0, 188, 212, 0.08) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
      }
      .total-label {
        font-size: 1.25rem;
        color: #455A64;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .total-label i {
        font-size: 1.75rem;
        color: #00BCD4;
        background: rgba(0, 188, 212, 0.1);
        padding: 0.75rem;
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.1);
      }
      .total-value {
        font-size: 2.75rem;
        font-weight: 800;
        background: linear-gradient(135deg, #0097A7 0%, #006064 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
        letter-spacing: -0.5px;
      }

      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .lpj-review-page {
            padding: 1rem;
        }
        
        /* Enable horizontal scroll for complex grid rows */
        .category-section {
            overflow-x: auto;
        }
        .border-hover-draw {
            min-width: 800px; /* Ensure rows don't break layout */
        }
        
        /* Action buttons stack */
        .action-buttons {
            flex-direction: column;
            gap: 1rem;
        }
        .action-buttons button, .action-buttons .flex {
            width: 100%;
        }
        .action-buttons .flex {
            flex-direction: column;
        }
        
        /* Total card */
        .spectacular-total-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
      }
    </style>

    <div class="lpj-review-page">
      <div class=" active">
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 class="font-bold text-2xl text-gray-800" id="kegiatan-title">Memuat...</h3>
          <p class="text-gray-500" id="pengusul-name">Oleh: Memuat...</p>
        </div>
      </div>

      <div class=" active">
        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div id="anggaran-container">
              <div class="text-center p-8">Memuat item anggaran...</div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons (Fixed at bottom) -->
      <div class="action-buttons">
        <button class="lpj-custom-btn btn-back-style" onclick="history.back()">
          <i class="ti ti-arrow-left">&#xea1b;</i> Kembali
        </button>
        ${
          isBendahara
            ? `
          <div class="flex gap-4">
            <button class="lpj-custom-btn btn-revise-style" id="btn-request-revision" style="display: none;">
              <i class="ti ti-send">&#xeb1e;</i> Kirim Revisi
            </button>
            <button class="lpj-custom-btn btn-approve-style" id="btn-approve-lpj" style="display: none;">
              <i class="ti ti-check">&#xea5e;</i> Setuju
            </button>
            <button class="lpj-custom-btn btn-complete-style" id="btn-complete-lpj" style="display: none;">
              <i class="ti ti-check-double"></i> Selesaikan LPJ
            </button>
          </div>
        `
            : ""
        }
        ${
          isPengusul
            ? `
          <div class="flex gap-4">
            <button class="lpj-custom-btn btn-resubmit-style" id="btn-resubmit-lpj">
              <i class="ti ti-send">&#xeb1e;</i> Submit ulang Revisi
            </button>
          </div>
        `
            : ""
        }
      </div>

      <!-- Comment Count Badge -->
      <div class="comment-count" id="commentCountBadge" style="display: none;">
        <i class="ti ti-message-dots"></i>
        <span id="commentCountText">0 Catatan</span>
      </div>
    </div>

    <!-- Lampiran Comment Modal -->
    <div class="modal fade" id="lampiranCommentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
            <h5 class="modal-title" style="margin: 0; flex: 1;">
              <i class="ti ti-message-dots">&#xeaee;</i>
              Catatan Revisi untuk <span id="lampiranCommentLabel" style="color: white; font-weight: 800;"></span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label font-semibold" style="color: #374151;">Nama File</label>
              <div class="p-3 rounded-lg" style="background: #F3F4F6; color: #374151;" id="lampiranFileName"></div>
            </div>
            <div id="lampiranCommentInputContainer" style="${
              isPengusul ? "display: none;" : ""
            }">
              <label class="form-label font-semibold" style="color: #374151;">Catatan Revisi</label>
              <textarea id="lampiranCommentInput" class="form-control" rows="5" placeholder="Tuliskan catatan revisi untuk lampiran ini..."></textarea>
            </div>
            <div id="lampiranCommentDisplayContainer" style="${
              isBendahara ? "display: none;" : ""
            }">
              <label class="form-label font-semibold" style="color: #374151;">Catatan dari Bendahara</label>
              <div class="p-3 rounded-lg" style="background: #FEF2F2; color: #374151; border-left: 4px solid #EF4444;" id="lampiranCommentDisplayText"></div>
            </div>
            <div class="info-box">
              <div class="info-box-text">
                <i class="ti ti-info-circle">&#xeac5;</i> Berikan masukan yang jelas dan konstruktif untuk membantu pengusul memperbaiki lampiran.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" tabindex="-1" data-bs-dismiss="modal">
              <i class="ti ti-x">&#xeb55;</i> Batal
            </button>
            ${
              isBendahara
                ? '<button type="button" class="btn btn-primary" id="saveLampiranCommentBtn"><i class="ti ti-check">&#xea5e;</i> Simpan Catatan</button>'
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  const pathSegments = path.split("/").filter(Boolean);
  const kegiatanId = pathSegments[pathSegments.length - 1];

  let lampiranComments = {};
  let lampiranCommentModalInstance = null;

  function init() {
    lampiranCommentModalInstance = new bootstrap.Modal(
      document.getElementById("lampiranCommentModal")
    );

    const modalEl = document.getElementById("lampiranCommentModal");
    modalEl.addEventListener("hidden.bs.modal", function () {
      document.getElementById("lampiranCommentInput").value = "";
    });
    modalEl.addEventListener("shown.bs.modal", function () {
      const input = document.getElementById("lampiranCommentInput");
      if (input && !input.disabled) {
        input.focus();
      }
    });

    const commentInput = document.getElementById("lampiranCommentInput");
    if (commentInput) {
      commentInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          document.getElementById("saveLampiranCommentBtn").click();
        }
      });
    }

    fetchAndPopulateData();
    attachEventListeners();
    updateCommentCount();
  }

  function calculateRevisiLpjTotals() {
    let grandTotal = 0;

    document.querySelectorAll(".category-section").forEach((section) => {
      let subtotal = 0;
      section.querySelectorAll(".border-hover-draw").forEach((row) => {
        const realisasiGrid = row.querySelector(".realisasi-grid");
        if (!realisasiGrid) return;

        const vol1Input = realisasiGrid.querySelector(
          'input[data-field="realisasi_volume1"]'
        );
        const vol2Input = realisasiGrid.querySelector(
          'input[data-field="realisasi_volume2"]'
        );
        const vol3Input = realisasiGrid.querySelector(
          'input[data-field="realisasi_volume3"]'
        );
        const hargaInput = realisasiGrid.querySelector(
          'input[data-field="realisasi_harga_satuan"]'
        );

        const v1 = parseFloat(vol1Input?.value) || 0;
        const v2 =
          vol2Input?.value === "" ||
          vol2Input?.value === null ||
          vol2Input?.value === "0"
            ? 1
            : parseFloat(vol2Input.value);
        const v3 =
          vol3Input?.value === "" ||
          vol3Input?.value === null ||
          vol3Input?.value === "0"
            ? 1
            : parseFloat(vol3Input.value);

        let harga = 0;
        if (
          typeof AutoNumeric !== "undefined" &&
          AutoNumeric.getAutoNumericElement(hargaInput)
        ) {
          harga = AutoNumeric.getAutoNumericElement(hargaInput).getNumber();
        } else {
          harga = parseFloat(hargaInput?.value.replace(/[^0-9]/g, "")) || 0;
        }

        subtotal += v1 * v2 * v3 * harga;
      });

      const subtotalEl = section.querySelector(".subtotal-display");
      if (subtotalEl) {
        subtotalEl.textContent = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(subtotal);
      }
      grandTotal += subtotal;
    });

    const grandTotalEl = document.getElementById("grand-total-lpj");
    if (grandTotalEl) {
      grandTotalEl.textContent = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(grandTotal);
    }
  }

  async function fetchAndPopulateData() {
    Swal.fire({
      title: "Memuat Data LPJ...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const [lpjResponse, satuanResponse] = await Promise.all([
        apiRequest(`/kegiatan/${kegiatanId}/lpj/review`),
        apiRequest("/master/satuan"),
      ]);

      const { kegiatan, anggaran, lampiran } = lpjResponse.data;
      state.satuan = satuanResponse.data;
      state.anggaran = anggaran;
      state.lampiran = lampiran;
      state.kegiatan_lpj_status = kegiatan.lpj_status; // Populate new state

      updateBendaharaButtonVisibility(kegiatan.lpj_status);

      document.getElementById("kegiatan-title").textContent =
        "Nama Kegiatan: " + kegiatan.nama_kegiatan;

      document.getElementById("pengusul-name").textContent =
        "Pengusul: " + kegiatan.pelaksana_manual;

      const groupedAnggaran = anggaran.reduce((acc, item) => {
        const category = item.nama_kategori_belanja || "Lain-lain";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});

      const lampiranMap = lampiran.reduce((acc, file) => {
        if (!acc[file.anggaran_id]) {
          acc[file.anggaran_id] = [];
        }
        acc[file.anggaran_id].push(file);
        return acc;
      }, {});

      const anggaranContainer = document.getElementById("anggaran-container");
      anggaranContainer.innerHTML = "";

      for (const category in groupedAnggaran) {
        const categorySection = document.createElement("div");
        const isLastCategory =
          Object.keys(groupedAnggaran).indexOf(category) ===
          Object.keys(groupedAnggaran).length - 1;
        categorySection.className = `category-section mb-8 ${
          !isLastCategory ? "spectacular-divider" : ""
        }`;

        categorySection.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-xl font-semibold text-gray-700">${category}</h4>
                <div class="text-right">
                    <span class="text-sm text-gray-500">Subtotal (Realisasi):</span>
                    <span class="font-bold text-lg ml-2 subtotal-display" style="color: #00BCD4;">Rp 0</span>
                </div>
            </div>
        `;

        groupedAnggaran[category].forEach((item, index) => {
          const itemLampiran = lampiranMap[item.anggaran_id] || [];
          const section = document.createElement("div");
          section.innerHTML = createDetailedAnggaranRow(
            item,
            itemLampiran,
            index
          );
          categorySection.appendChild(section);
        });
        anggaranContainer.appendChild(categorySection);
      }

      // Grand Total
      const totalSection = document.createElement("div");
      totalSection.className = "spectacular-total-card";
      totalSection.innerHTML = `
        <div class="total-label">
            <i class="ti ti-receipt-2"></i>
            <span>Total Realisasi LPJ</span>
        </div>
        <div id="grand-total-lpj" class="total-value">Rp 0</div>
      `;
      anggaranContainer.appendChild(totalSection);

      initializeComments(lampiran);
      updateAllCommentIcons();

      // Initialize AutoNumeric
      if (typeof AutoNumeric !== "undefined") {
        const numericOptions = {
          currencySymbol: "Rp ",
          digitGroupSeparator: ".",
          decimalCharacter: ",",
          decimalPlaces: 0,
          minimumValue: "0",
          readOnly: !isPengusul, // Readonly if not pengusul
        };

        anggaranContainer
          .querySelectorAll(".autonumeric-currency")
          .forEach((el) => {
            const rawValue = el.dataset.rawValue;
            const anElement = new AutoNumeric(el, numericOptions);
            if (
              rawValue !== undefined &&
              rawValue !== null &&
              rawValue !== ""
            ) {
              anElement.set(rawValue);
            }
            el.addEventListener(
              "autoNumeric:rawValueModified",
              calculateRevisiLpjTotals
            );
          });
      }

      // Event listener for volume inputs
      anggaranContainer.addEventListener("input", (e) => {
        if (e.target.matches('input[type="number"]')) {
          calculateRevisiLpjTotals();
        }
      });

      // Initial calculation
      calculateRevisiLpjTotals();

      Swal.close();
    } catch (error) {
      Swal.fire("Error", `Gagal memuat data LPJ: ${error.message}`, "error");
    }
  }

  function getSatuanOptions(selectedValue) {
    const defaultOption = `<option value="" ${
      selectedValue == null || selectedValue === "" ? "selected" : ""
    }></option>`;
    return (
      defaultOption +
      state.satuan
        .map(
          (s) =>
            `<option value="${s.satuan_id}" ${
              s.satuan_id == selectedValue ? "selected" : ""
            }>${s.nama_satuan}</option>`
        )
        .join("")
    );
  }

  function createDetailedAnggaranRow(item, lampiran, index) {
    const commonInputClasses = "w-full px-4 py-3 border-2 rounded-lg text-sm";

    const onFocus =
      "this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)'; this.style.outline='none !important';";

    const onBlur =
      "this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';";

    const readOnlyAttr = "readonly disabled";

    const readOnlyStyle = `style="background: #F3F4F6 !important; border-color: #E5E7EB !important; cursor: not-allowed;"`;

    const canEdit = isPengusul;

    const inputAttr = canEdit
      ? `onfocus="${onFocus}" onblur="${onBlur}"`
      : readOnlyAttr;

    const inputStyle = canEdit
      ? `style="border-color: #E5E7EB; background: #FFFFFF;"`
      : readOnlyStyle;

    const realisasiHargaVal =
      item.realisasi_harga_satuan !== undefined
        ? item.realisasi_harga_satuan
        : item.harga_satuan || 0;

    const lampiranListHTML =
      lampiran.length > 0
        ? lampiran

            .map(
              (file) => `

                <div class="lampiran-item border-hover-draw ${
                  lampiranComments[file.lampiran_id] ? "has-comment" : ""
                } ${
                file.status_lampiran === "archived" ? "archived-lampiran" : ""
              }" data-lampiran-id="${file.lampiran_id}">

                   <div class="lampiran-content">

                     <i class="ti ti-file-text text-gray-400"></i>

                     <a href="javascript:void(0);"
                        data-lampiran-id="${file.lampiran_id}"
                        class="text-blue-600 hover:underline text-sm view-file-btn">${
                          file.nama_file_asli
                        }</a>

                   </div>

                   <div class="flex items-center gap-2">

                      ${
                        isBendahara || isPengusul
                          ? `<button type="button" class="lampiran-comment-btn ${
                              lampiranComments[file.lampiran_id]
                                ? "has-comment"
                                : ""
                            }" data-lampiran-id="${
                              file.lampiran_id
                            }" data-filename="${
                              file.nama_file_asli
                            }" title="Komentar">

                                <i class="ti ti-message-circle-2">&#xeaed;</i>

                            </button>`
                          : ""
                      }

                      ${
                        isPengusul && file.status_lampiran !== "archived"
                          ? `<button type="button" class="btn-delete-lampiran" data-lampiran-id="${file.lampiran_id}" title="Hapus file"><i class="ti ti-trash">&#xeb41;</i></button>`
                          : ""
                      }

                   </div>

                </div>
            `
            )

            .join("")
        : '<p class="text-xs text-gray-400 italic no-files">Tidak ada bukti terlampir untuk item ini.</p>';

    return `

        <div class="mb-4 p-4 rounded-xl border-hover-draw" data-anggaran-id="${
          item.anggaran_id
        }">

          

          <div class="mb-6">

              <h5 class="mb-4 font-bold text-lg" style="color: #374151;">Rencana Anggaran Biaya (KAK)</h5>

              <div class="grid grid-cols-[2.5fr_0.8fr_1.2fr_0.8fr_1.2fr_0.8fr_1.2fr_2.5fr] gap-4 items-end mb-4">

                <div><label class="block font-semibold mb-2 text-sm">Uraian</label><input type="text" disabled class="${commonInputClasses}" ${readOnlyStyle} value="${
      item.uraian || ""
    }"></div>

                <div><label class="block font-semibold mb-2 text-sm">Qty 1</label><input type="number" disabled class="${commonInputClasses}" ${readOnlyStyle} value="${
      item.volume1 || ""
    }"></div>

                <div><label class="block font-semibold mb-2 text-sm">Satuan 1</label><select disabled class="${commonInputClasses}" ${readOnlyStyle}>${getSatuanOptions(
      item.satuan1_id
    )}</select></div>

                <div><label class="block font-semibold mb-2 text-sm">Qty 2</label><input type="number" disabled class="${commonInputClasses}" ${readOnlyStyle} value="${
      item.volume2 || ""
    }"></div>

                <div><label class="block font-semibold mb-2 text-sm">Satuan 2</label><select disabled class="${commonInputClasses}" ${readOnlyStyle}>${getSatuanOptions(
      item.satuan2_id
    )}</select></div>

                <div><label class="block font-semibold mb-2 text-sm">Qty 3</label><input type="number" disabled class="${commonInputClasses}" ${readOnlyStyle} value="${
      item.volume3 || ""
    }"></div>

                <div><label class="block font-semibold mb-2 text-sm">Satuan 3</label><select disabled class="${commonInputClasses}" ${readOnlyStyle}>${getSatuanOptions(
      item.satuan3_id
    )}</select></div>

                <div><label class="block font-semibold mb-2 text-sm">Harga Satuan</label><input type="text" disabled class="${commonInputClasses}" ${readOnlyStyle} value="${formatCurrency(
      item.harga_satuan
    )}"></div>

              </div>

          </div>

  

          <div>

              <h5 class="mb-4 font-bold text-lg" style="color: #00BCD4;">Realisasi Pertanggungjawaban (LPJ)</h5>

              <div class="grid grid-cols-[2.5fr_0.8fr_1.2fr_0.8fr_1.2fr_0.8fr_1.2fr_2.5fr] gap-4 items-end mb-4 realisasi-grid">

                <div>

                  <label class="block font-semibold mb-2 text-sm">Uraian</label>

                  <input type="text" disabled class="${commonInputClasses} realisasi-input" data-field="realisasi_uraian" ${readOnlyStyle} value="${
      item.realisasi_uraian || item.uraian || ""
    }">

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Qty 1</label>

                  <input type="number" min="0" ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_volume1" ${inputStyle} value="${
      item.realisasi_volume1 || item.volume1 || ""
    }">

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Satuan 1</label>

                  <select ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_satuan1_id" ${inputStyle}>${getSatuanOptions(
      item.realisasi_satuan1_id || item.satuan1_id
    )}</select>

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Qty 2</label>

                  <input type="number" min="0" ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_volume2" ${inputStyle} value="${
      item.realisasi_volume2 || item.volume2 || ""
    }">

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Satuan 2</label>

                  <select ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_satuan2_id" ${inputStyle}>${getSatuanOptions(
      item.realisasi_satuan2_id || item.satuan2_id
    )}</select>

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Qty 3</label>

                  <input type="number" min="0" ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_volume3" ${inputStyle} value="${
      item.realisasi_volume3 || item.volume3 || ""
    }">

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Satuan 3</label>

                  <select ${inputAttr} class="${commonInputClasses} realisasi-input" data-field="realisasi_satuan3_id" ${inputStyle}>${getSatuanOptions(
      item.realisasi_satuan3_id || item.satuan3_id
    )}</select>

                </div>

                <div>

                  <label class="block font-semibold mb-2 text-sm">Harga Satuan</label>

                  <input type="text" ${inputAttr} class="${commonInputClasses} realisasi-input autonumeric-currency" data-field="realisasi_harga_satuan" ${inputStyle} data-raw-value="${realisasiHargaVal}">

                </div>

                </div>

  

                  <div class="mt-4">

  

                      <h6 class="font-semibold text-xs text-gray-500 mb-2">BUKTI/LAMPIRAN:</h6>

  

                      <div class="pl-4 border-l-2 border-gray-200 space-y-2 lampiran-list" data-anggaran-id="${
                        item.anggaran_id
                      }">

                          ${lampiranListHTML}

                      </div>

  

                      ${
                        isPengusul
                          ? `

                        <div class="mt-2">

                          <input type="file" class="input-add-lampiran" data-anggaran-id="${item.anggaran_id}" multiple style="display: none;" />

                                                    <button type="button" class="btn-add-lampiran btn btn-sm btn-outline-primary" data-anggaran-id="${item.anggaran_id}">

                                                      <i class="ti ti-script-plus">&#xf2d8;</i> Tambah File

                                                    </button>

                        </div>`
                          : ""
                      }

                  </div>

  

                </div>

      `;
  }

  function initializeComments(lampiran) {
    lampiranComments = {};
    lampiran.forEach((file) => {
      if (file.catatan_reviewer) {
        lampiranComments[file.lampiran_id] = file.catatan_reviewer;
      }
    });
    updateCommentCount();
  }

  function updateAllCommentIcons() {
    document.querySelectorAll(".lampiran-item").forEach((item) => {
      const lampiranId = item.dataset.lampiranId;
      const comment = lampiranComments[lampiranId];

      const btn = item.querySelector(".lampiran-comment-btn");
      if (btn) {
        btn.classList.toggle("has-comment", !!comment);
      }

      item.classList.toggle("has-comment", !!comment);
    });
  }

  async function openLampiranCommentModal(btn) {
    const lampiranId = btn.getAttribute("data-lampiran-id");
    const filename = btn.getAttribute("data-filename");

    const modalElement = document.getElementById("lampiranCommentModal");
    modalElement.dataset.lampiranId = lampiranId; // Store ID on the modal

    document.getElementById("lampiranCommentLabel").textContent = filename;
    document.getElementById("lampiranFileName").textContent = filename;

    const commentInput = document.getElementById("lampiranCommentInput");
    const commentDisplay = document.getElementById(
      "lampiranCommentDisplayText"
    );

    // Show loading state
    commentInput.value = "Memuat catatan...";
    commentInput.disabled = true;
    commentDisplay.textContent = "Memuat catatan...";

    lampiranCommentModalInstance.show();

    try {
      const response = await apiRequest(`/lampiran/${lampiranId}`);
      const lampiranData = response.data;
      const commentText = lampiranData.catatan_reviewer || "";
      const saveBtn = document.getElementById("saveLampiranCommentBtn");

      if (isBendahara) {
        commentInput.value = commentText;
        if (lampiranData.status_lampiran === 'archived') {
            commentInput.disabled = true;
            commentInput.placeholder = "Lampiran ini telah diarsipkan dan tidak dapat dikomentari.";
            if (saveBtn) saveBtn.style.display = 'none';
        } else {
            commentInput.disabled = false;
            commentInput.placeholder = "Tuliskan catatan revisi untuk lampiran ini...";
            if (saveBtn) saveBtn.style.display = 'inline-block';
        }
      }
      
      commentDisplay.textContent = commentText || "(Tidak ada catatan)";

    } catch (error) {
      const errorMsg = `Gagal memuat catatan: ${error.message}`;
      commentInput.value = errorMsg;
      commentDisplay.textContent = errorMsg;
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    }
  }

  async function saveLampiranComment() {
    const modalElement = document.getElementById("lampiranCommentModal");
    const lampiranId = modalElement.dataset.lampiranId; // Retrieve ID from the modal
    const comment = document
      .getElementById("lampiranCommentInput")
      .value.trim();

    if (!lampiranId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Tidak dapat menemukan ID lampiran. Coba lagi.",
      });
      return;
    }

    const saveBtn = document.getElementById("saveLampiranCommentBtn");
    if (window.setButtonLoading && saveBtn) {
      window.setButtonLoading(saveBtn, true, "Menyimpan...");
    }

    try {
      const response = await apiRequest(`/lampiran/${lampiranId}/catatan`, {
        method: "POST",
        body: JSON.stringify({ catatan_reviewer: comment }),
      });

      // Update local state only on success
      if (comment) {
        lampiranComments[lampiranId] = comment;
      } else {
        delete lampiranComments[lampiranId];
      }

      updateAllCommentIcons();
      updateCommentCount();

      const saveBtn = document.getElementById("saveLampiranCommentBtn");
      if (window.setButtonLoading && saveBtn) {
        window.setButtonLoading(saveBtn, false);
      }

      lampiranCommentModalInstance.hide();

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        text: "Catatan berhasil disimpan ke database.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      const saveBtn = document.getElementById("saveLampiranCommentBtn");
      if (window.setButtonLoading && saveBtn) {
        window.setButtonLoading(saveBtn, false);
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: `Terjadi kesalahan saat menyimpan catatan: ${error.message}`,
      });
    }
  }

  function updateCommentCount() {
    const count = Object.keys(lampiranComments).length;

    const badge = document.getElementById("commentCountBadge");
    const text = document.getElementById("commentCountText");

    if (badge && text) {
      if (count > 0) {
        text.textContent = `${count} Catatan`;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    }
  }

  async function submitRevision() {
    // Kumpulkan semua catatan lampiran yang disimpan secara lokal untuk dikirim ke API.
    const lampiran_comments = [];
    Object.entries(lampiranComments).forEach(
      ([lampiranId, catatan_reviewer]) => {
        lampiran_comments.push({ id: lampiranId, catatan_reviewer });
      }
    );

    if (Object.keys(lampiranComments).length === 0) {
      Swal.fire(
        "Peringatan",
        "Anda harus memberikan setidaknya satu catatan revisi.",
        "warning"
      );
      return;
    }

    const payload = {
      catatan_umum:
        "LPJ perlu direvisi. Mohon periksa catatan pada setiap lampiran.",
      anggaran_comments: [],
      lampiran_comments,
    };

    Swal.fire({
      title: "Mengirim Revisi...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await apiRequest(`/kegiatan/${kegiatanId}/lpj/revise`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await Swal.fire(
        "Sukses",
        "LPJ telah dikembalikan ke pengusul untuk direvisi.",
        "success"
      );
      window.location.href = "/bendahara/kegiatan/lpj";
    } catch (error) {
      Swal.fire("Error", `Gagal mengirim revisi: ${error.message}`, "error");
    }
  }

  async function approveLpj() {
    Swal.fire({
      title: "Setujui LPJ?",
      text: "LPJ akan disetujui dan status akan menjadi 'Setor Fisik'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Menyetujui LPJ...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        try {
          await apiRequest(`/kegiatan/${kegiatanId}/lpj/approve`, {
            method: "POST",
            body: JSON.stringify({}), // No specific payload needed for now
          });
          await Swal.fire(
            "Sukses",
            "LPJ berhasil disetujui. Status LPJ adalah 'Setor Fisik'.",
            "success"
          );
          window.location.href = "/bendahara/kegiatan/lpj"; // Reload page to update buttons and status
        } catch (error) {
          Swal.fire("Error", `Gagal menyetujui LPJ: ${error.message}`, "error");
        }
      }
    });
  }

  async function completeLpj() {
    Swal.fire({
      title: "Selesaikan LPJ?",
      text: "LPJ akan ditandai sebagai selesai secara keseluruhan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Selesaikan!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Menyelesaikan LPJ...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        try {
          await apiRequest(`/kegiatan/${kegiatanId}/lpj/complete`, {
            method: "POST",
            body: JSON.stringify({}), // No specific payload needed for now
          });
          await Swal.fire(
            "Sukses",
            "LPJ berhasil ditandai sebagai selesai dan status approval kegiatan menjadi disetujui.",
            "success"
          );
          window.location.reload(); // Reload page to update status
        } catch (error) {
          Swal.fire(
            "Error",
            `Gagal menyelesaikan LPJ: ${error.message}`,
            "error"
          );
        }
      }
    });
  }

  function updateBendaharaButtonVisibility(status) {
    if (!isBendahara) return;

    const approveBtn = document.getElementById("btn-approve-lpj");
    const completeBtn = document.getElementById("btn-complete-lpj");
    const revisionBtn = document.getElementById("btn-request-revision");

    // Hide all first to have a clean state
    if (approveBtn) approveBtn.style.display = "none";
    if (completeBtn) completeBtn.style.display = "none";
    if (revisionBtn) revisionBtn.style.display = "none";

    if (status === "setor fisik") {
      // Only show "Selesaikan" button
      if (completeBtn) completeBtn.style.display = "inline-block";
    } else if (status !== "disetujui" && status !== "selesai") {
      // For other non-final states, show approval and revision buttons
      if (approveBtn) approveBtn.style.display = "inline-block";
      if (revisionBtn) revisionBtn.style.display = "inline-block";
    }
    // If status is 'disetujui' or 'selesai', all buttons remain hidden.
  }

  async function openFileInNewTab(lampiranId) {
    Swal.fire({
      title: "Membuka file...",
      text: "Mohon tunggu sejenak.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      const response = await fetch(`/api/lampiran/${lampiranId}/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Gagal mengambil file (status: ${response.status})`
        );
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      Swal.close();
      window.open(fileUrl, "_blank");

      // Revoke the object URL after a short delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Membuka File",
        text: error.message,
      });
    }
  }

  function attachEventListeners() {
    // Remove previous listeners to prevent duplicates from being attached on re-renders.
    if (currentBodyClickHandler) {
      document.body.removeEventListener("click", currentBodyClickHandler);
    }
    if (currentBodyChangeHandler) {
      document.body.removeEventListener("change", currentBodyChangeHandler);
    }

    // Define a single, consolidated click handler for the body.
    currentBodyClickHandler = function (event) {
      const commentBtn = event.target.closest(".lampiran-comment-btn");
      if (commentBtn) {
        event.preventDefault();
        event.stopPropagation();
        openLampiranCommentModal(commentBtn);
        return;
      }

      const viewFileBtn = event.target.closest(".view-file-btn");
      if (viewFileBtn) {
        event.preventDefault();
        const isPending = viewFileBtn.dataset.isPending === "true";

        if (isPending) {
          const tempId = viewFileBtn.dataset.tempId;
          const anggaranId = viewFileBtn.dataset.anggaranId;
          const fileData = fileStore[anggaranId]?.[tempId];
          if (fileData && fileData.previewUrl) {
            window.open(fileData.previewUrl, "_blank");
          }
        } else {
          const lampiranId = viewFileBtn.dataset.lampiranId;
          openFileInNewTab(lampiranId);
        }
        return;
      }

      if (isPengusul) {
        const addBtn = event.target.closest(".btn-add-lampiran");
        if (addBtn) {
          const anggaranId = addBtn.dataset.anggaranId;
          document
            .querySelector(
              `.input-add-lampiran[data-anggaran-id="${anggaranId}"]`
            )
            ?.click();
          return;
        }
        const deleteBtn = event.target.closest(".btn-delete-lampiran");
        if (deleteBtn) {
          handleDeleteFile(deleteBtn);
          return;
        }

        const cancelBtn = event.target.closest(".btn-cancel-upload");
        if (cancelBtn) {
          const tempId = cancelBtn.dataset.tempId;
          const anggaranId = cancelBtn.dataset.anggaranId;

          const fileData = fileStore[anggaranId]?.[tempId];
          if (fileData) {
            URL.revokeObjectURL(fileData.previewUrl); // Free up memory
            delete fileStore[anggaranId][tempId];
            if (Object.keys(fileStore[anggaranId]).length === 0) {
              delete fileStore[anggaranId];
            }
          }

          const lampiranItem = cancelBtn.closest(".lampiran-item");
          lampiranItem.remove();

          const lampiranList = document.querySelector(
            `.lampiran-list[data-anggaran-id="${anggaranId}"]`
          );
          if (lampiranList && lampiranList.children.length === 0) {
            const noFilesText = document.createElement("p");
            noFilesText.className = "text-xs text-gray-400 italic no-files";
            noFilesText.textContent =
              "Tidak ada bukti terlampir untuk item ini.";
            lampiranList.appendChild(noFilesText);
          }
          return;
        }
      }
    };

    // Define a single, consolidated change handler for the body.
    currentBodyChangeHandler = function (event) {
      if (isPengusul) {
        if (event.target.matches(".input-add-lampiran")) {
          handleFileSelect(event.target);
        }
      }
    };

    // Attach the new listeners.
    document.body.addEventListener("click", currentBodyClickHandler);
    document.body.addEventListener("change", currentBodyChangeHandler);

    // Listeners for specific elements (these are safe as elements are re-created)
    if (isBendahara) {
      const saveBtn = document.getElementById("saveLampiranCommentBtn");
      if (saveBtn) {
        saveBtn.addEventListener("click", saveLampiranComment);
      }
      const revisionBtn = document.getElementById("btn-request-revision");
      if (revisionBtn) {
        revisionBtn.addEventListener("click", submitRevision);
      }
      const approveBtn = document.getElementById("btn-approve-lpj");
      if (approveBtn) {
        approveBtn.addEventListener("click", approveLpj);
      }
      const completeBtn = document.getElementById("btn-complete-lpj");
      if (completeBtn) {
        completeBtn.addEventListener("click", completeLpj);
      }
    }

    if (isPengusul) {
      const resubmitBtn = document.getElementById("btn-resubmit-lpj");
      if (resubmitBtn) {
        resubmitBtn.addEventListener("click", resubmitLpj);
      }
    }
  }
  // --- Resubmission Logic for Pengusul ---
  const filesToDelete = new Set();
  const fileStore = {}; // Structure: { anggaran_id: { temp_id: { file: File, previewUrl: '...' } } }

  function handleDeleteFile(btn) {
    const lampiranId = btn.dataset.lampiranId;
    Swal.fire({
      title: "Anda yakin?",
      text: "File ini akan ditandai untuk dihapus saat Anda submit ulang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6e7881",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        filesToDelete.add(lampiranId);
        const lampiranItem = btn.closest(".lampiran-item");
        lampiranItem.classList.add("archived-lampiran"); // Visually mark as archived
        btn.remove(); // Remove the delete button
      }
    });
  }

  function handleFileSelect(input) {
    const anggaranId = input.dataset.anggaranId;
    const files = Array.from(input.files);

    if (!fileStore[anggaranId]) {
      fileStore[anggaranId] = {};
    }

    const lampiranList = document.querySelector(
      `.lampiran-list[data-anggaran-id="${anggaranId}"]`
    );

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    files.forEach((file) => {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipe File Tidak Didukung",
          text: `File "${file.name}" ditolak. Hanya file JPG, PNG, atau PDF yang diizinkan.`,
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          icon: "error",
          title: "Ukuran File Terlalu Besar",
          text: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB) melebihi batas 10 MB.`,
        });
        return;
      }

      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);
      fileStore[anggaranId][tempId] = { file, previewUrl };

      const pendingItem = document.createElement("div");
      pendingItem.className =
        "lampiran-item pending-lampiran border-hover-draw";
      pendingItem.dataset.anggaranId = anggaranId;
      pendingItem.dataset.tempId = tempId;
      pendingItem.innerHTML = `
          <div class="lampiran-content flex items-center gap-2">
              <i class="ti ti-clock text-blue-500"></i>
              <a href="javascript:void(0);" class="text-blue-600 hover:underline text-sm view-file-btn" data-is-pending="true" data-temp-id="${tempId}" data-anggaran-id="${anggaranId}">
                ${file.name}
              </a>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-cancel-upload" data-temp-id="${tempId}" data-anggaran-id="${anggaranId}" title="Batal Upload">
              <i class="ti ti-trash">&#xeb41;</i>
            </button>
          </div>
      `;
      lampiranList.querySelector(".no-files")?.remove();
      lampiranList.appendChild(pendingItem);
    });

    // Clear the input value to allow selecting the same file again
    input.value = "";
  }

  // window.cancelNewFile is no longer needed and is removed.

  async function resubmitLpj() {
    Swal.fire({
      title: "Submit Ulang LPJ?",
      text: "Pastikan semua data realisasi dan lampiran sudah benar sebelum submit.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Submit Ulang!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        executeResubmission();
      }
    });
  }

  async function executeResubmission() {
    Swal.fire({
      title: "Mengirim data...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();

    // 1. Append files to delete
    formData.append(
      "files_to_delete",
      JSON.stringify(Array.from(filesToDelete))
    );

    // 2. Append realization data
    const realisasiData = {};
    document.querySelectorAll(".realisasi-grid").forEach((grid) => {
      const anggaranId = grid.closest("[data-anggaran-id]").dataset.anggaranId;
      realisasiData[anggaranId] = {};
      grid.querySelectorAll(".realisasi-input").forEach((input) => {
        const fieldName = input.dataset.field;
        let value = input.value;
        if (input.classList.contains("autonumeric-currency")) {
          const autoNumericInstance = AutoNumeric.getAutoNumericElement(input);
          if (autoNumericInstance) {
            value = autoNumericInstance.getNumber();
          }
        }
        realisasiData[anggaranId][fieldName] = value;
      });
    });
    formData.append("realisasi", JSON.stringify(realisasiData));

    // 3. Append new files
    for (const anggaranId in fileStore) {
      if (Object.prototype.hasOwnProperty.call(fileStore, anggaranId)) {
        for (const tempId in fileStore[anggaranId]) {
          if (
            Object.prototype.hasOwnProperty.call(fileStore[anggaranId], tempId)
          ) {
            const fileData = fileStore[anggaranId][tempId];
            if (fileData && fileData.file) {
              formData.append(
                `bukti[${anggaranId}][]`,
                fileData.file,
                fileData.file.name
              );
            }
          }
        }
      }
    }

    try {
      await apiRequest(`/kegiatan/${kegiatanId}/lpj/resubmit`, {
        method: "POST",
        body: formData,
      });

      // Cleanup blob URLs on successful submission
      for (const anggaranId in fileStore) {
        for (const tempId in fileStore[anggaranId]) {
          URL.revokeObjectURL(fileStore[anggaranId][tempId].previewUrl);
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "LPJ telah berhasil disubmit ulang.",
      });

      window.location.href = "/pengusul/kegiatan/lpj";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Terjadi kesalahan: ${error.message}`,
      });
    }
  }

  init();
}
