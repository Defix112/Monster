// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initSmoothScroll();
    initAuth();
    checkMonsterStatus();
});

// Инициализация авторизации
function initAuth() {
    const currentUser = getCurrentUser();
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const authButtons = document.getElementById('authButtons');

    if (currentUser) {
        // Пользователь вошел
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = currentUser.username;
        if (currentUser.hasMonster) {
            usernameDisplay.innerHTML += ' <span class="monster-badge-small">👹</span>';
        }
        logoutBtn.style.display = 'inline-block';
        authButtons.style.display = 'none';

        // Обработчик выхода
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            location.reload();
        });
    } else {
        // Пользователь не вошел
        userInfo.style.display = 'none';
        authButtons.style.display = 'flex';
    }
}

// Проверка статуса Monster
function checkMonsterStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.hasMonster) {
            showNotification('Привилегия Monster успешно активирована! 🎉', 'success');
        }
    }
}

// Показ уведомления
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления, если его нет
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Инициализация анимаций
function initAnimations() {
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(card);
    });
}

// Плавная прокрутка
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Анимация плавающих элементов
const floatingElements = document.querySelectorAll('.float-element');
floatingElements.forEach((element, index) => {
    const delay = index * 0.5;
    const duration = 3 + Math.random() * 2;
    element.style.animation = `float ${duration}s ease-in-out infinite`;
    element.style.animationDelay = `${delay}s`;
});
