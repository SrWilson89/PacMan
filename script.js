const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Ajustar el tamaño del canvas al tamaño de la pantalla
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.7;

const pacman = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'yellow',
    speed: 3,
    direction: 'right'
};

const ghosts = [
    { x: 100, y: 100, size: 20, color: 'red', speed: 1.5 },
    { x: 300, y: 100, size: 20, color: 'blue', speed: 2 }
];

const points = [];
const pointSize = 5;
let score = 0;

// Generar puntos aleatorios
for (let i = 0; i < 20; i++) {
    points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    });
}

function drawPacman() {
    ctx.fillStyle = pacman.color;
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x, ghost.y, ghost.size, ghost.size);
    });
}

function drawPoints() {
    ctx.fillStyle = 'white';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function movePacman() {
    if (pacman.direction === 'right') pacman.x += pacman.speed;
    if (pacman.direction === 'left') pacman.x -= pacman.speed;
    if (pacman.direction === 'up') pacman.y -= pacman.speed;
    if (pacman.direction === 'down') pacman.y += pacman.speed;

    // Detectar colisión con los bordes del canvas
    if (pacman.x < 0) pacman.x = canvas.width;
    if (pacman.x > canvas.width) pacman.x = 0;
    if (pacman.y < 0) pacman.y = canvas.height;
    if (pacman.y > canvas.height) pacman.y = 0;
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        const direction = Math.floor(Math.random() * 4);
        if (direction === 0) ghost.x += ghost.speed;
        if (direction === 1) ghost.x -= ghost.speed;
        if (direction === 2) ghost.y -= ghost.speed;
        if (direction === 3) ghost.y += ghost.speed;

        // Detectar colisión con los bordes del canvas
        if (ghost.x < 0) ghost.x = canvas.width;
        if (ghost.x > canvas.width) ghost.x = 0;
        if (ghost.y < 0) ghost.y = canvas.height;
        if (ghost.y > canvas.height) ghost.y = 0;
    });
}

function checkCollisions() {
    ghosts.forEach(ghost => {
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pacman.size + ghost.size) {
            alert("¡Game Over! Puntos: " + score);
            document.location.reload();
        }
    });

    // Verificar si Pacman come un punto
    points.forEach((point, index) => {
        const dx = pacman.x - point.x;
        const dy = pacman.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < pacman.size + pointSize) {
            points.splice(index, 1); // Eliminar el punto
            score += 10;
            scoreElement.textContent = "Puntos: " + score;
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPacman();
    movePacman();
    drawGhosts();
    moveGhosts();
    drawPoints();
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') pacman.direction = 'right';
    if (event.key === 'ArrowLeft') pacman.direction = 'left';
    if (event.key === 'ArrowUp') pacman.direction = 'up';
    if (event.key === 'ArrowDown') pacman.direction = 'down';
});

gameLoop();