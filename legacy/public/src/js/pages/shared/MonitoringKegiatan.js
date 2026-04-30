// frontend/src/pages/Pengusul/MonitoringKegiatan.js

import { renderDashboardLayout } from "../../layout/AppLayout.js";

export function renderMonitoringKegiatanPage(path, userRole) {
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

      /* Desktop right padding */
      @media (min-width: 1024px) {
        .monitoring-kegiatan-page {
          padding-right: 1rem;
        }
      }

      /* Clean background with image */
      .monitoring-kegiatan-page {
        min-height: 100vh;
        padding: 2rem;
        animation: fadeIn 0.4s ease-out;
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        background-repeat: no-repeat;
      }

      /* ========== GLOBAL Z-INDEX FIX ========== */
      .modal-backdrop { z-index: 9999 !important; }
      .modal { z-index: 10000 !important; }

      /* ========== HEADER STYLES (From Dashboard Direktur) ========== */
      .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; animation: fadeInUp 0.5s ease-out; }
      .header-title h2 { font-size: 2.25rem; font-weight: 700; margin: 0; background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
      .header-title p { color: #64748b; margin-top: 0.25rem; font-size: 1rem; font-weight: 500; }

      /* Info banner */
      .info-banner {
        background: white;
        color: #64748b;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #03C9D7;
        animation: slideDown 0.5s ease-out;
        transition: all 0.3s ease;
      }

      .info-banner:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(3, 201, 215, 0.2);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .info-icon {
        color: #03C9D7;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        transition: transform 0.3s ease;
      }

      .info-banner:hover .info-icon {
        transform: scale(1.1);
      }

      /* ========================================== */
      /* SEARCH BAR STYLES */
      /* ========================================== */
      .search-section {
        margin-bottom: 1.5rem;
        opacity: 0;
        animation: slideInLeft 0.6s ease-out forwards;
        animation-delay: 0.1s;
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .search-container {
        position: relative;
        max-width: 500px;
      }

      .search-input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 3rem;
        border: 2px solid #E5E7EB;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .search-input:focus {
        outline: none;
        border-color: #03C9D7;
        box-shadow: 0 0 0 4px rgba(3, 201, 215, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9CA3AF;
        pointer-events: none;
        transition: color 0.3s ease;
      }

      .search-input:focus + .search-icon {
        color: #03C9D7;
      }

      .clear-search {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        padding: 0.25rem;
        display: none;
        transition: color 0.3s ease;
      }

      .clear-search:hover {
        color: #EF4444;
      }

      .clear-search.visible {
        display: block;
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Card container - Enhanced with rounded corners and proper padding */
      .card-datatable {
        background: white;
        border-radius: 18px;
        padding: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        animation: scaleIn 0.5s ease-out;
        animation-delay: 0.1s;
        animation-fill-mode: backwards;
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      }

      .card-datatable:hover {
        box-shadow: 0 8px 24px rgba(3, 201, 215, 0.15);
        transform: translateY(-2px);
      }
      
      .card-datatable .table {
        border-radius: 18px;
        overflow: hidden;
      }

      /* Table styling */
      .table {
        margin-bottom: 0;
      }

      .table thead tr th {
        background: #f8fafb;
        font-weight: 600;
        color: #475569;
        padding: 1rem 1rem;
        font-size: 0.875rem;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
        animation: fadeIn 0.5s ease-out backwards;
        transition: all 0.3s ease;
      }

      .table thead tr th:hover {
        background: #f0f4f8;
        color: #03C9D7;
      }

      .table thead tr th:nth-child(1) { animation-delay: 0.2s; }
      .table thead tr th:nth-child(2) { animation-delay: 0.25s; }
      .table thead tr th:nth-child(3) { animation-delay: 0.3s; }
      .table thead tr th:nth-child(4) { animation-delay: 0.35s; }

      /* Enhanced row hover effect with premium interaction */
      .table tbody tr {
        border-bottom: 1px solid #f1f5f9;
        transition: all 0.3s ease;
        position: relative;
        border-left: 3px solid transparent;
        animation: slideInRight 0.5s ease-out backwards;
        background: white;
        cursor: pointer;
      }

      .table tbody tr::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 100%;
        background: linear-gradient(90deg, rgba(3, 201, 215, 0.05) 0%, transparent 100%);
        transition: width 0.3s ease;
        z-index: 0;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }

      .table tbody tr:hover::before {
        width: 100%;
      }

      .table tbody tr:nth-child(1) { animation-delay: 0.4s; }
      .table tbody tr:nth-child(2) { animation-delay: 0.45s; }
      .table tbody tr:nth-child(3) { animation-delay: 0.5s; }
      .table tbody tr:nth-child(4) { animation-delay: 0.55s; }
      .table tbody tr:nth-child(5) { animation-delay: 0.6s; }

      .table tbody tr:hover {
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.15);
        border-left-color: #03C9D7;
        border-left-width: 3px;
        z-index: 10;
      }

      .table tbody tr:active {
        transform: translateX(2px);
      }

      .table tbody tr:hover td {
        position: relative;
        z-index: 1;
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .table tbody tr td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border: none;
      }

      .table tbody tr td:nth-child(1) {
        text-align: center;
        width: 80px;
        min-width: 80px;
        max-width: 80px;
      }

      .table tbody tr td:nth-child(2) {
        width: 300px;
        min-width: 300px;
        max-width: 300px;
      }

      .table tbody tr td:nth-child(3) {
        text-align: center;
        width: auto;
        padding-left: 3rem;
        padding-right: 3rem;
      }

      /* Removed checkbox styling */

      /* Index number */
      .index-number {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
        display: inline-block;
        transition: all 0.3s ease;
      }

      tr:hover .index-number {
        color: #03C9D7;
        transform: scale(1.1);
      }

      /* Activity name */
      .activity-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
        transition: all 0.3s ease;
      }

      tr:hover .activity-name {
        color: #03C9D7;
        transform: translateX(4px);
      }

      .activity-name-sub {
        font-size: 0.75rem;
        color: #94a3b8;
        transition: all 0.3s ease;
      }

      tr:hover .activity-name-sub {
        color: #64748b;
        transform: translateX(4px);
      }

      /* Bootstrap Progress Stepper */
      .stepper-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        padding: 1.5rem 1rem;
        width: 100%;
        gap: 0.5rem;
      }

      /* Stepper Item - Base */
      .stepper-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1 1 0;
        max-width: calc(20% - 0.5rem);
        animation: fadeIn 0.5s ease-out backwards;
      }

      .stepper-item:nth-child(1) { animation-delay: 0.05s; }
      .stepper-item:nth-child(2) { animation-delay: 0.1s; }
      .stepper-item:nth-child(3) { animation-delay: 0.15s; }
      .stepper-item:nth-child(4) { animation-delay: 0.2s; }
      .stepper-item:nth-child(5) { animation-delay: 0.25s; }

      /* Step Counter - Base */
      .step-counter {
        position: relative;
        z-index: 5;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #e2e8f0;
        margin-bottom: 0.5rem;
        font-weight: 700;
        font-size: 1.1rem; /* Increased from 0.75rem */
        color: #94a3b8;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        animation: fadeIn 0.5s ease-out backwards;
        cursor: pointer;
        flex-shrink: 0;
      }

      .stepper-item:hover .step-counter {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.2);
      }

      .stepper-item.pending:hover .step-counter {
        background: #cbd5e1;
      }
      
      /* Completed Step Enhancements */
      .stepper-item.completed .step-counter {
        background: linear-gradient(135deg, #03C9D7 0%, #02b3c4 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.3);
        animation: scaleIn 0.5s ease-out backwards;
      }

      .stepper-item.completed:hover .step-counter {
        transform: scale(1.2);
        box-shadow: 0 6px 16px rgba(3, 201, 215, 0.4);
      }
      
      /* Active Step Enhancements */
      .stepper-item.active .step-counter {
        background: white;
        border: 3px solid #03C9D7;
        color: #03C9D7;
        box-shadow: 0 0 0 0 rgba(3, 201, 215, 0.4);
        animation: pulseBorder 2s ease-in-out infinite;
      }

      .stepper-item.active:hover .step-counter {
        transform: scale(1.2);
      }

      @keyframes pulseBorder {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(3, 201, 215, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(3, 201, 215, 0.1);
        }
      }
      
      /* Stepper Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(3, 201, 215, 0.4);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(3, 201, 215, 0.1);
        }
      }

      .step-name {
        text-align: center;
        font-size: 0.85rem;
        font-weight: 600;
        color: #94a3b8;
        margin-top: 0.25rem;
        animation: fadeIn 0.6s ease-out backwards;
        animation-delay: 0.15s;
        transition: all 0.3s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        padding: 0 2px;
        line-height: 1.2;
      }

      .stepper-item:hover .step-name {
        transform: translateY(-2px);
        color: #475569;
      }

      .step-date {
        text-align: center;
        font-size: 0.8rem;
        color: #cbd5e0;
        margin-top: 0.15rem;
        animation: fadeIn 0.6s ease-out backwards;
        animation-delay: 0.25s;
        transition: all 0.3s ease;
        white-space: nowrap;
        font-weight: 500;
      }

      .stepper-item:hover .step-name {
        transform: translateY(-3px);
        color: #64748b;
      }

      .stepper-item:hover .step-date {
        transform: translateY(-2px);
        color: #94a3b8;
      }

      .stepper-item.completed .step-name,
      .stepper-item.active .step-name {
        color: #475569;
        font-weight: 700;
      }

      .stepper-item.completed:hover .step-name {
        color: #03C9D7;
        transform: translateY(-4px);
      }

      .stepper-item.active:hover .step-name {
        color: #03C9D7;
        transform: translateY(-4px);
      }

      .stepper-item.completed .step-date {
        color: #03C9D7;
        font-weight: 600;
      }

      .stepper-item.completed:hover .step-date {
        transform: translateY(-3px);
      }

      /* Bootstrap Progress Bar as Connector */
      .progress-connector {
        position: absolute;
        top: 25px; /* (50px / 2) */
        left: calc(50% + 25px); /* (50px / 2) */
        width: calc(100% - 50px);
        height: 4px;
        z-index: 1;
      }

      .progress-connector .progress {
        height: 100%;
        background-color: #e2e8f0;
        border-radius: 2px;
        overflow: visible;
      }

      .progress-connector .progress-bar {
        background: linear-gradient(90deg, #03C9D7 0%, #02b3c4 100%);
        transition: all 0.3s ease;
        border-radius: 2px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(3, 201, 215, 0.3);
      }

      .stepper-item.completed:hover .progress-connector .progress-bar {
        height: 6px;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.4);
      }

      /* Last item - no connector */
      .stepper-item:last-child .progress-connector {
        display: none;
      }

      /* Status badge */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.85rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        animation: bounceIn 0.6s ease-out backwards;
        transition: transform 0.2s ease;
      }

      .status-badge:hover {
        transform: scale(1.05);
      }

      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      .badge-overdue {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
        padding: 6px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        display: inline-block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: statusPulse 2s ease-in-out infinite;
      }

      .badge-overdue:hover {
        transform: scale(1.1);
        animation: pulse 0.5s ease-in-out;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      }

      .badge-on-track {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #059669;
        padding: 6px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        display: inline-block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: statusPulse 2s ease-in-out infinite;
      }

      .badge-on-track:hover {
        transform: scale(1.1);
        animation: pulse 0.5s ease-in-out;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      }

      /* Pagination */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-top: 1px solid #f1f5f9;
        background: white;
        animation: fadeIn 0.5s ease-out;
        animation-delay: 0.7s;
        animation-fill-mode: backwards;
        border-bottom-left-radius: 18px;
        border-bottom-right-radius: 18px;
      }

      .pagination-info {
        color: #6B7280;
        font-size: 14px;
      }

      .pagination {
        display: flex;
        gap: 0.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .pagination .page-item {
        display: inline-block;
      }

      .pagination .page-link {
        min-width: 36px;
        height: 36px;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        border: 1px solid #E5E7EB;
        background: white;
        color: #374151;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      .pagination .page-link:hover:not(.disabled) {
        background: #F3F4F6;
        border-color: #03C9D7;
        color: #03C9D7;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(3, 201, 215, 0.15);
      }

      .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #03C9D7, #02b3c4);
        color: white;
        border-color: #03C9D7;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.3);
      }

      .pagination .page-item.disabled .page-link {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Empty state */
      .empty-state {
        text-align: center;
        padding: 3rem;
        color: #94a3b8;
        animation: fadeIn 0.6s ease-out;
      }

      .empty-state-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        opacity: 0.5;
        color: #cbd5e0;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .empty-state:hover .empty-state-icon {
        opacity: 0.7;
      }

      .empty-state h3 {
        color: #64748b;
        font-weight: 600;
        margin-bottom: 0.5rem;
        animation: fadeIn 0.6s ease-out;
        animation-delay: 0.2s;
        animation-fill-mode: backwards;
      }

      /* Responsive */
      @media (max-width: 1400px) {
        .step-counter {
          width: 34px;
          height: 34px;
          font-size: 0.7rem;
        }
        
        .step-name {
          font-size: 0.6rem;
        }
        
        .step-date {
          font-size: 0.55rem;
        }
        
        .progress-connector {
          top: 17px;
          left: calc(50% + 17px);
          width: calc(100% - 34px);
        }
        
        .stepper-wrapper {
          padding: 1.25rem 0.75rem;
        }
      }

      @media (max-width: 1200px) {
        .step-counter {
          width: 30px;
          height: 30px;
          font-size: 0.65rem;
        }
        
        .stepper-wrapper {
          padding: 1rem 0.5rem;
          gap: 0.25rem;
        }
        
        .step-name {
          font-size: 0.55rem;
        }
        
        .step-date {
          font-size: 0.5rem;
        }
        
        .progress-connector {
          top: 15px;
          left: calc(50% + 15px);
          width: calc(100% - 30px);
        }
      }

      @media (max-width: 992px) {
        .monitoring-kegiatan-page {
          padding: 1rem;
        }

        .card-datatable {
          padding: 0.5rem;
        }

        .stepper-wrapper {
          flex-wrap: nowrap;
          gap: 0.125rem;
          padding: 0.75rem 0.25rem;
        }
        
        .step-counter {
          width: 26px;
          height: 26px;
          font-size: 0.6rem;
        }
        
        .step-name {
          font-size: 0.5rem;
        }
        
        .step-date {
          font-size: 0.45rem;
        }

        .progress-connector {
          top: 13px;
          left: calc(50% + 13px);
          width: calc(100% - 26px);
          height: 2px;
        }

        .table tbody tr td {
          padding: 1rem 0.5rem;
        }

        .table tbody tr:hover {
          transform: translateY(-2px) scale(1.002);
        }
        
        .pagination-container {
            flex-direction: column;
            gap: 1rem;
        }
        
        .search-section .search-container {
            max-width: 100%;
        }
      }

        .table tbody tr:hover {
          transform: translateY(-2px) scale(1.002);
        }
      }

      /* ========================================== */
      /* ENHANCED ANIMATIONS FROM MONITORING USULAN */
      /* ========================================== */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      @keyframes statusPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes skeletonLoading {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      /* Enhanced monitoring page animation */
      .monitoring-kegiatan-page {
        animation: fadeIn 0.5s ease-out !important;
      }

      /* Enhanced card with shimmer effect */
      .card-datatable {
        position: relative;
        animation: fadeInUp 0.6s ease-out forwards !important;
        animation-delay: 0.2s;
        opacity: 0;
      }

      .card-datatable::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        animation: shimmer 3s infinite;
        pointer-events: none;
        z-index: 0;
      }

      /* Enhanced table row animations */
      .table tbody tr {
        opacity: 0;
        animation: slideUp 0.5s ease-out forwards !important;
      }

      .table tbody tr:nth-child(1) { animation-delay: 0.3s !important; }
      .table tbody tr:nth-child(2) { animation-delay: 0.4s !important; }
      .table tbody tr:nth-child(3) { animation-delay: 0.5s !important; }
      .table tbody tr:nth-child(4) { animation-delay: 0.6s !important; }
      .table tbody tr:nth-child(5) { animation-delay: 0.7s !important; }
      .table tbody tr:nth-child(6) { animation-delay: 0.8s !important; }
      .table tbody tr:nth-child(7) { animation-delay: 0.9s !important; }
      .table tbody tr:nth-child(8) { animation-delay: 1s !important; }
      .table tbody tr:nth-child(9) { animation-delay: 1.1s !important; }
      .table tbody tr:nth-child(10) { animation-delay: 1.2s !important; }

      /* Enhanced stepper animations */
      .step-circle {
        animation: statusPulse 2s ease-in-out infinite;
      }

      .step-circle:hover {
        animation: pulse 0.5s ease-in-out;
      }

      /* Button ripple effect */
      .btn {
        position: relative;
        overflow: hidden;
      }

      .btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      .btn:hover::before {
        width: 300px;
        height: 300px;
      }

      /* Skeleton loading animation */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: skeletonLoading 1.5s ease-in-out infinite;
        border-radius: 4px;
      }

      /* Enhanced pagination animations */
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-top: 1px solid #f1f5f9;
        background: white;
        animation: fadeIn 0.5s ease-out;
        animation-delay: 0.7s;
        animation-fill-mode: backwards;
        border-bottom-left-radius: 18px;
        border-bottom-right-radius: 18px;
      }

      .pagination-info {
        color: #6B7280;
        font-size: 14px;
        font-weight: 500;
      }

      .pagination {
        display: flex;
        gap: 0.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .pagination .page-item {
        display: inline-block;
      }

      .pagination .page-link {
        padding: 0.5rem 0.75rem;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        color: #374151;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        min-width: 40px;
        text-align: center;
        display: inline-block;
        position: relative;
        overflow: hidden;
      }

      .pagination .page-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(3, 201, 215, 0.2), transparent);
        transition: left 0.5s;
      }

      .pagination .page-link:hover {
        background: #F3F4F6;
        border-color: #03C9D7;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(3, 201, 215, 0.2);
      }

      .pagination .page-link:hover::before {
        left: 100%;
      }

      .pagination .page-item.active .page-link {
        background: linear-gradient(135deg, #03C9D7, #02b3c4);
        color: white;
        border-color: #03C9D7;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.4);
        transform: scale(1.1);
      }

      .pagination .page-item.disabled .page-link {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Empty state */
      .table tbody tr:hover {
        background: linear-gradient(to right, #F0F9FF, transparent) !important;
        transform: translateX(4px) scale(1.002) !important;
        box-shadow: 0 4px 12px rgba(3, 201, 215, 0.12) !important;
      }

      /* Number badge animation */
      .index-number {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      tr:hover .index-number {
        transform: scale(1.1);
        text-shadow: 0 2px 4px rgba(3, 201, 215, 0.3);
      }

      /* Removed arrow indicator */

      /* Info banner enhancement */
      .info-banner {
        animation: slideDown 0.5s ease-out, pulse 2s ease-in-out 2s infinite;
      }

      /* Stepper connector animation */
      .progress-connector {
        transition: all 0.5s ease;
      }

      .progress-connector.completed {
        animation: progressFill 0.8s ease-out forwards;
      }

      @keyframes progressFill {
        from {
          width: 0;
          opacity: 0;
        }
        to {
          width: 100%;
          opacity: 1;
        }
      }

      /* ========================================== */
      /* UTILITY CLASSES */
      /* ========================================== */
      .text-center { text-align: center; }
      .text-muted { color: #6B7280; }
      .text-danger { color: #EF4444; }
      
      strong {
        font-weight: 600;
        color: #1F2937;
      }

      .small {
        font-size: 13px;
        color: #9CA3AF;
      }

      /* ========================================== */
      /* RESPONSIVE ENHANCEMENTS */
      /* ========================================== */
      @media (max-width: 768px) {
        .page-header-section {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .pagination-container {
          flex-direction: column;
          gap: 1rem;
        }

        .table {
          font-size: 13px;
        }

        .monitoring-kegiatan-page {
          padding: 1rem;
        }
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        .table-responsive {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 10px;
        }
        .table-responsive::-webkit-scrollbar {
          display: block;
          height: 6px;
          background: #f1f5f9;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      }
    </style>

    <div class="monitoring-kegiatan-page">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-title">
          <h2>Pemantauan Kegiatan</h2>
          <p>Pantau progress dan status kegiatan yang sedang berjalan</p>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="Cari nama kegiatan..."
          />
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <button class="clear-search" id="clearSearch" title="Clear search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="card card-datatable table-responsive p-0">
        <table class="table" style="border-collapse: separate; border-spacing: 0 1rem; padding: 0 1.5rem;">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">
              </th>
              <th style="width: 60px;">No.</th>
              <th style="min-width: 200px;">Nama Kegiatan</th>
              <th style="text-align: center; min-width: 600px;">Status</th>
            </tr>
          </thead>
          <tbody id="monitoringTableBody">
            <!-- Data will be populated by JavaScript -->
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Menampilkan <span id="startEntry">1</span> sampai <span id="endEntry">10</span> dari <span id="totalEntries">50</span> entri
          </div>
          <ul class="pagination" id="paginationButtons">
            <!-- Pagination buttons will be generated by JavaScript -->
          </ul>
        </div>
      </div>
    </div>
  `;

  renderDashboardLayout(pageContent, userRole);

  const user = JSON.parse(localStorage.getItem('auth_user'));

  // ==============================================
  // API Service
  // ==============================================
  const apiService = {
    getKegiatan: async (page = 1, per_page = 10) => {
      const token = localStorage.getItem('auth_token');
      let url = `/api/kegiatan?page=${page}&per_page=${per_page}`;

      if (userRole.toLowerCase() === 'pengusul' && user && user.user_id) {
        url += `&user_id=${user.user_id}`;
      }

      // Filter for Verifikator based on username (e.g. verifikator1 -> kategori_kegiatan=1)
      if (userRole.toLowerCase() === 'verifikator' && user && user.username) {
        const match = user.username.match(/verifikator(\d+)/i);
        if (match) {
          url += `&kategori_kegiatan=${match[1]}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data kegiatan.');
      }
      return response.json();
    }
  };
  
  // ==============================================
  // STATE
  // ==============================================
  let state = {
    activities: [],
    allActivities: [],
    filteredActivities: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalEntries: 0,
    totalPages: 1,
    selectedItems: new Set(),
    isLoading: true,
    error: null,
    searchQuery: '',
    searchTimeout: null,
  };

  // ==============================================
  // HELPER FUNCTIONS
  // ==============================================
    
  function formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
  }

  function transformApiData(apiData) {
    // Ensure apiData is an array before mapping
    if (!Array.isArray(apiData)) {
      console.warn("apiData is not an array:", apiData);
      return [];
    }
      
    const approvalStepMapping = {
      'PPK': { step: 1, dateKey: 'accPPK' },
      'Wadir2': { step: 2, dateKey: 'accWD2' },
      'Bendahara-Cair': { step: 3, dateKey: 'uangMuka' },
      'Bendahara-LPJ': { step: 4, dateKey: 'lpj' },
      'Bendahara-Setor': { step: 5, dateKey: 'setorFisik' }
    };
    
    return apiData.map(item => {
        const dates = { accPPK: null, accWD2: null, uangMuka: null, lpj: null, setorFisik: null };
        const approvedSteps = [];

        item.approvals.forEach(approval => {
            if ((approval.status === 'Disetujui' || approval.status === 'Bendahara-Setor') && approvalStepMapping[approval.approval_level]) {
                const mapping = approvalStepMapping[approval.approval_level];
                dates[mapping.dateKey] = formatDate(approval.updated_at);
                approvedSteps.push(mapping.step);
            }
        });
        
        const maxApprovedStep = approvedSteps.length > 0 ? Math.max(...approvedSteps) : 0;
        let currentStatus;

        if (item.current_approval && item.current_approval.status === 'Aktif' && approvalStepMapping[item.current_approval.approval_level]) {
            currentStatus = approvalStepMapping[item.current_approval.approval_level].step;
        } else {
            if (maxApprovedStep === 5) {
                currentStatus = 6; // All steps are completed, so status is beyond the last step
            } else {
                currentStatus = maxApprovedStep + 1;
            }
        }

        return {
            kak_id: item.kak_id,
            kegiatan_id: item.kegiatan_id,
            nama_kegiatan: item.nama_kegiatan,
            status: currentStatus,
            dates: dates,
            overdueDays: 0, // Placeholder
        };
    });
  }
  function renderStepper(item) {
    const steps = [
      { number: "01", label: "Disetujui PPK", date: item.dates.accPPK },
      { number: "02", label: "Disetujui WD2", date: item.dates.accWD2 },
      { number: "03", label: "Uang Muka", date: item.dates.uangMuka },
      { number: "04", label: "LPJ", date: item.dates.lpj },
      { number: "05", label: "Setor Fisik LPJ", date: item.dates.setorFisik }
    ];

    return `
      <div class="stepper-wrapper">
        ${steps.map((step, index) => {
          const stepNumber = index + 1;
          let stepClass = "pending";
          let progressWidth = "0%";

          if (stepNumber < item.status) {
            stepClass = "completed";
            progressWidth = "100%";
          } else if (stepNumber === item.status) {
            stepClass = "active";
            progressWidth = "0%";
          }

          return `
            <div class="stepper-item ${stepClass}">
              <div class="step-counter">
                ${stepClass === "completed" ? "✓" : step.number}
              </div>
              <div class="step-name">${step.label}</div>
              <div class="step-date">${step.date || "-"}</div>
              ${index < steps.length - 1 ? `
                <div class="progress-connector">
                  <div class="progress">
                    <div class="progress-bar ${stepClass === 'completed' ? 'animated' : ''}" 
                         role="progressbar" 
                         style="width: ${progressWidth}" 
                         aria-valuenow="${progressWidth === '100%' ? 100 : 0}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderStatusBadge(item) {
    if (item.status === 5 && item.overdueDays > 0) {
      return `<span class="status-badge badge-overdue">${item.overdueDays} Hari</span>`;
    }
    return `<span class="status-badge badge-on-track">✓</span>`;
  }

  // ==============================================
  // RENDER FUNCTIONS
  // ==============================================
  function renderTableRows() {
    const tbody = document.getElementById("monitoringTableBody");
    if (!tbody) return;

    if (state.isLoading) {
      tbody.innerHTML = window.createTableLoadingRow ? window.createTableLoadingRow(3, 'Memuat kegiatan...') : `<tr><td colspan="3" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>`;
      return;
    }

    if (state.error) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${state.error}</td></tr>`;
      return;
    }

    if (state.activities.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3">
            <div class="empty-state">
              <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3>Tidak ada data kegiatan</h3>
              <p>Belum ada kegiatan yang terdaftar dalam sistem</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    state.activities.forEach((item, index) => {
        const globalIndex = (state.currentPage - 1) * state.itemsPerPage + index + 1;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <span class="index-number">${globalIndex}</span>
        </td>
        <td>
          <div class="activity-name">${item.nama_kegiatan}</div>
          <div class="activity-name-sub">Pengusul</div>
        </td>
        <td>
          ${renderStepper(item)}
        </td>
      `;

      tbody.appendChild(row);
    });

    updatePaginationInfo();
    attachEventListeners();
  }

  // ==============================================
  // SEARCH FUNCTIONS
  // ==============================================
  function performSearch(query) {
    state.searchQuery = query.toLowerCase().trim();
    
    if (!state.searchQuery) {
      state.filteredActivities = state.allActivities;
    } else {
      state.filteredActivities = state.allActivities.filter(activity => {
        const namaKegiatan = (activity.nama_kegiatan || '').toLowerCase();
        return namaKegiatan.includes(state.searchQuery);
      });
    }
    
    state.activities = state.filteredActivities;
    state.currentPage = 1;
    state.totalEntries = state.filteredActivities.length;
    state.totalPages = Math.ceil(state.totalEntries / state.itemsPerPage);
    
    renderTableRows();
    setupPagination();
  }

  function debounceSearch(query) {
    if (state.searchTimeout) {
      clearTimeout(state.searchTimeout);
    }
    
    state.searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  }

  // ==============================================
  // EVENT LISTENERS
  // ==============================================
  function attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        
        // Show/hide clear button
        if (clearSearch) {
          if (query.length > 0) {
            clearSearch.classList.add('visible');
          } else {
            clearSearch.classList.remove('visible');
          }
        }
        
        debounceSearch(query);
      });
      
      // Clear on Escape key
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.value = '';
          if (clearSearch) {
            clearSearch.classList.remove('visible');
          }
          performSearch('');
        }
      });
    }
    
    if (clearSearch) {
      clearSearch.addEventListener('click', function() {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.classList.remove('visible');
        performSearch('');
      });
    }
    // Simple click event for rows
    document.querySelectorAll(".table tbody tr").forEach((row) => {
      row.addEventListener("click", function() {
        // Future: Navigate to detail page or show modal
        console.log("Row clicked");
      });
    });
  }

  // ==============================================
  // PAGINATION
  // ==============================================
  function setupPagination() {
    const paginationContainer = document.getElementById("paginationButtons");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const totalPages = state.totalPages;

    // Previous buttons
    paginationContainer.innerHTML += `
      <li class="page-item ${state.currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnFirstPage">«</a>
      </li>
      <li class="page-item ${state.currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnPrevPage">‹</a>
      </li>
    `;

    // Page number buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationContainer.innerHTML += `
        <li class="page-item ${i === state.currentPage ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Next buttons
    paginationContainer.innerHTML += `
      <li class="page-item ${state.currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnNextPage">›</a>
      </li>
      <li class="page-item ${state.currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="#" id="btnLastPage">»</a>
      </li>
    `;

    // Attach event listeners to pagination buttons
    document.querySelectorAll(".pagination .page-link").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const page = this.getAttribute("data-page");
        if (page) {
          changePage(parseInt(page));
        }
      });
    });

    const btnFirstPage = document.getElementById("btnFirstPage");
    const btnPrevPage = document.getElementById("btnPrevPage");
    const btnNextPage = document.getElementById("btnNextPage");
    const btnLastPage = document.getElementById("btnLastPage");

    if (btnFirstPage)
      btnFirstPage.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(1);
      });
    if (btnPrevPage)
      btnPrevPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage > 1) changePage(state.currentPage - 1);
      });
    if (btnNextPage)
      btnNextPage.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentPage < totalPages)
          changePage(state.currentPage + 1);
      });
    if (btnLastPage)
      btnLastPage.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(totalPages);
      });
  }

  async function changePage(page) {
    if (page < 1 || page > state.totalPages || page === state.currentPage) return;
    
    // If searching, just paginate the filtered results
    if (state.searchQuery) {
      state.currentPage = page;
      const startIndex = (page - 1) * state.itemsPerPage;
      const endIndex = startIndex + state.itemsPerPage;
      state.activities = state.filteredActivities.slice(startIndex, endIndex);
      renderTableRows();
      setupPagination();
      
      // Smooth scroll to top of table after page change
      const cardElement = document.querySelector('.card-datatable');
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    
    state.isLoading = true;
    state.error = null;
    renderTableRows(); // Show loader

    try {
        const result = await apiService.getKegiatan(page, state.itemsPerPage);
        const transformedData = transformApiData(result.data.data).filter(a => a.status < 6);
        state.activities = transformedData;
        state.allActivities = transformedData;
        state.filteredActivities = transformedData;
        state.currentPage = result.pagination?.current_page || 1; // Safely access current_page
        state.totalEntries = result.pagination?.total || 0;     // Safely access total
        state.totalPages = result.pagination?.last_page || 1;   // Safely access last_page
    } catch (error) {
        state.error = error.message;
    } finally {
        state.isLoading = false;
        renderTableRows();
        setupPagination();
        
        // Smooth scroll to top of table after page change
        const cardElement = document.querySelector('.card-datatable');
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  }

  function updatePaginationInfo() {
    const startEntry = (state.currentPage - 1) * state.itemsPerPage + 1;
    const endEntry = Math.min(
      state.currentPage * state.itemsPerPage,
      state.totalEntries
    );

    const startEntryEl = document.getElementById("startEntry");
    const endEntryEl = document.getElementById("endEntry");
    const totalEntriesEl = document.getElementById("totalEntries");

    if (startEntryEl) {
      startEntryEl.textContent = state.totalEntries > 0 ? startEntry : 0;
    }
    if (endEntryEl) {
      endEntryEl.textContent = endEntry;
    }
    if (totalEntriesEl) {
      totalEntriesEl.textContent = state.totalEntries;
    }
  }

  // ==============================================
  // INITIALIZATION
  // ==============================================
  async function init() {
    state.isLoading = true;
    renderTableRows(); // Initial render with loader

    try {
        const result = await apiService.getKegiatan(state.currentPage, state.itemsPerPage);
        const transformedData = transformApiData(result.data.data).filter(a => a.status < 6);
        state.activities = transformedData;
        state.allActivities = transformedData;
        state.filteredActivities = transformedData;
        state.totalEntries = result.pagination?.total || 0;     // Safely access total
        state.totalPages = result.pagination?.last_page || 1;   // Safely access last_page
        state.currentPage = result.pagination?.current_page || 1; // Safely access current_page
    } catch (e) {
        state.error = e.message;
    } finally {
        state.isLoading = false;
        renderTableRows();
        setupPagination();
    }

    if (window.Helpers) {
        window.Helpers.init();
    }
  }

  init();
}