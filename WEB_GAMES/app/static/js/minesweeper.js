function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');

document.addEventListener('DOMContentLoaded', function() {
    let board = [];
    let revealedCells = 0;
    let totalCells = 0;
    let minesCount = 0;
    let flaggedCells = 0;
    let gameOver = false;
    let gameWon = false;
    let timerInterval;
    let seconds = 0;

    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const minesInput = document.getElementById('minesInput');
    const minesLeftSpan = document.getElementById('minesLeft');
    const timeSpan = document.getElementById('time');
    const finalTimeSpan = document.getElementById('finalTime');
    const gameBoard = document.getElementById('gameBoard');
    const startBtn = document.getElementById('startBtn');
    const gameOverDiv = document.getElementById('gameOver');
    const gameResultDiv = document.getElementById('gameResult');
    const restartBtn = document.getElementById('restartBtn');

    function startNewGame() {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        minesCount = parseInt(minesInput.value);

        const maxMines = Math.floor(width * height * 0.35);
        if (minesCount > maxMines) {
            minesCount = maxMines;
            minesInput.value = maxMines;
        }

        board = [];
        revealedCells = 0;
        totalCells = width * height;
        flaggedCells = 0;
        gameOver = false;
        gameWon = false;
        seconds = 0;
        timeSpan.textContent = '0';

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        minesLeftSpan.textContent = minesCount;
        gameOverDiv.classList.remove('show');

        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell_mine');
                cell.dataset.x = x;
                cell.dataset.y = y;

                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleRightClick);

                gameBoard.appendChild(cell);
                row.push({
                    element: cell,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            board.push(row);
        }

        placeMines(width, height, minesCount);

        calculateNeighborMines(width, height);
    }

    function placeMines(width, height, mines) {
        let minesPlaced = 0;

        while (minesPlaced < mines) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);

            if (!board[y][x].isMine) {
                board[y][x].isMine = true;
                minesPlaced++;
            }
        }
    }

    function calculateNeighborMines(width, height) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (board[y][x].isMine) continue;

                let count = 0;

                for (const [dx, dy] of directions) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height && board[ny][nx].isMine) {
                        count++;
                    }
                }

                board[y][x].neighborMines = count;
            }
        }
    }

    function handleCellClick(e) {
        if (gameOver) return;

        const cell = e.target;
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const cellData = board[y][x];

        if (cellData.isRevealed || cellData.isFlagged) return;

        if (revealedCells === 0) {
            startTimer();
        }

        if (cellData.isMine) {
            revealAllMines();
            endGame(false);
            return;
        }

        revealCell(x, y);

        if (revealedCells === totalCells - minesCount) {
            endGame(true);
        }
    }

    function handleRightClick(e) {
        e.preventDefault();

        if (gameOver) return;

        const cell = e.target;
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const cellData = board[y][x];

        if (cellData.isRevealed) return;

        cellData.isFlagged = !cellData.isFlagged;

        if (cellData.isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
            flaggedCells++;
        } else {
            cell.classList.remove('flagged');
            cell.textContent = '';
            flaggedCells--;
        }

        minesLeftSpan.textContent = minesCount - flaggedCells;
    }

    function revealCell(x, y) {
        const cellData = board[y][x];

        if (cellData.isRevealed || cellData.isFlagged) return;

        cellData.isRevealed = true;
        cellData.element.classList.add('revealed');
        revealedCells++;

        if (cellData.neighborMines > 0) {
            cellData.element.textContent = cellData.neighborMines;
            cellData.element.classList.add(`number-${cellData.neighborMines}`);
        } else {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];

            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
                    revealCell(nx, ny);
                }
            }
        }
    }

    function revealAllMines() {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[0].length; x++) {
                const cellData = board[y][x];

                if (cellData.isMine) {
                    cellData.element.textContent = '💣';
                    cellData.element.classList.add('mine');
                }
            }
        }
    }

    function startTimer() {
        seconds = 0;
        timeSpan.textContent = '0';

        timerInterval = setInterval(() => {
            seconds++;
            timeSpan.textContent = seconds;
        }, 1000);
    }

    function endGame(won) {
        gameOver = true;
        gameWon = won;

        clearInterval(timerInterval);

        gameResultDiv.textContent = won ? 'Вы выиграли!' : 'Вы проиграли!';
        gameResultDiv.className = won ? 'result win' : 'result lose';
        finalTimeSpan.textContent = seconds;

        gameOverDiv.classList.add('show');
    }

    startBtn.addEventListener('click', startNewGame);
    restartBtn.addEventListener('click', startNewGame);

    startNewGame();
});