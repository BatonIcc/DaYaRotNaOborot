function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');

document.addEventListener('DOMContentLoaded', function() {
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    const SHAPES = {
        I: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        J: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        L: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        O: [
            [1, 1],
            [1, 1]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        T: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ]
    };

    const COLORS = {
        I: 'I',
        J: 'J',
        L: 'L',
        O: 'O',
        S: 'S',
        T: 'T',
        Z: 'Z'
    };

    const tetrisBoard = document.getElementById('tetrisBoard');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const nextPieceElement = document.getElementById('nextPiece');
    const finalScoreElement = document.getElementById('finalScore');
    const gameOverElement = document.getElementById('gameOver');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');

    const rotateBtn = document.getElementById('rotateBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');

    let board = createBoard();
    let piece = null;
    let nextPiece = null;
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameInterval;
    let isPaused = false;
    let isGameOver = false;
    let dropStart = Date.now();

    function initGame() {
        board = createBoard();

        piece = createPiece();
        nextPiece = createPiece();

        score = 0;
        lines = 0;
        level = 1;
        scoreElement.textContent = score;
        levelElement.textContent = level;

        gameOverElement.classList.remove('show');

        drawNextPiece();

        draw();
    }

    function createBoard() {
        return Array.from(Array(ROWS), () => Array(COLS).fill(0));
    }

    function createPiece() {
        const shapeKeys = Object.keys(SHAPES);
        const randIndex = Math.floor(Math.random() * shapeKeys.length);
        const key = shapeKeys[randIndex];

        return {
            shape: SHAPES[key],
            color: key,
            pos: {x: Math.floor(COLS / 2) - 1, y: 0}
        };
    }

    function draw() {
        tetrisBoard.innerHTML = '';

        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const cell_ttt = document.createElement('div');
                    cell_ttt.className = `cell_ttt filled ${COLORS[value] || ''}`;
                    cell_ttt.style.gridRow = y + 1;
                    cell_ttt.style.gridColumn = x + 1;
                    tetrisBoard.appendChild(cell_ttt);
                } else {
                    const cell_ttt = document.createElement('div');
                    cell_ttt.className = 'cell_ttt';
                    cell_ttt.style.gridRow = y + 1;
                    cell_ttt.style.gridColumn = x + 1;
                    tetrisBoard.appendChild(cell_ttt);
                }
            });
        });

        if (piece) {
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const cell_ttt = document.createElement('div');
                        cell_ttt.className = `cell_ttt filled ${piece.color}`;
                        cell_ttt.style.gridRow = piece.pos.y + y + 1;
                        cell_ttt.style.gridColumn = piece.pos.x + x + 1;
                        tetrisBoard.appendChild(cell_ttt);
                    }
                });
            });
        }
    }

    function drawNextPiece() {
        nextPieceElement.innerHTML = '';

        if (nextPiece) {
            nextPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const cell_ttt = document.createElement('div');
                        cell_ttt.className = `cell_ttt filled ${nextPiece.color}`;
                        cell_ttt.style.gridRow = y + 1;
                        cell_ttt.style.gridColumn = x + 1;
                        nextPieceElement.appendChild(cell_ttt);
                    } else {
                        const cell_ttt = document.createElement('div');
                        cell_ttt.className = 'cell_ttt';
                        cell_ttt.style.gridRow = y + 1;
                        cell_ttt.style.gridColumn = x + 1;
                        nextPieceElement.appendChild(cell_ttt);
                    }
                });
            });
        }
    }

    function drop() {
        const now = Date.now();
        const delta = now - dropStart;
        const speed = Math.max(1000 - (level - 1) * 100, 100);

        if (delta > speed) {
            moveDown();
            dropStart = now;
        }

        if (!isGameOver && !isPaused) {
            requestAnimationFrame(drop);
        }
    }

    function collision(x, y, shape) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] !== 0) {
                    const newX = x + j;
                    const newY = y + i;

                    if (
                        newX < 0 ||
                        newX >= COLS ||
                        newY >= ROWS ||
                        (newY >= 0 && board[newY][newX])
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function rotate() {
        const originalShape = piece.shape;
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;
        const newShape = Array.from(Array(cols), () => Array(rows).fill(0));

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                newShape[x][y] = piece.shape[y][x];
            }
        }

        newShape.forEach(row => row.reverse());

        if (!collision(piece.pos.x, piece.pos.y, newShape)) {
            piece.shape = newShape;
            draw();
        }
    }

    function moveLeft() {
        if (!collision(piece.pos.x - 1, piece.pos.y, piece.shape)) {
            piece.pos.x--;
            draw();
        }
    }

    function moveRight() {
        if (!collision(piece.pos.x + 1, piece.pos.y, piece.shape)) {
            piece.pos.x++;
            draw();
        }
    }

    function moveDown() {
        if (!collision(piece.pos.x, piece.pos.y + 1, piece.shape)) {
            piece.pos.y++;
            draw();
            return true;
        } else {
            lockPiece();
            return false;
        }
    }

    function hardDrop() {
        while (moveDown()) {}
    }

    function lockPiece() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = piece.pos.y + y;
                    const boardX = piece.pos.x + x;

                    if (boardY >= 0) {
                        board[boardY][boardX] = piece.color;
                    }
                }
            });
        });

        checkRows();

        piece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();

        if (collision(piece.pos.x, piece.pos.y, piece.shape)) {
            gameOver();
        }
    }

    function checkRows() {
        let linesCleared = 0;

        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(cell_ttt => cell_ttt !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            updateScore(linesCleared);
        }
    }

    function updateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200];
        lines += linesCleared;

        level = Math.floor(lines / 10) + 1;

        score += points[linesCleared] * level;
        scoreElement.textContent = score;
        levelElement.textContent = level;
    }

    function handleKeyPress(e) {
        if (isGameOver || isPaused) return;

        switch (e.key) {
            case 'a':
                moveLeft();
                break;
            case 'd':
                moveRight();
                break;
            case 's':
                moveDown();
                break;
            case 'w':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
            case 'p':
            case 'P':
                togglePause();
                break;
        }
    }

    function startGame() {
        if (gameInterval) {
            cancelAnimationFrame(gameInterval);
        }

        isGameOver = false;
        isPaused = false;
        pauseBtn.textContent = 'Пауза';
        initGame();
        dropStart = Date.now();
        gameInterval = requestAnimationFrame(drop);
    }

    function togglePause() {
        if (isGameOver) return;

        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Продолжить' : 'Пауза';

        if (!isPaused) {
            dropStart = Date.now();
            gameInterval = requestAnimationFrame(drop);
        }
    }

    function gameOver() {
        isGameOver = true;
        cancelAnimationFrame(gameInterval);

        finalScoreElement.textContent = `Ваш счет: ${score}`;
        gameOverElement.classList.add('show');
    }

    document.addEventListener('keydown', handleKeyPress);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);

    rotateBtn.addEventListener('click', rotate);
    leftBtn.addEventListener('click', moveLeft);
    rightBtn.addEventListener('click', moveRight);
    downBtn.addEventListener('click', moveDown);

    initGame();
});