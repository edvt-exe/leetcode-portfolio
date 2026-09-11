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

app.put('/api/problems/:id', express.json(), (req, res) => {
  const problemId = parseInt(req.params.id);
  const updates = req.body;

  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(404).json({ error: 'Database not found.' });
    }

    const data = loadDatabase();
    let updated = false;

    for (let p of data.problems || []) {
      if (Number(p.id) === problemId) {
        if (updates.solution_logic !== undefined) {
          p.solution_logic = updates.solution_logic;
        }
        if (updates.struggle_rating !== undefined) {
          p.struggle_rating = updates.struggle_rating;
        }
        updated = true;
        break;
      }
    }

    if (updated) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return res.json({ status: 'success' });
    } else {
      return res.status(404).json({ error: 'Problem not found.' });
    }
  } catch (err) {
    console.error('Eroare la salvarea în database.json:', err);
    return res.status(500).json({ error: 'Failed to update problem.' });
  }
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Blind 75 portfolio server running on http://localhost:${PORT}`);
});