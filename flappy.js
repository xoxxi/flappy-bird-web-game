const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRAVITY = 0.25;
const FLAP = -4.5;
const BIRD_SIZE = 32;
const PIPE_WIDTH = 52;
const PIPE_GAP = 110;
let birdY, birdV, pipes, score, game, gameOverFlag;

function resetGame() {
    birdY = canvas.height / 2 - BIRD_SIZE / 2;
    birdV = 0;
    pipes = [{ x: canvas.width + 60, h: randomHeight() }];
    score = 0;
    gameOverFlag = false;
    draw();
}

function randomHeight() {
    return Math.floor(Math.random() * (canvas.height - PIPE_GAP - 80)) + 40;
}

function draw() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    ctx.fillStyle = '#5ee432';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.h);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.h + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.h - PIPE_GAP);
    });

    // Draw bird
    ctx.save();
    ctx.translate(50 + BIRD_SIZE/2, birdY + BIRD_SIZE/2);
    ctx.rotate(Math.min(birdV/10, 0.4));
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw score
    document.getElementById('score').innerText = `점수: ${score}`;
}

function update() {
    birdV += GRAVITY;
    birdY += birdV;

    // Bird collision with ground/ceiling
    if (birdY + BIRD_SIZE > canvas.height || birdY < 0) {
        endGame();
        return;
    }

    // Move pipes
    pipes.forEach(pipe => pipe.x -= 2);
    // Add new pipe
    if (pipes[pipes.length-1].x < canvas.width - 180) {
        pipes.push({ x: canvas.width, h: randomHeight() });
    }
    // Remove off-screen pipes
    if (pipes[0].x < -PIPE_WIDTH) pipes.shift();

    // Collision detection
    pipes.forEach(pipe => {
        if (50 + BIRD_SIZE > pipe.x && 50 < pipe.x + PIPE_WIDTH) {
            if (birdY < pipe.h || birdY + BIRD_SIZE > pipe.h + PIPE_GAP) {
                endGame();
            }
        }
    });

    // Score
    pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            score++;
            pipe.passed = true;
        }
    });
}

function gameLoop() {
    update();
    draw();
    if (!gameOverFlag) {
        game = requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '2em Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('게임 오버!', canvas.width/2, canvas.height/2);
        ctx.font = '1.1em Segoe UI, Arial';
        ctx.fillText(`최종 점수: ${score}`, canvas.width/2, canvas.height/2 + 40);
    }
}

function flap() {
    if (!gameOverFlag) {
        birdV = FLAP;
    } else {
        restartGame();
    }
}

function endGame() {
    gameOverFlag = true;
    cancelAnimationFrame(game);
}

function restartGame() {
    resetGame();
    cancelAnimationFrame(game);
    game = requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', e => {
    if (e.code === 'Space') flap();
});
canvas.addEventListener('touchstart', flap);

resetGame();
game = requestAnimationFrame(gameLoop);
