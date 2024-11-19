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

document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.content');
    const progressText = document.getElementById('progress-text');

    content.addEventListener('scroll', () => {
        // Calculate the scroll percentage within the .content element
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight - content.clientHeight;
        
        // Ensure scrollHeight doesn't become 0 (which can happen if the content is too short)
        if (scrollHeight <= 0) return;

        const scrollPercent = (scrollTop / scrollHeight) * 100;

        // Update the progress text
        if (scrollPercent >= 100) {
            progressText.textContent = 'Lesson Completed!';
        } else {
            progressText.textContent = `${Math.floor(scrollPercent)}%`;
        }
    });
});
