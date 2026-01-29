# Инструкция по настройке приема платежей

## Шаг 1: Регистрация в ЮKassa

1. Перейдите на сайт [ЮKassa](https://yookassa.ru/)
2. Зарегистрируйтесь или войдите в личный кабинет
3. Создайте магазин (если еще не создан)
4. Получите:
   - **Shop ID** (ID магазина)
   - **Secret Key** (Секретный ключ)

## Шаг 2: Настройка сервера

### Установка зависимостей

```bash
npm install
```

### Настройка переменных

Откройте файл `server.js` и замените:

```javascript
const SHOP_ID = 'YOUR_SHOP_ID'; // Ваш ID магазина
const SECRET_KEY = 'YOUR_SECRET_KEY'; // Ваш секретный ключ
```

### Запуск сервера

```bash
npm start
```

Или для разработки с автоперезагрузкой:

```bash
npm run dev
```

## Шаг 3: Настройка Webhook

1. В личном кабинете ЮKassa перейдите в настройки магазина
2. Найдите раздел "Webhook"
3. Добавьте URL: `https://ваш-домен.com/api/payment-webhook`
4. Выберите события: `payment.succeeded`, `payment.canceled`

## Шаг 4: Настройка фронтенда

В файле `checkout.js` измените URL сервера:

```javascript
const response = await fetch('https://ваш-домен.com/api/create-payment', {
    // ...
});
```

## Шаг 5: Получение денег

### Как деньги приходят к вам:

1. **Пользователь оплачивает** → ЮKassa обрабатывает платеж
2. **ЮKassa отправляет webhook** → Ваш сервер получает уведомление
3. **Деньги переводятся** → На ваш счет в ЮKassa
4. **Вывод средств** → Через личный кабинет ЮKassa на вашу карту

### Комиссия ЮKassa:

- **Онлайн-платежи**: 2.8% + 10₽ за транзакцию
- **Вывод средств**: бесплатно (на карту или счет)

### Время поступления:

- **Онлайн-платежи**: мгновенно
- **Вывод на карту**: 1-3 рабочих дня

## Альтернативные платежные системы

### Stripe (для международных платежей)

```bash
npm install stripe
```

```javascript
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

// Создание платежа
const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    metadata: { product: 'Monster Privilege' }
});
```

### PayPal

```bash
npm install paypal-rest-sdk
```

## Безопасность

⚠️ **ВАЖНО:**

1. **Никогда не храните секретные ключи в коде!**
   - Используйте переменные окружения: `process.env.SECRET_KEY`
   - Создайте файл `.env` (добавьте в `.gitignore`)

2. **Используйте HTTPS** для продакшена

3. **Проверяйте подписи webhook** от ЮKassa

4. **Не обрабатывайте данные карт на фронтенде** - используйте токенизацию

## Пример с переменными окружения

Создайте файл `.env`:

```
SHOP_ID=123456
SECRET_KEY=live_xxxxxxxxxxxxx
PORT=3000
```

Установите `dotenv`:

```bash
npm install dotenv
```

В `server.js`:

```javascript
require('dotenv').config();

const SHOP_ID = process.env.SHOP_ID;
const SECRET_KEY = process.env.SECRET_KEY;
```

## Тестирование

### Тестовые карты ЮKassa:

- **Успешная оплата**: `5555 5555 5555 4444`
- **Отклоненная оплата**: `5555 5555 5555 4477`
- **CVV**: любые 3 цифры
- **Срок**: любая будущая дата

## Поддержка

Если возникли вопросы:
- Документация ЮKassa: https://yookassa.ru/developers/api
- Техподдержка: support@yookassa.ru

