// Генерация капчи
let currentCaptchaAnswer = 0;

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let answer;
    let question;
    
    if (operation === '+') {
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    } else {
        // Убеждаемся, что результат положительный
        if (num1 >= num2) {
            answer = num1 - num2;
            question = `${num1} - ${num2} = ?`;
        } else {
            answer = num2 - num1;
            question = `${num2} - ${num1} = ?`;
        }
    }
    
    currentCaptchaAnswer = answer;
    return question;
}

function initCaptcha() {
    const captchaText = document.getElementById('captchaText');
    const refreshBtn = document.getElementById('refreshCaptcha');
    
    if (captchaText) {
        captchaText.textContent = generateCaptcha();
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (captchaText) {
                captchaText.textContent = generateCaptcha();
            }
            const answerInput = document.getElementById('captchaAnswer');
            if (answerInput) {
                answerInput.value = '';
            }
        });
    }
}

function validateCaptcha(userAnswer) {
    return parseInt(userAnswer) === currentCaptchaAnswer;
}

// Обработка входа
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем капчу
    initCaptcha();
    
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

        // Проверка капчи
        const captchaAnswerInput = document.getElementById('captchaAnswer');
        if (!captchaAnswerInput) {
            showNotification('Ошибка: поле капчи не найдено', 'error');
            return;
        }
        
        const captchaAnswer = captchaAnswerInput.value.trim();
        
        if (!captchaAnswer) {
            showNotification('Пожалуйста, решите пример для проверки', 'error');
            captchaAnswerInput.style.borderColor = '#ff6b6b';
            captchaAnswerInput.focus();
            return;
        }
        
        if (!validateCaptcha(captchaAnswer)) {
            showNotification('Неверный ответ на проверку. Попробуйте еще раз', 'error');
            captchaAnswerInput.style.borderColor = '#ff6b6b';
            captchaAnswerInput.value = '';
            captchaAnswerInput.focus();
            // Генерируем новую капчу
            const captchaText = document.getElementById('captchaText');
            if (captchaText) {
                captchaText.textContent = generateCaptcha();
            }
            return;
        }
        
        // Сбрасываем цвет границы при успешной проверке
        captchaAnswerInput.style.borderColor = '#51cf66';

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

