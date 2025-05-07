function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');

document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('gameBoard');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverElement = document.getElementById('gameOver');
    const newGameBtn = document.getElementById('newGameBtn');
    const restartBtn = document.getElementById('restartBtn');

    const size = 4;
    let board = [];
    let score = 0;
    let bestScore = localStorage.getItem('2048-bestScore') || 0;
    let isGameOver = false;

    function initGame() {
        board = Array(size).fill().map(() => Array(size).fill(0));

        score = 0;
        scoreElement.textContent = score;
        bestScoreElement.textContent = bestScore;

        gameOverElement.classList.remove('show');
        isGameOver = false;

        addRandomTile();
        addRandomTile();

        renderBoard();
    }

    function addRandomTile() {
        const emptyCells = [];

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function renderBoard() {
        gameBoard.innerHTML = '';

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell_2048';

                if (board[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${board[i][j]}`;
                    tile.textContent = board[i][j];
                    cell.appendChild(tile);
                }

                gameBoard.appendChild(cell);
            }
        }

        gameBoard.appendChild(gameOverElement);
    }

    function moveTiles(direction) {
        if (isGameOver) return;

        let moved = false;
        const newBoard = Array(size).fill().map(() => Array(size).fill(0));

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < size; i++) {
                const row = board[i].filter(val => val !== 0);
                const newRow = [];

                if (direction === 'right') row.reverse();

                for (let j = 0; j < row.length; j++) {
                    if (j < row.length - 1 && row[j] === row[j + 1]) {
                        const mergedValue = row[j] * 2;
                        newRow.push(mergedValue);
                        score += mergedValue;
                        j++;
                        moved = true;
                    } else {
                        newRow.push(row[j]);
                    }
                }

                if (direction === 'right') newRow.reverse();

                while (newRow.length < size) {
                    if (direction === 'left') newRow.push(0);
                    else newRow.unshift(0);
                }

                if (!moved && !board[i].every((val, j) => val === newRow[j])) {
                    moved = true;
                }

                newBoard[i] = newRow;
            }
        } else { // up или down
            for (let j = 0; j < size; j++) {
                const column = [];
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== 0) column.push(board[i][j]);
                }

                const newColumn = [];

                if (direction === 'down') column.reverse();

                for (let i = 0; i < column.length; i++) {
                    if (i < column.length - 1 && column[i] === column[i + 1]) {
                        const mergedValue = column[i] * 2;
                        newColumn.push(mergedValue);
                        score += mergedValue;
                        i++;
                        moved = true;
                    } else {
                        newColumn.push(column[i]);
                    }
                }

                if (direction === 'down') newColumn.reverse();

                while (newColumn.length < size) {
                    if (direction === 'up') newColumn.push(0);
                    else newColumn.unshift(0);
                }

                if (!moved) {
                    for (let i = 0; i < size; i++) {
                        if (board[i][j] !== newColumn[i]) {
                            moved = true;
                            break;
                        }
                    }
                }

                for (let i = 0; i < size; i++) {
                    newBoard[i][j] = newColumn[i];
                }
            }
        }

        if (moved) {
            board = newBoard;
            addRandomTile();
            renderBoard();

            scoreElement.textContent = score;

            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('2048-bestScore', bestScore);
            }

            checkGameOver();
        }
    }

    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) return false;
            }
        }

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (j < size - 1 && board[i][j] === board[i][j + 1]) return false;
                if (i < size - 1 && board[i][j] === board[i + 1][j]) return false;
            }
        }

        gameOver();
        return true;
    }

    function gameOver() {
        isGameOver = true;
        finalScoreElement.textContent = `Ваш счет: ${score}`;
        gameOverElement.classList.add('show');
    }

    function handleKeyPress(e) {
        if (isGameOver) return;

        switch (e.key) {
            case 'w':
                moveTiles('up');
                break;
            case 's':
                moveTiles('down');
                break;
            case 'a':
                moveTiles('left');
                break;
            case 'd':
                moveTiles('right');
                break;
        }
    }

    document.addEventListener('keydown', handleKeyPress);
    newGameBtn.addEventListener('click', initGame);
    restartBtn.addEventListener('click', initGame);

    initGame();
});