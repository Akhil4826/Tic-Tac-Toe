let board;
let currentPlayer;
let isGameActive = false;
let mode = ''; // Variable to determine game mode
let qTable = {}; // Q-learning table
const learningRate = 0.1; // Learning rate
const discountFactor = 0.9; // Discount factor
const actions = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Possible moves

// Initialize the game
function initGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X'; // X starts first
    isGameActive = true;
    updateStatus();
    renderBoard();
}

// Update the status display
function updateStatus() {
    const status = document.getElementById('status');
    if (!isGameActive) {
        status.innerText = `Game Over!`;
        return;
    }
    status.innerText = `Current Player: ${currentPlayer}`;
}

// Render the game board
function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.innerText = board[index] || '';
        cell.style.pointerEvents = board[index] ? 'none' : 'auto'; // Disable clicks on occupied cells
    });
}

// Handle cell clicks
function handleCellClick(event) {
    const cellIndex = event.target.dataset.cellIndex;
    if (board[cellIndex] || !isGameActive || currentPlayer !== 'X') return; // Allow only Player 'X' to play manually

    // Player X makes a move
    board[cellIndex] = currentPlayer;
    renderBoard();
    const result = checkResult();

    if (result) {
        updateStatus();
        isGameActive = false;
        alert(`${result} wins!`); // Alert the winner
        updateQTable(result); // Update Q-table
    } else if (board.every(cell => cell)) {
        updateStatus();
        isGameActive = false;
        alert(`It's a draw!`); // Alert if it's a draw
        updateQTable('D'); // Update Q-table for draw
    } else {
        // Switch to AI (or Player O)
        currentPlayer = 'O';
        updateStatus();
        if (mode === 'AI') {
            setTimeout(makeAIMove, 1000); // Delay for AI move
        }
    }
}


// Check for a win or draw
// Check for a win or draw
// Check for a win or draw
// Check for a win or draw
function checkResult() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    console.log('Current board state:', board); // Log the current state of the board

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        console.log(`Checking combination: [${a}, ${b}, ${c}] -> [${board[a]}, ${board[b]}, ${board[c]}]`);

        // Check for a win
        if (board[a] === 'X' && board[b] === 'X' && board[c] === 'X') {
            console.log(`Winning combination for X: [${a}, ${b}, ${c}] -> [${board[a]}, ${board[b]}, ${board[c]}]`);
            return 'X'; // Return 'X' as the winner
        } else if (board[a] === 'O' && board[b] === 'O' && board[c] === 'O') {
            console.log(`Winning combination for O: [${a}, ${b}, ${c}] -> [${board[a]}, ${board[b]}, ${board[c]}]`);
            return 'O'; // Return 'O' as the winner
        }
    }

    return null; // No winner yet
}

// Make AI move using predefined strategy and Q-learning
function makeAIMove() {
    const winningMove = findWinningMove('O'); // Check for a winning move for O
    if (winningMove !== null) {
        board[winningMove] = currentPlayer; // Make winning move
        renderBoard();
        const result = checkResult();
        if (result) {
            updateStatus();
            isGameActive = false;
            alert(`${result} wins!`); // Alert the winner
            updateQTable(result); // Update Q-table
        }
        currentPlayer = 'X'; // Switch back to Player X after making the move
        updateStatus();
        return; // Exit after making the winning move
    }

    const blockingMove = findWinningMove('X'); // Check if the player has a winning move
    if (blockingMove !== null) {
        board[blockingMove] = currentPlayer; // Block player's winning move
        renderBoard();
        const result = checkResult();
        if (result) {
            updateStatus();
            isGameActive = false;
            alert(`${result} wins!`); // Alert the winner
            updateQTable(result); // Update Q-table
        }
        currentPlayer = 'X'; // Switch back to Player X after blocking move
        updateStatus();
        return; // Exit after blocking the winning move
    }

    // If no immediate win or block, make a strategic move
    let move = makeStrategicMove();
    if (move !== null) {
        board[move] = currentPlayer; // Make strategic move
    } else {
        // Select move using Q-learning if no strategic move found
        const emptyCells = board.map((cell, index) => (cell === null ? index : null)).filter(index => index !== null);
        const stateKey = board.join(',');
        if (!qTable[stateKey]) {
            qTable[stateKey] = actions.reduce((acc, action) => ({ ...acc, [action]: 0 }), {});
        }
        move = Object.keys(qTable[stateKey]).reduce((bestAction, action) => {
            return qTable[stateKey][action] > qTable[stateKey][bestAction] ? action : bestAction;
        });
        board[move] = currentPlayer; // Make Q-learning based move
    }

    renderBoard();
    const result = checkResult(); // Check if there's a result after AI move
    if (result) {
        updateStatus();
        isGameActive = false;
        alert(`${result} wins!`); // Alert the winner
        updateQTable(result); // Update Q-table
    } else {
        currentPlayer = 'X'; // Switch back to Player X after AI move
        updateStatus();
    }
}


// Update Q-table based on game outcome
function updateQTable(result) {
    const gameState = board.join(',');
    const key = `${gameState}-${currentPlayer}`;

    // Assign reward values
    let reward = 0;
    if (result === 'O') {
        reward = 1; // AI wins
    } else if (result === 'X') {
        reward = -1; // Player wins
    } else {
        reward = 0; // Draw
    }

    // Update Q-table
    if (!qTable[key]) {
        qTable[key] = actions.reduce((acc, action) => ({ ...acc, [action]: 0 }), {});
    }

    // Update the Q-value
    const maxNextQ = Math.max(...Object.values(qTable[key]));
    qTable[key][key] += learningRate * (reward + discountFactor * maxNextQ - qTable[key][key]);
}

// Make AI move using predefined strategy and Q-learning


// Find a winning move for the given player
function findWinningMove(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === player && board[b] === player && board[c] === null) {
            return c; // Return the empty cell index
        }
        if (board[b] === player && board[c] === player && board[a] === null) {
            return a; // Return the empty cell index
        }
        if (board[a] === player && board[c] === player && board[b] === null) {
            return b; // Return the empty cell index
        }
    }
    return null; // No winning move
}

// Make strategic moves
function makeStrategicMove() {
    // Prioritize center, corners, then edges
    const center = 4;
    if (board[center] === null) {
        return center; // Take the center if available
    }
    const corners = [0, 2, 6, 8];
    for (const corner of corners) {
        if (board[corner] === null) {
            return corner; // Take any corner if available
        }
    }
    const edges = [1, 3, 5, 7];
    for (const edge of edges) {
        if (board[edge] === null) {
            return edge; // Take any edge if available
        }
    }
    return null; // No move available
}

// Restart the game
function restartGame() {
    initGame();
}

// Event listeners
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('pvpBtn').addEventListener('click', () => {
    initGame();
    mode = 'PVP'; // Set mode to Player vs Player
    document.getElementById('gameContainer').style.display = 'block';
});
document.getElementById('pvaBtn').addEventListener('click', () => {
    initGame();
    mode = 'AI'; // Set mode to Player vs AI
    document.getElementById('gameContainer').style.display = 'block';
});
