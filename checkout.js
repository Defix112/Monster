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

    const payButton = document.getElementById('payButton');
    
    // Обработчик нажатия на кнопку оплаты
    payButton.addEventListener('click', () => {
        const btnText = payButton.querySelector('.btn-text');
        const btnLoader = payButton.querySelector('.btn-loader');
        
        // Показываем загрузку
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        payButton.disabled = true;

        // Собираем данные покупателя
        const customerData = {
            username: currentUser.username,
            amount: TBANK_CONFIG.amount,
            product: 'Monster Privilege'
        };

        // Сохраняем данные о платеже
        savePendingPayment(customerData);

        // Открываем приложение Т-Банк
        openTBankApp(customerData);
    });
});

// Открытие приложения Т-Банк
function openTBankApp(customerData) {
    // Определяем, мобильное устройство или нет
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Для мобильных устройств используем deep link напрямую
        // Используем простой deep link без Intent fallback, чтобы не открывался Play Market
        let deepLink = '';
        
        // Убираем пробелы из номера карты для передачи в URL
        const cardNumberClean = TBANK_CONFIG.cardNumber.replace(/\s/g, '');
        
        if (isAndroid) {
            // Для Android используем ТОЛЬКО прямой deep link БЕЗ Intent
            // Intent может перенаправлять в Play Market, поэтому не используем его
            const cardNumberClean = TBANK_CONFIG.cardNumber.replace(/\s/g, '');
            
            // Пробуем несколько вариантов прямого deep link для Т-Банка
            // Вариант 1: Основной формат с card и amount
            const deepLink1 = `tbank://transfer?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
            
            // Вариант 2: С параметром sum
            const deepLink2 = `tbank://transfer?card=${cardNumberClean}&sum=${TBANK_CONFIG.amount}`;
            
            // Вариант 3: С параметром to
            const deepLink3 = `tbank://transfer?to=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
            
            // Вариант 4: Альтернативный формат
            const deepLink4 = `tbank://pay?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
            
            // Вариант 5: Простой формат без параметров (откроет приложение, пользователь введет данные)
            const deepLink5 = `tbank://`;
            
            // Используем прямой способ открытия приложения БЕЗ Intent
            // Создаем скрытую ссылку и кликаем по ней
            // Это более надежный способ, который не перенаправляет в Play Market
            const openApp = (link) => {
                // Используем window.location.href напрямую - это самый надежный способ
                // для Android, который не перенаправляет в Play Market
                window.location.href = link;
            };
            
            // Пробуем открыть приложение через прямой deep link
            // Начинаем с самого простого варианта - просто открыть приложение
            // Это точно не перенаправит в Play Market, если приложение установлено
            try {
                // Сначала пробуем просто открыть приложение
                openApp(deepLink5); // tbank://
                
                // Затем через небольшую задержку пробуем открыть с параметрами
                // Это позволит передать данные в приложение, если оно поддерживает
                setTimeout(() => {
                    try {
                        openApp(deepLink1); // tbank://transfer?card=...&amount=...
                    } catch (e) {
                        // Игнорируем ошибку, приложение уже открыто
                    }
                }, 300);
                
                // Показываем информацию о переводе через небольшую задержку
                setTimeout(() => {
                    showTransferInfo(customerData);
                }, 800);
                
            } catch (e) {
                // Если не удалось открыть, пробуем другие варианты
                let opened = false;
                const variants = [deepLink1, deepLink2, deepLink3, deepLink4];
                
                for (let i = 0; i < variants.length; i++) {
                    try {
                        openApp(variants[i]);
                        opened = true;
                        setTimeout(() => {
                            showTransferInfo(customerData);
                        }, 500);
                        break;
                    } catch (err) {
                        continue;
                    }
                }
                
                // Если ничего не сработало, показываем модальное окно с номером карты
                if (!opened) {
                    showCardNumberModal(customerData);
                }
            }
        } else if (isIOS) {
            // Для iOS используем универсальную ссылку или deep link
            deepLink = `tbank://transfer?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
            
            try {
                window.location.href = deepLink;
                setTimeout(() => {
                    showTransferInfo(customerData);
                }, 500);
            } catch (e) {
                showCardNumberModal(customerData);
            }
        } else {
            // Для других мобильных устройств
            deepLink = `tbank://transfer?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
            try {
                window.location.href = deepLink;
                setTimeout(() => {
                    showTransferInfo(customerData);
                }, 500);
            } catch (e) {
                showCardNumberModal(customerData);
            }
        }
    } else {
        // Для десктопа показываем номер карты
        showCardNumberModal(customerData);
    }
}

