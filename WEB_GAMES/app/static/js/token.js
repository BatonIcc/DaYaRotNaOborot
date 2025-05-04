document.addEventListener('DOMContentLoaded', function() {
    const tokenText = document.getElementById('tokenText');
    const copyBtn = document.getElementById('copyBtn');
    const copySuccess = document.getElementById('copySuccess');

    copyBtn.addEventListener('click', function() {
        const token = tokenText.textContent;

        navigator.clipboard.writeText(token).then(function() {
            copySuccess.classList.add('show');

            setTimeout(function() {
                copySuccess.classList.remove('show');
            }, 2000);
        }).catch(function(err) {
            console.error('Не удалось скопировать токен: ', err);
            alert('Не удалось скопировать токен. Попробуйте снова.');
        });
    });
});