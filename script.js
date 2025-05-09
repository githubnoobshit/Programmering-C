const canvas       = document.getElementById('gameCanvas');
const ctx          = canvas.getContext('2d');

let submarine, bullets, enemies, enemyBullets;
let convoyScore, destroyerScore, totalScore, gameOver, frameCount, animationId;

const shootInterval   = 30;
const submarineColor  = getComputedStyle(document.documentElement)
                           .getPropertyValue('--submarine-color').trim();
const torpedoColor    = getComputedStyle(document.documentElement)
                           .getPropertyValue('--torpedo-color').trim();
const convoyColor     = getComputedStyle(document.documentElement)
                           .getPropertyValue('--convoy-color').trim();
const destroyerColor  = getComputedStyle(document.documentElement)
                           .getPropertyValue('--destroyer-color').trim();

let keys = { left: false, right: false, shoot: false };

function initGame() {
    submarine = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        width: 60,
        height: 10,
        speed: 4
    };
    bullets         = [];
    enemies         = [];
    enemyBullets    = [];
    convoyScore     = 0;
    destroyerScore  = 0;
    totalScore      = 0;
    gameOver        = false;
    frameCount      = 0;
    updateScoreDisplays();
}

function updateScoreDisplays() {
    document.getElementById('convoyScore').textContent = convoyScore;
    document.getElementById('destroyerScore').textContent = destroyerScore;
    document.getElementById('totalScore').textContent = totalScore;
}

function drawSubmarine() {
    // Krop
    ctx.fillStyle = submarineColor;
    ctx.fillRect(submarine.x - submarine.width/2, submarine.y, submarine.width, submarine.height);
    // Tårn
    ctx.fillRect(submarine.x - 10, submarine.y - 8, 20, 8);
}

function drawBullets() {
    ctx.fillStyle = torpedoColor;
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 6, 12));
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = e.type === 'destroyer' ? destroyerColor : convoyColor;
        // Skibskrop
        ctx.fillRect(e.x, e.y, 40, 15);
        // Bro/tårn
        ctx.fillRect(e.x + 12, e.y - 8, 16, 8);
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = "orange";
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
}

function drawScoreText() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Game Over`, canvas.width/2 - 60, canvas.height/2);
}

function moveSubmarine() {
    if (keys.left  && submarine.x - submarine.width/2 > 0)                    submarine.x -= submarine.speed;
    if (keys.right && submarine.x + submarine.width/2 < canvas.width)        submarine.x += submarine.speed;
}

function moveBullets() {
    bullets.forEach(b => b.y -= 6);
    bullets = bullets.filter(b => b.y > -12);
}

function moveEnemies() {
    enemies.forEach(e => e.x -= 2);
    enemies = enemies.filter(e => e.x + 40 > 0);
}

function moveEnemyBullets() {
    enemyBullets.forEach(b => b.y += 4);
    enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 10);
}

function spawnEnemy() {
    let type = Math.random() < 0.2 ? 'destroyer' : 'convoy';
    enemies.push({
        x: canvas.width + 40,
        y: Math.random() * 200 + 20,
        type: type,
        cooldown: 0
    });
}

function shootEnemyBullets() {
    enemies.forEach(e => {
        if (e.type === 'destroyer') {
            e.cooldown++;
            if (e.cooldown > 60) {
                enemyBullets.push({ x: e.x + 18, y: e.y + 15 });
                e.cooldown = 0;
            }
        }
    });
}

function detectHits() {
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x < e.x + 40 && b.x + 6 > e.x &&
                b.y < e.y + 15 && b.y + 12 > e.y) {
                bullets.splice(bi, 1);
                enemies.splice(ei, 1);
                if (e.type === 'destroyer') destroyerScore++;
                else convoyScore++;
                totalScore++;
                updateScoreDisplays();
            }
        });
    });
    enemyBullets.forEach(b => {
        if (b.x < submarine.x + submarine.width/2 &&
            b.x + 4 > submarine.x - submarine.width/2 &&
            b.y < submarine.y + submarine.height &&
            b.y + 10 > submarine.y) {
            gameOver = true;
        }
    });
}

function shoot() {
    bullets.push({ x: submarine.x - 3, y: submarine.y });
}

function gameLoop() {
    if (gameOver) {
        drawScoreText();
        return;
    }

    // Opdatering
    moveSubmarine();
    moveBullets();
    moveEnemies();
    moveEnemyBullets();
    shootEnemyBullets();
    detectHits();

    if (keys.shoot && frameCount % shootInterval === 0) shoot();
    if (Math.random() < 0.02) spawnEnemy();

    // Tegning
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSubmarine();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();

    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

// Key-state håndtering med preventDefault
document.addEventListener("keydown", e => {
    if (["ArrowLeft","ArrowRight"," ","ArrowUp"].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === "ArrowLeft")  keys.left  = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === " " || e.key === "ArrowUp") keys.shoot = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft")  keys.left  = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === " " || e.key === "ArrowUp") keys.shoot = false;
});

// Restart-knap
document.getElementById('restart-btn').addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    initGame();
    gameLoop();
});

// Start spillet
initGame();
gameLoop();
