// Обработка входа
document.addEventListener('DOMContentLoaded', () => {
    // Проверка, не вошел ли уже пользователь
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Проверка успешной регистрации
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showNotification('Регистрация успешна! Теперь войдите в систему', 'success');
    }

    const form = document.getElementById('loginForm');

    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }

        // Вход
        const result = loginUser(username, password);

        if (result.success) {
            showNotification(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification(result.message, 'error');
        }
    });
});

// Показ уведомления
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

