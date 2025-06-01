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

});
