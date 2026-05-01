/* =========================================
   L'ELITE Theme Toggle + Mobile Nav
   Simple, shared across all pages
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Theme Toggle ---
    var saved = localStorage.getItem('elite-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    var btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = (current === 'light') ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('elite-theme', next);
        });
    }

    // --- 2. Mobile Menu ---
    var hamburger = document.getElementById('nav-hamburger');
    var navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
    }
});
