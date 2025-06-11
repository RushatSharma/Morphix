document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggleButton');
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme on load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleButton) {
            themeToggleButton.textContent = 'Light Mode'; // Update button text
        }
    } else {
        // Default to light mode if no theme is saved or if it's 'light'
        document.body.classList.remove('dark-mode');
        if (themeToggleButton) {
            themeToggleButton.textContent = 'Dark Mode'; // Update button text
        }
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                themeToggleButton.textContent = 'Light Mode'; // Update button text
            } else {
                themeToggleButton.textContent = 'Dark Mode'; // Update button text
            }
            localStorage.setItem('theme', theme);
        });
    } else {
        console.warn('Theme toggle button #themeToggleButton not found.');
    }
});
