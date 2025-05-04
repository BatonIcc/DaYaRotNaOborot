document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('strengthMeter');
    const passwordHint = document.getElementById('passwordHint');

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        if (/\d/.test(password)) strength += 1;

        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;

        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        const width = strength * 20;
        strengthMeter.style.width = `${width}%`;

        if (strength <= 1) {
            strengthMeter.style.backgroundColor = '#ef4444';
            passwordHint.textContent = 'Слабый пароль. Используйте больше символов и цифр.';
        } else if (strength <= 3) {
            strengthMeter.style.backgroundColor = '#f59e0b';
            passwordHint.textContent = 'Средний пароль. Добавьте специальные символы или буквы в разных регистрах.';
        } else {
            strengthMeter.style.backgroundColor = '#10b981';
            passwordHint.textContent = 'Сильный пароль!';
        }
    });
});