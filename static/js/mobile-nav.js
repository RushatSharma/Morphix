document.addEventListener('DOMContentLoaded', () => {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav'); // The menu itself
    const navElement = document.querySelector('nav'); // The main nav element

    if (hamburgerButton && mobileNav && navElement) {
        hamburgerButton.addEventListener('click', () => {
            // Toggle a class on the nav element to show/hide the mobile menu
            // and change the hamburger icon (via CSS)
            navElement.classList.toggle('mobile-nav-active');

            // Update ARIA attribute for accessibility
            const isExpanded = navElement.classList.contains('mobile-nav-active');
            hamburgerButton.setAttribute('aria-expanded', isExpanded);
        });
    } else {
        console.error('Hamburger menu, mobile navigation, or nav element not found.');
    }
});
