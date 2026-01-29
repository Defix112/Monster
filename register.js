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

// Обработка регистрации
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем капчу
    initCaptcha();
    
    const form = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Проверка доступности никнейма в реальном времени
    usernameInput.addEventListener('blur', () => {
        const username = usernameInput.value.trim();
        if (username.length >= 3) {
            if (!isUsernameAvailable(username)) {
                showNotification('Этот никнейм уже занят', 'error');
                usernameInput.style.borderColor = '#ff6b6b';
            } else {
                usernameInput.style.borderColor = '#51cf66';
            }
        }
    });

    // Проверка совпадения паролей в реальном времени
    confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.style.borderColor = '#ff6b6b';
        } else {
            confirmPasswordInput.style.borderColor = '#51cf66';
        }
    });

    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Валидация
        if (username.length < 3) {
            showNotification('Никнейм должен содержать минимум 3 символа', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (!email.includes('@')) {
            showNotification('Введите корректный email', 'error');
            return;
        }

        // Проверка уникальности никнейма перед регистрацией
        if (!isUsernameAvailable(username)) {
            showNotification('Этот никнейм уже занят. Выберите другой никнейм', 'error');
            usernameInput.style.borderColor = '#ff6b6b';
            return;
        }

        // Проверка уникальности email
        if (!isEmailAvailable(email)) {
            showNotification('Этот email уже используется', 'error');
            emailInput.style.borderColor = '#ff6b6b';
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

        // Регистрация
        const result = registerUser(username, password, confirmPassword, email);

        if (result.success) {
            showNotification(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'login.html?registered=true';
            }, 1500);
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

