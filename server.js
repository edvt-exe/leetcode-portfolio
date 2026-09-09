const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function loadDatabase() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

app.get('/api/problems', (req, res) => {
  try {
    const data = loadDatabase();
    res.json(data.problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load problems database.' });
  }
});

app.get('/api/problems/:id', (req, res) => {
  try {
    const data = loadDatabase();
    const problem = data.problems.find(p => String(p.id) === String(req.params.id));
    if (!problem) return res.status(404).json({ error: 'Problem not found.' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load problem.' });
  }
});

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Blind 75 portfolio server running on http://localhost:${PORT}`);
});