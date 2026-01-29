// Flappy Demon Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Игровые переменные
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let bestScore = localStorage.getItem('flappyDemonBestScore') || 0;
let frames = 0;

// Демон
const demon = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8,
    rotation: 0
};

// Трубы
const pipes = [];
const pipeWidth = 60;
const pipeGap = 200;
const pipeSpeed = 3;

// Инициализация
function init() {
    document.getElementById('bestScoreDisplay').textContent = bestScore;
    canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyPress);
    gameLoop();
}

// Обработка клика
function handleClick() {
    if (gameState === 'start' || gameState === 'gameover') {
        startGame();
    } else if (gameState === 'playing') {
        jump();
    }
}

// Обработка нажатия клавиши
function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'gameover') {
            startGame();
        } else if (gameState === 'playing') {
            jump();
        }
    }
}

// Начать игру
function startGame() {
    gameState = 'playing';
    score = 0;
    frames = 0;
    pipes.length = 0;
    demon.y = canvas.height / 2;
    demon.velocity = 0;
    demon.rotation = 0;
    document.getElementById('gameOverScreen').classList.remove('show');
    document.getElementById('currentScore').textContent = score;
}

// Прыжок демона
function jump() {
    demon.velocity = demon.jumpPower;
    demon.rotation = -20;
}

// Создать трубу
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

// Обновление игры
function update() {
    if (gameState !== 'playing') return;

    frames++;

    // Обновление демона
    demon.velocity += demon.gravity;
    demon.y += demon.velocity;
    demon.rotation += 0.5;
    if (demon.rotation > 90) demon.rotation = 90;

    // Создание новых труб
    if (frames % 100 === 0) {
        createPipe();
    }

    // Обновление труб
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Проверка столкновения
        if (
            demon.x < pipe.x + pipeWidth &&
            demon.x + demon.width > pipe.x &&
            (demon.y < pipe.topHeight || demon.y + demon.height > pipe.bottomY)
        ) {
            gameOver();
            return;
        }

        // Подсчет очков
        if (!pipe.passed && pipe.x + pipeWidth < demon.x) {
            pipe.passed = true;
            score++;
            document.getElementById('currentScore').textContent = score;
        }

        // Удаление труб за экраном
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    // Проверка границ
    if (demon.y + demon.height > canvas.height || demon.y < 0) {
        gameOver();
    }
}

// Окончание игры
function gameOver() {
    gameState = 'gameover';
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyDemonBestScore', bestScore);
        document.getElementById('bestScoreDisplay').textContent = bestScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('gameOverScreen').classList.add('show');
}

// Перезапуск игры
function restartGame() {
    startGame();
}

// Отрисовка
function draw() {
    // Очистка canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Градиент неба
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98D8E8');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Облака
    drawClouds();

    // Трубы
    for (const pipe of pipes) {
        drawPipe(pipe);
    }

    // Демон
    drawDemon();

    // Экран начала игры
    if (gameState === 'start') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('👹', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('Нажмите для старта', canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Отрисовка облаков
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const cloudPositions = [
        { x: 50 + (frames * 0.5) % 400, y: 100 },
        { x: 200 + (frames * 0.3) % 400, y: 150 },
        { x: 350 + (frames * 0.4) % 400, y: 80 }
    ];

    for (const cloud of cloudPositions) {
        drawCloud(cloud.x, cloud.y);
    }
}

// Отрисовка одного облака
function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Отрисовка трубы
function drawPipe(pipe) {
    // Верхняя труба
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    
    // Нижняя труба
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

    // Обводка труб
    ctx.strokeStyle = '#1a3009';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.strokeRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

    // Капители труб
    ctx.fillStyle = '#3d7026';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
    ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
    
    ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
    ctx.strokeRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
}

// Отрисовка демона
function drawDemon() {
    ctx.save();
    ctx.translate(demon.x + demon.width / 2, demon.y + demon.height / 2);
    ctx.rotate((demon.rotation * Math.PI) / 180);
    
    // Тело демона
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(0, 0, demon.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI * 2);
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-8, -5, 2, 0, Math.PI * 2);
    ctx.arc(8, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Рот
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 5, 8, 0, Math.PI);
    ctx.stroke();
    
    // Рога
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.lineTo(-15, -25);
    ctx.lineTo(-5, -20);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(10, -15);
    ctx.lineTo(15, -25);
    ctx.lineTo(5, -20);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Запуск игры
init();

