// frontend/src/pages/shared/InputLpj.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderInputLpjPage(path, userRole) {
  const isViewOnly = path.includes("/lpj/detail");
  const isPengusul = userRole.toLowerCase() === "pengusul";
  const isBendahara = userRole.toLowerCase() === "bendahara";

  // Bendahara sees read-only inputs. Pengusul can edit if status is 'Perlu Revisi' or new.
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
      .input-lpj-page {
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
        /* Removed transform for scaling */
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
        padding: 1rem;
        border: 2px solid #E5E7EB;
        border-radius: 12px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        background: white;
        animation: fadeInLeft 0.5s ease-out forwards;
        opacity: 0;
      }

      .row-with-comment:nth-child(odd) {
        animation-delay: 0.1s;
      }
      .row-with-comment:nth-child(even) {
        animation-delay: 0.2s;
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
      
      .row-comment-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
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
        transform: translateY(-50%) scale(1.1);
      }
      
      .row-comment-icon.has-comment {
        background: #FEE2F2;
        color: #EF4444;
        border-color: #FCA5A5;
        animation: pulse-comment 2s infinite;
      }
      
      .row-comment-icon.has-comment:hover {
        background: #EF4444;
        color: white;
      }
      
      .row-with-comment .input-with-comment input {
        padding-right: 12px !important;
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

      /* Row Comment Modal Styling - SAME AS REVISIKAK */
      #rowCommentModal .modal-dialog {
        max-width: 750px;
      }

      #rowCommentModal .modal-content {
        border: none;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      #rowCommentModal .modal-header {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        border: none;
        padding: 1.75rem 2rem;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem;
        flex-wrap: nowrap;
      }

      #rowCommentModal .modal-title {
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

      #rowCommentModal .modal-title i {
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }

      /* Custom close button - PERFECT VERSION */
      #rowCommentModal .btn-close {
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        margin: -4px 0 0 0;
        cursor: pointer;
        flex-shrink: 0;
      }

      #rowCommentModal .btn-close:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
        transform: rotate(90deg) scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      /* X marks using pseudo-elements - PERFECT CROSS */
      #rowCommentModal .btn-close::before,
      #rowCommentModal .btn-close::after {
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

      #rowCommentModal .btn-close::before {
        transform: translate(-50%, -50%) rotate(45deg);
      }

      #rowCommentModal .btn-close::after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      #rowCommentModal .btn-close:hover::before,
      #rowCommentModal .btn-close:hover::after {
        background: white;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
      }

      /* Remove default Bootstrap close button styles */
      #rowCommentModal .btn-close:focus {
        box-shadow: none;
        outline: none;
      }

      #rowCommentModal .modal-body {
        padding: 2rem;
        max-height: 60vh;
        overflow-y: auto;
        background: linear-gradient(to bottom, #FAFAFA 0%, #F5F5F5 100%);
      }

      /* Completely hide scrollbar */
      #rowCommentModal .modal-body::-webkit-scrollbar {
        display: none;
      }

      #rowCommentModal .modal-body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      /* Input fields (from StepUsulanKak.js) */
      input[type="text"],
      input[type="number"],
      textarea,
      select {
        width: 100%; /* w-full */
        padding: 0.75rem 1rem; /* px-4 py-3 */
        border: 2px solid #E5E7EB; /* border-2 border-gray-200 */
        border-radius: 0.5rem; /* rounded-lg */
        font-size: 0.875rem; /* text-sm */
        transition: all 0.3s ease; /* transition-all duration-300 */
        outline: none; /* focus:outline-none */
        background: #FFFFFF;
      }

      input[type="text"]:focus,
      input[type="number"]:focus,
      textarea:focus,
      select:focus {
        border-color: #00BCD4; /* focus:border-cyan-500 */
        box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1); /* focus:ring-4 focus:ring-cyan-100 */
        outline: none; /* Remove default focus outline */
      }

      /* Disabled/Readonly states */
      input:disabled,
      input[readonly],
      select:disabled,
      textarea:disabled,
      textarea[readonly] {
        background: #E9E9E9;
        cursor: not-allowed;
        border-color: #C0C0C0;
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
        grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 0.5fr;
        gap: 0.75rem;
        align-items: end;
      }

      .grid-rab-header {
        display: grid;
        grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr 1fr 1.5fr 0.5fr;
        gap: 0.75rem;
        align-items: end;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #E5E7EB;
      }
      
      /* Unified Action Icons */
      .action-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }
      .action-icon:hover {
          transform: translateY(-2px) scale(1.05);
      }
      .action-icon i {
          font-size: 1.5rem;
          transition: all 0.3s ease;
      }
      .action-icon:hover i {
        transform: rotate(10deg);
      }

      .upload-icon {
          background: #E0F7FA;
          color: #00ACC1;
          border-color: #B2EBF2;
      }
      .upload-icon:hover {
          background: #00ACC1;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 172, 193, 0.3);
      }

      .remove-icon {
          background: #FFEBEE;
          color: #E53935;
          border-color: #FFCDD2;
      }
      .remove-icon:hover {
          background: #E53935;
          color: white;
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
      }
                
                /* Remove Button (from StepUsulanKak.js) */
                .remove-button {
                  border: 0;
                  width: 38px;
                  height: 38px;
                  border-radius: 10px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.3s ease;
                  background: #EF4444; /* Red-500 */
                  color: #FFFFFF;
                  font-size: 1.5rem; /* For the '−' character */
                  position: relative; /* Needed for pseudo-element */
                  overflow: hidden; /* Hide pseudo-element overflow */
                }
                .remove-button:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                /* Remove button specific animation override */
                .remove-button::after {
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
                .remove-button:hover::after {
                  left: 120%; /* Slide across to the right, matching new width */
                }
                
                /* Comment count badge */      .comment-count {
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
      }
      
      .comment-count i {
        font-size: 1.5rem;
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

      /* Card animations */
      .bg-white.rounded-xl.shadow-lg {
        animation: slideInUp 0.6s ease-out;
        transition: all 0.7s ease;
      }

      .bg-white.rounded-xl.shadow-lg:hover {
        /* Removed transform and box-shadow for enlargement */
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
        /* Removed transform for enlargement */
      }

      .row-item:nth-child(odd) {
        animation-delay: 0.1s;
      }

      .row-item:nth-child(even) {
        animation-delay: 0.2s;
      }

      /* Dynamic field animations (from StepUsulanKak.js) */
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

      /* Input fields */


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
        /* Removed transform for enlargement */
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
        
        /* Default state: hidden at center-bottom */
        clip-path: polygon(
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%, 
          50% 100%, 50% 100%
        );
        
        /* Smooth reverse animation by default */
        animation: borderDrawReverse 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
      }

      /* Override for files within rab-item with comment */
      .rab-item.has-row-comment .border-hover-draw::before {
        background: linear-gradient(135deg, #EF4444, #DC2626, #EF4444); /* Red gradient */
      }

      /* Forward animation on hover - SUPER SMOOTH */
      .border-hover-draw:hover::before {
        animation: borderDrawForward 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
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
      .border-hover-draw:hover input,
      .border-hover-draw:hover textarea,
      .border-hover-draw:hover select {
        border-color: rgba(0, 188, 212, 0.4) !important;
        box-shadow: 
          0 8px 24px rgba(0, 188, 212, 0.12),
          0 0 0 1px rgba(0, 188, 212, 0.1);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        /* No transform: scale(1.01); */
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
      
      .lampiran-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
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
      .lampiran-item.archived-lampiran {
        opacity: 0.6;
      }
      .lampiran-item.archived-lampiran .lampiran-content {
        text-decoration: line-through;
      }
      .lampiran-item.archived-lampiran .btn-delete-lampiran {
        display: none;
      }

      @media (max-width: 768px) {
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .input-lpj-page {
            padding: 1rem;
        }
        /* Make header flex column */
        .flex.justify-center.mb-8 {
            margin-bottom: 1.5rem;
        }
        .flex.items-center.gap-3.px-6 {
            width: 100%;
            justify-content: center;
        }
        
        /* Scrollable RAB items */
        .category-section {
            overflow-x: auto;
        }
        .rab-item {
            min-width: 800px;
        }
        
        /* Action buttons */
        .action-buttons {
            flex-direction: column;
            padding: 1.5rem;
        }
        #actionButtonsContainer {
            flex-direction: column;
            gap: 1rem;
        }
        .btn-primary-action, .btn-back {
            width: 100%;
            justify-content: center;
        }
        
        /* Total Card */
        .spectacular-total-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            padding: 1.5rem;
        }
      }
    </style>

    <div class="input-lpj-page">
      <!-- Header -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center gap-3 px-6 py-4 rounded-full" style="background: rgba(0, 188, 212, 0.1);">
          <div id="pageIcon" class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style="background: #00BCD4;">
            <span class="ti tabler-${
              isViewOnly || isBendahara ? "eye" : "file-pencil"
            } text-2xl"></span>
          </div>
          <span id="pageTitle" class="font-semibold text-base" style="color: #00BCD4;">
            ${isViewOnly ? "Detail" : "Input"} Laporan Pertanggungjawaban
          </span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="active">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div id="rabSectionsContainer">
            <div class="text-center p-8">${
              window.createLoadingState
                ? window.createLoadingState("Memuat data LPJ...")
                : "Loading..."
            }</div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
          <div id="actionButtonsContainer" class="flex justify-between w-full">
            <!-- Buttons will be rendered by JS -->
          </div>
      </div>

      <!-- Comment Count Badge -->
      <div class="comment-count" id="commentCountBadge" style="display: none;">
        <i class="ti ti-message-dots">&#xeaee;</i>
        <span id="commentCountText">0 Catatan</span>
      </div>
    </div>

    <!-- Row Comment Modal -->
    <div class="modal fade" id="rowCommentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; align-items: center; justify-content: space-between;">
            <h5 class="modal-title" style="margin: 0; flex: 1;">
              <i class="ti ti-message-dots">&#xeaee;</i>
              Catatan Revisi untuk <span id="rowCommentLabel" style="color: white; font-weight: 800;"></span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="block font-semibold mb-2 text-sm" style="color: #374151;">Detail RAB</label>
              <div class="p-3 rounded-lg" style="background: #F3F4F6; color: #374151;" id="currentRowValue"></div>
            </div>
            
            <div id="rowCommentInputContainer" style="${
              isPengusul || isViewOnly ? "display: none;" : ""
            }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan Revisi</label>
              <textarea id="rowCommentInput" class="form-control" rows="5" placeholder="Tuliskan catatan revisi untuk item ini..."></textarea>
            </div>
            
            <div id="rowCommentDisplayContainer" style="${
              isBendahara && !isViewOnly ? "display: none;" : ""
            }">
              <label class="block font-semibold mb-3 text-sm" style="color: #374151;">Catatan dari Bendahara</label>
              <div class="p-3 rounded-lg" style="background: #FEF2F2; color: #374151; border-left: 4px solid #EF4444;" id="rowCommentDisplayText"></div>
            </div>
            
            <div class="info-box mt-4">
              <div class="info-box-text">
                <i class="ti ti-info-circle">&#xeac5;</i> 
                ${
                  isBendahara && !isViewOnly
                    ? "Berikan masukan yang jelas dan konstruktif untuk membantu pengusul."
                    : "Perhatikan catatan dari bendahara untuk memperbaiki LPJ Anda."
                }
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              <i class="ti ti-x">&#xeb55;</i> Batal
            </button>
            ${
              isBendahara && !isViewOnly
                ? `<button type="button" class="btn btn-primary" onclick="window.saveRowComment()"><i class="ti ti-check">&#xea5e;</i> Simpan Catatan</button>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  // --- STATE MANAGEMENT ---
  const state = {
    kegiatan: null,
    kegiatanId: null,
    satuan: [],
    lpjData: null, // To hold existing LPJ data if in revision mode
    isLoading: true,
    status: "new", // 'new', 'revisi', 'view'
  };

  let rowComments = {}; // { anggaran_id: "comment text" }
  let currentCommentTarget = null;
  let rowCommentModalInstance = null;
  let fileStore = {}; // { anggaran_id: [File, File, ...] }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "Rp 0";
    const number = Number(amount);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // --- API FUNCTIONS ---
  async function apiRequest(endpoint, options = {}) {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Otentikasi Gagal",
        text: "Silakan login kembali.",
      });
      window.location.hash = "#/login";
      return;
    }
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const config = { ...options, headers };
    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      if (data.success === false)
        throw new Error(data.message || "API request failed");
      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      Swal.fire({ icon: "error", title: "API Error", text: error.message });
      throw error;
    }
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

  async function fetchLpjDetail(id) {
    try {
      // This endpoint should return KAK data, and if available, existing LPJ data + comments
      const response = await apiRequest(`/kegiatan/${id}/lpj/review`);
      state.kegiatan = response.data.kegiatan;
      state.lpjData = {
        anggaran_items: response.data.anggaran,
        lampiran: response.data.lampiran,
        realisasi: response.data.realisasi,
        status: response.data.kegiatan.lpj_status, // Assuming this field exists and is reliable
      };
      state.status = response.data.kegiatan.lpj_status || "new";

      // Populate comments
      if (state.lpjData && state.lpjData.realisasi) {
        state.lpjData.realisasi.forEach((item) => {
          if (item.catatan_bendahara) {
            rowComments[item.anggaran_id] = item.catatan_bendahara;
          }
        });
      }
    } catch (error) {
      document.getElementById(
        "rabSectionsContainer"
      ).innerHTML = `<div class="text-center text-red-500 p-8">Gagal memuat detail LPJ. ${error.message}</div>`;
    }
  }

  async function fetchSatuan() {
    try {
      const response = await apiRequest("/master/satuan");
      state.satuan = response.data;
    } catch (error) {
      console.error("Gagal memuat data satuan.");
    }
  }

  // --- RENDER FUNCTIONS ---
  function calculateLpjTotals() {
    let grandTotal = 0;
    let isAllValid = true;

    document.querySelectorAll(".category-section").forEach((section) => {
      let subtotal = 0;
      let rabSubtotal = 0;

      section.querySelectorAll(".rab-item").forEach((row) => {
        const anggaranId = row.dataset.pkValue;

        // --- Calculate RAB Subtotal ---
        const item = state.lpjData?.anggaran_items?.find(
          (i) => String(i.anggaran_id) === String(anggaranId)
        );
        if (item) {
          const rV1 = parseFloat(item.volume1) || 0;
          const rV2 =
            !item.volume2 || item.volume2 == 0 ? 1 : parseFloat(item.volume2);
          const rV3 =
            !item.volume3 || item.volume3 == 0 ? 1 : parseFloat(item.volume3);
          const rHarga = parseFloat(item.harga_satuan) || 0;
          rabSubtotal += rV1 * rV2 * rV3 * rHarga;
        }

        // --- Calculate Realisasi Subtotal ---
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
        // Treat empty/null as 1 for multipliers.
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
          // Fallback if AutoNumeric not attached or readonly
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

        // Validation: Check if Realisasi exceeds RAB
        const subtotalContainer = subtotalEl.parentElement;
        let warningEl = subtotalContainer.querySelector(".subtotal-warning");

        if (subtotal > rabSubtotal) {
          isAllValid = false;
          subtotalEl.style.color = "#EF4444"; // Red for error

          if (!warningEl) {
            warningEl = document.createElement("div");
            warningEl.className =
              "subtotal-warning text-xs text-red-500 font-bold mt-1";
            subtotalContainer.appendChild(warningEl);
          }
          const formattedRab = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(rabSubtotal);
          warningEl.innerHTML = `<i class="ti ti-alert-circle"></i> Melebihi RAB (${formattedRab})`;
        } else {
          subtotalEl.style.color = "#00BCD4"; // Original color
          if (warningEl) warningEl.remove();
        }
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

    return isAllValid;
  }

  function renderRABSections() {
    const container = document.getElementById("rabSectionsContainer");
    if (
      !container ||
      !state.lpjData ||
      !state.lpjData.anggaran_items ||
      state.lpjData.anggaran_items.length === 0
    ) {
      container.innerHTML = `<div class="text-center text-red-500 p-8">Tidak ada item anggaran untuk ditampilkan.</div>`;
      return;
    }

    // Group items by category
    const groupedItems = state.lpjData.anggaran_items.reduce((acc, item) => {
      const category = item.nama_kategori_belanja || "Lain-lain";
      if (!acc[category]) {
        acc[category] = { items: [] };
      }
      acc[category].items.push(item);
      return acc;
    }, {});

    // Create a map of lampiran for easy lookup
    const lampiranMap = (state.lpjData.lampiran || []).reduce((acc, file) => {
      if (!acc[file.anggaran_id]) {
        acc[file.anggaran_id] = [];
      }
      acc[file.anggaran_id].push(file);
      return acc;
    }, {});

    container.innerHTML = ""; // Clear loader

    // Render items for each category
    for (const category in groupedItems) {
      const group = groupedItems[category];
      const categorySection = document.createElement("div");
      const isLastCategory =
        Object.keys(groupedItems).indexOf(category) ===
        Object.keys(groupedItems).length - 1;
      categorySection.className = `category-section mb-10 ${
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

      group.items.forEach((item, index) => {
        const itemLampiran = lampiranMap[item.anggaran_id] || [];
        const section = document.createElement("div");
        // Add comment-related classes
        const comment = rowComments[item.anggaran_id];
        section.className = `rab-item dynamic-field-item new-item-animation mb-8 p-6 rounded-lg border-hover-draw ${
          comment ? "has-row-comment" : ""
        }`;
        section.dataset.rowType = "t_kegiatan_anggaran_realisasi";
        section.dataset.pkValue = item.anggaran_id;

        section.innerHTML = getSectionHTML(item, itemLampiran, index);
        categorySection.appendChild(section);
        updateCommentButton(
          `.row-with-comment[data-pk-value="${item.anggaran_id}"] .row-comment-icon`,
          comment
        );
      });

      container.appendChild(categorySection);
    }

    // Grand Total Section
    const totalSection = document.createElement("div");
    totalSection.className = "spectacular-total-card";
    totalSection.innerHTML = `
      <div class="total-label">
          <i class="ti ti-receipt-2"></i>
          <span>Total Realisasi LPJ</span>
      </div>
      <div id="grand-total-lpj" class="total-value">Rp 0</div>
    `;
    container.appendChild(totalSection);

    // Initialize AutoNumeric and Calculation
    if (typeof AutoNumeric !== "undefined") {
      const numericOptions = {
        currencySymbol: "Rp ",
        digitGroupSeparator: ".",
        decimalCharacter: ",",
        decimalPlaces: 0,
        minimumValue: "0",
        readOnly: isBendahara || isViewOnly, // Respect read-only state for formatting
      };

      container.querySelectorAll(".autonumeric-currency").forEach((el) => {
        const rawValue = el.dataset.rawValue;
        const anElement = new AutoNumeric(el, numericOptions);

        if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
          anElement.set(rawValue);
        }

        el.addEventListener("autoNumeric:rawValueModified", calculateLpjTotals);
      });
    }

    // Bind input events for volumes
    container.addEventListener("input", (e) => {
      if (e.target.matches('input[type="number"]')) {
        calculateLpjTotals();
      }
    });

    // Initial calculation
    calculateLpjTotals();
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

  window.deleteUploadedFile = async function (button, fileId) {
    // Placeholder for backend deletion
    console.log(`Request to delete file with ID: ${fileId}`);
    Swal.fire({
      title: "Fungsi Belum Tersedia",
      text: "Menghapus file yang sudah di-upload dari server akan diimplementasikan.",
      icon: "info",
    });
    // On success, you would remove the parent element:
    // button.parentElement.remove();
  };

  function getSectionHTML(item, itemLampiran, index) {
    const realisasiItem =
      state.lpjData?.realisasi?.find(
        (r) => r.anggaran_id === item.anggaran_id
      ) || {};

    const rabHargaFormatted = formatCurrency(item.harga_satuan);

    // For AutoNumeric

    const realisasiHargaVal =
      realisasiItem.harga_satuan !== undefined
        ? realisasiItem.harga_satuan
        : item.harga_satuan || 0;

    const inputAttr = isBendahara || isViewOnly ? "readonly disabled" : "";

    const commonInputClasses = "w-full px-4 py-3 border-2 rounded-lg text-sm";

    const commonInputStyle = `border-color: #E5E7EB; background: #FFFFFF;`;

    const commonOnfocusBlur = `onfocus="this.style.borderColor='#00BCD4';" onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"`;

    const disabledInputStyleAttr = `style="background: #E9E9E9; cursor: not-allowed; border-color: #C0C0C0;"`;

    const enabledInputStyleAttr = `style="${commonInputStyle}" ${commonOnfocusBlur}`;

    const currentInputStyleAttr =
      isBendahara || isViewOnly
        ? disabledInputStyleAttr
        : enabledInputStyleAttr;

    const lampiranListHTML =
      itemLampiran.length > 0
        ? itemLampiran
            .map(
              (file) => `
                <div class="lampiran-item border-hover-draw ${file.status_lampiran === 'archived' ? 'archived-lampiran' : ''}" data-lampiran-id="${
                  file.lampiran_id
                }">
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
                        isPengusul && !isViewOnly && file.status_lampiran !== 'archived'
                          ? `<button type="button" class="btn-delete-lampiran" data-lampiran-id="${file.lampiran_id}" title="Hapus file">
                               <i class="ti ti-trash">&#xeb41;</i>
                            </button>`
                          : ""
                      }
                   </div>
                </div>
              `
            )
            .join("")
        : '<p class="text-xs text-gray-400 italic no-files">Tidak ada bukti terlampir untuk item ini.</p>';

    return `

  

          ${
            (isBendahara && !isViewOnly) ||
            ((isPengusul || isViewOnly) && rowComments[item.anggaran_id])
              ? `<button class="row-comment-icon" onclick="window.openRowCommentModal(this)" data-label="Item Anggaran #${
                  index + 1
                }"><i class="ti ti-message-circle-2">&#xeaed;</i></button>`
              : ""
          }

    

  

          <!-- RAB Section (Disabled) -->

  

          <div class="mb-6">

  

            <h5 class="mb-4 font-bold text-lg" style="color: #374151;">Rencana Anggaran Biaya (KAK)</h5>

  

            <div class="grid-rab-header">

  

              <label class="block font-semibold text-sm">Uraian</label>

  

              <label class="block font-semibold text-sm">Qty 1</label>

  

              <label class="block font-semibold text-sm">Satuan 1</label>

  

              <label class="block font-semibold text-sm">Qty 2</label>

  

              <label class="block font-semibold text-sm">Satuan 2</label>

  

              <label class="block font-semibold text-sm">Qty 3</label>

  

              <label class="block font-semibold text-sm">Satuan 3</label>

  

              <label class="block font-semibold text-sm">Harga Satuan</label>

  

              <span></span>

  

            </div>

  

            <div class="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr_1fr_1.5fr_0.5fr] gap-4 items-end mt-2">

  

                <div><input type="text" disabled class="${commonInputClasses}" ${disabledInputStyleAttr} value="${
      item.uraian || ""
    }"></div>

  

                <div><input type="number" disabled class="${commonInputClasses}" ${disabledInputStyleAttr} value="${
      item.volume1 || ""
    }"></div>

  

                <div><select disabled class="${commonInputClasses}" ${disabledInputStyleAttr}>${getSatuanOptions(
      item.satuan1_id
    )}</select></div>

  

                <div><input type="number" disabled class="${commonInputClasses}" ${disabledInputStyleAttr} value="${
      item.volume2 || ""
    }"></div>

  

                <div><select disabled class="${commonInputClasses}" ${disabledInputStyleAttr}>${getSatuanOptions(
      item.satuan2_id
    )}</select></div>

  

                <div><input type="number" disabled class="${commonInputClasses}" ${disabledInputStyleAttr} value="${
      item.volume3 || ""
    }"></div>

  

                <div><select disabled class="${commonInputClasses}" ${disabledInputStyleAttr}>${getSatuanOptions(
      item.satuan3_id
    )}</select></div>

  

                <div><input type="text" disabled class="${commonInputClasses}" ${disabledInputStyleAttr} value="${rabHargaFormatted}"></div>

  

                <span></span>

  

            </div>

  

          </div>

  

    

  

          <!-- Realisasi Section -->

  

          <div>

  

            <h5 class="mb-4 font-bold text-lg" style="color: #00BCD4;">Realisasi Pertanggungjawaban (LPJ)</h5>

  

                        <div class="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr_1fr_1.5fr_0.5fr] gap-4 items-end realisasi-grid">

  

                            <div><input type="text" ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_uraian" value="${
      realisasiItem.uraian || item.uraian || ""
    }"></div>

  

             

  

                            <div><input type="number" min="0" ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_volume1" value="${
      realisasiItem.volume1 || item.volume1 || ""
    }"></div>

  

            

  

                            <div><select ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_satuan1_id">${getSatuanOptions(
      realisasiItem.satuan1_id || item.satuan1_id
    )}</select>

  

            

  

                            </div>

  

            

  

                            <div><input type="number" min="0" ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_volume2" value="${
      realisasiItem.volume2 || item.volume2 || ""
    }"></div>

  

            

  

                            <div><select ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_satuan2_id">${getSatuanOptions(
      realisasiItem.satuan2_id || item.satuan2_id
    )}</select></div>

  

            

  

                            <div><input type="number" min="0" ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_volume3" value="${
      realisasiItem.volume3 || item.volume3 || ""
    }"></div>

  

            

  

                            <div><select ${inputAttr} class="${commonInputClasses}" ${currentInputStyleAttr} data-field="realisasi_satuan3_id">${getSatuanOptions(
      realisasiItem.satuan3_id || item.satuan3_id
    )}</select></div>

  

            

  

                            <div><input type="text" ${inputAttr} class="${commonInputClasses} realisasi-input autonumeric-currency" data-field="realisasi_harga_satuan" data-raw-value="${realisasiHargaVal}" ${currentInputStyleAttr}></div>

  

            

  

                          ${
                            isPengusul && !isViewOnly
                              ? `

  

                                        <label class="cursor-pointer flex items-center justify-center">

  

                                                                      <input type="file" multiple class="hidden" onchange="window.handleFileUpload(this)" data-anggaran-id="${item.anggaran_id}">

  

                                                                      <div class="action-icon upload-icon">

  

                                                                        <i class="ti ti-script-plus text-white text-xl">&#xf2d8;</i>

  

                                                                      </div>

  

                                                                    </label>`
                              : "<div></div>"
                          }

  

            

  

                        </div>

  

                        <div class="mt-4">

  

                            <h6 class="font-semibold text-xs text-gray-500 mb-2">BUKTI/LAMPIRAN:</h6>

  

                            <div class="pl-4 border-l-2 border-gray-200 space-y-2 lampiran-list" data-anggaran-id="${
                              item.anggaran_id
                            }">

  

                                ${lampiranListHTML}

  

                            </div>

  

                            ${
                              isPengusul && !isViewOnly
                                ? `
                                                            </div>`
                                : ""
                            }
                        </div>
            <div class="uploaded-files-container mt-4 grid grid-cols-1 gap-2">
                ${(item.bukti || [])
                  .map(
                    (file) => `
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 border-hover-draw">
                                                <a href="javascript:void(0);"
                                                   data-lampiran-id="${
                                                     file.lampiran_id
                                                   }"
                                                   class="text-sm truncate flex-1 text-blue-500 hover:underline view-file-btn">📎 ${
                                                     file.nama_file_asli
                                                   }</a>
                                                ${
                                                  isPengusul && !isViewOnly
                                                    ? `<button type="button" class="action-icon remove-icon" onclick="window.deleteUploadedFile(this, ${file.lampiran_id})">
                                                          <i class="ti ti-minus">&#xeaf2;</i>
                                                       </button>`
                                                    : ""
                                                }
                    </div>
                `
                  )
                  .join("")}
            </div>
          </div>
        `;
  }

  function renderActionButtons() {
    const container = document.getElementById("actionButtonsContainer");
    let buttons = "";
    const backButton = `<button id="backButton" class="btn-back"><span>←</span> Kembali</button>`;

    if (isViewOnly) {
      buttons = backButton;
    } else if (isPengusul) {
      if (state.status === "new" || state.status === "revisi") {
        buttons = `
          ${backButton}
          <button id="submitLpjButton" class="btn-primary-action" style="background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); color: #FFFFFF;">
              <i class="ti ti-send">&#xeb1e;</i>
            ${state.status === "revisi" ? "Submit Revisi LPJ" : "Submit LPJ"}
          </button>
        `;
      } else {
        buttons = backButton;
      }
    } else if (isBendahara) {
      buttons = `
        ${backButton}
        <div class="flex gap-4">
          <button id="submitReviewButton" class="btn-primary-action btn-revise">Kirim Revisi</button>
          <button id="approveLpjButton" class="btn-primary-action" style="background: linear-gradient(135deg, #10B981 0%, #0F9D58 100%); color: #FFFFFF;">Setujui LPJ</button>
        </div>
      `;
    }
    container.innerHTML = buttons;
    attachActionListeners();
  }

  // --- COMMENTING LOGIC ---
  function updateCommentCount() {
    const count = Object.keys(rowComments).length;
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

  // --- DATA COLLECTION & SUBMISSION ---
  async function submitLpj(kegiatanId) {
    // Validate Prices
    const isPriceValid = calculateLpjTotals();
    if (!isPriceValid) {
      Swal.fire({
        icon: "error",
        title: "Validasi Anggaran Gagal",
        text: "Total realisasi pada salah satu kategori melebihi total anggaran (RAB). Silakan periksa kembali input Anda.",
      });
      return;
    }

    const rabSections = document.querySelectorAll(".rab-item");
    let allItemsValid = true;

    // Clear previous error styles by reverting to the default border
    rabSections.forEach((section) => {
      section.style.border = "";
    });

    for (const section of rabSections) {
      const anggaranId = section.dataset.pkValue;

      // Check for existing server-side files within this item
      const existingFiles = section.querySelectorAll(
        ".lampiran-list .lampiran-item"
      );

      // Check for new client-side files for this item
      const newFiles = fileStore[anggaranId] || [];

      // The item is invalid if it has neither existing nor new files
      if (existingFiles.length === 0 && newFiles.length === 0) {
        allItemsValid = false;
        section.style.border = "2px solid #EF4444"; // Use a specific red color
      }
    }

    if (!allItemsValid) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Setiap item belanja harus memiliki minimal satu file bukti/lampiran.",
      });
      return; // Stop submission
    }

    // --- END VALIDATION ---

    Swal.fire({
      title: "Mengirim LPJ...",
      text: "Harap tunggu, sistem sedang memproses permintaan Anda.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formData = collectLpjData();
      await apiRequest(`/kegiatan/${kegiatanId}/lpj`, {
        method: "POST",
        body: formData,
      });
      await Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "LPJ berhasil disubmit.",
      });
      window.location.href = "/pengusul/kegiatan/lpj";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Gagal submit LPJ: ${error.message}`,
      });
    }
  }

  async function submitReview(kegiatanId) {
    const button = document.getElementById("submitReviewButton");
    button.disabled = true;
    button.innerHTML = "Submitting...";
    try {
      const payload = { comments: rowComments };
      await apiRequest(`/lpj/${kegiatanId}/review`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Revisi berhasil dikirim.",
      });
      window.location.hash = "#/bendahara/lpj";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Gagal mengirim revisi: ${error.message}`,
      });
    } finally {
      button.disabled = false;
      button.innerHTML = "Kirim Revisi";
    }
  }

  async function approveLpj(kegiatanId) {
    // Confirmation dialog
    const result = await Swal.fire({
      title: "Anda yakin?",
      text: "Anda akan menyetujui LPJ ini. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, setujui!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const button = document.getElementById("approveLpjButton");
      button.disabled = true;
      button.innerHTML = "Menyetujui...";
      try {
        await apiRequest(`/lpj/${kegiatanId}/approve`, { method: "POST" });
        Swal.fire({
          icon: "success",
          title: "Sukses",
          text: "LPJ berhasil disetujui.",
        });
        window.location.hash = "#/bendahara/lpj";
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: `Gagal menyetujui LPJ: ${error.message}`,
        });
        button.disabled = false;
        button.innerHTML = "Setujui LPJ";
      }
    }
  }

  function collectLpjData() {
    const formData = new FormData();
    const rabSections = document.querySelectorAll(".rab-item");

    rabSections.forEach((section) => {
      const anggaranId = section.dataset.pkValue;
      const realisasiGrid = section.querySelector(".realisasi-grid");

      const uraian = realisasiGrid.querySelector(
        'input[data-field="realisasi_uraian"]'
      ).value;
      const volume1 = realisasiGrid.querySelector(
        'input[data-field="realisasi_volume1"]'
      ).value;
      const satuan1_id = realisasiGrid.querySelector(
        'select[data-field="realisasi_satuan1_id"]'
      ).value;
      const volume2 = realisasiGrid.querySelector(
        'input[data-field="realisasi_volume2"]'
      ).value;
      const satuan2_id = realisasiGrid.querySelector(
        'select[data-field="realisasi_satuan2_id"]'
      ).value;
      const volume3 = realisasiGrid.querySelector(
        'input[data-field="realisasi_volume3"]'
      ).value;
      const satuan3_id = realisasiGrid.querySelector(
        'select[data-field="realisasi_satuan3_id"]'
      ).value;

      const harga_satuan_input = realisasiGrid.querySelector(
        'input[data-field="realisasi_harga_satuan"]'
      );
      let harga_satuan = "0";
      if (harga_satuan_input) {
        if (
          typeof AutoNumeric !== "undefined" &&
          AutoNumeric.getAutoNumericElement(harga_satuan_input)
        ) {
          harga_satuan =
            AutoNumeric.getAutoNumericElement(harga_satuan_input).getNumber() ||
            "0";
        } else {
          harga_satuan = harga_satuan_input.value.replace(/[^0-9]/g, "") || "0";
        }
      }

      formData.append(`realisasi[${anggaranId}][uraian]`, uraian);
      formData.append(`realisasi[${anggaranId}][volume1]`, volume1);
      formData.append(`realisasi[${anggaranId}][satuan1_id]`, satuan1_id);
      formData.append(`realisasi[${anggaranId}][volume2]`, volume2);
      formData.append(`realisasi[${anggaranId}][satuan2_id]`, satuan2_id);
      formData.append(`realisasi[${anggaranId}][volume3]`, volume3);
      formData.append(`realisasi[${anggaranId}][satuan3_id]`, satuan3_id);
      formData.append(`realisasi[${anggaranId}][harga_satuan]`, harga_satuan);

      // Append files from the fileStore
      if (fileStore[anggaranId] && fileStore[anggaranId].length > 0) {
        fileStore[anggaranId].forEach((file) => {
          formData.append(`bukti[${anggaranId}][]`, file);
        });
      }
    });

    console.log("FormData being sent:", Object.fromEntries(formData.entries())); // Log all entries
    return formData;
  }

  // --- COMMENTING LOGIC ---
  window.openRowCommentModal = function (btn) {
    const rowElement = btn.closest(".row-with-comment");
    const pkValue = rowElement.dataset.pkValue;
    currentCommentTarget = { type: "row", pk: pkValue };

    const rowLabel = btn.dataset.label;
    const commentText = rowComments[pkValue] || "";

    document.getElementById("rowCommentLabel").textContent = rowLabel;

    const rabUraian = rowElement.querySelector(
      '.mb-6 input[type="text"]'
    ).value;
    const rabHarga = rowElement.querySelector(
      '.mb-6 input[disabled][value^="Rp"]'
    ).value;
    document.getElementById(
      "currentRowValue"
    ).innerHTML = `<strong>${rabUraian}</strong> <br> <small>RAB: ${rabHarga}</small>`;

    if (isBendahara && !isViewOnly) {
      document.getElementById("rowCommentInputContainer").style.display =
        "block";
      document.getElementById("rowCommentDisplayContainer").style.display =
        "none";
      document.getElementById("rowCommentInput").value = commentText;
    } else {
      // Pengusul or ViewOnly
      document.getElementById("rowCommentInputContainer").style.display =
        "none";
      document.getElementById("rowCommentDisplayContainer").style.display =
        "block";
      document.getElementById("rowCommentDisplayText").textContent =
        commentText || "(Tidak ada catatan)";
    }

    if (!rowCommentModalInstance) {
      rowCommentModalInstance = new bootstrap.Modal(
        document.getElementById("rowCommentModal")
      );
    }
    rowCommentModalInstance.show();
  };

  window.saveRowComment = function () {
    const saveBtn = document.querySelector('#rowCommentModal .btn-primary');
    if (window.setButtonLoading && saveBtn) {
      window.setButtonLoading(saveBtn, true, 'Menyimpan...');
    }
    
    const comment = document.getElementById("rowCommentInput").value.trim();
    const { pk } = currentCommentTarget;
    if (comment) {
      rowComments[pk] = comment;
    } else {
      delete rowComments[pk];
    }
    updateCommentButton(
      `.row-with-comment[data-pk-value="${pk}"] .row-comment-icon`,
      comment
    );
    
    if (window.setButtonLoading && saveBtn) {
      window.setButtonLoading(saveBtn, false);
    }
    
    rowCommentModalInstance.hide();
  };

  function updateCommentButton(selector, comment) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.toggle("has-comment", !!comment);
    }
  }

  // --- EVENT HANDLERS & INITIALIZATION ---
  window.removeFile = function (button, anggaranId, fileName) {
    const lampiranItem = button.closest(".lampiran-item");
    const listContainer = lampiranItem.closest(".lampiran-list");

    // Revoke object URL for local files to free up memory
    const link = lampiranItem.querySelector("a");
    if (link && link.href.startsWith("blob:")) {
      URL.revokeObjectURL(link.href);
    }

    // Remove from UI
    lampiranItem.remove();

    // Remove from fileStore
    if (fileStore[anggaranId]) {
      fileStore[anggaranId] = fileStore[anggaranId].filter(
        (f) => f.name !== fileName
      );
    }

    // If the list is now empty, show the 'no files' message
    if (listContainer && listContainer.childElementCount === 0) {
      listContainer.innerHTML =
        '<p class="text-xs text-gray-400 italic no-files">Tidak ada bukti terlampir untuk item ini.</p>';
    }
  };

  window.handleFileUpload = function (input) {
    const anggaranId = input.dataset.anggaranId;
    const files = Array.from(input.files);
    const listContainer = input
      .closest(".rab-item")
      .querySelector(".lampiran-list");

    const MAX_SIZE = 10485760; // 10 MB
    const ALLOWED_TYPES = ["jpg", "jpeg", "png", "pdf"];

    // Remove "Tidak ada bukti" message if it exists
    const noFilesMessage = listContainer.querySelector(".no-files");
    if (noFilesMessage) {
      noFilesMessage.remove();
    }

    if (!fileStore[anggaranId]) {
      fileStore[anggaranId] = [];
    }

    files.forEach((file) => {
      const extension = file.name.split(".").pop().toLowerCase();

      // Validation
      if (file.size > MAX_SIZE) {
        Swal.fire({
          icon: "error",
          title: "File Ditolak",
          text: `Ukuran file "${file.name}" terlalu besar. Maksimal 10MB.`,
        });
        return;
      }
      if (!ALLOWED_TYPES.includes(extension)) {
        Swal.fire({
          icon: "error",
          title: "File Ditolak",
          text: `Tipe file "${
            file.name
          }" tidak diizinkan. Hanya ${ALLOWED_TYPES.join(", ")}.`,
        });
        return;
      }

      // Add to store and UI
      fileStore[anggaranId].push(file);
      const fileUrl = URL.createObjectURL(file);
      const fileItem = document.createElement("div");
      fileItem.className = "lampiran-item local-file"; // Added 'lampiran-item' for consistent styling
      fileItem.innerHTML = `
        <div class="lampiran-content">
          <i class="ti ti-file-text text-gray-400"></i>
          <a href="${fileUrl}" target="_blank" class="text-blue-600 hover:underline text-sm">${file.name}</a>
        </div>
        <div class="flex items-center gap-2">
            <button type="button" class="action-icon remove-icon" onclick="window.removeFile(this, '${anggaranId}', '${file.name}')">
                <i class="ti ti-minus">&#xeaf2;</i>
            </button>
        </div>
      `;
      listContainer.appendChild(fileItem);
    });
    input.value = "";
  };

  function attachActionListeners() {
    const backButton = document.getElementById("backButton");
    if (backButton)
      backButton.addEventListener("click", () => window.history.back());

    if (isPengusul && !isViewOnly) {
      const submitLpjButton = document.getElementById("submitLpjButton");
      if (submitLpjButton)
        submitLpjButton.addEventListener("click", () =>
          submitLpj(state.kegiatanId)
        );
    }
    if (isBendahara && !isViewOnly) {
      const submitReviewButton = document.getElementById("submitReviewButton");
      const approveLpjButton = document.getElementById("approveLpjButton");
      if (submitReviewButton)
        submitReviewButton.addEventListener("click", () =>
          submitReview(state.kegiatanId)
        );
      if (approveLpjButton)
        approveLpjButton.addEventListener("click", () =>
          approveLpj(state.kegiatanId)
        );
    }
  }

  async function initializeApp() {
    const params = new URLSearchParams(window.location.search);
    let kegiatanId = params.get("kegiatan_id");

    if (!kegiatanId) {
      const pathSegments = path.split("/");
      const idFromPath = pathSegments[pathSegments.length - 1];
      if (idFromPath && !isNaN(idFromPath)) {
        kegiatanId = idFromPath;
      }
    }

    state.kegiatanId = kegiatanId;

    if (!kegiatanId) {
      document.getElementById(
        "rabSectionsContainer"
      ).innerHTML = `<div class="text-center text-red-500 p-8">Kegiatan ID tidak ditemukan di URL.</div>`;
      return;
    }

    await Promise.all([fetchSatuan(), fetchLpjDetail(kegiatanId)]);

    state.isLoading = false;

    // Set dynamic page title based on context
    const pageTitleElement = document.querySelector(
      ".input-lpj-page #pageTitle"
    );
    const dynamicTitleElement = document.getElementById("pageTitle"); // This is the one in the colored box, but it is the same.
    if (isViewOnly) {
      if (pageTitleElement)
        pageTitleElement.textContent = `Detail LPJ: ${state.kegiatan.nama_kegiatan}`;
    } else {
      if (dynamicTitleElement)
        dynamicTitleElement.textContent = `LPJ: ${state.kegiatan.nama_kegiatan}`;
    }

    renderRABSections();
    renderActionButtons();

    // Add event listener for viewing files
    document.body.addEventListener("click", function (event) {
      const viewBtn = event.target.closest(".view-file-btn");
      if (viewBtn) {
        event.preventDefault();
        const lampiranId = viewBtn.dataset.lampiranId;
        openFileInNewTab(lampiranId);
      }
    });
  }

  initializeApp();
}
