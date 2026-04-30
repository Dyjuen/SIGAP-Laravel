/**
 * Loading Spinner Utility
 * Provides consistent loading spinner implementation across the app
 * Uses SpinKit Chase Dot spinner
 */

(function() {
  'use strict';

/**
 * Creates a chase dot spinner HTML
 * @param {string} color - CSS color value (default: #00BCD4)
 * @param {string} size - Size in px (default: 40px)
 * @returns {string} HTML string for the spinner
 */
function createChaseSpinner(color = '#00BCD4', size = '40px') {
  return `
    <div class="sk-chase" style="--sk-size: ${size}; --sk-color: ${color};">
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
    </div>
  `;
}

/**
 * Creates a centered loading state with spinner and optional message
 * @param {string} message - Optional loading message
 * @param {string} color - Spinner color
 * @param {string} size - Spinner size
 * @returns {string} HTML string for centered loading state
 */
function createLoadingState(message = 'Memuat...', color = '#00BCD4', size = '40px') {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; gap: 1rem;">
      ${createChaseSpinner(color, size)}
      ${message ? `<div style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">${message}</div>` : ''}
    </div>
  `;
}

/**
 * Creates a table row with loading spinner
 * @param {number} colspan - Number of columns to span
 * @param {string} message - Optional loading message
 * @returns {string} HTML string for table loading row
 */
function createTableLoadingRow(colspan, message = 'Memuat data...') {
  return `
    <tr>
      <td colspan="${colspan}" class="text-center" style="padding: 2rem;">
        ${createLoadingState(message, '#00BCD4', '30px')}
      </td>
    </tr>
  `;
}

/**
 * Creates a small inline spinner for buttons
 * @param {string} color - Spinner color
 * @returns {string} HTML string for small spinner
 */
function createButtonSpinner(color = '#ffffff') {
  return `<span class="sk-chase" style="--sk-size: 16px; --sk-color: ${color}; display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
    <span class="sk-chase-dot"></span>
    <span class="sk-chase-dot"></span>
    <span class="sk-chase-dot"></span>
    <span class="sk-chase-dot"></span>
    <span class="sk-chase-dot"></span>
    <span class="sk-chase-dot"></span>
  </span>`;
}

/**
 * Adds loading state to a button
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show during loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Memproses...') {
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `${createButtonSpinner()}${loadingText}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML.replace(/<span class="sk-chase".*?<\/span>/s, '');
  }
}

// Make functions available globally
window.createChaseSpinner = createChaseSpinner;
window.createLoadingState = createLoadingState;
window.createTableLoadingRow = createTableLoadingRow;
window.createButtonSpinner = createButtonSpinner;
window.setButtonLoading = setButtonLoading;

})();
