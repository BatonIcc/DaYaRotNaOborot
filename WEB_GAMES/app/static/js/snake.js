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
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');

    const upBtn = document.getElementById('upBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');

    const gridSize = 20;
    const boardWidth = gameBoard.clientWidth;
    const boardHeight = gameBoard.clientHeight;
    const cellSize = boardWidth / gridSize;

    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 150;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let isPaused = false;
    let isGameOver = false;

    function initGame() {
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];

        createFood();

        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;

        direction = 'right';
        nextDirection = 'right';

        gameOverElement.classList.remove('show');

        drawGame();
    }

    function createFood() {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };

        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return createFood();
            }
        }
    }

    function drawGame() {
        gameBoard.innerHTML = '';

        snake.forEach((segment, index) => {
            const segmentElement = document.createElement('div');
            segmentElement.className = 'snake-segment';

            if (index === 0) {
                segmentElement.classList.add('snake-head');
            }

            segmentElement.style.left = `${segment.x * cellSize}px`;
            segmentElement.style.top = `${segment.y * cellSize}px`;
            gameBoard.appendChild(segmentElement);
        });

        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.style.left = `${food.x * cellSize}px`;
        foodElement.style.top = `${food.y * cellSize}px`;
        gameBoard.appendChild(foodElement);

        gameBoard.appendChild(gameOverElement);
    }

    function updateGame() {
        if (isPaused || isGameOver) return;

        direction = nextDirection;

        const head = {...snake[0]};

        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }

        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver();
            return;
        }

        for (let segment of snake) {
            if (segment.x === head.x && segment.y === head.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;

            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }

            createFood();

            if (gameSpeed > 70 && score % 50 === 0) {
                gameSpeed -= 5;
                clearInterval(gameInterval);
                gameInterval = setInterval(updateGame, gameSpeed);
            }
        } else {
            snake.pop();
        }

        drawGame();
    }

    function handleKeyPress(e) {
        switch (e.key) {
            case 'w':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 's':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'a':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'd':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                togglePause();
                break;
        }
    }

    function startGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
        }

        isGameOver = false;
        isPaused = false;
        pauseBtn.textContent = 'Пауза';
        initGame();
        gameInterval = setInterval(updateGame, gameSpeed);
    }

    function togglePause() {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Продолжить' : 'Пауза';
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);

        finalScoreElement.textContent = `Ваш счет: ${score}`;
        gameOverElement.classList.add('show');
    }

    document.addEventListener('keydown', handleKeyPress);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);

    upBtn.addEventListener('click', () => { if (direction !== 'down') nextDirection = 'up'; });
    downBtn.addEventListener('click', () => { if (direction !== 'up') nextDirection = 'down'; });
    leftBtn.addEventListener('click', () => { if (direction !== 'right') nextDirection = 'left'; });
    rightBtn.addEventListener('click', () => { if (direction !== 'left') nextDirection = 'right'; });

    initGame();
});