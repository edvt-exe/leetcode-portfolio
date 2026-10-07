const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

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

// Pulls the latest solutions into the local leetcode-explained clone, so sync.py sees new problems. Never blocks startup: on any failure it warns and moves on
function pullSolutions() {
  const dir = process.env.SOLUTIONS_REPO_PATH || path.join(__dirname, '..', 'leetcode-explained');
  if (!fs.existsSync(path.join(dir, '.git'))) return Promise.resolve();

  console.log('Updating solutions repo (git pull) ...');
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };

    const child = spawn('git', ['-C', dir, 'pull', '--ff-only'], {
      stdio: 'inherit',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    });
    child.on('error', (err) => {
      console.warn('Could not run git:', err.message);
      finish();
    });
    child.on('close', (code) => {
      if (code !== 0 && !done) console.warn(`git pull failed (code ${code}) - using the local copy as is.`);
      finish();
    });
  });
}

// Runs scripts/sync.py before the server starts, so database.json and README.mdare fresh
// If Python or the solutions repo is missing, the server still starts with the existing data
// Env: SKIP_SYNC=1 skips pull + sync, SKIP_PULL=1 skips only the git pull, PYTHON=<path> picks the interpreter
function runSync() {
  if (process.env.SKIP_SYNC === '1') {
    console.log('SKIP_SYNC=1 - skipping scripts/sync.py');
    return Promise.resolve();
  }
  const pull = process.env.SKIP_PULL === '1' ? Promise.resolve() : pullSolutions();
  return pull.then(runPython);
}

function runPython() {
  const script = path.join(__dirname, 'scripts', 'sync.py');
  const candidates = process.env.PYTHON
    ? [[process.env.PYTHON]]
    : process.platform === 'win32'
      ? [['python'], ['py', '-3']]
      : [['python3'], ['python']];

  return new Promise((resolve) => {
    const attempt = (i) => {
      if (i >= candidates.length) {
        console.warn('Python not found - skipping sync (set PYTHON=<path to python> to fix).');
        return resolve();
      }

      const [cmd, ...args] = candidates[i];
      console.log('Running scripts/sync.py ...');
      let failedToStart = false;

      const child = spawn(cmd, [...args, script], {
        cwd: __dirname,
        stdio: 'inherit',
        env: { ...process.env, PYTHONUTF8: '1' }
      });

      child.on('error', (err) => {
        failedToStart = true;
        if (err.code === 'ENOENT') return attempt(i + 1);
        console.warn('Could not run sync.py:', err.message);
        resolve();
      });

      child.on('close', (code) => {
        if (failedToStart) return;
        if (code !== 0) console.warn(`sync.py exited with code ${code} - starting with the existing data.`);
        resolve();
      });
    };
    attempt(0);
  });
}

runSync().then(() => {
  app.listen(PORT, () => {
    console.log(`LeetCode portfolio server running on http://localhost:${PORT}`);
  });
});