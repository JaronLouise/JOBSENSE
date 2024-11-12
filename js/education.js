document.addEventListener('scroll', () => {
    const content = document.querySelector('.content');
    const progressText = document.getElementById('progress-text');

    // Calculate the scroll percentage
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    // Update the progress text
    if (scrollPercent >= 100) {
        progressText.textContent = 'Lesson Completed!';
    } else {
        progressText.textContent = `${Math.floor(scrollPercent)}%`;
    }
});
