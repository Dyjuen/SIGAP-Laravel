// frontend/src/pages/verifikator/RevisiKak.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderRevisiKakPage(path, userRole) {
  const isVerifikator = userRole.toLowerCase() === "verifikator";
  const isPengusul = userRole.toLowerCase() === "pengusul";

  const inputAttr = isPengusul ? "" : "readonly disabled";
  const inputStyle = isPengusul
    ? ""
    : "color: #4B5563 !important; border-color: #F3F4F6 !important; background: #F3F4F6 !important; cursor: default; ";
  const pageContent = `
    <link rel="stylesheet" href="/assets/vendor/libs/bootstrap-daterangepicker/bootstrap-daterangepicker.css" />
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
      .revisi-kak-page {
        padding-right: 1rem;
      }
    }

    /* Daterangepicker theme overrides */
    .daterangepicker { border-color: #00BCD4 !important; }
    .daterangepicker .calendar-table { border-color: #E5F8FB !important; }
    .daterangepicker td.active, .daterangepicker td.active:hover { background-color: #00BCD4 !important; border-color: #00BCD4 !important; color: #FFFFFF !important; }
    .daterangepicker td.in-range { background-color: #E5F8FB !important; color: #374151 !important; }
    .daterangepicker td.available:hover { background-color: #E5F8FB !important; color: #374151 !important; }
    .daterangepicker .ranges li.active { background-color: #00BCD4 !important; color: #FFFFFF !important; }
    .daterangepicker .ranges li:hover { background-color: #E5F8FB !important; color: #374151 !important; }
    .daterangepicker td.start-date, .daterangepicker td.end-date { background-color: #00BCD4 !important; border-color: #00BCD4 !important; color: #FFFFFF !important; }
    .daterangepicker .drp-buttons .btn-primary { background-color: #00BCD4 !important; border-color: #00BCD4 !important; color: #FFFFFF !important; }
    .daterangepicker .drp-buttons .btn-primary:hover { background-color: #0097A7 !important; border-color: #0097A7 !important; }
    .daterangepicker th.month { color: #00BCD4 !important; }
    .daterangepicker td.off, .daterangepicker td.off.in-range, .daterangepicker td.off.start-date, .daterangepicker td.off.end-date { background-color: #F9FAFB !important; color: #9CA3AF !important; }
    .daterangepicker select.monthselect, .daterangepicker select.yearselect { border-color: #E5E7EB !important; }
    .daterangepicker select.monthselect:focus, .daterangepicker select.yearselect:focus { border-color: #00BCD4 !important; outline: none !important; box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1) !important; }
    .daterangepicker .calendar-table .next span, .daterangepicker .calendar-table .prev span { border-color: #00BCD4 !important; }
    .daterangepicker .calendar-table .next:hover, .daterangepicker .calendar-table .prev:hover { background-color: #E5F8FB !important; }
    .daterangepicker td.today { background-color: #E5F8FB !important; color: #374151 !important; }
    .daterangepicker td.today.active { background-color: #00BCD4 !important; color: #FFFFFF !important; }
      /* Comment button styling */
      .comment-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        background: #E0F7FA;
        color: #00BCD4;
        border: 2px solid #B2EBF2;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
      }
      
      .comment-icon:hover {
        background: #00BCD4;
        color: white;
        transform: translateY(-50%) scale(1.1);
      }
      
      .comment-icon.has-comment {
        background: #FEE2E2;
        color: #EF4444;
        border-color: #FCA5A5;
        animation: pulse-comment 2s infinite;
      }
      
      .comment-icon.has-comment:hover {
        background: #EF4444;
        color: white;
      }
      
      @keyframes pulse-comment {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      }
      
      .input-with-comment {
        position: relative;
      }
      
      .input-with-comment input,
      .input-with-comment textarea,
      .input-with-comment select {
        padding-right: 52px !important;
      }
      
      /* Row comment styling */
      .row-with-comment {
        position: relative;
        padding: 0.75rem;
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        margin-bottom: 0.75rem;
        transition: all 0.3s ease;
        background: white;
      }
      
      .row-with-comment:hover {
        border-color: #00BCD4;
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
        transform: translateY(-2px);
      }
      
      .row-with-comment.has-row-comment {
        background: #FEF2F2;
        border-color: #FCA5A5;
      }
      
      .row-with-comment.has-row-comment:hover {
        border-color: #EF4444;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
      }
      
      .row-with-comment.has-row-comment input,
      .row-with-comment.has-row-comment textarea {
        background-color: #FFFFFF !important;
      }
      
      .row-comment-icon {
        position: absolute;
        right: 0.75rem;
        top: 0.75rem;
        width: 36px;
        height: 36px;
        background: #E0F7FA;
        color: #00BCD4;
        border: 2px solid #B2EBF2;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
      }
      
      .row-comment-icon:hover {
        background: #00BCD4;
        color: white;
        transform: scale(1.1);
      }
      
      .row-comment-icon.has-comment {
        background: #FEE2E2;
        color: #EF4444;
        border-color: #FCA5A5;
        animation: pulse-comment 2s infinite;
      }
      
      .row-comment-icon.has-comment:hover {
        background: #EF4444;
        color: white;
      }
      
      .row-with-comment .input-with-comment {
        padding-right: 50px !important;
      }
      
      .row-with-comment .input-with-comment input,
      .row-with-comment .input-with-comment textarea {
        padding-right: 12px !important;
      }
      
      .row-with-comment .grid,
      .row-with-comment .grid-rab {
        padding-right: 50px !important;
      }
      
      /* Progress Steps */
      .progress-step-item {
        cursor: default;
      }
      
      .progress-step-circle {
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
      }
      
      /* Menu buttons */
      .menu-button {
        transition: all 0.3s ease;
      }
      
      .menu-button.active {
        border-color: #00BCD4 !important;
        background: rgba(0, 188, 212, 0.1) !important;
      }
      
      /* Menu button dengan revisi */
      .menu-button.has-revision {
        border-color: #FCA5A5 !important;
        background: linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%) !important;
        position: relative;
      }
      
      /* Icon background jadi MERAH kalau ada revisi */
      .menu-button.has-revision .w-8 {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
        color: #FFFFFF !important;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }
      
      /* Override shimmer effect untuk revisi - MERAH */
      .menu-button.has-revision::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), transparent);
        transition: left 0.6s ease;
      }
      
      .menu-button.has-revision:hover::before {
        left: 100%;
      }
      
      @keyframes pulse-warning {
        0%, 100% {
          transform: translateY(-50%) scale(1);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }
        50% {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.6);
        }
      }
      
      .menu-button.has-revision .font-semibold {
        color: #EF4444 !important;
      }
      
      /* Hover text color untuk revisi tetap merah */
      .menu-button.has-revision:hover .font-semibold {
        color: #DC2626 !important;
      }
      
      .menu-button.has-revision.active {
        border-color: #EF4444 !important;
        background: linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(252, 165, 165, 0.7) 100%) !important;
      }
      
      @keyframes pulse-revision {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
        }
      }
      
      /* Step content */
      .step-content {
        display: none;
      }
      
      .step-content.active {
        display: block;
      }
      
      .main-step-content {
        display: none;
      }
      
      .main-step-content.active {
        display: block;
      }
      
      /* Modal styling */
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
      
      /* Action buttons */
      .action-buttons {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        margin-top: 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 4px solid #EF4444;
      }
      
      .btn-primary-action {
        padding: 1rem 2.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .btn-revise {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
      }
      
      .btn-revise:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
      }
      
      .btn-back {
        padding: 1rem 2rem;
        border-radius: 12px;
        background: #F3F4F6;
        color: #6B7280;
        font-weight: 600;
        border: 2px solid #E5E7EB;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-back:hover {
        background: #E5E7EB;
        color: #374151;
      }
      
      /* RAB Grid */
      .grid-rab {
        display: grid;
        grid-template-columns: 2.5fr 0.8fr 1.2fr 0.8fr 1.2fr 0.8fr 1.2fr 2.5fr;
        gap: 1rem;
        align-items: end;
      }
      
 /* Comment count badge */
.comment-count {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comment-count:hover {
  transform: translateX(-50%) translateY(-3px);
  box-shadow: 0 12px 28px rgba(239, 68, 68, 0.6);
}

.comment-count i {
  font-size: 1.5rem;
}

/* Comment Detail Modal Styling - FINAL CLEAN VERSION */
#commentDetailModal .modal-dialog {
  max-width: 750px;
}

#commentDetailModal .modal-content {
  border: none;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

#commentDetailModal .modal-header {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  border: none;
  padding: 1.75rem 2rem;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 1rem;
  flex-wrap: nowrap;
  position: relative; /* Set position context for the button */
}

#commentDetailModal .modal-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 !important;
  flex: 1;
  white-space: nowrap;
}

#commentDetailModal .modal-title i {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}



#commentDetailModal .modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
  background: linear-gradient(to bottom, #FAFAFA 0%, #F5F5F5 100%);
}

/* Completely hide scrollbar */
#commentDetailModal .modal-body::-webkit-scrollbar {
  display: none;
}

#commentDetailModal .modal-body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.comment-item {
  padding: 1.5rem;
  border-radius: 16px;
  border: 2px solid transparent;
  background: white;
  margin-bottom: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.comment-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #EF4444, #DC2626);
  transition: width 0.4s ease;
}

.comment-item:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
  border-color: #FCA5A5;
}

.comment-item:hover::before {
  width: 8px;
}

.comment-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-item-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: #EF4444;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

.comment-item:hover .comment-item-title {
  color: #DC2626;
  transform: translateX(4px);
}

.comment-item-title i {
  font-size: 1.25rem;
  color: #EF4444;
  flex-shrink: 0;
}

.comment-item-badge {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  flex-shrink: 0;
}

.comment-item-text {
  color: #4B5563;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #FEFEFE 0%, #F9FAFB 100%);
  border-radius: 12px;
  border-left: 4px solid #EF4444;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Section divider - FIXED untuk sticky scroll */
.comment-section-divider {
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
  margin: 2rem -2rem 1.5rem -2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  position: sticky;
  top: -2rem;
  z-index: 10;
  border-left: 6px solid #B91C1C;
}

.comment-section-divider:first-child {
  margin-top: -2rem;
}

.comment-section-divider i {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  flex-shrink: 0;
}

.comment-empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
}

.comment-empty-state i {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.2;
  color: #EF4444;
}

.comment-empty-state .empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #6B7280;
}

.comment-empty-state .empty-subtitle {
  font-size: 0.95rem;
  color: #9CA3AF;
}

/* Remove footer completely */
#commentDetailModal .modal-footer {
  display: none;
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

      /* ====== ANIMATION SYSTEM FROM DUMMYINPUTREADONLY ====== */
      
      /* Keyframe Animations */
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

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      /* Progress Steps Enhanced */
      .progress-step-item {
        cursor: pointer;
        animation: fadeIn 0.6s ease-out;
        transition: all 0.7s ease;
      }

      .progress-step-item:hover {
        transform: translateY(-3px); 
      }
      
      .progress-step-circle {
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.4);
        transition: all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);        
      }

      .progress-step-item:hover .progress-step-circle {
        box-shadow: 0 8px 20px rgba(0, 188, 212, 0.6);
        transform: rotate(360deg);
      }
      
      /* Menu buttons - SMOOTH ROTATION LIKE STEPPER! */
      .menu-button {
        transition: all 0.4s ease-in-out;
        position: relative;
        overflow: hidden;
      }

      .menu-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.3), transparent);
        transition: left 0.6s ease;
      }

      .menu-button:hover::before {
        left: 100%;
      }

      .menu-button:hover {
        transform: translateY(-3px); 
      }

      .menu-button.active {
        border-color: #00BCD4 !important;
        background: rgba(0, 188, 212, 0.1) !important;
      }

      /* ICON ROTATION - SAME AS STEPPER CIRCLE! */
      .menu-button .w-8 {
        transition: all 0.8s cubic-bezier(0.050, 0.600, 0.165, 1.025);
      }

      .menu-button:hover .w-8 {
        transform: rotate(360deg);
      }

      /* IMPORTANT: DISABLE transform for icon inside menu button! */
      .menu-button .w-8 .ti {
        transition: none !important;
        transform: none !important;
      }

      .menu-button:hover .w-8 .ti {
        transform: none !important;
        /* Icon rotates with parent (.w-8), not independently! */
      }

      /* Text transition */
      .menu-button .font-semibold {
        transition: color 0.3s ease;
      }

      .menu-button:hover .font-semibold {
        color: #00ACC1;
      }
      
      /* Step content */
      .step-content {
        display: none;
      }
      
      .step-content.active {
        display: block;
        animation: fadeIn 0.5s ease-out;
      }
      
      /* Row item animations */
      .row-item {
        animation: fadeInLeft 0.5s ease-out;
        transition: all 0.8s cubic-bezier(0.050, 0.600, 0.165, 1.025);
        position: relative;
        overflow: hidden;
      }

      .row-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.1), transparent);
        transition: left 0.6s ease;
      }

      .row-item:hover::before {
        left: 100%;
      }

      .row-item:hover {
        transform: translateX(5px) scale(1.02);
      }

      .row-item:nth-child(odd) {
        animation-delay: 0.1s;
      }

      .row-item:nth-child(even) {
        animation-delay: 0.2s;
      }

      /* Input fields */
      input[readonly], textarea[readonly], select[disabled] {
        transition: all 0.7s ease;
      }

      input[readonly]:hover, textarea[readonly]:hover, select[disabled]:hover {
        box-shadow: 0 4px 12px rgba(0, 188, 212, 0.15);
        transform: scale(1.01);
      }

      /* Enhanced button animations */
      button {
        position: relative;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      button::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
      }

      button:active::after {
        width: 300px;
        height: 300px;
      }

      button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 188, 212, 0.3);
      }

      button:active {
        transform: translateY(-1px);
      }

      /* Labels */
      label {
        transition: all 0.7s ease;
        display: inline-block;
      }

      /* Headers */
      h4, h5 {
        animation: fadeInDown 0.6s ease-out;
        transition: all 0.7s ease;
      }

      /* Backdrop */
      .backdrop-blur-md {
        animation: slideInDown 0.6s ease-out;
        transition: all 0.7s ease;
      }

      .backdrop-blur-md:hover {
        backdrop-filter: blur(20px) !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }

      /* Loading shimmer effect */
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
      }

      /* Stagger animations for grid items */
      .grid > * {
        animation: fadeIn 0.5s ease-out;
      }

      .grid > *:nth-child(1) { animation-delay: 0.1s; }
      .grid > *:nth-child(2) { animation-delay: 0.2s; }
      .grid > *:nth-child(3) { animation-delay: 0.3s; }
      .grid > *:nth-child(4) { animation-delay: 0.4s; }
      .grid > *:nth-child(5) { animation-delay: 0.5s; }
      .grid > *:nth-child(6) { animation-delay: 0.6s; }

      /* Smooth scroll */
      html {
        scroll-behavior: smooth;
      }

      /* Container animations */
      .flex.gap-8 > * {
        animation: fadeInRight 0.6s ease-out;
      }

      .flex.gap-8 > *:first-child {
        animation: fadeInLeft 0.6s ease-out;
      }

      /* Icon animations */
      .ti {
        transition: all 0.3s ease;
        display: inline-block;
      }

      button:hover .ti {
        transform: scale(1.2) rotate(10deg);
      }

      /* ====== BORDER DRAWING ANIMATION - SUPER SMOOTH VERSION ====== */
      .border-hover-draw {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Subtle pop-up effect on hover */
      .border-hover-draw:hover {
        transform: translateY(-4px) scale(1.01);
      }

      .border-hover-draw::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 12px;
        padding: 2px;
        background: linear-gradient(135deg, #00BCD4, #00E5FF, #00BCD4);
        -webkit-mask: 
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        
        /* Default state: hidden at center-bottom */
        clip-path: polygon(
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%
        );
        
        /* Smooth reverse animation by default */
        animation: borderDrawReverse 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* Forward animation on hover - SUPER SMOOTH */
      .border-hover-draw:hover::before {
        animation: borderDrawForward 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* ====== FORWARD ANIMATION (Mouse IN) ====== */
      /* Bottom → Left/Right → Top */
      @keyframes borderDrawForward {
        0% {
          /* Start: center-bottom point */
          clip-path: polygon(
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%
          );
        }
        
        30% {
          /* Bottom line expands smoothly left-right */
          clip-path: polygon(
            0% 100%, 0% 100%, 
            0% 100%, 50% 100%, 
            50% 100%, 100% 100%, 
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Left & right borders rise together to top (SMOOTH!) */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
        
        100% {
          /* Complete: full border with slight overshoot */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
      }

      /* ====== REVERSE ANIMATION (Mouse OUT) ====== */
      /* Top → Left/Right → Bottom */
      @keyframes borderDrawReverse {
        0% {
          /* Start: full border */
          clip-path: polygon(
            0% 100%, 0% 0%, 
            0% 0%, 50% 0%, 
            50% 0%, 100% 0%, 
            100% 0%, 100% 100%
          );
        }
        
        30% {
          /* Top line & left-right borders collapse smoothly */
          clip-path: polygon(
            0% 100%, 0% 100%, 
            0% 100%, 50% 100%, 
            50% 100%, 100% 100%, 
            100% 100%, 100% 100%
          );
        }
        
        70% {
          /* Bottom line starts shrinking to center */
          clip-path: polygon(
            25% 100%, 25% 100%, 
            25% 100%, 50% 100%, 
            50% 100%, 75% 100%, 
            75% 100%, 75% 100%
          );
        }
        
        100% {
          /* End: disappears at center-bottom */
          clip-path: polygon(
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%, 
            50% 100%, 50% 100%
          );
        }
      }

      /* Bonus: Input subtle lift + shadow + glow on hover */
      .border-hover-draw:hover input[readonly],
      .border-hover-draw:hover textarea[readonly] {
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

      /* Wrapper for border animation */
      .main-step-content.active > .bg-white {
        position: relative;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Border drawing effect (smoother to match .border-hover-draw) */
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

        /* Smoother animation + slightly longer for natural page load feel */
        animation: 
          mainStepBorderDraw 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.15s forwards,
          borderFadeIn 0.35s ease-out 0.15s forwards;
      }

      /* Pop-up subtle on hover */
      .main-step-content.active > .bg-white:hover {
        transform: translateY(-6px) scale(1.005);
      }

      .main-step-content.active > .bg-white:hover::before {
        opacity: 1;
      }

      /* Pop-up entry animation */
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

      /* Border drawing for main step */
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

    /* Dynamic field animations */
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

    .remove-button {
      display: none; /* Hide by default */
      opacity: 0;
      transform: scale(0.5);
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    }

    .remove-button.visible {
      display: flex;
      opacity: 1;
      transform: scale(1);
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

      /* FIX: Disable generic button animations for close buttons */
      .btn-close {
        transform: none !important;
        transition: none !important;
        box-shadow: none !important;
      }
      .btn-close:hover {
        transform: none !important;
        box-shadow: none !important;
        opacity: 0.75;
      }
      .btn-close::after {
        display: none !important;
      }

          @media (max-width: 768px) {
              html, body {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              html::-webkit-scrollbar, body::-webkit-scrollbar {
                display: none;
              }
              .rab-item {
                  overflow-x: auto;
              }
              .rab-item > div.grid {
                  min-width: 800px;
              }
          }    </style>

    <div class="kerangka-acuan-kerja-page">
      <!-- Progress Steps -->
      <div class="flex justify-center gap-24 mb-8 backdrop-blur-md p-6 rounded-xl shadow-lg" style="background: rgba(255, 255, 255, 0.8);">
        <div class="progress-step-item flex items-center justify-center gap-3 px-4 cursor-pointer" data-main-step="1">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #00BCD4; color: #FFFFFF;">1</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #00BCD4;">Kerangka Acuan Kerja</div>
          </div>
        </div>
        <div class="progress-step-item flex items-center justify-center gap-3 px-4 cursor-pointer" data-main-step="2">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #E5E7EB; color: #6B7280;">2</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #6B7280;">Indikator Kinerja Utama</div>
          </div>
        </div>
        <div class="progress-step-item flex items-center justify-center gap-3 px-4 cursor-pointer" data-main-step="3">
          <div class="progress-step-circle w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg" style="background: #E5E7EB; color: #6B7280;">3</div>
          <div class="text-left">
            <div class="progress-step-text text-sm font-semibold" style="color: #6B7280;">Rencana Anggaran Biaya</div>
          </div>
        </div>
      </div>

      <!-- Main Step 1: Kerangka Acuan Kerja -->
      <div class="main-step-content active" id="main-step-1">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="flex gap-8">
            <!-- Sidebar Menu -->
            <div class="flex flex-col gap-4 w-96">
              <button class="menu-button border-2 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3 active" data-menu="gambaran-umum" style="border-color: #00BCD4; background: rgba(0, 188, 212, 0.1);">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-file-text" style="font-size: 1rem; line-height: 1;">&#xff43;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Gambaran Umum</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="penerima-manfaat">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-users" style="font-size: 1rem; line-height: 1;">&#xf7cd;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Penerima Manfaat</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="strategi-pencapaian">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-target" style="font-size: 1rem; line-height: 1;">&#xeb35;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Strategi Pencapaian</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="indikator-kinerja">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-chart-bar" style="font-size: 1rem; line-height: 1;">&#xea59;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Indikator Kinerja</div>
              </button>
              <button class="menu-button border-2 border-gray-200 rounded-xl p-4 text-left cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3" data-menu="kurun-waktu">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold" style="background: #00BCD4; color: #FFFFFF;"><i class="ti ti-calendar" style="font-size: 1rem; line-height: 1;">&#xea53;</i></div>
                <div class="font-semibold text-base" style="color: #00BCD4;">Kurun Waktu Pelaksanaan</div>
              </button>
            </div>

            <!-- Main Form Area -->
            <div class="flex-1 min-h-[500px]">
              <div class="border border-gray-200 rounded-xl p-6 border-hover-draw">
                <!-- Step 1: Gambaran Umum -->
                <div class="step-content active" id="gambaran-umum">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Gambaran Umum</h4>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Nama Kegiatan</label>
                    <div class="row-with-comment">
                      <div class="input-with-comment">
                        <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="" data-field="namaKegiatan">
                      </div>
                      <button class="row-comment-icon" onclick="openFieldCommentModal(this)" data-field="namaKegiatan" data-label="Nama Kegiatan">
                        <i class="ti ti-message-circle-2">&#xeaed;</i>
                      </button>
                    </div>
                  </div>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">
                      Tipe Kegiatan <span class="text-red-500">*</span>
                    </label>
                    <div class="row-with-comment">
                      <div class="input-with-comment">
                        <select id="tipeKegiatan" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} data-field="tipeKegiatan">
                          <option value="">Pilih Tipe Kegiatan</option>
                        </select>
                      </div>
                      <button class="row-comment-icon" onclick="openFieldCommentModal(this)" data-field="tipeKegiatan" data-label="Tipe Kegiatan">
                        <i class="ti ti-message-circle-2">&#xeaed;</i>
                      </button>
                    </div>
                  </div>

                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Gambaran Umum Kegiatan</label>
                    <div class="row-with-comment">
                      <div class="input-with-comment">
                        <textarea class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[200px] resize-y" style="${inputStyle}" ${inputAttr} data-field="gambaranUmum"></textarea>
                      </div>
                      <button class="row-comment-icon" onclick="openFieldCommentModal(this)" data-field="gambaranUmum" data-label="Gambaran Umum Kegiatan">
                        <i class="ti ti-message-circle-2">&#xeaed;</i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Penerima Manfaat -->
                <div class="step-content" id="penerima-manfaat">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Penerima Manfaat</h4>
                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Sasaran Utama</label>
                    <div id="sasaranUtamaContainer">
                      <!-- ONE sasaran utama from t_kak -->
                    </div>
                  </div>

                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Output Kegiatan</label>
                    <div id="manfaatContainer">
                      <!-- MANY manfaat from t_kak_manfaat -->
                    </div>
                    ${isPengusul ? `<button type="button" class="border-0 px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-block hover:-translate-y-0.5 mt-4" style="background: #00BCD4; color: #FFFFFF;" onclick="addManfaat()">Tambah Output Kegiatan</button>` : ''}
                  </div>
                </div>

                <!-- Step 3: Strategi Pencapaian -->
                <div class="step-content" id="strategi-pencapaian">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Strategi Pencapaian</h4>
                  
                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Metode Pelaksanaan</label>
                    <div class="row-with-comment">
                      <div class="input-with-comment">
                        <textarea class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[200px] resize-y" style="${inputStyle}" ${inputAttr} data-field="metodePelaksanaan"></textarea>
                      </div>
                      <button class="row-comment-icon" onclick="openFieldCommentModal(this)" data-field="metodePelaksanaan" data-label="Metode Pelaksanaan">
                        <i class="ti ti-message-circle-2">&#xeaed;</i>
                      </button>
                    </div>
                  </div>

                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Tahapan Pelaksanaan</label>
                    <div id="tahapanPelaksanaanContainer">
                      <!-- Dynamic content will be injected here -->
                    </div>
                    ${isPengusul ? `<button type="button" class="border-0 px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-block hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" onclick="addTahapanPelaksanaan()">Tambah</button>` : ''}
                  </div>
                </div>

                <!-- Step 4: Indikator Kinerja -->
                <div class="step-content" id="indikator-kinerja">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Indikator Kinerja</h4>
                  
                  <div class="mb-8">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Indikator Kinerja</label>
                    <div id="indikatorKinerjaContainer">
                      <!-- Dynamic content will be injected here -->
                    </div>
                    ${isPengusul ? `<button type="button" class="border-0 px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-block hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" onclick="addIndikatorKinerja()">Tambah</button>` : ''}
                  </div>
                </div>

                <!-- Step 5: Kurun Waktu -->
                <div class="step-content" id="kurun-waktu">
                  <h4 class="mb-6 font-bold text-xl" style="color: #00BCD4;">Kurun Waktu Pelaksanaan</h4>
                  
                  <div class="mb-6">
                    <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Periode Pelaksanaan</label>
                    <div class="row-with-comment">
                    <div class="input-with-comment">
                            <input type="text" id="kurunWaktu" class="form-control w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} placeholder="Pilih tanggal" data-field="kurunWaktu">
                        </div>
                        <button class="row-comment-icon" onclick="openFieldCommentModal(this)" data-field="kurunWaktu" data-label="Kurun Waktu">
                          <i class="ti ti-message-circle-2">&#xeaed;</i>
                        </button>
                    </div>
                    <small class="text-gray-500 mt-1 block">Pilih tanggal mulai dan tanggal selesai</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBack">
              <span>←</span> Back
            </button>
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2 hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" id="btnNext">
              Next <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Step 2: IKU & Renstra -->
      <div class="main-step-content" id="main-step-2">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h4 class="mb-8 font-bold text-xl" style="color: #00BCD4;">Indikator Kinerja Utama</h4>
          
          <div class="mb-8" id="ikuRenstraContainer">
            <!-- Dynamic content will be injected here -->
          </div>

          ${isPengusul ? `<button type="button" class="border-0 px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-block hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" onclick="addIkuField()">Tambah</button>` : ''}

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBackIku">
              <span>←</span> Back
            </button>
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2 hover:-translate-y-0.5" style="background: #00BCD4; color: #FFFFFF;" id="btnNextIku">
              Next <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Step 3: RAB -->
      <div class="main-step-content" id="main-step-3">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h4 class="mb-8 font-bold text-xl" style="color: #00BCD4;">Rencana Anggaran Biaya</h4>
          
          <div id="rab-container">
            <!-- Dynamic RAB sections will be injected here -->
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8">
            <button class="px-8 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 border-0 flex items-center gap-2" style="background: rgba(0, 188, 212, 0.1); color: #00BCD4;" id="btnBackRab">
              <span>←</span> Back
            </button>
          </div>
        </div>
        <!-- Action Buttons (Fixed at bottom) -->
        <div class="action-buttons">
          ${isVerifikator
      ? `
          <button class="btn-back" onclick="window.location.href = '/verifikator/usulan'">
            <i class="ti ti-arrow-left">&#xea19;</i> Kembali
          </button>
          <div class="flex gap-4">
            <button class="btn-primary-action btn-revise" onclick="submitReview()">
              <i class="ti ti-send">&#xeae0;</i>
              Kirim Revisi
            </button>
          </div>
        `
      : isPengusul
        ? `
          <button class="btn-back" onclick="window.location.href = '/pengusul/usulan'">
            <i class="ti ti-arrow-left">&#xea19;</i> Kembali
          </button>
          <div class="flex gap-4">
            <button class="btn-primary-action btn-revise" onclick="submitRevisedKak()">
              <i class="ti ti-send">&#xeae0;</i>
              Submit KAK Revisi
            </button>
          </div>
        `
        : ""
    }
        </div>
      </div>

<!-- Comment Count Badge -->
<div class="comment-count" id="commentCountBadge" style="display: none;" onclick="openCommentDetailModal()">
  <i class="ti ti-message-dots">&#xeaee;</i>
  <span id="commentCountText">0 Catatan</span>
</div>

<!-- Comment Detail Modal -->
<div class="modal fade" id="commentDetailModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
        <h5 class="modal-title" style="margin: 0; flex: 1;">
          <i class="ti ti-message-dots">&#xeaee;</i>
          Daftar Catatan Revisi
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="commentDetailContent">
        <!-- Dynamic content will be injected here -->
      </div>
    </div>
  </div>
</div>

    <!-- Field Comment Modal -->
    <div class="modal fade" id="fieldCommentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
            <h5 class="modal-title">
              Catatan Revisi untuk <span id="fieldCommentLabel" style="color: #00BCD4; font-weight: 700;"></span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Nilai Saat Ini</label>
              <div class="p-3 rounded-lg" style="background: #F3F4F6; color: #374151;" id="currentFieldValue"></div>
            </div>
            <div id="fieldCommentInputContainer" style="${isPengusul ? "display: none;" : ""
    }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan Revisi</label>
              <textarea id="fieldCommentInput" class="form-control" rows="5" placeholder="Tuliskan catatan revisi spesifik untuk field ini..."></textarea>
            </div>
            <div id="fieldCommentDisplayContainer" style="${isVerifikator ? "display: none;" : ""
    }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan Verifikator</label>
              <div class="p-3 rounded-lg" style="background: #E0F7FA; color: #374151;" id="fieldCommentDisplayText"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal" tabindex="-1">
              <i class="ti ti-x">&#xeb55;</i> Batal
            </button>
            ${isVerifikator
      ? `
              <button type="button" class="btn btn-primary" onclick="saveFieldComment()">
                <i class="ti ti-check">&#xea5e;</i> Simpan Catatan
              </button>
            `
      : ""
    }
          </div>
        </div>
      </div>
    </div>

    <!-- Row Comment Modal -->
    <div class="modal fade" id="rowCommentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
            <h5 class="modal-title">
              Catatan Revisi untuk <span id="rowCommentLabel" style="color: #00BCD4; font-weight: 700;"></span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Nilai Saat Ini</label>
              <div class="p-3 rounded-lg" style="background: #F3F4F6; color: #374151;" id="currentRowValue"></div>
            </div>
            <div id="rowCommentInputContainer" style="${isPengusul ? "display: none;" : ""
    }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan Revisi</label>
              <textarea id="rowCommentInput" class="form-control" rows="5" placeholder="Tuliskan catatan revisi untuk baris ini..."></textarea>
            </div>
            <div id="rowCommentDisplayContainer" style="${isVerifikator ? "display: none;" : ""
    }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan Verifikator</label>
              <div class="p-3 rounded-lg" style="background: #E0F7FA; color: #374151;" id="rowCommentDisplayText"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal" tabindex="-1">
              <i class="ti ti-x">&#xeb55;</i> Batal
            </button>
            ${isVerifikator
      ? `
              <button type="button" class="btn btn-primary" onclick="saveRowComment()">
                <i class="ti ti-check">&#xea5e;</i> Simpan Catatan
              </button>
            `
      : ""
    }
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // --- JavaScript Logic ---
  const pathSegments = path.split("/").filter(Boolean);
  const usulanId =
    pathSegments.length > 2 ? pathSegments[pathSegments.length - 1] : null;

  // State untuk menyimpan data KAK yang sudah di-fetch
  let kakDataState = null;

  let mainStep = 1;
  let currentStep = 1;
  const totalSteps = 5;
  const menuItems = [
    "gambaran-umum",
    "penerima-manfaat",
    "strategi-pencapaian",
    "indikator-kinerja",
    "kurun-waktu",
  ];

  // New structured comment state
  let fieldComments = {}; // For t_kak table fields
  let rowComments = {}; // For child table rows

  let currentCommentTarget = null;
  let fieldCommentModalInstance = null;
  let rowCommentModalInstance = null;



  let masterState = {
    iku: [],
    satuan: [],
  };

  // ==============================================
  // DYNAMIC FIELD FUNCTIONS
  // ==============================================

  window.removeField = function (btn) {
    const item = btn.closest(".dynamic-field-item");
    if (!item) return;

    // For Revisi, we assume added fields can be removed without limit checks on existing items
    item.classList.add("removing");
    item.addEventListener("animationend", () => {
      item.remove();
    }, { once: true });
  };

  window.addManfaat = function () {
    const container = document.getElementById("manfaatContainer");
    const newItem = document.createElement("div");
    newItem.className = "manfaat-item dynamic-field-item new-item-animation flex gap-4 items-start mb-4";
    newItem.innerHTML = `
      <input type="text" class="manfaat-input flex-1 px-4 py-3 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-4" style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';" placeholder="Output Kegiatan">
      <button type="button" class="remove-button border-0 w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0 visible" style="background: #EF4444; color: #FFFFFF;" onclick="removeField(this)">
        <span class="text-xl font-bold">−</span>
      </button>
    `;
    container.appendChild(newItem);
    newItem.addEventListener('animationend', () => {
      newItem.classList.remove('new-item-animation');
    });
  };

  window.addTahapanPelaksanaan = function () {
    const container = document.getElementById("tahapanPelaksanaanContainer");
    const newItem = document.createElement("div");
    newItem.className = "tahapan-item dynamic-field-item new-item-animation flex gap-4 items-start mb-4";
    newItem.innerHTML = `
      <input type="text" class="flex-1 px-4 py-3 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-4" style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';" placeholder="Input">
      <button type="button" class="remove-button border-0 w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0 visible" style="background: #EF4444; color: #FFFFFF;" onclick="removeField(this)">
        <span class="text-xl font-bold">−</span>
      </button>
    `;
    container.appendChild(newItem);
  };

  window.addIndikatorKinerja = function () {
    const container = document.getElementById("indikatorKinerjaContainer");
    const newItem = document.createElement("div");
    newItem.className = "indikator-kinerja-item dynamic-field-item new-item-animation flex items-end gap-4 mb-6";
    newItem.innerHTML = `
      <div class='w-full'>
        <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Bulan</label>
        <select class="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-4" style="border-color: #E5E7EB; background: #FFFFFF;">
          <option value="">Pilih Bulan</option>
          <option value="Januari">Januari</option><option value="Februari">Februari</option><option value="Maret">Maret</option>
          <option value="April">April</option><option value="Mei">Mei</option><option value="Juni">Juni</option>
          <option value="Juli">Juli</option><option value="Agustus">Agustus</option><option value="September">September</option>
          <option value="Oktober">Oktober</option><option value="November">November</option><option value="Desember">Desember</option>
        </select>
      </div>
      <div class='w-full'>
        <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Indikator Keberhasilan</label>
        <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" placeholder="Input">
      </div>
      <div class='w-full'>
        <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Target</label>
        <div class="flex gap-2 items-center">
          <input type="number" class="flex-1 px-4 py-3 border-2 rounded-lg text-sm" placeholder="0" min="0" max="100" step="1">
          <div class="px-3 py-3 text-sm font-semibold" style="color: #374151;">%</div>
        </div>
      </div>
      <button type="button" class="remove-button border-0 w-10 h-10 rounded-full cursor-pointer flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:scale-110 visible" style="background: #EF4444; color: #FFFFFF;" onclick="removeField(this)">
        <span class="text-xl font-bold">−</span>
      </button>
    `;
    container.appendChild(newItem);
  };

  function renderIkuOptions() {
    if (!masterState.iku || masterState.iku.length === 0) return;

    // IDs from existing (saved) rows - assume these cannot be changed/removed in this view
    const existingIkuIds = (kakDataState && kakDataState.iku)
      ? kakDataState.iku.map(item => String(item.iku_id))
      : [];

    const ikuSelects = document.querySelectorAll("#ikuRenstraContainer select:not(.satuan-select)");

    // Collect all selected values from other dropdowns
    const selectedValues = Array.from(ikuSelects)
      .map(s => s.value)
      .filter(v => v);

    // Combine with existing IDs
    const allTakenIds = new Set([...existingIkuIds, ...selectedValues]);

    ikuSelects.forEach((select) => {
      const currentValue = select.value;

      // Clear existing options except placeholder
      select.innerHTML = '<option value="">Pilih IKU</option>';

      masterState.iku.forEach((iku) => {
        const idStr = String(iku.iku_id);
        // Add option if it's not taken OR if it's the current value of this select
        if (!allTakenIds.has(idStr) || idStr === currentValue) {
          const option = document.createElement("option");
          option.value = iku.iku_id;
          option.textContent = iku.nama_iku;
          select.appendChild(option);
        }
      });

      // Restore value
      select.value = currentValue;
    });
  }

  window.removeIkuField = function (btn) {
    const item = btn.closest(".dynamic-field-item");
    if (!item) return;

    item.classList.add("removing");
    item.addEventListener("animationend", () => {
      item.remove();
      renderIkuOptions();
    }, { once: true });
  };

  window.addIkuField = function () {
    const container = document.getElementById("ikuRenstraContainer");
    const newItem = document.createElement("div");
    newItem.className = "iku-item dynamic-field-item new-item-animation row-item mb-4";

    newItem.innerHTML = `
      <div class="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Indikator Kinerja Utama</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-4" style="border-color: #E5E7EB; background: #FFFFFF;">
            <option value="">Pilih IKU</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Target</label>
          <input type="number" class="w-full px-4 py-3 border-2 rounded-lg text-sm" placeholder="0" min="0">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-4 satuan-select" style="border-color: #E5E7EB; background: #FFFFFF;">
            <option value="">Pilih Satuan</option>
          </select>
        </div>
        <button type="button" class="remove-button border-0 w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0 visible" style="background: #EF4444; color: #FFFFFF;" onclick="removeIkuField(this)">
          <span class="text-xl font-bold">−</span>
        </button>
      </div>
    `;
    container.appendChild(newItem);

    const selectElement = newItem.querySelector('select:not(.satuan-select)');
    selectElement.addEventListener('change', () => {
      renderIkuOptions();
    });

    // Populate options
    renderIkuOptions();

    // Populate Satuan dropdown
    if (masterState.satuan && masterState.satuan.length > 0) {
      const satuanSelect = newItem.querySelector('.satuan-select');
      masterState.satuan.forEach(satuan => {
        const option = document.createElement("option");
        option.value = satuan.satuan_id;
        option.textContent = satuan.nama_satuan;
        satuanSelect.appendChild(option);
      });
    }
  };

  function calculateTotals() {
    let grandTotal = 0;

    document.querySelectorAll('[id^="rab-items-container-"]').forEach(container => {
      const categoryId = container.id.replace('rab-items-container-', '');
      let categorySubtotal = 0;

      container.querySelectorAll('.rab-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        // Layout in addRabItem:
        // 0: Uraian
        // 1: Qty 1
        // 2: Qty 2
        // 3: Qty 3
        // 4: Harga Satuan (autonumeric)

        const v1 = parseFloat(inputs[1]?.value) || 0;
        const v2 = (inputs[2]?.value === "" || inputs[2]?.value === "0") ? 1 : parseFloat(inputs[2].value);
        const v3 = (inputs[3]?.value === "" || inputs[3]?.value === "0") ? 1 : parseFloat(inputs[3].value);

        let price = 0;
        const priceInput = inputs[4];
        if (priceInput && typeof AutoNumeric !== 'undefined' && AutoNumeric.getAutoNumericElement(priceInput)) {
          price = AutoNumeric.getAutoNumericElement(priceInput).getNumber();
        } else if (priceInput) {
          price = parseFloat(priceInput.value.replace(/[^0-9]/g, '')) || 0;
        }

        categorySubtotal += (v1 * v2 * v3 * price);
      });

      grandTotal += categorySubtotal;

      const subtotalEl = document.getElementById(`subtotal-${categoryId}`);
      if (subtotalEl) {
        subtotalEl.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(categorySubtotal);
      }
    });

    const grandTotalEl = document.getElementById('grand-total-rab');
    if (grandTotalEl) {
      grandTotalEl.textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal);
    }
  }

  async function populateTipeKegiatanDropdown() {
    try {
      const response = await apiRequest("/master/tipe-kegiatan");
      const tipeKegiatanData = response.data;

      const selectElement = document.getElementById("tipeKegiatan");
      if (!selectElement) return;

      // Clear existing options except placeholder
      selectElement.innerHTML = '<option value="">Pilih Tipe Kegiatan</option>';

      tipeKegiatanData.forEach(tipe => {
        const option = document.createElement("option");
        option.value = tipe.tipe_kegiatan_id;
        option.textContent = tipe.nama_tipe;
        selectElement.appendChild(option);
      });
      // Restore previous value if exists (after fetchAndPopulateData)
      if (kakDataState && kakDataState.tipe_kegiatan_id) {
        selectElement.value = kakDataState.tipe_kegiatan_id;
      }
    } catch (error) {
      console.error("Error populating Tipe Kegiatan dropdown:", error);
      if (typeof Swal !== "undefined") {
        Swal.fire("Error", "Gagal memuat data Tipe Kegiatan. Silakan coba lagi.", "error");
      }
    }
  }

  window.addRabItem = function (kategoriId, itemData = null) {
    const container = document.getElementById(`rab-items-container-${kategoriId}`);
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'rab-item dynamic-field-item new-item-animation mb-8 p-6 rounded-lg';
    const inputStyle = `style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"`;

    let satuanOptions = '<option value="">Pilih Satuan</option>';
    if (masterState.satuan) {
      masterState.satuan.forEach(satuan => {
        satuanOptions += `<option value="${satuan.satuan_id}">${satuan.nama_satuan}</option>`;
      });
    }

    // Determine if this is creating from existing data (itemData) or new row
    const uraian = itemData ? itemData.uraian : '';
    const vol1 = itemData ? itemData.volume1 : '';
    const sat1 = itemData ? itemData.satuan1_id : '';
    const vol2 = itemData ? itemData.volume2 : '';
    const sat2 = itemData ? itemData.satuan2_id : '';
    const vol3 = itemData ? itemData.volume3 : '';
    const sat3 = itemData ? itemData.satuan3_id : '';
    const harga = itemData ? itemData.harga_satuan : '';

    newItem.innerHTML = `
        <div class="grid grid-cols-[2.5fr_0.8fr_1.2fr_0.8fr_1.2fr_0.8fr_1.2fr_2.5fr_auto] gap-4 items-end">
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Uraian</label>
                <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" placeholder="Input Uraian" value="${uraian}" ${inputStyle}>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 1</label>
                <input type="number" min="0" value="${vol1}" placeholder="0" class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${inputStyle}>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 1</label>
                <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${inputStyle}>
                    ${satuanOptions}
                </select>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 2</label>
                <input type="number" min="0" value="${vol2}" placeholder="0" class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${inputStyle}>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 2</label>
                <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${inputStyle}>
                    ${satuanOptions}
                </select>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 3</label>
                <input type="number" min="0" value="${vol3}" placeholder="0" class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${inputStyle}>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 3</label>
                <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${inputStyle}>
                    ${satuanOptions}
                </select>
            </div>
            <div>
                <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Harga Satuan</label>
                <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm autonumeric-currency" placeholder="Input Harga" ${inputStyle}>
            </div>
            <div class="flex items-end pb-3">
                <button type="button" class="remove-button border-0 w-10 h-10 rounded-full cursor-pointer flex items-center justify-center visible" style="background: #EF4444; color: #FFFFFF;" onclick="removeField(this)">
                    <span class="text-xl font-bold">−</span>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newItem);

    // Populate selects
    const selects = newItem.querySelectorAll('.satuan-select');
    if (sat1) selects[0].value = sat1;
    if (sat2) selects[1].value = sat2;
    if (sat3) selects[2].value = sat3;

    // Init AutoNumeric
    if (typeof AutoNumeric !== 'undefined') {
      const priceInput = newItem.querySelector('.autonumeric-currency');
      new AutoNumeric(priceInput, {
        currencySymbol: 'Rp ',
        digitGroupSeparator: '.',
        decimalCharacter: ',',
        decimalPlaces: 0,
        minimumValue: '0'
      });
      if (harga) {
        AutoNumeric.getAutoNumericElement(priceInput).set(harga);
      }
      priceInput.addEventListener('autoNumeric:rawValueModified', calculateTotals);
    }

    updateRemoveButtonVisibility(container);
    newItem.addEventListener('animationend', () => {
      newItem.classList.remove('new-item-animation');
    });
  };

  // ==============================================
  // API FUNCTIONS
  // ==============================================
  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
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
      if (typeof Swal !== "undefined") {
        Swal.fire({ icon: "error", title: "API Error", text: error.message });
      }
      throw error;
    }
  }

  // ==============================================
  // HELPER & CREATION FUNCTIONS
  // ==============================================
  const toSnakeCase = (str) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNameById = (id, list, idField, nameField) => {
    const item = list.find((d) => d[idField] == id);
    return item ? item[nameField] : "N/A";
  };

  const createReadOnlyRow = (value, index, type, pkValue, pkName, fieldName) => {
    const fieldAttr = fieldName ? `data-field-name="${fieldName}"` : '';
    return `
    <div class="row-with-comment" data-row-type="${type}" data-pk-name="${pkName}" data-pk-value="${pkValue}" ${fieldAttr}>
      <div class="input-with-comment">
        <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${value}">
      </div>
      <button class="row-comment-icon" onclick="openRowCommentModal(this)" data-label="${(fieldName ? (fieldName.charAt(0).toUpperCase() + fieldName.slice(1)).replace('_', ' ') : type.charAt(0).toUpperCase() + type.slice(1))
      } #${index + 1}">
        <i class="ti ti-message-circle-2">&#xeaed;</i>
      </button>
    </div>
  `};



  const createIndikatorKinerjaRow = (item, index) => {
    // Generate bulan options
    const bulanList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const bulanOptions = bulanList.map(bulan =>
      `<option value="${bulan}" ${item.bulan_indikator === bulan ? 'selected' : ''}>${bulan}</option>`
    ).join('');

    // Tentukan style untuk select bulan
    const selectStyle = isPengusul
      ? `style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"`
      : `style="${inputStyle}" ${inputAttr}`;

    return `
    <div class="row-with-comment" data-row-type="t_kak_target" data-pk-name="target_id" data-pk-value="${item.target_id}">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Bulan</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${selectStyle}>
            <option value="">Pilih Bulan</option>
            ${bulanOptions}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Indikator Keberhasilan</label>
          <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${item.deskripsi_target || ""}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-xs" style="color: #374151;">Target</label>
          <div class="flex gap-2 items-center">
            <input type="number" class="flex-1 px-4 py-3 border-2 rounded-lg text-sm" placeholder="Input" min="0" max="100" step="1" style="${inputStyle}" ${inputAttr} value="${item.persentase_target || ""}">
            <div class="px-3 py-3 text-sm font-semibold" style="color: #374151;">%</div>
          </div>
        </div>
      </div>
      <button class="row-comment-icon" onclick="openRowCommentModal(this)" data-label="Indikator Kinerja #${index + 1}">
        <i class="ti ti-message-circle-2">&#xeaed;</i>
      </button>
    </div>
  `;
  };

  const createIkuRow = (item, index) => {
    // Generate IKU options
    const ikuOptions = masterState.iku && masterState.iku.length > 0
      ? masterState.iku.map(iku =>
        `<option value="${iku.iku_id}" ${iku.iku_id == item.iku_id ? 'selected' : ''}>${iku.nama_iku}</option>`
      ).join('')
      : '';

    // Generate Satuan options
    const satuanOptions = masterState.satuan && masterState.satuan.length > 0
      ? masterState.satuan.map(satuan =>
        `<option value="${satuan.satuan_id}" ${satuan.satuan_id == item.satuan_id ? 'selected' : ''}>${satuan.nama_satuan}</option>`
      ).join('')
      : '';

    // Tentukan style untuk select
    const selectStyle = isPengusul
      ? `style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"`
      : `style="${inputStyle}" ${inputAttr}`;

    return `
    <div class="row-with-comment" data-row-type="t_kak_iku" data-pk-name="kak_iku_id" data-pk-value="${item.kak_iku_id || item.iku_id}">
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1">
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Indikator Kinerja Utama</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${selectStyle}>
            <option value="">Pilih IKU</option>
            ${ikuOptions}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Target</label>
          <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${item.target || "0"}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm" ${selectStyle}>
            <option value="">Pilih Satuan</option>
            ${satuanOptions}
          </select>
        </div>
      </div>
      <button class="row-comment-icon" onclick="openRowCommentModal(this)" data-label="IKU & Target #${index + 1}">
        <i class="ti ti-message-circle-2">&#xeaed;</i>
      </button>
    </div>
  `;
  };

  const createRabRow = (item, index) => {
    const vol1 = isVerifikator && !item.volume1 ? "" : item.volume1 || "";
    const vol2 = isVerifikator && !item.volume2 ? "" : item.volume2 || "";
    const vol3 = isVerifikator && !item.volume3 ? "" : item.volume3 || "";

    // Function untuk render satuan options
    const satuanOptions = (satuanId) => {
      if (!masterState.satuan || masterState.satuan.length === 0) {
        return '<option value="">Pilih Satuan</option>';
      }

      let options = '<option value="">Pilih Satuan</option>';
      masterState.satuan.forEach(s => {
        const selected = s.satuan_id == satuanId ? 'selected' : '';
        options += `<option value="${s.satuan_id}" ${selected}>${s.nama_satuan}</option>`;
      });
      return options;
    };

    // Style untuk select - jangan disable untuk Pengusul
    const selectStyle = isPengusul
      ? `style="border-color: #E5E7EB; background: #FFFFFF;" onfocus="this.style.borderColor='#00BCD4'; this.style.boxShadow='0 0 0 4px rgba(0, 188, 212, 0.1)';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"`
      : `style="${inputStyle}" ${inputAttr}`;

    return `
    <div class="row-with-comment rab-item" data-row-type="t_kak_anggaran" data-pk-name="anggaran_id" data-pk-value="${item.anggaran_id}">
      <div class="grid-rab">
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Uraian</label>
          <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${item.uraian || ""}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 1</label>
          <input type="number" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${vol1}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 1</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${selectStyle}>
            ${satuanOptions(item.satuan1_id)}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 2</label>
          <input type="number" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${vol2}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 2</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${selectStyle}>
            ${satuanOptions(item.satuan2_id)}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Qty 3</label>
          <input type="number" class="w-full px-4 py-3 border-2 rounded-lg text-sm" style="${inputStyle}" ${inputAttr} value="${vol3}">
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Satuan 3</label>
          <select class="w-full px-4 py-3 border-2 rounded-lg text-sm satuan-select" ${selectStyle}>
            ${satuanOptions(item.satuan3_id)}
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Harga Satuan</label>
          <input type="text" class="w-full px-4 py-3 border-2 rounded-lg text-sm autonumeric-currency" style="${inputStyle}" ${inputAttr} data-raw-value="${item.harga_satuan || 0}">
        </div>
      </div>
      <button class="row-comment-icon" onclick="openRowCommentModal(this)" data-label="Anggaran #${index + 1}">
        <i class="ti ti-message-circle-2">&#xeaed;</i>
      </button>
    </div>
  `;
  };

  // Helper to initialize AutoNumeric
  const initAutoNumeric = () => {
    if (typeof AutoNumeric === 'undefined') return;
    document.querySelectorAll('.autonumeric-currency').forEach(el => {
      if (AutoNumeric.getAutoNumericElement(el)) return; // Already initialized
      new AutoNumeric(el, {
        currencySymbol: 'Rp ',
        digitGroupSeparator: '.',
        decimalCharacter: ',',
        decimalPlaces: 0,
        minimumValue: '0'
      });
      // Set initial value
      const rawValue = el.getAttribute('data-raw-value');
      if (rawValue) {
        AutoNumeric.getAutoNumericElement(el).set(rawValue);
      }
      el.addEventListener('autoNumeric:rawValueModified', calculateTotals);
    });
  };

  // ==============================================
  // DATE RANGE PICKER
  // ==============================================
  const loadDateRangePicker = () => {
    // Load moment.js first
    const momentScript = document.createElement("script");
    momentScript.src = "/assets/vendor/libs/moment/moment.js";
    momentScript.onload = () => {
      // Then load daterangepicker
      const daterangeScript = document.createElement("script");
      daterangeScript.src = "/assets/vendor/libs/bootstrap-daterangepicker/bootstrap-daterangepicker.js";
      daterangeScript.onload = () => initializeDateRangePickers(usulanId);
      document.head.appendChild(daterangeScript);
    };
    document.head.appendChild(momentScript);
  };

  function initializeDateRangePickers(kakId) {
    if (typeof $ !== "undefined" && $.fn.daterangepicker) {
      const pickerOptions = {
        showDropdowns: true,
        minYear: 2020,
        maxYear: parseInt(moment().format("YYYY"), 10) + 5,
        locale: {
          format: "DD/MM/YYYY",
          separator: " - ",
          applyLabel: "Terapkan",
          cancelLabel: "Batal",
          fromLabel: "Dari",
          toLabel: "Hingga",
          customRangeLabel: "Kustom",
          weekLabel: "W",
          daysOfWeek: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
          monthNames: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
          firstDay: 1,
        },
        opens: "right",
      };

      if (isPengusul) {
        pickerOptions.startDate = moment();
        pickerOptions.endDate = moment().add(7, "days");
      }

      $("#kurunWaktu").daterangepicker(pickerOptions);

      if (!isPengusul) {
        // For verifikator, we just want to display the date, not make it editable.
        // Disabling the input is handled by inputAttr, but we remove the picker functionality
        // to prevent the calendar from showing up at all.
        $("#kurunWaktu").data('daterangepicker').remove();
      }

      fetchAndPopulateData(kakId);
    } else {
      setTimeout(() => initializeDateRangePickers(kakId), 50);
    }
  }

  // ==============================================
  // DATA FETCH AND POPULATE - FIXED VERSION
  // ==============================================
  async function fetchAndPopulateData(kakId) {
    if (!kakId) {
      Swal.fire("Error", "ID Usulan tidak ditemukan di URL.", "error");
      return;
    }

    Swal.fire({
      title: "Memuat Data...",
      text: "Silakan tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const [kakResponse, ikuResponse, satuanResponse, kategoriBelanjaResponse] = await Promise.all([
        apiRequest(`/kak/${kakId}/data`),
        apiRequest("/master/iku"),
        apiRequest("/master/satuan"),
        apiRequest("/master/kategori-belanja"),
      ]);

      masterState.iku = ikuResponse.data;
      masterState.satuan = satuanResponse.data;
      const kakData = kakResponse.data;

      kakDataState = kakData;

      const fieldMapping = {
        catatan_nama_kegiatan: "namaKegiatan",
        catatan_deskripsi_kegiatan: "gambaranUmum",
        catatan_metode_pelaksanaan: "metodePelaksanaan",
        catatan_tanggal: "kurunWaktu",
      };

      for (const [backendKey, frontendKey] of Object.entries(fieldMapping)) {
        if (kakData[backendKey]) {
          fieldComments[toSnakeCase(frontendKey)] = kakData[backendKey];
          updateCommentButton(
            `.row-comment-icon[data-field="${frontendKey}"]`,
            kakData[backendKey]
          );
        }
      }

      const childTables = {
        manfaat: { array: kakData.manfaat, idField: "manfaat_id", tableName: "t_kak_manfaat" },
        tahapan: { array: kakData.tahapan, idField: "tahapan_id", tableName: "t_kak_tahapan" },
        target: { array: kakData.target, idField: "target_id", tableName: "t_kak_target" },
        iku: { array: kakData.iku, idField: "kak_iku_id", tableName: "t_kak_iku" },
        anggaran: { array: kakData.anggaran, idField: "anggaran_id", tableName: "t_kak_anggaran" },
      };

      for (const config of Object.values(childTables)) {
        if (config.array && config.array.length > 0) {
          if (!rowComments[config.tableName]) rowComments[config.tableName] = {};
          config.array.forEach((item) => {
            // Use fallback ID for IKU to match UI generation
            const pk = (config.tableName === 't_kak_iku')
              ? (item.kak_iku_id || item.iku_id)
              : item[config.idField];

            if (!pk) return;

            if (config.tableName === 't_kak_manfaat') {
              // Only load catatan_manfaat (sasaran_utama moved to t_kak)
              if (item.catatan_manfaat) {
                rowComments[config.tableName][`${pk}_manfaat`] = item.catatan_manfaat;
              }
            } else if (item.catatan_verifikator) {
              rowComments[config.tableName][pk] = item.catatan_verifikator;
            }
          });
        }
      }

      // Load catatan_sasaran_utama from t_kak header
      if (kakData.catatan_sasaran_utama) {
        if (!rowComments['t_kak']) rowComments['t_kak'] = {};
        rowComments['t_kak'][`${kakData.kak_id}_sasaran_utama`] = kakData.catatan_sasaran_utama;
      }

      updateCommentCount();

      document.querySelector('[data-field="namaKegiatan"]').value = kakData.nama_kegiatan || "";
      document.querySelector('[data-field="tipeKegiatan"]').value = kakData.tipe_kegiatan_id || "";
      document.querySelector('[data-field="gambaranUmum"]').value = kakData.deskripsi_kegiatan || "";
      document.querySelector('[data-field="metodePelaksanaan"]').value = kakData.metode_pelaksanaan || "";

      // Populate Kurun Waktu
      if (kakData.tanggal_mulai && kakData.tanggal_selesai) {
        const startDate = moment(kakData.tanggal_mulai, "YYYY-MM-DD");
        const endDate = moment(kakData.tanggal_selesai, "YYYY-MM-DD");
        if (isPengusul && typeof $ !== "undefined" && $.fn.daterangepicker && $('#kurunWaktu').data('daterangepicker')) {
          $('#kurunWaktu').data('daterangepicker').setStartDate(startDate);
          $('#kurunWaktu').data('daterangepicker').setEndDate(endDate);
        } else {
          const formatted = `${startDate.format("DD/MM/YYYY")} - ${endDate.format("DD/MM/YYYY")}`;
          document.getElementById('kurunWaktu').value = formatted;
        }
      }

      // Populate Sasaran Utama (header level from t_kak)
      const sasaranContainer = document.getElementById("sasaranUtamaContainer");
      sasaranContainer.innerHTML = "";
      console.log('DEBUG Sasaran Utama:', kakData.sasaran_utama);
      console.log('DEBUG KAK ID:', kakData.kak_id);
      if (kakData.sasaran_utama) {
        // Use textarea for long text instead of input
        sasaranContainer.innerHTML = `
          <div class="row-with-comment" data-row-type="t_kak" data-pk-name="kak_id" data-pk-value="${kakData.kak_id}" data-field-name="sasaran_utama">
            <div class="input-with-comment">
              <textarea class="w-full px-4 py-3 border-2 rounded-lg text-sm min-h-[100px] resize-y" style="${inputStyle}" ${inputAttr}>${kakData.sasaran_utama}</textarea>
            </div>
            <button class="row-comment-icon" onclick="openRowCommentModal(this)" data-label="Sasaran Utama">
              <i class="ti ti-message-circle-2">&#xeaed;</i>
            </button>
          </div>
        `;
        if (kakData.catatan_sasaran_utama) {
          updateCommentButton(
            `.row-with-comment[data-row-type="t_kak"][data-pk-value="${kakData.kak_id}"][data-field-name="sasaran_utama"] .row-comment-icon`,
            kakData.catatan_sasaran_utama
          );
        }
      }

      // Populate Manfaat (detail level from t_kak_manfaat)
      const manfaatContainer = document.getElementById("manfaatContainer");
      manfaatContainer.innerHTML = "";
      if (kakData.manfaat && kakData.manfaat.length > 0) {
        kakData.manfaat.forEach((item, index) => {
          if (item.manfaat) {
            manfaatContainer.innerHTML += createReadOnlyRow(
              item.manfaat,
              index,
              "t_kak_manfaat",
              item.manfaat_id,
              "manfaat_id",
              "manfaat"
            );
          }
        });
        kakData.manfaat.forEach((item) => {
          if (item.catatan_manfaat) {
            updateCommentButton(
              `.row-with-comment[data-row-type="t_kak_manfaat"][data-pk-value="${item.manfaat_id}"][data-field-name="manfaat"] .row-comment-icon`,
              item.catatan_manfaat
            );
          }
        });
      }

      // Populate Tahapan
      const tahapanContainer = document.getElementById("tahapanPelaksanaanContainer");
      tahapanContainer.innerHTML = "";
      if (kakData.tahapan && kakData.tahapan.length > 0) {
        kakData.tahapan.forEach((item, index) => {
          tahapanContainer.innerHTML += createReadOnlyRow(item.nama_tahapan, index, "t_kak_tahapan", item.tahapan_id, "tahapan_id");
        });
        kakData.tahapan.forEach((item) => {
          if (item.catatan_verifikator) {
            updateCommentButton(`.row-with-comment[data-row-type="t_kak_tahapan"][data-pk-value="${item.tahapan_id}"] .row-comment-icon`, item.catatan_verifikator);
          }
        });
      }

      // Populate Indikator Kinerja
      const indikatorContainer = document.getElementById("indikatorKinerjaContainer");
      indikatorContainer.innerHTML = "";
      if (kakData.target && kakData.target.length > 0) {
        kakData.target.forEach((item, index) => {
          indikatorContainer.innerHTML += createIndikatorKinerjaRow(item, index);
        });
        kakData.target.forEach((item) => {
          if (item.catatan_verifikator) {
            updateCommentButton(`.row-with-comment[data-row-type="t_kak_target"][data-pk-value="${item.target_id}"] .row-comment-icon`, item.catatan_verifikator);
          }
        });
      }

      // Populate IKU
      const ikuContainer = document.getElementById("ikuRenstraContainer");
      ikuContainer.innerHTML = "";
      if (kakData.iku && kakData.iku.length > 0) {
        kakData.iku.forEach((item, index) => {
          ikuContainer.innerHTML += createIkuRow(item, index);
        });
        kakData.iku.forEach((item) => {
          if (item.catatan_verifikator) {
            const pkValue = item.kak_iku_id || item.iku_id;
            updateCommentButton(`.row-with-comment[data-row-type="t_kak_iku"][data-pk-value="${pkValue}"] .row-comment-icon`, item.catatan_verifikator);
          }
        });
      }

      // Render RAB
      const rabContainer = document.getElementById("rab-container");
      if (rabContainer && kakData.anggaran) {
        rabContainer.innerHTML = "";
        const grouped = {};
        kakData.anggaran.forEach((item) => {
          if (!grouped[item.kategori_belanja_id]) grouped[item.kategori_belanja_id] = [];
          grouped[item.kategori_belanja_id].push(item);
        });

        // We need category names. Assuming they are in `kategoriBelanjaResponse` which was fetched but not stored in masterState?
        // In the `fetchAndPopulateData` I saw: `const [..., kategoriBelanjaResponse] = await Promise.all(...)`
        // I need to make sure `kategoriBelanjaResponse` is used.

        const kategoriData = kategoriBelanjaResponse.data;

        kategoriData.forEach((cat, index) => {
          const catItems = grouped[cat.kategori_belanja_id] || [];
          // Always show category if we are Pengusul (to allow adding) or if Verifikator has items
          if (isPengusul || catItems.length > 0) {
            const section = document.createElement("div");
            const isLastCategory = index === kategoriData.length - 1;
            section.className = `mb-8 ${!isLastCategory ? 'spectacular-divider' : ''}`;
            section.dataset.kategoriId = cat.kategori_belanja_id;

            section.innerHTML = `
                    <div class="flex justify-between items-center mb-6">
                        <h5 class="font-bold text-lg" style="color: #374151;">${cat.nama}</h5>
                    </div>
                `;

            const itemsContainer = document.createElement("div");
            itemsContainer.id = `rab-items-container-${cat.kategori_belanja_id}`;

            catItems.forEach((item, idx) => {
              itemsContainer.innerHTML += createRabRow(item, idx);
            });

            section.appendChild(itemsContainer);

            const subtotalDiv = document.createElement("div");
            subtotalDiv.className = "flex justify-end items-center mt-4";
            subtotalDiv.innerHTML = `
                    <div class="text-right">
                        <span class="text-sm text-gray-500">Subtotal:</span>
                        <span id="subtotal-${cat.kategori_belanja_id}" class="font-bold text-lg ml-2" style="color: #00BCD4;">Rp 0</span>
                    </div>
                `;
            section.appendChild(subtotalDiv);

            if (isPengusul) {
              const addButton = document.createElement("button");
              addButton.type = "button";
              addButton.className = "ml-6 border-0 px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-block hover:-translate-y-0.5";
              addButton.style.background = "#00BCD4";
              addButton.style.color = "#FFFFFF";
              addButton.textContent = "Tambah Item";
              addButton.onclick = () => addRabItem(cat.kategori_belanja_id);
              section.appendChild(addButton);
            }

            rabContainer.appendChild(section);

            // Restore missing logic: Update comment buttons for RAB items
            catItems.forEach((item) => {
              if (item.catatan_verifikator) {
                updateCommentButton(
                  `.row-with-comment[data-row-type="t_kak_anggaran"][data-pk-value="${item.anggaran_id}"] .row-comment-icon`,
                  item.catatan_verifikator
                );
              }
            });
          }
        });

        // Grand Total
        const totalSection = document.createElement('div');
        totalSection.className = 'spectacular-total-card';
        totalSection.innerHTML = `
            <div class="total-label">
                <i class="ti ti-wallet"></i>
                <span>Total Estimasi Biaya</span>
            </div>
            <div id="grand-total-rab" class="total-value">Rp 0</div>
        `;
        rabContainer.appendChild(totalSection);

        // Initialize AutoNumeric after rendering RAB
        initAutoNumeric();
        setTimeout(calculateTotals, 500);
      }

      Swal.close();
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Gagal memuat data KAK.", "error");
    }
  }

  // Initialize
  function init() {
    updateMainStepDisplay();
    updateStepDisplay();
    attachEventListeners();
    populateTipeKegiatanDropdown(); // Populate dropdown on init
    loadDateRangePicker();

    // Update menu button revision status on page load
    setTimeout(() => {
      updateMenuButtonRevisionStatus();
    }, 100);
  }

  function updateMainStepDisplay() {
    const stepIcons = {
      1: { class: "ti ti-file-text", entity: "&#xef40;" },
      2: { class: "ti ti-chart-bar", entity: "&#xea59;" },
      3: { class: "ti ti-currency-dollar", entity: "&#xeb84;" },
    };
    document.querySelectorAll(".progress-step-item").forEach((step, index) => {
      const stepNum = index + 1;
      const circle = step.querySelector(".progress-step-circle");
      const text = step.querySelector(".progress-step-text");
      const subtext = step.querySelector(".progress-step-subtext");
      circle.className =
        "progress-step-circle w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300";
      if (stepNum < mainStep) {
        circle.style.background = "#10B981";
        circle.style.color = "#FFFFFF";
        circle.innerHTML =
          '<i class="ti ti-check" style="font-size: 1.125rem;">&#xea5e;</i>';
        text.style.color = "#10B981";
        if (subtext) subtext.style.color = "#10B981";
      } else if (stepNum === mainStep) {
        circle.style.background = "#00BCD4";
        circle.style.color = "#FFFFFF";
        circle.innerHTML = `<i class="${stepIcons[stepNum].class}" style="font-size: 1.125rem;">${stepIcons[stepNum].entity}</i>`;
        text.style.color = "#00BCD4";
        if (subtext) subtext.style.color = "#00BCD4";
      } else {
        circle.style.background = "#E5E7EB";
        circle.style.color = "#6B7280";
        circle.innerHTML = `<i class="${stepIcons[stepNum].class}" style="font-size: 1.125rem;">${stepIcons[stepNum].entity}</i>`;
        text.style.color = "#6B7280";
        if (subtext) subtext.style.color = "#9CA3AF";
      }
    });
    document
      .querySelectorAll(".main-step-content")
      .forEach((content, index) => {
        content.classList.toggle("active", index + 1 === mainStep);
      });
  }

  function updateStepDisplay() {
    if (mainStep !== 1) return;
    document.querySelectorAll(".menu-button").forEach((btn, index) => {
      const isActive = index + 1 === currentStep;
      btn.classList.toggle("active", isActive);
      btn.style.borderColor = isActive ? "#00BCD4" : "#E5E7EB";
      btn.style.background = isActive ? "rgba(0, 188, 212, 0.1)" : "";
    });
    document
      .querySelectorAll("#main-step-1 .step-content")
      .forEach((content) => {
        content.classList.toggle(
          "active",
          content.id === menuItems[currentStep - 1]
        );
      });
    document.getElementById("btnBack").style.visibility =
      currentStep === 1 ? "hidden" : "visible";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function attachEventListeners() {
    // Progress step items - allow clicking to navigate
    document.querySelectorAll(".progress-step-item").forEach((step) => {
      step.addEventListener("click", function () {
        const targetStep = parseInt(this.getAttribute("data-main-step"));

        if (targetStep && targetStep !== mainStep) {
          mainStep = targetStep;
          if (mainStep === 1) {
            currentStep = 1;
          }
          updateMainStepDisplay();
          updateStepDisplay();
        }
      });
    });

    document.querySelectorAll(".menu-button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const menuIndex = menuItems.indexOf(this.getAttribute("data-menu"));
        if (menuIndex !== -1) {
          currentStep = menuIndex + 1;
          updateStepDisplay();
        }
      });
    });
    document.getElementById("btnBack").addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
      }
    });
    document.getElementById("btnNext").addEventListener("click", () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepDisplay();
      } else {
        mainStep = 2;
        updateMainStepDisplay();
      }
    });
    document.getElementById("btnBackIku").addEventListener("click", () => {
      mainStep = 1;
      currentStep = totalSteps;
      updateMainStepDisplay();
      updateStepDisplay();
    });
    document.getElementById("btnNextIku").addEventListener("click", () => {
      mainStep = 3;
      updateMainStepDisplay();
    });
    document.getElementById("btnBackRab").addEventListener("click", () => {
      mainStep = 2;
      updateMainStepDisplay();
    });

    // RAB Calculation Listener
    const rabContainer = document.getElementById('rab-container');
    if (rabContainer) {
      rabContainer.addEventListener('input', (e) => {
        if (e.target.matches('input[type="number"]')) {
          calculateTotals();
        }
      });
    }

    // Enter key submission for comment modals
    const fieldCommentInput = document.getElementById("fieldCommentInput");
    if (fieldCommentInput) {
      fieldCommentInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          saveFieldComment();
        }
      });
    }

    const rowCommentInput = document.getElementById("rowCommentInput");
    if (rowCommentInput) {
      rowCommentInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          saveRowComment();
        }
      });
    }

    // Focus input when modal opens
    const fieldCommentModal = document.getElementById('fieldCommentModal');
    if (fieldCommentModal) {
      fieldCommentModal.addEventListener('shown.bs.modal', function () {
        if (fieldCommentInput && !fieldCommentInput.disabled) {
          fieldCommentInput.focus();
        }
      });
    }

    const rowCommentModal = document.getElementById('rowCommentModal');
    if (rowCommentModal) {
      rowCommentModal.addEventListener('shown.bs.modal', function () {
        if (rowCommentInput && !rowCommentInput.disabled) {
          rowCommentInput.focus();
        }
      });
    }
  }

  window.openFieldCommentModal = function (btn) {
    const fieldKey = btn.getAttribute("data-field");
    const fieldLabel = btn.getAttribute("data-label");
    currentCommentTarget = { type: "field", key: toSnakeCase(fieldKey) };
    const commentText = fieldComments[currentCommentTarget.key] || "";

    const fieldCommentInputContainer = document.getElementById(
      "fieldCommentInputContainer"
    );
    const fieldCommentInput = document.getElementById("fieldCommentInput");
    const fieldCommentDisplayContainer = document.getElementById(
      "fieldCommentDisplayContainer"
    );
    const fieldCommentDisplayText = document.getElementById(
      "fieldCommentDisplayText"
    );
    const fieldCommentLabelEl = document.getElementById("fieldCommentLabel");
    const currentFieldValueEl = document.getElementById("currentFieldValue");

    fieldCommentLabelEl.textContent = fieldLabel;
    let container = btn.closest(".row-with-comment");
    if (!container) container = btn.closest(".input-with-comment");
    const input = container.querySelector("input, textarea, select");

    let currentValue = "";
    if (input) {
      if (input.tagName.toLowerCase() === 'select') {
        const selectedOption = input.options[input.selectedIndex];
        currentValue = selectedOption ? selectedOption.text : "";
      } else {
        currentValue = input.value;
      }
    }

    currentFieldValueEl.textContent = currentValue || "(Kosong)";

    if (isVerifikator) {
      fieldCommentInputContainer.style.display = "block";
      fieldCommentDisplayContainer.style.display = "none";
      fieldCommentInput.value = commentText;
    } else if (isPengusul) {
      fieldCommentInputContainer.style.display = "none";
      fieldCommentDisplayContainer.style.display = "block";
      fieldCommentDisplayText.textContent =
        commentText || "(Tidak ada catatan)";
    }

    if (!fieldCommentModalInstance) {
      fieldCommentModalInstance = new bootstrap.Modal(
        document.getElementById("fieldCommentModal")
      );
    }
    if (isVerifikator || isPengusul) {
      fieldCommentModalInstance.show();
    }
  };

  window.openRowCommentModal = function (btn) {
    const rowElement = btn.closest(".row-with-comment");
    const fieldName = rowElement.dataset.fieldName;
    currentCommentTarget = {
      type: "row",
      table: rowElement.dataset.rowType,
      pk: rowElement.dataset.pkValue,
      field: fieldName,
    };
    const rowLabel = btn.getAttribute("data-label");
    let commentText = "";
    // Handle tables with fieldName (t_kak, t_kak_manfaat)
    if (currentCommentTarget.field) {
      const key = `${currentCommentTarget.pk}_${currentCommentTarget.field}`;
      commentText = (rowComments[currentCommentTarget.table]?.[key]) || "";
    } else {
      commentText = (rowComments[currentCommentTarget.table]?.[currentCommentTarget.pk]) || "";
    }

    const rowCommentInputContainer = document.getElementById(
      "rowCommentInputContainer"
    );
    const rowCommentInput = document.getElementById("rowCommentInput");
    const rowCommentDisplayContainer = document.getElementById(
      "rowCommentDisplayContainer"
    );
    const rowCommentDisplayText = document.getElementById(
      "rowCommentDisplayText"
    );
    const rowCommentLabelEl = document.getElementById("rowCommentLabel");
    const currentRowValueEl = document.getElementById("currentRowValue");

    rowCommentLabelEl.textContent = rowLabel;
    const inputs = rowElement.querySelectorAll("input, textarea, select");
    let rowValues = Array.from(inputs)
      .map((input) => input.value)
      .filter(Boolean);
    currentRowValueEl.textContent = rowValues.join(" | ") || "(Kosong)";

    if (isVerifikator) {
      rowCommentInputContainer.style.display = "block";
      rowCommentDisplayContainer.style.display = "none";
      rowCommentInput.value = commentText;
    } else if (isPengusul) {
      rowCommentInputContainer.style.display = "none";
      rowCommentDisplayContainer.style.display = "block";
      rowCommentDisplayText.textContent = commentText || "(Tidak ada catatan)";
    }

    if (!rowCommentModalInstance) {
      rowCommentModalInstance = new bootstrap.Modal(
        document.getElementById("rowCommentModal")
      );
    }
    if (isVerifikator || (isPengusul && commentText)) {
      rowCommentModalInstance.show();
    }
  };

  window.saveFieldComment = function () {
    const comment = document.getElementById("fieldCommentInput").value.trim();
    const { key } = currentCommentTarget;
    if (comment) {
      fieldComments[key] = comment;
    } else {
      delete fieldComments[key];
    }

    // Convert snake_case back to camelCase for selector
    const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    updateCommentButton(`.row-comment-icon[data-field="${camelCaseKey}"]`, comment);
    updateCommentCount();

    // Update menu button revision status
    updateMenuButtonRevisionStatus();

    fieldCommentModalInstance.hide();
    Swal.fire({
      icon: "success",
      title: "Tersimpan!",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  window.saveRowComment = function () {
    const saveBtn = document.querySelector('#rowCommentModal .btn-primary');
    if (window.setButtonLoading && saveBtn) {
      window.setButtonLoading(saveBtn, true, 'Menyimpan...');
    }

    const comment = document.getElementById("rowCommentInput").value.trim();
    const { table, pk, field } = currentCommentTarget;

    // Handle tables with fieldName (t_kak, t_kak_manfaat)
    if (field) {
      if (!rowComments[table]) rowComments[table] = {};
      const key = `${pk}_${field}`;
      if (comment) {
        rowComments[table][key] = comment;
      } else {
        delete rowComments[table][key];
      }
    } else {
      // Standard tables without fieldName (tahapan, target, anggaran, iku)
      if (!rowComments[table]) {
        rowComments[table] = {};
      }
      if (comment) {
        rowComments[table][pk] = comment;



      } else {



        delete rowComments[table][pk];



      }



    }



    let selector = `.row-with-comment[data-row-type="${table}"][data-pk-value="${pk}"]`;

    if (field) {

      selector += `[data-field-name="${field}"]`;

    } else {

      selector += `:not([data-field-name])`;

    }

    selector += ` .row-comment-icon`;



    updateCommentButton(selector, comment);

    updateCommentCount();

    // Update menu button revision status
    updateMenuButtonRevisionStatus();

    if (window.setButtonLoading && saveBtn) {
      window.setButtonLoading(saveBtn, false);
    }

    rowCommentModalInstance.hide();

    Swal.fire({
      icon: "success",
      title: "Tersimpan!",
      timer: 1500,
      showConfirmButton: false,
    });

  };

  function updateCommentButton(selector, comment) {
    const btn = document.querySelector(selector);
    if (btn) {
      const icon = btn.querySelector("i");
      btn.classList.toggle("has-comment", !!comment);
      icon.innerHTML = comment ? "&#xeaee;" : "&#xeaed;";
      if (btn.parentElement.classList.contains("row-with-comment")) {
        btn.parentElement.classList.toggle("has-row-comment", !!comment);
      }
    }

    // Update menu button status
    updateMenuButtonRevisionStatus();
  }
  // Fungsi untuk membuka modal detail catatan - SIMPLIFIED VERSION
  window.openCommentDetailModal = function () {
    const modalContent = document.getElementById("commentDetailContent");

    // Simplified mapping - hanya 3 section utama
    const fieldToMainStep = {
      'nama_kegiatan': 1,
      'gambaran_umum': 1,
      'metode_pelaksanaan': 1,
      'kurun_waktu': 1
    };

    const tableToMainStep = {
      't_kak': 1, // For sasaran_utama and other t_kak fields
      't_kak_manfaat': 1,
      't_kak_tahapan': 1,
      't_kak_target': 1,
      't_kak_iku': 2,
      't_kak_anggaran': 3
    };

    // Group comments by main step
    const commentsByStep = {
      1: [], // KAK
      2: [], // IKU & Renstra
      3: []  // RAB
    };

    // Collect field comments
    for (const [fieldKey, comment] of Object.entries(fieldComments)) {
      const step = fieldToMainStep[fieldKey] || 1;
      const fieldLabels = {
        'nama_kegiatan': 'Nama Kegiatan',
        'gambaran_umum': 'Gambaran Umum Kegiatan',
        'metode_pelaksanaan': 'Metode Pelaksanaan',
        'kurun_waktu': 'Kurun Waktu Pelaksanaan'
      };

      commentsByStep[step].push({
        type: 'field',
        identifier: fieldKey,
        label: fieldLabels[fieldKey] || fieldKey,
        comment: comment,
        section: getSectionFromField(fieldKey)
      });
    }

    // Collect row comments
    for (const [tableName, comments] of Object.entries(rowComments)) {
      const step = tableToMainStep[tableName] || 1;

      for (const [rowId, comment] of Object.entries(comments)) {
        let displayLabel = getTableDisplayName(tableName);
        let rowIdForNav = rowId;

        // Handle tables with fieldName (t_kak, t_kak_manfaat)
        if ((tableName === 't_kak' || tableName === 't_kak_manfaat') && rowId.includes('_')) {
          const parts = rowId.split('_');
          const fieldName = parts.slice(1).join('_');
          rowIdForNav = parts[0];

          if (tableName === 't_kak') {
            displayLabel = fieldName === 'sasaran_utama' ? 'Sasaran Utama' : fieldName;
          } else {
            displayLabel += ` - ${fieldName === 'sasaran_utama' ? 'Sasaran Utama' : 'Manfaat'}`;
          }
        }

        commentsByStep[step].push({
          type: 'row',
          identifier: tableName,
          rowId: rowIdForNav,
          label: displayLabel,
          comment: comment,
          section: getSectionFromTable(tableName)
        });
      }
    }

    // Build HTML
    let html = '';
    let hasComments = false;

    const stepTitles = {
      1: { title: 'Kerangka Acuan Kerja', icon: '&#xef40;' },
      2: { title: 'IKU & Renstra', icon: '&#xea59;' },
      3: { title: 'Rencana Anggaran Biaya', icon: '&#xeb84;' }
    };

    for (const step of [1, 2, 3]) {
      const items = commentsByStep[step];
      if (items.length > 0) {
        hasComments = true;

        html += `
        <div class="comment-section-divider">
          <i class="ti ti-file-text">${stepTitles[step].icon}</i>
          ${stepTitles[step].title}
        </div>
      `;

        items.forEach(item => {
          const navigateParams = item.type === 'field'
            ? `'field', '${item.identifier}', ${step}, '${item.section}'`
            : `'row', '${item.identifier}', ${step}, '${item.section}', '${item.rowId}'`;

          html += `
          <div class="comment-item" onclick="navigateToComment(${navigateParams})">
            <div class="comment-item-header">
              <div class="comment-item-title">
                <i class="ti ti-alert-circle">&#xea06;</i>
                ${item.label}
              </div>
            </div>
            <div class="comment-item-text">${item.comment}</div>
          </div>
        `;
        });
      }
    }

    // Empty state
    if (!hasComments) {
      html = `
      <div class="comment-empty-state">
        <i class="ti ti-clipboard-off">&#xf0cf;</i>
        <div class="empty-title">Tidak Ada Catatan Revisi</div>
        <div class="empty-subtitle">Belum ada catatan yang ditambahkan untuk usulan ini.</div>
      </div>
    `;
    }

    modalContent.innerHTML = html;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('commentDetailModal'));
    modal.show();
  };

  // Helper functions
  function getSectionFromField(fieldKey) {
    const sectionMap = {
      'nama_kegiatan': 'gambaran-umum',
      'gambaran_umum': 'gambaran-umum',
      'metode_pelaksanaan': 'strategi-pencapaian',
      'kurun_waktu': 'kurun-waktu'
    };
    return sectionMap[fieldKey] || 'gambaran-umum';
  }

  function getSectionFromTable(tableName) {
    const sectionMap = {
      't_kak': 'penerima-manfaat', // For sasaran_utama
      't_kak_manfaat': 'penerima-manfaat',
      't_kak_tahapan': 'strategi-pencapaian',
      't_kak_target': 'indikator-kinerja',
      't_kak_iku': null,
      't_kak_anggaran': null
    };
    return sectionMap[tableName] || null;
  }

  function getTableDisplayName(tableName) {
    const nameMap = {
      't_kak': 'KAK', // Generic name for t_kak
      't_kak_manfaat': 'Penerima Manfaat',
      't_kak_tahapan': 'Tahapan Pelaksanaan',
      't_kak_target': 'Indikator Kinerja',
      't_kak_iku': 'IKU & Renstra',
      't_kak_anggaran': 'Rencana Anggaran Biaya'
    };
    return nameMap[tableName] || tableName;
  }

  // Navigate to specific comment location - FIXED VERSION
  window.navigateToComment = function (type, identifier, targetMainStep, targetSection, rowId = null) {
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('commentDetailModal'));
    if (modal) modal.hide();

    // Navigate to main step
    mainStep = targetMainStep;
    updateMainStepDisplay();

    // If it's KAK step with subsections
    if (targetMainStep === 1 && targetSection) {
      const menuIndex = menuItems.indexOf(targetSection);
      if (menuIndex !== -1) {
        currentStep = menuIndex + 1;
        updateStepDisplay();
      }
    }

    // Scroll to element after a short delay
    setTimeout(() => {
      let targetElement = null;

      if (type === 'field') {
        // Convert snake_case back to camelCase for data-field attribute
        const camelCaseKey = identifier.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

        // Try to find by data-field first
        targetElement = document.querySelector(`[data-field="${camelCaseKey}"]`);

        // If not found, try to find the parent container
        if (!targetElement) {
          targetElement = document.querySelector(`.row-with-comment .input-with-comment [data-field="${camelCaseKey}"]`);
        }

        // Get the parent row-with-comment for better highlighting
        if (targetElement) {
          const parentRow = targetElement.closest('.row-with-comment');
          if (parentRow) {
            targetElement = parentRow;
          }
        }
      } else if (type === 'row' && rowId) {
        // Find row by type and pk value
        if (identifier === 't_kak_manfaat') {
          // Try both with and without field-name for manfaat
          targetElement = document.querySelector(`.row-with-comment[data-row-type="${identifier}"][data-pk-value="${rowId}"]`);
        } else {
          targetElement = document.querySelector(`.row-with-comment[data-row-type="${identifier}"][data-pk-value="${rowId}"]`);
        }
      }

      if (targetElement) {
        // Scroll with offset for fixed headers
        const yOffset = -150;
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });

        // Enhanced highlight effect with animation
        targetElement.style.transition = 'all 0.5s ease';
        targetElement.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.6)';
        targetElement.style.transform = 'scale(1.02)';

        // Add background flash
        const originalBg = targetElement.style.backgroundColor;
        targetElement.style.backgroundColor = 'rgba(254, 226, 226, 0.5)';

        setTimeout(() => {
          targetElement.style.boxShadow = '';
          targetElement.style.transform = '';
          targetElement.style.backgroundColor = originalBg;
        }, 2000);
      } else {
        console.warn('Target element not found:', type, identifier, rowId);
      }
    }, 400);
  };

  // Fungsi untuk mengecek dan update status menu button jika ada revisi di section-nya
  function updateMenuButtonRevisionStatus() {
    // Mapping section ID ke menu button data-menu
    const sectionMenuMap = {
      'gambaran-umum': 'gambaran-umum',
      'penerima-manfaat': 'penerima-manfaat',
      'strategi-pencapaian': 'strategi-pencapaian',
      'indikator-kinerja': 'indikator-kinerja',
      'kurun-waktu': 'kurun-waktu'
    };

    // Cek setiap section
    Object.keys(sectionMenuMap).forEach(sectionId => {
      const section = document.getElementById(sectionId);
      const menuButton = document.querySelector(`.menu-button[data-menu="${sectionMenuMap[sectionId]}"]`);

      if (section && menuButton) {
        // Cek apakah ada comment button dengan class 'has-comment' di dalam section
        const hasRevision = section.querySelector('.has-comment, .has-row-comment') !== null;

        // Toggle class 'has-revision' pada menu button
        menuButton.classList.toggle('has-revision', hasRevision);
      }
    });
  }

  function updateCommentCount() {
    const fieldCount = Object.keys(fieldComments).length;
    const rowCount = Object.values(rowComments).reduce(
      (acc, table) => acc + Object.keys(table).length,
      0
    );
    const totalComments = fieldCount + rowCount;
    const badge = document.getElementById("commentCountBadge");
    const text = document.getElementById("commentCountText");
    if (totalComments > 0) {
      text.textContent = `${totalComments} Catatan`;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  window.submitReview = function () {
    const totalCount =
      Object.keys(fieldComments).length +
      Object.values(rowComments).reduce(
        (sum, table) => sum + Object.keys(table).length,
        0
      );

    if (totalCount === 0) {
      Swal.fire(
        "Perhatian!",
        "Harap berikan minimal satu catatan revisi sebelum mengirim.",
        "warning"
      );
      return;
    }

    // Convert fieldComments back to backend format (add catatan_ prefix)
    const catatanKak = {};
    for (const [key, value] of Object.entries(fieldComments)) {
      // Map frontend key back to backend key
      let backendKey = key;
      if (key === "gambaran_umum") {
        backendKey = "deskripsi_kegiatan";
      }
      catatanKak[backendKey] = value;
    }

    const anakPayload = {};
    for (const table in rowComments) {
      if (table === 't_kak') {
        // Handle t_kak catatan (sasaran_utama, etc.) - merge into catatanKak
        for (const compositeKey in rowComments[table]) {
          const firstUnderscoreIndex = compositeKey.indexOf('_');
          const fieldName = compositeKey.substring(firstUnderscoreIndex + 1); // Remove id prefix, get field name
          // Field name is already the full field name (e.g., "sasaran_utama")
          catatanKak[fieldName] = rowComments[table][compositeKey];
        }
      } else if (table === 't_kak_manfaat') {
        // t_kak_manfaat now only has catatan_manfaat (no sasaran_utama)
        anakPayload[table] = [];
        for (const compositeKey in rowComments[table]) {
          const firstUnderscoreIndex = compositeKey.indexOf('_');
          const id = compositeKey.substring(0, firstUnderscoreIndex);
          anakPayload[table].push({
            id: id,
            catatan_manfaat: rowComments[table][compositeKey]
          });
        }
      } else {
        // Other child tables (tahapan, target, anggaran, iku)
        anakPayload[table] = [];
        for (const id in rowComments[table]) {
          anakPayload[table].push({
            id: id,
            catatan_verifikator: rowComments[table][id],
          });
        }
      }
    }

    const payload = {
      catatan_kak: catatanKak,
      anak: anakPayload,
    };

    Swal.fire({
      title: "Kirim Revisi?",
      html: `Anda memiliki <strong>${totalCount}</strong> catatan revisi.<br>Usulan akan dikembalikan ke pengusul untuk diperbaiki.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Kirim Revisi",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Mengirim Revisi...',
          text: 'Harap tunggu, sistem sedang memproses permintaan Anda.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await apiRequest(`/kak/${usulanId}/revise`, {
            method: "POST",
            body: JSON.stringify(payload),
          });

          await Swal.fire({
            icon: "success",
            title: "Terkirim!",
            text: "Catatan revisi telah dikirim ke pengusul.",
            timer: 2000,
            showConfirmButton: false,
          });

          window.location.href = "/verifikator/usulan";
        } catch (error) {
          Swal.fire("Gagal Mengirim", error.message, "error");
        }
      }
    });
  };

  window.resubmitKak = async function () {
    const kakFile = document.getElementById("kakFile");
    if (!kakFile || !kakFile.files || kakFile.files.length === 0) {
      Swal.fire(
        "Error",
        "Harap pilih file KAK revisi untuk diunggah.",
        "error"
      );
      return;
    }

    const file = kakFile.files[0];
    const formData = new FormData();
    formData.append("file", file);

    Swal.fire({
      title: "Kirim Ulang KAK?",
      text: `Anda akan mengunggah file '${file.name}' sebagai revisi KAK.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00BCD4",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Kirim Ulang",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiRequest(`/kak/${usulanId}/resubmit`, {
            method: "POST",
            body: formData,
          });

          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "KAK revisi berhasil diunggah dan dikirim ulang.",
            timer: 2000,
            showConfirmButton: false,
          });

          window.location.href = "/pengusul/usulan";
        } catch (error) {
          Swal.fire("Gagal Mengunggah", error.message, "error");
        }
      }
    });
  };

  window.submitRevisedKak = async function () {
    if (!kakDataState) {
      Swal.fire(
        "Error",
        "Data KAK tidak tersedia. Silakan refresh halaman.",
        "error"
      );
      return;
    }

    // Validasi bahwa ada catatan dari verifikator
    const totalComments =
      Object.keys(fieldComments).length +
      Object.values(rowComments).reduce(
        (sum, table) => sum + Object.keys(table).length,
        0
      );

    if (totalComments === 0) {
      Swal.fire("Info", "Tidak ada catatan revisi dari verifikator.", "info");
      return;
    }

    Swal.fire({
      title: "Submit KAK Revisi?",
      html: `Anda akan mengirimkan ulang KAK yang telah diperbaiki sesuai <strong>${totalComments}</strong> catatan revisi.<br><br>Pastikan semua perbaikan sudah dilakukan dengan benar.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00BCD4",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Submit KAK",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Mengirim Ulang KAK...',
          text: 'Harap tunggu, sistem sedang memproses dan menyimpan revisi Anda.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          // Helpers
          const getVal = (el) => el ? el.value : "";

          // 1. General Info
          const nama_kegiatan = getVal(document.querySelector('[data-field="namaKegiatan"]'));
          const tipe_kegiatan_id = parseInt(getVal(document.querySelector('[data-field="tipeKegiatan"]'))) || null;
          const deskripsi_kegiatan = getVal(document.querySelector('[data-field="gambaranUmum"]'));
          const metode_pelaksanaan = getVal(document.querySelector('[data-field="metodePelaksanaan"]'));
          const kurunWaktuRaw = getVal(document.querySelector('[data-field="kurunWaktu"]'));


          let tanggal_mulai = kakDataState.tanggal_mulai;
          let tanggal_selesai = kakDataState.tanggal_selesai;
          let kurun_waktu_pelaksanaan = kakDataState.kurun_waktu_pelaksanaan;

          if (kurunWaktuRaw.includes(" - ")) {
            const parts = kurunWaktuRaw.split(" - ");
            if (parts.length === 2) {
              const start = moment(parts[0], "DD/MM/YYYY");
              const end = moment(parts[1], "DD/MM/YYYY");
              if (start.isValid() && end.isValid()) {
                tanggal_mulai = start.format("YYYY-MM-DD");
                tanggal_selesai = end.format("YYYY-MM-DD");

                // Calculate kurun waktu string
                const diffDays = end.diff(start, "days") + 1;
                if (diffDays > 0) {
                  if (diffDays < 30) {
                    kurun_waktu_pelaksanaan = `${diffDays} hari`;
                  } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30);
                    const remainingDays = diffDays % 30;
                    kurun_waktu_pelaksanaan = `${months} bulan ${remainingDays > 0 ? `${remainingDays} hari` : ""}`.trim();
                  } else {
                    const years = Math.floor(diffDays / 365);
                    const remainingMonths = Math.floor((diffDays % 365) / 30);
                    kurun_waktu_pelaksanaan = `${years} tahun ${remainingMonths > 0 ? `${remainingMonths} bulan` : ""}`.trim();
                  }
                }
              }
            }
          }

          // 2. Penerima Manfaat
          // Sasaran Utama (ONE value from header textarea)
          const sasaranUtamaTextarea = document.querySelector('#sasaranUtamaContainer textarea');
          const sasaran_utama = sasaranUtamaTextarea ? sasaranUtamaTextarea.value : "";

          // Manfaat (ARRAY from detail rows)
          const manfaat = [];
          // Existing manfaat (readonly)
          document.querySelectorAll('#manfaatContainer .row-with-comment input').forEach(el => {
            if (el.value.trim()) {
              manfaat.push(el.value.trim());
            }
          });
          // New manfaat (editable)
          document.querySelectorAll('#manfaatContainer .manfaat-item .manfaat-input').forEach(el => {
            if (el.value.trim()) {
              manfaat.push(el.value.trim());
            }
          });

          // 3. Tahapan
          const tahapan_pelaksanaan = [];
          // Existing
          document.querySelectorAll('#tahapanPelaksanaanContainer .row-with-comment input').forEach((el, idx) => {
            tahapan_pelaksanaan.push({
              nama_tahapan: el.value,
              urutan: idx + 1
            });
          });
          // New
          document.querySelectorAll('#tahapanPelaksanaanContainer .tahapan-item input').forEach(el => {
            tahapan_pelaksanaan.push({
              nama_tahapan: el.value,
              urutan: tahapan_pelaksanaan.length + 1
            });
          });

          // 4. Indikator Kinerja
          const indikator_kinerja = [];
          // Existing
          document.querySelectorAll('#indikatorKinerjaContainer .row-with-comment').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 3) {
              indikator_kinerja.push({
                bulan_indikator: inputs[0].value,
                deskripsi_target: inputs[1].value,
                persentase_target: inputs[2].value
              });
            }
          });
          // New
          document.querySelectorAll('#indikatorKinerjaContainer .indikator-kinerja-item').forEach(row => {
            const bulan = row.querySelector('select').value;
            const inputs = row.querySelectorAll('input');
            indikator_kinerja.push({
              bulan_indikator: bulan,
              deskripsi_target: inputs[0].value,
              persentase_target: inputs[1].value
            });
          });

          // 5. IKU
          const target_iku = [];
          // Existing (rely on order match with kakDataState.iku)
          if (kakDataState.iku) {
            document.querySelectorAll('#ikuRenstraContainer .row-with-comment').forEach((row, idx) => {
              const original = kakDataState.iku[idx];
              // Structure: Indikator (input), Target (input), Satuan (input)
              // We can't easily change values of existing rows in Revisi view if they are read-only inputs.
              // However, if the logic allows updating existing ones, we need to parse them.
              // BUT, `createIkuRow` renders inputs with `value` from `original`.
              // The user (Pengusul) can only ADD new rows or potentially DELETE existing ones (if logic supported, but `removeField` is general).
              // If Pengusul CANNOT edit existing rows inline (they are readonly), then we just push the original data or data from DOM.

              // Since `createIkuRow` makes them readonly, we assume we just keep them as is.
              // We push `original` ID and values.

              if (original) {
                target_iku.push({
                  iku_id: original.iku_id || original.kak_iku_id,
                  target: parseFloat(original.target) || 0,
                  satuan_id: parseInt(original.satuan_id) || 0
                });
              }
            });
          }
          // New
          document.querySelectorAll('#ikuRenstraContainer .iku-item').forEach(row => {
            const selects = row.querySelectorAll('select');
            const ikuSelect = selects[0];
            const satuanSelect = selects[1];
            const input = row.querySelector('input[type="number"]');

            if (ikuSelect && ikuSelect.value) {
              target_iku.push({
                iku_id: parseInt(ikuSelect.value),
                target: parseFloat(input.value) || 0,
                satuan_id: parseInt(satuanSelect.value) || 0
              });
            }
          });

          // 6. RAB
          const rab = [];
          const rabContainers = document.querySelectorAll('[id^="rab-items-container-"]');
          rabContainers.forEach(container => {
            const catId = parseInt(container.id.replace('rab-items-container-', ''));

            // Helper for RAB Row
            const extractRabData = (inputs) => {
              const hargaInput = inputs[7];
              let harga = 0;
              if (typeof AutoNumeric !== 'undefined' && AutoNumeric.getAutoNumericElement(hargaInput)) {
                harga = AutoNumeric.getAutoNumericElement(hargaInput).getNumber();
              } else {
                harga = parseFloat(hargaInput.getAttribute('data-raw-value')) || parseFloat(hargaInput.value.replace(/[^0-9]/g, '')) || 0;
              }
              return {
                kategori_belanja_id: catId,
                uraian: inputs[0].value,
                volume1: inputs[1].value !== "" ? parseFloat(inputs[1].value) : null,
                satuan1_id: inputs[2].value ? parseInt(inputs[2].value) : null,
                volume2: inputs[3].value !== "" ? parseFloat(inputs[3].value) : null,
                satuan2_id: inputs[4].value ? parseInt(inputs[4].value) : null,
                volume3: inputs[5].value !== "" ? parseFloat(inputs[5].value) : null,
                satuan3_id: inputs[6].value ? parseInt(inputs[6].value) : null,
                harga_satuan: harga
              };
            };

            // PERBAIKAN: Ambil SEMUA items dengan class .rab-item (termasuk yang readonly)
            // Class .rab-item ada di semua row RAB (baik existing maupun new)
            container.querySelectorAll('.rab-item').forEach(row => {
              const inputs = row.querySelectorAll('input, select');
              rab.push(extractRabData(inputs));
            });
          });

          // Prepare payload
          const payload = {
            kak: {
              nama_kegiatan,
              tipe_kegiatan_id,
              deskripsi_kegiatan,
              metode_pelaksanaan,
              kurun_waktu_pelaksanaan,
              tanggal_mulai,
              tanggal_selesai,
              lokasi: kakDataState.lokasi,
              sasaran_utama,
              manfaat,
              tahapan_pelaksanaan,
              indikator_kinerja,
            },
            target_iku,
            rab,
          };

          // Step 1: Update the KAK data
          await apiRequest(`/kak/${usulanId}/update`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });

          // Step 2: Submit the updated KAK for verification
          await apiRequest(`/kak/${usulanId}/submit`, {
            method: "POST",
          });

          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "KAK revisi berhasil disubmit dan dikirim untuk verifikasi ulang.",
            timer: 2000,
            showConfirmButton: false,
          });

          window.location.href = "/pengusul/usulan";
        } catch (error) {
          Swal.fire("Gagal Submit", error.message, "error");
        }
      }
    });
  };

  // Populate Tipe Kegiatan Dropdown
  async function populateTipeKegiatanDropdown() {
    try {
      const response = await apiRequest("/master/tipe-kegiatan");
      const tipeKegiatanData = response.data;

      const selectElement = document.getElementById("tipeKegiatan");
      if (!selectElement) return;

      // Clear existing options except placeholder
      selectElement.innerHTML = '<option value="">Pilih Tipe Kegiatan</option>';

      tipeKegiatanData.forEach(tipe => {
        const option = document.createElement("option");
        option.value = tipe.tipe_kegiatan_id;
        option.textContent = tipe.nama_tipe;
        selectElement.appendChild(option);
      });

      // Restore value if exists
      if (kakDataState && kakDataState.tipe_kegiatan_id) {
        selectElement.value = kakDataState.tipe_kegiatan_id;
      }
    } catch (error) {
      console.error("Error populating Tipe Kegiatan dropdown:", error);
    }
  }

  init();

  if (window.Helpers) {
    window.Helpers.init();
  }
}

export default renderRevisiKakPage;
