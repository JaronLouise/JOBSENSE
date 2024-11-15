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
