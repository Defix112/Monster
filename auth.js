// Система авторизации и регистрации

// Регистрация нового пользователя
function registerUser(username, password, confirmPassword, email) {
    // Валидация
    if (!username || username.length < 3) {
        return { success: false, message: 'Никнейм должен содержать минимум 3 символа' };
    }
    
    if (!password || password.length < 6) {
        return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    
    if (password !== confirmPassword) {
        return { success: false, message: 'Пароли не совпадают' };
    }
    
    if (!email || !email.includes('@')) {
        return { success: false, message: 'Введите корректный email' };
    }
    
    // Проверка уникальности никнейма
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Этот никнейм уже занят' };
    }
    
    // Проверка уникальности email
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Этот email уже используется' };
    }
    
    // Создание нового пользователя
    const newUser = {
        username: username,
        password: hashPassword(password), // Хешируем пароль
        email: email,
        hasMonster: false,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Регистрация успешна!' };
}

// Вход в систему
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'Неверный никнейм или пароль' };
    }
    
    // Проверка пароля
    if (user.password !== hashPassword(password)) {
        return { success: false, message: 'Неверный никнейм или пароль' };
    }
    
    // Создание сессии
    createSession(user.username);
    
    return { success: true, message: 'Вход выполнен успешно!', user: user };
}

// Выход из системы
function logoutUser() {
    localStorage.removeItem('currentSession');
    return { success: true, message: 'Выход выполнен' };
}

// Создание сессии
function createSession(username) {
    const session = {
        username: username,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 дней
    };
    localStorage.setItem('currentSession', JSON.stringify(session));
}

// Получение текущего пользователя
function getCurrentUser() {
    const session = localStorage.getItem('currentSession');
    if (!session) return null;
    
    try {
        const sessionData = JSON.parse(session);
        
        // Проверка срока действия сессии
        if (new Date(sessionData.expiresAt) < new Date()) {
            localStorage.removeItem('currentSession');
            return null;
        }
        
        const users = getUsers();
        return users.find(u => u.username === sessionData.username) || null;
    } catch (e) {
        return null;
    }
}

// Проверка авторизации
function isAuthenticated() {
    return getCurrentUser() !== null;
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

// Простое хеширование пароля (в продакшене используйте более безопасные методы)
function hashPassword(password) {
    // Простое хеширование для демонстрации
    // В реальном приложении используйте bcrypt или подобное
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Проверка уникальности никнейма
function isUsernameAvailable(username) {
    const users = getUsers();
    return !users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

// Проверка уникальности email
function isEmailAvailable(email) {
    const users = getUsers();
    return !users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