// Показ модального окна с номером карты
function showCardNumberModal(customerData) {
    const modal = `
        <div class="transfer-modal" id="transferModal">
            <div class="transfer-modal-content">
                <h2>Перевод в Т-Банк</h2>
                <div class="card-number-display">
                    <div class="card-number-label">Номер карты для перевода:</div>
                    <div class="card-number-value" id="cardNumberDisplay">${TBANK_CONFIG.cardNumberDisplay}</div>
                    <button onclick="copyCardNumber()" class="btn-copy-card-modal">📋 Скопировать номер</button>
                </div>
                <div class="amount-display">
                    <div class="amount-label">Сумма:</div>
                    <div class="amount-value">${TBANK_CONFIG.amount} ₽</div>
                </div>
                <div class="transfer-instructions">
                    <p><strong>Инструкция:</strong></p>
                    <ol>
                        <li>Откройте приложение Т-Банк на телефоне</li>
                        <li>Перейдите в раздел "Переводы"</li>
                        <li>Введите номер карты: <strong>${TBANK_CONFIG.cardNumberDisplay}</strong></li>
                        <li>Введите сумму: <strong>${TBANK_CONFIG.amount} ₽</strong></li>
                        <li>Выполните перевод</li>
                    </ol>
                </div>
                <div class="transfer-actions">
                    <button onclick="tryOpenTBankAgain()" class="btn-open-app">
                        Открыть Т-Банк
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
    
    document.body.insertAdjacentHTML('beforeend', modal);
    addTransferModalStyles();
}

// Показ информации о переводе (когда приложение открылось)
function showTransferInfo(customerData) {
    const info = `
        <div class="transfer-info-modal" id="transferInfoModal">
            <div class="transfer-info-content">
                <h2>Перевод в Т-Банк</h2>
                <div class="transfer-details-box">
                    <p><strong>Номер карты:</strong> ${TBANK_CONFIG.cardNumberDisplay}</p>
                    <p><strong>Сумма:</strong> ${TBANK_CONFIG.amount} ₽</p>
                    <p><strong>Комментарий:</strong> Monster Privilege ${customerData.username}</p>
                </div>
                <p class="transfer-note">Выполните перевод в приложении Т-Банк, затем вернитесь и подтвердите оплату.</p>
                <div class="transfer-actions">
                    <button onclick="tryOpenTBankAgain()" class="btn-open-app">
                        Открыть Т-Банк снова
                    </button>
                    <button onclick="confirmPayment()" class="btn-confirm-payment">
                        Я перевел деньги
                    </button>
                    <button onclick="closeTransferInfoModal()" class="btn-close-modal">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', info);
    addTransferModalStyles();
}

// Копирование номера карты
function copyCardNumber() {
    const cardNumber = TBANK_CONFIG.cardNumber.replace(/\s/g, '');
    navigator.clipboard.writeText(cardNumber).then(() => {
        showNotification('Номер карты скопирован!', 'success');
    }).catch(() => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = cardNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Номер карты скопирован!', 'success');
    });
}

// Попытка открыть Т-Банк снова
function tryOpenTBankAgain() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Убираем пробелы из номера карты
    const cardNumberClean = TBANK_CONFIG.cardNumber.replace(/\s/g, '');
    
    // Используем ТОЛЬКО прямой deep link БЕЗ Intent
    let deepLink = `tbank://transfer?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`;
    
    if (isAndroid) {
        // Для Android пробуем несколько вариантов прямого deep link
        const variants = [
            `tbank://transfer?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`,
            `tbank://transfer?card=${cardNumberClean}&sum=${TBANK_CONFIG.amount}`,
            `tbank://transfer?to=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`,
            `tbank://pay?card=${cardNumberClean}&amount=${TBANK_CONFIG.amount}`,
            `tbank://` // Просто открыть приложение
        ];
        
        // Пробуем открыть первый вариант
        for (let i = 0; i < variants.length; i++) {
            try {
                window.location.href = variants[i];
                break;
            } catch (e) {
                if (i === variants.length - 1) {
                    // Если все варианты не сработали, показываем модальное окно
                    showCardNumberModal({ username: getCurrentUser()?.username || '' });
                }
            }
        }
    } else if (isIOS) {
        window.location.href = deepLink;
    } else {
        window.location.href = deepLink;
    }
}

// Закрытие модального окна с информацией
function closeTransferInfoModal() {
    const modal = document.getElementById('transferInfoModal');
    if (modal) {
        modal.remove();
    }
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
            .transfer-modal-content, .transfer-info-content {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .transfer-info-modal {
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
            .card-number-display {
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                color: white;
            }
            .card-number-label {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 10px;
            }
            .card-number-value {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 10px 0;
            }
            .btn-copy-card-modal {
                margin-top: 10px;
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            .btn-copy-card-modal:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            .amount-display {
                text-align: center;
                margin: 20px 0;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 10px;
            }
            .amount-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
            }
            .amount-value {
                font-size: 32px;
                font-weight: bold;
                color: #333;
            }
            .transfer-instructions {
                margin: 20px 0;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 10px;
            }
            .transfer-instructions ol {
                margin: 10px 0;
                padding-left: 20px;
            }
            .transfer-instructions li {
                margin: 8px 0;
                color: #555;
            }
            .transfer-note {
                margin: 15px 0;
                padding: 15px;
                background: #e3f2fd;
                border-radius: 10px;
                color: #1976d2;
            }
            .btn-copy-card {
                background: transparent;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 5px 10px;
                margin-left: 10px;
                transition: transform 0.2s;
            }
            .btn-copy-card:hover {
                transform: scale(1.2);
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
