/**
 * @file Main Navigation Controller
 * @description Handles the site-wide navigation menu with keyboard support,
 *              loading states, and error handling.
 *
 * Hook emitted: H53:NavChange — when user navigates to a new section
 */

(function () {
    "use strict";

    const menu = document.getElementById("menu");
    if (!menu) {
        console.error("Navigation menu element not found");
        return;
    }

    /**
     * Navigate to the selected page.
     * @param {string} value - The directory name to navigate to
     */
    function navigateTo(value) {
        if (!value || value.trim() === "") {
            console.error("Invalid selection: empty value");
            return;
        }

        // H53:NavChange hook (custom event for web hook integration)
        document.dispatchEvent(new CustomEvent("hook:H53:NavChange", {
            detail: {
                from: window.location.pathname,
                to: `./${value}/index.html`
            }
        }));

        window.location.href = `./${value}/index.html`;
    }

    // Handle menu change events
    menu.addEventListener("change", function (e) {
        const selectedValue = e.target.value;
        navigateTo(selectedValue);
    });

    // Keyboard navigation: Enter key on focused menu triggers navigation
    menu.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const selectedValue = menu.value;
            navigateTo(selectedValue);
        }
    });
})();
