// Настройки для перевода Т-Банк
const TBANK_CONFIG = {
    // Номер карты получателя
    cardNumber: '5536917753742763', // Ваш номер карты
    cardNumberDisplay: '5536 9177 5374 2763', // Для отображения
    // Сумма перевода в рублях
    amount: 19
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, авторизован ли пользователь
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Для оплаты необходимо войти в систему', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Заполняем данные получателя
    document.getElementById('recipientCard').textContent = TBANK_CONFIG.cardNumberDisplay;
    document.getElementById('recipientName').textContent = currentUser.username;

    const form = document.getElementById('paymentForm');
    const phoneInput = document.getElementById('phone');

    // Форматирование телефона
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('8')) {
            value = '7' + value.substring(1);
        }
        if (value.startsWith('7')) {
            value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
        }
        e.target.value = value;
    });

    // Отправка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('.btn-pay-checkout');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoader = submitButton.querySelector('.btn-loader');
        
        // Показываем загрузку
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitButton.disabled = true;

        // Собираем данные покупателя
        const customerData = {
            username: currentUser.username,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            amount: TBANK_CONFIG.amount,
            product: 'Monster Privilege'
        };

        // Сохраняем данные о платеже
        savePendingPayment(customerData);

        // Создаем ссылку для перевода в Т-Банк
        // Deep link для мобильного приложения Т-Банк
        const tbankAppLink = `tbank://transfer?card=${TBANK_CONFIG.cardNumber}&amount=${TBANK_CONFIG.amount}&comment=Monster+Privilege+${currentUser.username}`;
        
        // Пытаемся открыть приложение Т-Банк
        openTBankTransfer(tbankAppLink, customerData);
    });
});

// Открытие перевода в Т-Банк
function openTBankTransfer(link, customerData) {
    // Пытаемся открыть приложение
    window.location.href = link;
    
    // Показываем инструкцию
    setTimeout(() => {
        showTransferInstructions(customerData);
    }, 500);
}

// Показ инструкции по переводу
function showTransferInstructions(customerData) {
    const instructions = `
        <div class="transfer-modal" id="transferModal">
            <div class="transfer-modal-content">
                <h2>Перевод в Т-Банк</h2>
                <div class="transfer-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-text">
                            <strong>Откройте приложение Т-Банк</strong>
                            <p>Если приложение не открылось автоматически, откройте его вручную</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-text">
                            <strong>Перейдите в "Переводы"</strong>
                            <p>Найдите раздел "Перевести" или "Переводы"</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-text">
                            <strong>Введите данные</strong>
                            <div class="transfer-details-box">
                                <p><strong>Номер карты:</strong> ${TBANK_CONFIG.cardNumberDisplay}</p>
                                <p><strong>Сумма:</strong> ${TBANK_CONFIG.amount} ₽</p>
                                <p><strong>Комментарий:</strong> Monster Privilege ${customerData.username}</p>
                            </div>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-text">
                            <strong>Нажмите "Отправить"</strong>
                            <p>Подтвердите перевод</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">5</div>
                        <div class="step-text">
                            <strong>Вернитесь на сайт</strong>
                            <p>После перевода вернитесь и подтвердите оплату</p>
                        </div>
                    </div>
                </div>
                <div class="transfer-actions">
                    <button onclick="openTBankAppAgain()" class="btn-open-app">
                        Открыть Т-Банк снова
                    </button>
                    <button onclick="copyTransferData()" class="btn-copy-data">
                        Скопировать данные
                    </button>
                    <button onclick="confirmPayment()" class="btn-confirm-payment">
                        Я перевел деньги
                    </button>
                    <button onclick="closeTransferModal()" class="btn-close-modal">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;

    // Добавляем модальное окно
    document.body.insertAdjacentHTML('beforeend', instructions);
    addTransferModalStyles();
}

// Добавление стилей для модального окна
function addTransferModalStyles() {
    if (!document.getElementById('transferModalStyles')) {
        const styles = document.createElement('style');
        styles.id = 'transferModalStyles';
        styles.textContent = `
            .transfer-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s;
            }
            .transfer-modal-content {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .transfer-steps {
                margin: 20px 0;
            }
            .step {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
            }
            .step-number {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }
            .step-text strong {
                display: block;
                margin-bottom: 5px;
                color: #333;
            }
            .step-text p {
                color: #666;
                margin: 5px 0;
            }
            .transfer-details-box {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 10px;
                margin-top: 10px;
            }
            .transfer-details-box p {
                margin: 5px 0;
            }
            .transfer-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 20px;
            }
            .btn-open-app, .btn-copy-data, .btn-confirm-payment, .btn-close-modal {
                padding: 15px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            .btn-open-app {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-copy-data {
                background: #f0f0f0;
                color: #333;
            }
            .btn-confirm-payment {
                background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
                color: white;
            }
            .btn-close-modal {
                background: #e0e0e0;
                color: #333;
            }
            .btn-open-app:hover, .btn-copy-data:hover, .btn-confirm-payment:hover, .btn-close-modal:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(styles);
    }
}

// Открытие приложения Т-Банк снова
function openTBankAppAgain() {
    const link = `tbank://transfer?card=${TBANK_CONFIG.cardNumber}&amount=${TBANK_CONFIG.amount}`;
    window.location.href = link;
}

// Копирование данных для перевода
function copyTransferData() {
    const data = `Перевод в Т-Банк:
Номер карты: ${TBANK_CONFIG.cardNumberDisplay}
Сумма: ${TBANK_CONFIG.amount} ₽
Комментарий: Monster Privilege`;
    
    navigator.clipboard.writeText(data).then(() => {
        showNotification('Данные скопированы! Вставьте их в приложение Т-Банк', 'success');
    }).catch(() => {
        showNotification('Не удалось скопировать. Скопируйте вручную', 'error');
    });
}

// Подтверждение оплаты
function confirmPayment() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Ошибка: пользователь не найден', 'error');
        return;
    }

    // Активируем привилегию Monster
    activateMonsterPrivilege(currentUser.username);
    
    // Показываем успешное сообщение
    showNotification('Привилегия Monster успешно активирована! 🎉', 'success');
    
    // Закрываем модальное окно
    closeTransferModal();
    
    // Перенаправляем на главную страницу
    setTimeout(() => {
        window.location.href = 'index.html?success=true';
    }, 2000);
}

// Активация привилегии Monster
function activateMonsterPrivilege(username) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        users[userIndex].hasMonster = true;
        users[userIndex].monsterActivatedAt = new Date().toISOString();
        saveUsers(users);
    }
}

// Сохранение данных о платеже
function savePendingPayment(customerData) {
    localStorage.setItem('pendingPayment', JSON.stringify({
        ...customerData,
        timestamp: Date.now(),
        cardNumber: TBANK_CONFIG.cardNumber
    }));
}

// Закрытие модального окна
function closeTransferModal() {
    const modal = document.getElementById('transferModal');
    if (modal) {
        modal.remove();
    }
}

// Получение текущего пользователя
function getCurrentUser() {
    const session = localStorage.getItem('currentSession');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    const users = getUsers();
    return users.find(u => u.username === sessionData.username) || null;
}

// Получение всех пользователей
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Сохранение пользователей
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Показ уведомления
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Проверка успешной оплаты при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showNotification('Привилегия Monster успешно активирована! 🎉', 'success');
    }
});
