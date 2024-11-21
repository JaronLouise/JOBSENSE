// Load navbar.html content
document.addEventListener('DOMContentLoaded', () => {
    const navbarContainer = document.getElementById('navbar-container');
    fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            navbarContainer.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
        });
});
function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');
  }
 
