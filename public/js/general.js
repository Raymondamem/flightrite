// Get the current URL path
const path = window.location.pathname;

// Remove trailing slashes and get the route
const currentRoute = path.replace(/\/$/, '');

// Find the links in the navigation bar
const links = document.querySelectorAll('#navBar a');

// Loop through each link and add/remove the 'active' class
links.forEach(link => {
    // Remove 'active' class from all links
    link.classList.remove('active');

    // Add 'active' class to the link with matching href
    if (link.getAttribute('href') === currentRoute) {
        link.classList.add('active');
    }
});
