const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/Lucas/Desktop/sqt/users.db');


db.serialize(() => {
  // Create a users table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);
});

module.exports = db;
