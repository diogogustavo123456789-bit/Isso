const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tickets.db');

db.run(`
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  canal TEXT,
  status TEXT
)
`);

module.exports = db;
