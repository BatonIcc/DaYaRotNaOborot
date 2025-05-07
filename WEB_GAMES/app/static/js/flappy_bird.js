function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');

document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('gameBoard');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const gameOverElement = document.getElementById('gameOver');
    const startScreen = document.getElementById('startScreen');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const jumpBtn = document.getElementById('jumpBtn');

    const boardWidth = gameBoard.clientWidth;
    const boardHeight = gameBoard.clientHeight;
    const gravity = 0.5;
    const jumpForce = -10;
    const pipeWidth = 60;
    const pipeGap = 150;
    const pipeSpeed = 3;
    const cloudSpeed = 1;

    let bird = {
        x: 100,
        y: boardHeight / 2,
        width: 40,
        height: 30,
        velocity: 0
    };

    let pipes = [];
    let clouds = [];
    let score = 0;
    let highScore = localStorage.getItem('flappyHighScore') || 0;
    let gameInterval;
    let isGameOver = false;
    let isGameStarted = false;

    function initGame() {
        bird = {
            x: 100,
            y: boardHeight / 2,
            width: 40,
            height: 30,
            velocity: 0
        };

        pipes = [];
        clouds = [];
        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        isGameOver = false;

        for (let i = 0; i < 3; i++) {
            createCloud(true);
        }

        drawGame();
    }

    function createBird() {
        const birdElement = document.createElement('div');
        birdElement.className = 'bird';
        birdElement.style.left = `${bird.x}px`;
        birdElement.style.top = `${bird.y}px`;
        birdElement.style.width = `${bird.width}px`;
        birdElement.style.height = `${bird.height}px`;
        return birdElement;
    }

    function createPipe() {
        const pipeHeight = Math.floor(Math.random() * (boardHeight - pipeGap - 200)) + 50;

        const topPipe = {
            x: boardWidth,
            y: 0,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        };

        const bottomPipe = {
            x: boardWidth,
            y: pipeHeight + pipeGap,
            width: pipeWidth,
            height: boardHeight - pipeHeight - pipeGap - 50, // 50 - высота земли
            passed: false
        };

        pipes.push(topPipe, bottomPipe);
    }

    function createCloud(initial = false) {
        const size = Math.floor(Math.random() * 50) + 50;
        const y = Math.floor(Math.random() * (boardHeight / 2));
        const x = initial ? Math.floor(Math.random() * boardWidth) : boardWidth;

        clouds.push({
            x: x,
            y: y,
            width: size,
            height: size / 2,
            speed: Math.random() * cloudSpeed + 0.5
        });
    }

    function drawGame() {
        const elementsToRemove = document.querySelectorAll('.bird, .pipe, .cloud');
        elementsToRemove.forEach(el => el.remove());

        gameBoard.appendChild(createBird());

        pipes.forEach(pipe => {
            const pipeElement = document.createElement('div');
            pipeElement.className = `pipe ${pipe.y === 0 ? 'pipe-top' : 'pipe-bottom'}`;
            pipeElement.style.left = `${pipe.x}px`;
            pipeElement.style.top = `${pipe.y}px`;
            pipeElement.style.width = `${pipe.width}px`;
            pipeElement.style.height = `${pipe.height}px`;
            gameBoard.appendChild(pipeElement);
        });

        clouds.forEach(cloud => {
            const cloudElement = document.createElement('div');
            cloudElement.className = 'cloud';
            cloudElement.style.left = `${cloud.x}px`;
            cloudElement.style.top = `${cloud.y}px`;
            cloudElement.style.width = `${cloud.width}px`;
            cloudElement.style.height = `${cloud.height}px`;
            gameBoard.appendChild(cloudElement);
        });
    }

    function updateGame() {
        if (isGameOver) return;

        bird.velocity += gravity;
        bird.y += bird.velocity;

        const birdElement = document.querySelector('.bird');
        if (birdElement) {
            const rotation = Math.min(Math.max(bird.velocity * 5, -30), 30);
            birdElement.style.transform = `rotate(${rotation}deg)`;
        }

        if (bird.y + bird.height > boardHeight - 50 || bird.y < 0) {
            gameOver();
            return;
        }

        if (pipes.length === 0 || pipes[pipes.length - 1].x < boardWidth - 300) {
            createPipe();
        }

        if (Math.random() < 0.005) {
            createCloud();
        }

        pipes.forEach(pipe => {
            pipe.x -= pipeSpeed;

            if (
                bird.x + bird.width > pipe.x &&
                bird.x < pipe.x + pipe.width &&
                bird.y + bird.height > pipe.y &&
                bird.y < pipe.y + pipe.height
            ) {
                gameOver();
                return;
            }

            if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                pipe.passed = true;
                if (pipe.y === 0) {
                    score++;
                    scoreElement.textContent = score;

                    if (score > highScore) {
                        highScore = score;
                        highScoreElement.textContent = highScore;
                        localStorage.setItem('flappyHighScore', highScore);
                    }
                }
            }
        });

        pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

        clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
        });

        clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);

        drawGame();
    }

    function jump() {
        if (!isGameStarted) {
            startGame();
            return;
        }

        if (isGameOver) return;

        bird.velocity = jumpForce;

        const birdElement = document.querySelector('.bird');
        if (birdElement) {
            birdElement.style.transform = 'rotate(-30deg)';
        }
    }

    function startGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
        }

        isGameStarted = true;
        startScreen.style.display = 'none';
        initGame();
        gameInterval = setInterval(updateGame, 20);
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);

        finalScoreElement.textContent = `Ваш счет: ${score}`;
        gameOverElement.classList.add('show');
    }

    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });

    gameBoard.addEventListener('click', jump);
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', function() {
        gameOverElement.classList.remove('show');
        startGame();
    });
    jumpBtn.addEventListener('click', jump);

    initGame();
});