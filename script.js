document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;

    if (menuToggle && sidebar && mobileMenuOverlay && body) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('is-open');
            mobileMenuOverlay.classList.toggle('is-visible');
            body.classList.toggle('no-scroll'); // Prevent body scroll when menu open
        });

        mobileMenuOverlay.addEventListener('click', () => {
            sidebar.classList.remove('is-open');
            mobileMenuOverlay.classList.remove('is-visible');
            body.classList.remove('no-scroll');
        });
    }

    // --- Table of Contents (TOC) Generation and Scroll Highlighting ---
    const mainContent = document.querySelector('.main-content');
    const tocList = document.getElementById('toc-list');

    if (mainContent && tocList) {
        const headings = mainContent.querySelectorAll('h2[id], h3[id]'); // Select H2 and H3 with IDs
        const headingOffsets = [];

        // Generate TOC links
        headings.forEach(heading => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            listItem.appendChild(link);

            // Add class for indentation based on heading level
            if (heading.tagName === 'H3') {
                listItem.classList.add('toc-nested');
            }

            tocList.appendChild(listItem);
            
            // Store heading element and its offset for scroll tracking
            headingOffsets.push({
                id: heading.id,
                element: heading,
                linkElement: link
            });
        });

        // Function to update active TOC link based on scroll position
        const updateActiveTOCLink = () => {
            const scrollPosition = mainContent.scrollTop + mainContent.offsetTop; // Current scroll position relative to document top
            const viewportHeight = mainContent.clientHeight;

            let activeHeading = null;

            // Iterate through headings to find the one currently in view
            for (let i = headingOffsets.length - 1; i >= 0; i--) {
                const heading = headingOffsets[i].element;
                const headingTop = heading.offsetTop;
                const headingBottom = headingTop + heading.offsetHeight;

                // Check if heading is within the visible portion of the main content
                // A common heuristic is to activate when 50% or more of the heading is in view
                // or when its top edge crosses a certain threshold (e.g., 20% from top of main content)
                if (headingTop < mainContent.scrollTop + (viewportHeight * 0.3) && headingBottom > mainContent.scrollTop) {
                    activeHeading = headingOffsets[i];
                    break;
                }
            }

            // Remove active class from all links
            document.querySelectorAll('.toc-nav a').forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to the current active link
            if (activeHeading) {
                activeHeading.linkElement.classList.add('active');
            }
        };

        // Add scroll event listener to the main-content area
        mainContent.addEventListener('scroll', updateActiveTOCLink);
        // Also call on initial load to set the active link for the top of the page
        updateActiveTOCLink();
    }

    // Smooth scroll for TOC links and "Scroll to top"
    document.querySelectorAll('.toc-nav a[href^="#"], .scroll-to-top[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // If scrolling to a heading in main-content
                if (mainContent.contains(targetElement)) {
                    // Calculate scroll position relative to mainContent's scrollable area
                    const targetOffset = targetElement.offsetTop;
                    mainContent.scrollTo({
                        top: targetOffset,
                        behavior: 'smooth'
                    });
                } else {
                    // For "Scroll to top" or other page-level anchors
                    window.scrollTo({
                        top: targetElement.offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- Sidebar Search Functionality ---
    const sidebarSearchInput = document.querySelector('.sidebar-search input');
    const allSidebarLinks = document.querySelectorAll('.sidebar-nav .sidebar-link');
    const allSidebarSections = document.querySelectorAll('.sidebar-nav .sidebar-section'); // li containing details
    const allSidebarCategoryTitles = document.querySelectorAll('.sidebar-nav .sidebar-category-title');

    // Store original text content of links to restore after search
    const originalLinkTexts = new Map();
    allSidebarLinks.forEach(link => {
        originalLinkTexts.set(link, link.textContent);
    });

    // Helper function to highlight text
    function highlightText(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi'); // 'gi' for global and case-insensitive
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    if (sidebarSearchInput) {
        // 1. Open mobile menu on focus if on mobile and sidebar is closed
        sidebarSearchInput.addEventListener('focus', () => {
            if (window.innerWidth <= 768 && !sidebar.classList.contains('is-open')) {
                sidebar.classList.add('is-open');
                mobileMenuOverlay.classList.add('is-visible');
                body.classList.add('no-scroll');
            }
        });

        // 2. Implement filtering and highlighting on input
        sidebarSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm === '') {
                // Reset all visibility and highlighting
                allSidebarLinks.forEach(link => {
                    link.innerHTML = originalLinkTexts.get(link); // Restore original text
                    link.closest('li').style.display = ''; // Show parent li
                });
                allSidebarSections.forEach(section => {
                    section.style.display = ''; // Show section li
                    const details = section.querySelector('details');
                    if (details) details.removeAttribute('open'); // Close details
                });
                allSidebarCategoryTitles.forEach(title => {
                    title.style.display = ''; // Show category title
                });
                return;
            }

            const visibleSections = new Set(); // To track details elements that should be open/visible
            const visibleCategories = new Set(); // To track h4 category titles that should be visible

            allSidebarLinks.forEach(link => {
                link.innerHTML = originalLinkTexts.get(link); // Reset highlighting before checking
                const linkText = link.textContent.toLowerCase();
                const parentLi = link.closest('li');
                
                if (linkText.includes(searchTerm)) {
                    parentLi.style.display = ''; // Show the link's li
                    link.innerHTML = highlightText(originalLinkTexts.get(link), searchTerm); // Apply highlighting

                    // Mark parent details and category title for visibility
                    const parentDetails = link.closest('details');
                    if (parentDetails) visibleSections.add(parentDetails);

                    const parentUlOfSection = link.closest('.sidebar-nav > ul');
                    if (parentUlOfSection && parentUlOfSection.previousElementSibling && parentUlOfSection.previousElementSibling.classList.contains('sidebar-category-title')) {
                        visibleCategories.add(parentUlOfSection.previousElementSibling);
                    }
                } else {
                    parentLi.style.display = 'none'; // Hide the link's li
                }
            });

            // Adjust visibility of sections (details) and category titles (h4)
            allSidebarSections.forEach(section => {
                const detailsElement = section.querySelector('details');
                if (detailsElement) {
                    if (visibleSections.has(detailsElement)) {
                        section.style.display = ''; // Show the li.sidebar-section
                        detailsElement.setAttribute('open', ''); // Open the details
                    } else {
                        section.style.display = 'none'; // Hide the li.sidebar-section
                        detailsElement.removeAttribute('open'); // Ensure it's closed
                    }
                }
            });

            allSidebarCategoryTitles.forEach(title => {
                if (visibleCategories.has(title)) {
                    title.style.display = ''; // Show the h4
                } else {
                    title.style.display = 'none'; // Hide the h4
                }
            });
        });
    }

    // --- Theme Settings Dropdown ---
    const settingsToggle = document.querySelector('.settings-toggle');
    const settingsDropdown = document.querySelector('.settings-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const htmlEl = document.documentElement;

    // Function to apply the theme
    const applyTheme = (theme) => {
        htmlEl.setAttribute('data-theme', theme);
    };

    // Function to update the active state in the dropdown
    const updateActiveButton = (themeValue) => {
        themeOptions.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeValue === themeValue);
        });
    };

    if (settingsToggle && settingsDropdown) {
        // Toggle dropdown visibility
        settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = settingsToggle.getAttribute('aria-expanded') === 'true';
            settingsDropdown.hidden = isExpanded;
            settingsToggle.setAttribute('aria-expanded', !isExpanded);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (settingsToggle.getAttribute('aria-expanded') === 'true') {
                settingsDropdown.hidden = true;
                settingsToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Handle theme selection
        themeOptions.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const themeValue = button.dataset.themeValue;
                localStorage.setItem('docs-theme', themeValue);
                
                if (themeValue === 'system') {
                    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                } else {
                    applyTheme(themeValue);
                }
                updateActiveButton(themeValue);
                
                // Hide dropdown after selection
                settingsDropdown.hidden = true;
                settingsToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Apply theme on initial load
        const savedTheme = localStorage.getItem('docs-theme') || 'system';
        updateActiveButton(savedTheme);
        if (savedTheme === 'system') {
            applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
            applyTheme(savedTheme);
        }

        // Listen for changes in system preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('docs-theme') === 'system') {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
});
