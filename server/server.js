const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Create a SQLite database
const db = new sqlite3.Database('games.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware to parse JSON
app.use(bodyParser.json());

// Route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Tic-Tac-Toe Game API!');
});

// Route to save game state
app.post('/save', (req, res) => {
    const { state, result } = req.body;
    db.run('INSERT INTO games(state, result) VALUES(?, ?)', [state, result], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.json({ id: this.lastID });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
