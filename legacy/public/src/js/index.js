// frontend/src/index.js
import { router } from './router.js';

// Listen for URL changes
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);

// Handle navigation for links
document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        history.pushState(null, null, e.target.href);
        router();
    }
});

// Global navigation function for programmatic navigation
window.navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};