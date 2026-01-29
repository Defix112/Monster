// Загружаем переменные окружения
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { YooCheckout } = require('yookassa');

const app = express();
const PORT = process.env.PORT || 3000;

// ВАЖНО: Замените на ваши реальные данные из личного кабинета ЮKassa
// Получите их здесь: https://yookassa.ru/my → Настройки → API
const SHOP_ID = process.env.SHOP_ID || 'YOUR_SHOP_ID'; // ID магазина из ЮKassa
const SECRET_KEY = process.env.SECRET_KEY || 'YOUR_SECRET_KEY'; // Секретный ключ из ЮKassa

// Инициализация ЮKassa
const checkout = new YooCheckout({
    shopId: SHOP_ID,
    secretKey: SECRET_KEY
});

app.use(cors());
app.use(express.json());

// Создание платежа
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, email, phone, product } = req.body;

        console.log('Создание платежа:', { amount, email, product });

        // Создаем платеж в ЮKassa
        const payment = await checkout.createPayment({
            amount: {
                value: (amount / 100).toFixed(2), // Конвертируем копейки в рубли
                currency: 'RUB'
            },
            confirmation: {
                type: 'redirect',
                return_url: (process.env.SITE_URL || 'http://localhost:3000') + '/payment-success' // URL после успешной оплаты
            },
            capture: true, // Автоматическое подтверждение платежа
            description: `Оплата привилегии: ${product}`,
            metadata: {
                product: product,
                email: email,
                phone: phone
            },
            // Опционально: можно указать получателя (если у вас несколько счетов)
            // recipient: {
            //     account_id: 'ваш_счет_id'
            // }
        }, {
            idempotenceKey: `${Date.now()}-${Math.random()}` // Уникальный ключ
        });

        console.log('Платеж создан:', payment.id);

        // Возвращаем URL для редиректа на страницу оплаты
        res.json({
            success: true,
            paymentId: payment.id,
            paymentUrl: payment.confirmation.confirmation_url
        });

    } catch (error) {
        console.error('Ошибка создания платежа:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Ошибка при создании платежа'
        });
    }
});

// Webhook для получения уведомлений о платежах
// Настройте в личном кабинете ЮKassa: Настройки → Webhook
// URL: https://ваш-домен.com/api/payment-webhook
app.post('/api/payment-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = JSON.parse(req.body);
        
        console.log('Получен webhook:', event.type);

        if (event.type === 'payment.succeeded') {
            const payment = event.object;
            
            console.log('✅ Платеж успешно обработан!');
            console.log('Детали платежа:', {
                paymentId: payment.id,
                amount: payment.amount.value + ' ' + payment.amount.currency,
                email: payment.metadata.email,
                product: payment.metadata.product,
                status: payment.status
            });

            // Деньги уже поступили на ваш счет в ЮKassa!
            // Если настроен автоматический вывод, они будут переведены на вашу карту

            // Здесь вы можете:
            // 1. Активировать привилегию пользователю
            // 2. Отправить email с подтверждением
            // 3. Сохранить данные в базу данных
            // 4. Отправить уведомление вам о новом платеже
            
            // Пример отправки уведомления (нужно настроить)
            // await sendNotificationEmail({
            //     to: process.env.NOTIFICATION_EMAIL,
            //     subject: 'Новый платеж получен!',
            //     text: `Получен платеж на сумму ${payment.amount.value} ${payment.amount.currency}`
            // });
        }

        if (event.type === 'payment.canceled') {
            console.log('❌ Платеж отменен:', event.object.id);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Ошибка обработки webhook:', error);
        res.status(500).send('Error');
    }
});

// Страница успешной оплаты
app.get('/payment-success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Оплата успешна</title>
            <meta http-equiv="refresh" content="3;url=index.html?success=true">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                h1 { font-size: 3rem; margin-bottom: 20px; }
                p { font-size: 1.2rem; }
            </style>
        </head>
        <body>
            <h1>✅ Оплата успешно обработана!</h1>
            <p>Привилегия Monster активирована.</p>
            <p>Деньги поступят на ваш счет в течение нескольких минут.</p>
            <p>Перенаправление на главную страницу...</p>
        </body>
        </html>
    `);
});

// Получение статуса платежа
app.get('/api/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await checkout.getPayment(paymentId);
        
        res.json({
            success: true,
            status: payment.status,
            paid: payment.paid,
            amount: payment.amount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Информация о настройке
app.get('/api/info', (req, res) => {
    res.json({
        message: 'Сервер работает!',
        instructions: 'Настройте SHOP_ID и SECRET_KEY в файле .env',
        docs: 'См. файл CARD_SETUP.md для инструкций по привязке карты'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Не забудьте:`);
    console.log(`   1. Зарегистрироваться на yookassa.ru`);
    console.log(`   2. Привязать свою карту в личном кабинете`);
    console.log(`   3. Настроить автоматический вывод средств`);
    console.log(`   4. Заменить SHOP_ID и SECRET_KEY в файле .env`);
    console.log(`   5. Настроить webhook: ${process.env.SITE_URL || 'http://localhost:3000'}/api/payment-webhook`);
});
