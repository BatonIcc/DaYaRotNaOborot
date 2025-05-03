function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');

document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.getElementById('gameBoard');
    const cells = document.querySelectorAll('.cell');
    const currentPlayerElement = document.getElementById('currentPlayer');
    const computerThinkingElement = document.getElementById('computerThinking');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const gameOverElement = document.getElementById('gameOver');
    const winnerElement = document.getElementById('winner');
    const restartBtn = document.getElementById('restartBtn');
    const resetScoreBtn = document.getElementById('resetScoreBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const pvpModeBtn = document.getElementById('pvpMode');
    const pvcModeBtn = document.getElementById('pvcMode');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scoreX = 0;
    let scoreO = 0;
    let gameMode = 'pvp';

    function initGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        currentPlayerElement.textContent = currentPlayer;
        currentPlayerElement.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
        computerThinkingElement.style.display = 'none';

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });

        gameOverElement.classList.remove('show');

        if (gameMode === 'pvc' && currentPlayer === 'O') {
            computerMove();
        }
    }

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        makeMove(clickedCell, clickedCellIndex);

        checkResult();

        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    function makeMove(cell, index) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
    }

    function computerMove() {
        if (!gameActive) return;

        computerThinkingElement.style.display = 'inline-block';

        const data = {
            board: board,
        };

        fetch('/api/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/yaml',
            },
            body: jsyaml.dump(data),

        })
        .then(response => response.json())
        .then(data => {
            computerThinkingElement.style.display = 'none';
            if (data.move !== undefined && data.move !== null) {
                const cell = document.querySelector(`.cell[data-index="${data.move}"]`);
                makeMove(cell, data.move);
                checkResult();
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            computerThinkingElement.style.display = 'none';
            const availableCells = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
            if (availableCells.length > 0) {
                const randomMove = availableCells[Math.floor(Math.random() * availableCells.length)];
                const cell = document.querySelector(`.cell[data-index="${randomMove}"]`);
                makeMove(cell, randomMove);
                checkResult();
            }
        });
    }

    function checkResult() {
        let roundWon = false;
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;

            if (board[a] === '' || board[b] === '' || board[c] === '') {
                continue;
            }

            if (board[a] === board[b] && board[b] === board[c]) {
                roundWon = true;

                cells[a].classList.add('winning-cell');
                cells[b].classList.add('winning-cell');
                cells[c].classList.add('winning-cell');
                break;
            }
        }

        if (roundWon) {
            gameActive = false;

            if (currentPlayer === 'X') {
                scoreX++;
                scoreXElement.textContent = scoreX;
            } else {
                scoreO++;
                scoreOElement.textContent = scoreO;
            }

            showGameOver(currentPlayer);
            return;
        }

        if (!board.includes('')) {
            gameActive = false;
            showGameOver('draw');
            return;
        }

        changePlayer();
    }

    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        currentPlayerElement.textContent = currentPlayer;
        currentPlayerElement.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    }

    function showGameOver(winner) {
        if (winner === 'draw') {
            winnerElement.textContent = 'Ничья!';
            winnerElement.className = 'winner draw';
        } else {
            winnerElement.textContent = winner;
            winnerElement.className = `winner ${winner.toLowerCase()}`;
        }

        gameOverElement.classList.add('show');
    }

    function changeGameMode(mode) {
        gameMode = mode;

        if (mode === 'pvp') {
            pvpModeBtn.classList.add('active');
            pvcModeBtn.classList.remove('active');
        } else {
            pvpModeBtn.classList.remove('active');
            pvcModeBtn.classList.add('active');
        }

        initGame();
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', initGame);
    newGameBtn.addEventListener('click', initGame);
    resetScoreBtn.addEventListener('click', function() {
        scoreX = 0;
        scoreO = 0;
        scoreXElement.textContent = scoreX;
        scoreOElement.textContent = scoreO;
        initGame();
    });
    pvpModeBtn.addEventListener('click', () => changeGameMode('pvp'));
    pvcModeBtn.addEventListener('click', () => changeGameMode('pvc'));

    initGame();
});