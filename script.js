const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const powerUpStatusElement = document.getElementById('powerUpStatus');
const startButton = document.getElementById('startButton');
const instructionsButton = document.getElementById('instructionsButton');
const backButton = document.getElementById('backButton');
const pauseButton = document.getElementById('pauseButton');
const menu = document.getElementById('menu');
const gameUI = document.getElementById('gameUI');
const instructions = document.getElementById('instructions');

// Ajustar el tamaño del canvas
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

// Variables del juego
let pacman, ghosts, points, powerUps, score, lives, gameActive, paused;
let invincible = false;
let invincibleTimer = 0;
let speedBoost = false;
let speedBoostTimer = 0;
let freezeGhosts = false;
let freezeTimer = 0;

// Inicializar el juego
function initGame() {
    pacman = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 20,
        color: 'yellow',
        speed: 3,
        direction: 'right'
    };

    ghosts = [
        { x: 100, y: 100, size: 20, color: 'red', speed: 1.5 },
        { x: 300, y: 100, size: 20, color: 'blue', speed: 2 }
    ];

    points = [];
    powerUps = [];
    score = 0;
    lives = 3;
    gameActive = true;
    paused = false;

    // Generar puntos
    for (let i = 0; i < 20; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    // Generar power-ups
    powerUps.push({ x: 50, y: 50, type: 'invincible' });
    powerUps.push({ x: canvas.width - 50, y: canvas.height - 50, type: 'speed' });
    powerUps.push({ x: canvas.width / 2, y: canvas.height / 2, type: 'freeze' });

    // Mostrar la interfaz del juego
    menu.classList.add('hidden');
    gameUI.classList.remove('hidden');
    instructions.classList.add('hidden');
}

// Dibujar Pacman
function drawPacman() {
    ctx.fillStyle = pacman.color;
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();
}

// Dibujar fantasmas
function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x, ghost.y, ghost.size, ghost.size);
    });
}

// Dibujar puntos
function drawPoints() {
    ctx.fillStyle = 'white';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Dibujar power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'invincible' ? 'gold' : powerUp.type === 'speed' ? 'lime' : 'cyan';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Mover Pacman
function movePacman() {
    if (paused) return;

    if (pacman.direction === 'right') pacman.x += pacman.speed;
    if (pacman.direction === 'left') pacman.x -= pacman.speed;
    if (pacman.direction === 'up') pacman.y -= pacman.speed;
    if (pacman.direction === 'down') pacman.y += pacman.speed;

    // Detectar colisión con los bordes
    if (pacman.x < 0) pacman.x = canvas.width;
    if (pacman.x > canvas.width) pacman.x = 0;
    if (pacman.y < 0) pacman.y = canvas.height;
    if (pacman.y > canvas.height) pacman.y = 0;
}

// Mover fantasmas
function moveGhosts() {
    if (freezeGhosts) return;

    ghosts.forEach(ghost => {
        const direction = Math.floor(Math.random() * 4);
        if (direction === 0) ghost.x += ghost.speed;
        if (direction === 1) ghost.x -= ghost.speed;
        if (direction === 2) ghost.y -= ghost.speed;
        if (direction === 3) ghost.y += ghost.speed;

        // Detectar colisión con los bordes
        if (ghost.x < 0) ghost.x = canvas.width;
        if (ghost.x > canvas.width) ghost.x = 0;
        if (ghost.y < 0) ghost.y = canvas.height;
        if (ghost.y > canvas.height) ghost.y = 0;
    });
}

// Verificar colisiones
function checkCollisions() {
    ghosts.forEach(ghost => {
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pacman.size + ghost.size) {
            if (invincible) {
                ghost.x = -100; // Eliminar fantasma temporalmente
            } else {
                lives--;
                livesElement.textContent = `Vidas: ${lives}`;
                if (lives === 0) {
                    gameActive = false;
                    alert(`¡Game Over! Puntos: ${score}`);
                    document.location.reload();
                }
            }
        }
    });

    // Verificar si Pacman come un punto
    points.forEach((point, index) => {
        const dx = pacman.x - point.x;
        const dy = pacman.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pacman.size + 5) {
            points.splice(index, 1);
            score += 10;
            scoreElement.textContent = `Puntos: ${score}`;
        }
    });

    // Verificar si Pacman toma un power-up
    powerUps.forEach((powerUp, index) => {
        const dx = pacman.x - powerUp.x;
        const dy = pacman.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pacman.size + 10) {
            if (powerUp.type === 'invincible') {
                invincible = true;
                invincibleTimer = 300; // 5 segundos
                powerUpStatusElement.textContent = "Invencible: 5s";
            } else if (powerUp.type === 'speed') {
                speedBoost = true;
                pacman.speed *= 2;
                speedBoostTimer = 300; // 5 segundos
                powerUpStatusElement.textContent = "Velocidad: 5s";
            } else if (powerUp.type === 'freeze') {
                freezeGhosts = true;
                freezeTimer = 300; // 5 segundos
                powerUpStatusElement.textContent = "Fantasmas Congelados: 5s";
            }
            powerUps.splice(index, 1);
        }
    });
}

// Actualizar temporizadores de power-ups
function updatePowerUps() {
    if (invincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) {
            invincible = false;
            powerUpStatusElement.textContent = "";
        }
    }

    if (speedBoost) {
        speedBoostTimer--;
        if (speedBoostTimer <= 0) {
            speedBoost = false;
            pacman.speed /= 2;
            powerUpStatusElement.textContent = "";
        }
    }

    if (freezeGhosts) {
        freezeTimer--;
        if (freezeTimer <= 0) {
            freezeGhosts = false;
            powerUpStatusElement.textContent = "";
        }
    }
}

// Bucle principal del juego
function gameLoop() {
    if (!gameActive || paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPacman();
    movePacman();
    drawGhosts();
    moveGhosts();
    drawPoints();
    drawPowerUps();
    checkCollisions();
    updatePowerUps();
    requestAnimationFrame(gameLoop);
}

// Eventos de teclado
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') pacman.direction = 'right';
    if (event.key === 'ArrowLeft') pacman.direction = 'left';
    if (event.key === 'ArrowUp') pacman.direction = 'up';
    if (event.key === 'ArrowDown') pacman.direction = 'down';
});

// Eventos de botones
startButton.addEventListener('click', () => {
    initGame();
    gameLoop();
});

instructionsButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    instructions.classList.remove('hidden');
});

backButton.addEventListener('click', () => {
    instructions.classList.add('hidden');
    menu.classList.remove('hidden');
});

pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? "Reanudar" : "Pausa";
});