const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const db = new Database('bookstore.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    price REAL NOT NULL,
    inStock INTEGER NOT NULL
  )
`);

app.get('/books', (req, res) => {
  const { genre, author } = req.query;

  if (genre) {
    const books = db.prepare('SELECT * FROM books WHERE genre = ?').all(genre);
    return res.json(books);
  }

  if (author) {
    const books = db.prepare('SELECT * FROM books WHERE author = ?').all(author);
    return res.json(books);
  }

  const books = db.prepare('SELECT * FROM books').all();
  res.json(books);
});

// ---------- POST a new book, with missing-fields protection ----------
app.post('/books', (req, res) => {
  const { title, author, genre, price, inStock } = req.body;

  if (!title || !author || !genre || price === undefined || inStock === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare(`
    INSERT INTO books (title, author, genre, price, inStock)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(title, author, genre, price, inStock);

  const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newBook);
});

// ---------- PUT (update) a book ----------
app.put('/books/:id', (req, res) => {
  const { inStock } = req.body;

  const stmt = db.prepare('UPDATE books SET inStock = ? WHERE id = ?');
  const result = stmt.run(inStock, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ---------- DELETE a book ----------
app.delete('/books/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ message: 'Book removed', removedBook: book });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
