// script.js (No changes from previous version)

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;

    function toggleMenu() {
        sidebar.classList.toggle('is-open');
        overlay.classList.toggle('is-visible');
        body.classList.toggle('no-scroll'); // Prevent background scrolling
        
        // Update aria-expanded for accessibility
        const isMenuOpen = sidebar.classList.contains('is-open');
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
        
        // Focus the first link in the sidebar when opened
        if (isMenuOpen) {
            // Find the first focusable element (link or input) in the sidebar
            const firstFocusable = sidebar.querySelector('a, button, input');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        } else {
            menuToggle.focus(); // Return focus to the toggle button when closed
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu); // Close menu when clicking outside

    // Optional: Close menu if window is resized (e.g., to desktop size)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && sidebar.classList.contains('is-open')) {
            toggleMenu(); // Close menu if resized to desktop
        }
    });

    // Handle ESC key to close menu
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
            toggleMenu();
        }
    });
});
