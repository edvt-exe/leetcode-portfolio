// state
const state = {
  problems: [],
  loaded: false
};

const CATEGORY_ORDER = [
  'Array & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation'
];

const DIFF_STYLES = {
  Easy:   { text: 'text-easy',   bg: 'bg-easy/10',   border: 'border-easy/30' },
  Medium: { text: 'text-medium', bg: 'bg-medium/10', border: 'border-medium/30' },
  Hard:   { text: 'text-hard',   bg: 'bg-hard/10',   border: 'border-hard/30' }
};

const BOOKMARK_KEY = 'bookmarked_problems';
const SOLUTIONS_REPO_URL = 'https://github.com/edvt-exe/leetcode-explained';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; }
  catch { return []; }
}
function isBookmarked(id) {
  return getBookmarks().includes(String(id));
}
function toggleBookmark(id) {
  const key = String(id);
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(key);
  idx === -1 ? bookmarks.push(key) : bookmarks.splice(idx, 1);
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  return idx === -1;
}
function bookmarkButtonHtml(id, size = 'sm') {
  const active = isBookmarked(id);
  const dims = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  return `
  <button data-bookmark-id="${id}" aria-label="Save for review" title="Save for review"
    class="bookmark-btn ${dims} flex items-center justify-center rounded-md border transition-colors duration-200 ${active ? 'border-accent-soft/50 bg-accent/10 text-accent-soft' : 'border-zinc-800 text-zinc-500 hover:text-accent-soft hover:border-accent-soft/40'}">
    <svg class="w-3.5 h-3.5" fill="${active ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
    </svg>
  </button>`;
}

function performanceRingHtml(label, pct, colorVar) {
  const safePct = Math.max(0, Math.min(100, pct ?? 0));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safePct / 100);
  return `
  <div class="flex flex-col items-center gap-2">
    <svg width="64" height="64" viewBox="0 0 64 64" class="-rotate-90">
      <circle cx="32" cy="32" r="${radius}" fill="none" stroke="currentColor" stroke-width="5" class="text-zinc-800" />
      <circle cx="32" cy="32" r="${radius}" fill="none" stroke="${colorVar}" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition: stroke-dashoffset 0.7s ease" />
    </svg>
    <div class="-mt-11 font-mono text-sm text-zinc-100">${safePct}%</div>
    <p class="text-[11px] text-zinc-500 mt-6">${label}</p>
  </div>`;
}

function struggleMeterHtml(rating = 0, interactive = false) {
  const colors = ['bg-white', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  const bars = [1, 2, 3, 4, 5].map(i => {
    const bg = i <= rating ? colors[i - 1] : 'bg-zinc-800';
    return interactive 
      ? `<button data-rating="${i}" class="rating-bar w-2 h-5 rounded-full transition-colors hover:bg-zinc-400 cursor-pointer ${bg}"></button>`
      : `<div class="w-2 h-5 rounded-full ${bg}"></div>`;
  }).join('');
  
  return `
  <div class="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800/80" title="Personal Review of Struggle: ${rating}/5">
    <span class="text-xs text-zinc-400 font-medium">Personal Review of Struggle:</span>
    <div class="flex items-end gap-1" id="struggle-bars-container">${bars}</div>
    <span class="text-xs font-mono text-zinc-300" id="struggle-text-label">${rating}/5</span>
  </div>`;
}

function getSimilarProblems(current, count = 3) {
  const pool = state.problems.filter(p => p.category === current.category && p.id !== current.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const root = document.getElementById('app-root');

// data
async function loadProblems() {
  if (state.loaded) return state.problems;
  try {
    const res = await fetch('/api/problems');
    state.problems = await res.json();
  } catch (err) {
    state.problems = [];
    console.error('Failed to load problems', err);
  }
  state.loaded = true;
  return state.problems;
}

// small helpers
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function difficultyBadge(diff) {
  const s = DIFF_STYLES[diff] || DIFF_STYLES.Easy;
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${s.text} ${s.bg} ${s.border}">${diff}</span>`;
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

let readingProgressHandler = null;
let analyticsRadarChart = null;

function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  bar.classList.remove('opacity-0');
  readingProgressHandler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener('scroll', readingProgressHandler, { passive: true });
  readingProgressHandler();
}

function teardownReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (readingProgressHandler) {
    window.removeEventListener('scroll', readingProgressHandler);
    readingProgressHandler = null;
  }
  if (bar) { bar.classList.add('opacity-0'); bar.style.width = '0%'; }
}

function setActiveNav(routeName) {
  document.querySelectorAll('.nav-link').forEach(el => {
    if (el.dataset.route === routeName) {
      el.classList.add('text-zinc-100', 'bg-zinc-900');
      el.classList.remove('text-zinc-400');
    } else {
      el.classList.remove('text-zinc-100', 'bg-zinc-900');
      el.classList.add('text-zinc-400');
    }
  });
}

// card component
function problemCard(p) {
  return `
  <a href="#problem/${p.id}" class="group relative block rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-accent-soft/60 hover:bg-zinc-900/70 transition-all duration-300 overflow-hidden">
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none"></div>
    <div class="flex items-center justify-between mb-3 relative">
      <span class="font-mono text-xs text-zinc-600">#${String(p.id).padStart(3, '0')}</span>
      <div class="flex items-center gap-2">
        ${difficultyBadge(p.difficulty)}
        ${bookmarkButtonHtml(p.id)}
      </div>
    </div>
    <h3 class="text-zinc-100 font-semibold mb-1.5 group-hover:text-accent-soft transition-colors duration-200">${escapeHtml(p.title)}</h3>
    <p class="text-xs text-zinc-500 mb-4">${escapeHtml(p.category)}</p>
    <div class="flex items-center justify-between text-xs font-mono text-zinc-500 pt-3 border-t border-zinc-800/70">
      <span title="Runtime beats">⚡ ${p.runtime_beats || 0}% beats</span>
      <span title="Memory beats">🧠 ${p.memory_beats || 0}% beats</span>
      <span title="Lines of code">${p.loc} loc</span>
    </div>
  </a>`;
}

// view: Home
// view: Home
function renderHome() {
  const total = state.problems.length;
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  state.problems.forEach(p => {
    if (counts[p.difficulty] !== undefined) counts[p.difficulty]++;
  });

  const lastProblems = [...state.problems].sort((a, b) => new Date(b.solved_at || 0) - new Date(a.solved_at || 0)).slice(0, 6);
  
  const lastSolvedHtml = lastProblems.length === 0 ? 
    `<div class="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-600">No problems solved yet.</div>` :
    `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${lastProblems.map(p => `
        <a href="#problem/${p.id}" class="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 hover:border-accent-soft/50 transition-colors duration-200">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-xs text-zinc-600">#${String(p.id).padStart(3, '0')}</span>
              ${difficultyBadge(p.difficulty)}
            </div>
            <p class="text-sm text-zinc-200 group-hover:text-accent-soft transition-colors duration-200 truncate font-medium">${escapeHtml(p.title)}</p>
            <p class="text-xs text-zinc-600 font-mono mt-1">⚡ ${p.runtime_beats || 0}% · 🧠 ${p.memory_beats || 0}% · ${p.loc} loc</p>
          </div>
          <svg class="w-4 h-4 text-zinc-700 group-hover:text-accent-soft shrink-0 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </a>`).join('')}
    </div>`;

  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-8 pb-24">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-400 mb-6">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Blind 75 Progress Tracker
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight mb-6 leading-tight">
            Mastering data structures & algorithms, one solution at a time.
          </h1>
          <p class="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8">
            A clean portfolio showcasing Python solutions for the Blind 75 LeetCode challenge, featuring performance metrics, custom notes, and clean UI.
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <a href="#problems" class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-soft text-zinc-950 font-semibold text-sm rounded-lg transition-colors duration-200 shadow-sm">
              Explore Problems
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
            <a href="${SOLUTIONS_REPO_URL}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-sm rounded-lg border border-zinc-800 transition-colors duration-200">
              GitHub Repository
            </a>
          </div>
        </div>

        <div class="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 text-center min-w-[220px]">
          <p class="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-wider">Total Progress</p>
          <p class="text-5xl font-extrabold text-zinc-100 font-mono">${total}<span class="text-lg text-zinc-600 font-normal">/75</span></p>
          <p class="text-xs text-zinc-500 mt-2">Problems Solved</p>
        </div>
      </div>

      <!-- Stats Grid (Only Difficulties) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p class="text-xs text-easy font-mono mb-1">Easy</p>
          <p class="text-3xl font-bold text-easy font-mono">${counts.Easy}</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p class="text-xs text-medium font-mono mb-1">Medium</p>
          <p class="text-3xl font-bold text-medium font-mono">${counts.Medium}</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p class="text-xs text-hard font-mono mb-1">Hard</p>
          <p class="text-3xl font-bold text-hard font-mono">${counts.Hard}</p>
        </div>
      </div>

      <!-- Last problems solved section -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span class="w-1.5 h-5 bg-accent rounded-full"></span> Last problems solved
          </h2>
          <a href="#problems" class="text-xs text-zinc-500 hover:text-accent-soft transition-colors duration-200">View all →</a>
        </div>
        ${lastSolvedHtml}
      </div>
    </section>
  `;
}

function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter, 10) || 0;
    const duration = 700;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// view: All Problems / Category directory
function renderProblemsDirectory(options = {}) {
  const sourceProblems = options.sourceProblems || state.problems;
  const eyebrow = options.eyebrow || 'Directory';
  const title = options.title || 'All problems';
  const subtitle = options.subtitle || `${sourceProblems.length} problem${sourceProblems.length === 1 ? '' : 's'} logged so far.`;
  const emptyMessage = options.emptyMessage || 'No problems match these filters yet.';
  const categories = [...new Set(sourceProblems.map(p => p.category))];

  const filters = {
    difficulty: options.difficulty || 'All',
    category: options.category || 'All',
    sort: options.sort || 'id-asc'
  };

  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-8 pb-24">
      <div class="mb-10">
        <p class="font-mono text-xs text-accent-soft mb-2">${escapeHtml(eyebrow)}</p>
        <h1 class="text-3xl font-bold text-zinc-50 tracking-tight">${escapeHtml(title)}</h1>
        <p class="text-zinc-500 mt-2">${escapeHtml(subtitle)}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div class="flex items-center gap-2">
          <label class="text-xs text-zinc-500">Difficulty</label>
          <select id="filter-difficulty" class="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 rounded-md px-2 py-1.5 focus:border-accent-soft">
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-zinc-500">Category</label>
          <select id="filter-category" class="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 rounded-md px-2 py-1.5 focus:border-accent-soft">
            <option value="All">All</option>
            ${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <label class="text-xs text-zinc-500">Sort by</label>
          <select id="filter-sort" class="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 rounded-md px-2 py-1.5 focus:border-accent-soft">
            <option value="id-asc">ID (asc)</option>
            <option value="id-desc">ID (desc)</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="time-asc">Time efficiency (best first)</option>
            <option value="space-asc">Space efficiency (best first)</option>
            <option value="loc-asc">Lines of code (fewest first)</option>
            <option value="loc-desc">Lines of code (most first)</option>
          </select>
        </div>
      </div>

      <div id="problems-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"></div>
    </section>
  `;

  document.getElementById('filter-difficulty').value = filters.difficulty;
  document.getElementById('filter-category').value = filters.category;
  document.getElementById('filter-sort').value = filters.sort;

  function applyAndRender() {
    const grid = document.getElementById('problems-grid');
    let list = [...sourceProblems];

    if (filters.difficulty !== 'All') list = list.filter(p => p.difficulty === filters.difficulty);
    if (filters.category !== 'All') list = list.filter(p => p.category === filters.category);

    const complexityRank = (str) => {
      const order = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n²)', 'O(2^n)'];
      const idx = order.indexOf(str);
      return idx === -1 ? order.length : idx;
    };

    switch (filters.sort) {
      case 'id-asc': list.sort((a, b) => a.id - b.id); break;
      case 'id-desc': list.sort((a, b) => b.id - a.id); break;
      case 'name-asc': list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name-desc': list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'time-asc': list.sort((a, b) => complexityRank(a.time_complexity) - complexityRank(b.time_complexity)); break;
      case 'space-asc': list.sort((a, b) => complexityRank(a.space_complexity) - complexityRank(b.space_complexity)); break;
      case 'loc-asc': list.sort((a, b) => a.loc - b.loc); break;
      case 'loc-desc': list.sort((a, b) => b.loc - a.loc); break;
    }

    if (list.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">${escapeHtml(emptyMessage)}</div>`;
      return;
    }
    grid.innerHTML = list.map(problemCard).join('');
  }

  document.getElementById('filter-difficulty').addEventListener('change', e => { filters.difficulty = e.target.value; applyAndRender(); });
  document.getElementById('filter-category').addEventListener('change', e => { filters.category = e.target.value; applyAndRender(); });
  document.getElementById('filter-sort').addEventListener('change', e => { filters.sort = e.target.value; applyAndRender(); });

  applyAndRender();
}

// view: Saved Problems (reuses the directory layout, filtered to bookmarks)
function renderSavedProblems() {
  const savedIds = getBookmarks();
  const savedProblems = state.problems.filter(p => savedIds.includes(String(p.id)));

  renderProblemsDirectory({
    sourceProblems: savedProblems,
    eyebrow: 'Saved',
    title: 'Saved problems',
    subtitle: `${savedProblems.length} problem${savedProblems.length === 1 ? '' : 's'} saved for review.`,
    emptyMessage: "You haven't saved any problems yet — tap the bookmark icon on a card to add one here."
  });
}

// view: Search Results
function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const results = q
    ? state.problems.filter(p =>
        String(p.id).includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q))
    : [];

  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-8 pb-24">
      <p class="font-mono text-xs text-accent-soft mb-2">Search</p>
      <h1 class="text-3xl font-bold text-zinc-50 tracking-tight mb-1">Results for "${escapeHtml(query)}"</h1>
      <p class="text-zinc-500 mb-10">${results.length} match${results.length === 1 ? '' : 'es'} found.</p>
      <div id="search-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${results.length
          ? results.map(problemCard).join('')
          : `<div class="col-span-full text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">Nothing matched — try an ID, a title, or a category name.</div>`}
      </div>
    </section>
  `;
}

// view: Single Problem
function renderSingleProblem(id) {
  const problem = state.problems.find(p => String(p.id) === String(id));

  if (!problem) {
    root.innerHTML = `
      <section class="max-w-3xl mx-auto px-6 pt-12 pb-24 text-center">
        <p class="font-mono text-xs text-hard mb-3">404</p>
        <h1 class="text-2xl font-bold text-zinc-100 mb-3">This problem hasn't been logged yet</h1>
        <a href="#problems" class="text-accent-soft hover:text-accent transition-colors duration-200 text-sm">← Back to all problems</a>
      </section>`;
    return;
  }

  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-6 pb-24">
      <div class="flex items-center justify-between mb-6">
        <a href="#problems" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          All problems
        </a>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 items-start">
        <div class="min-w-0">
          <div class="flex flex-col gap-4 mb-6 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
            <div class="flex flex-wrap items-center justify-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-500 uppercase tracking-wider">ID:</span> 
                <span class="font-mono text-sm text-zinc-200">#${String(problem.id).padStart(3, '0')}</span>
              </div>
              <div class="w-px h-4 bg-zinc-700 hidden sm:block"></div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-500 uppercase tracking-wider">Difficulty:</span> 
                ${difficultyBadge(problem.difficulty)}
              </div>
              <div class="w-px h-4 bg-zinc-700 hidden sm:block"></div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-500 uppercase tracking-wider">Category:</span> 
                <span class="text-sm font-medium text-zinc-300">${escapeHtml(problem.category)}</span>
              </div>
            </div>
            
            <div class="w-full h-px bg-zinc-800"></div>
            
            <div class="flex items-center justify-between mt-1">
              ${struggleMeterHtml(problem.struggle_rating, true)}
              
              ${problem.folder_name ? `
              <a href="${SOLUTIONS_REPO_URL}/tree/main/${problem.folder_name}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-accent-soft transition-colors duration-200 px-3 py-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/60 hover:border-accent-soft/40 hover:bg-zinc-900">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 4.98 3.23 9.2 7.71 10.69.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.1-3.14.68-3.8-1.34-3.8-1.34-.51-1.31-1.25-1.66-1.25-1.66-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.16-3.04-.12-.29-.5-1.45.11-3.02 0 0 .95-.3 3.11 1.16a10.8 10.8 0 0 1 5.66 0c2.16-1.46 3.11-1.16 3.11-1.16.61 1.57.23 2.73.11 3.02.72.79 1.16 1.8 1.16 3.04 0 4.35-2.65 5.31-5.17 5.59.4.35.76 1.03.76 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.78.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z"/></svg>
                View on GitHub
              </a>` : ''}

              ${bookmarkButtonHtml(problem.id, 'lg')}
            </div>
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight mb-8 max-w-2xl border-b border-zinc-800 pb-4">${escapeHtml(problem.title)}</h1>
          
          <div id="problem-description" class="text-zinc-400 leading-relaxed text-sm space-y-4 mb-16 max-w-2xl break-words overflow-hidden [&>p]:text-zinc-300 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ul>li]:text-zinc-400 [&>pre]:bg-zinc-900/80 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-zinc-800/80 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:text-zinc-300 [&>pre]:overflow-x-auto [&>pre]:my-3 [&>code]:bg-zinc-800/80 [&>code]:text-zinc-200 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:text-xs [&>code]:rounded [&>code]:font-mono">
            ${problem.description}
          </div>

          <div class="max-w-2xl mb-10">
            <h2 class="text-lg font-bold text-zinc-100 mb-6 flex items-center justify-between border-b border-zinc-800 pb-3">
              <span class="flex items-center gap-2"><span class="w-1.5 h-5 bg-accent rounded-full"></span> My Solution Notes</span>
            </h2>
            <div class="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/20 p-6 transition-colors hover:border-zinc-500 group">
              <div id="solution-display" class="flex flex-col items-start text-left">
                <p class="text-sm text-zinc-400 mb-5 whitespace-pre-wrap w-full">${escapeHtml(problem.solution_logic || "Nu ai adăugat notițe pentru această problemă încă.")}</p>
                <button id="edit-solution-btn" class="inline-flex self-center items-center gap-2 px-4 py-2 bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-md hover:bg-accent hover:text-white transition-colors duration-200 shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Edit Solution
                </button>
              </div>
              
              <div id="solution-edit-mode" class="hidden flex-col gap-3">
                <textarea id="solution-textarea" class="w-full bg-zinc-900/50 border border-zinc-700 rounded-md p-3 text-sm text-zinc-300 focus:outline-none focus:border-accent-soft min-h-[120px] placeholder-zinc-600" placeholder="Explică abordarea aici...">${escapeHtml(problem.solution_logic || "")}</textarea>
                <div class="flex justify-end gap-2">
                  <button id="cancel-solution-btn" class="px-4 py-2 bg-transparent text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
                  <button id="save-solution-btn" class="px-4 py-2 bg-accent text-xs font-semibold text-white rounded-md hover:bg-accent-soft transition-colors">Save Notes</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="min-w-0 lg:sticky lg:top-24">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden max-w-full">
            <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-hard/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-medium/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-easy/80"></span>
              </div>
              <span class="font-mono text-xs text-zinc-500">solution.py</span>
              <button id="copy-code-btn" class="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-accent-soft transition-colors duration-200 px-2 py-1 rounded-md hover:bg-zinc-800/60">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span id="copy-code-label">Copy</span>
              </button>
            </div>
            <pre id="code-panel" class="p-5 overflow-x-auto text-sm leading-relaxed font-mono !bg-transparent"><code class="language-python">${escapeHtml(problem.python_code)}</code></pre>
            
            <div class="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 bg-zinc-900/30">
              <div class="px-4 py-4 flex flex-col items-center text-center">
                <p class="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Runtime Beats</p>
                <p class="font-mono text-lg text-easy">${problem.runtime_beats || 0}%</p>
              </div>
              <div class="px-4 py-4 flex flex-col items-center text-center">
                <p class="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Memory Beats</p>
                <p class="font-mono text-lg text-accent-soft">${problem.memory_beats || 0}%</p>
              </div>
              <div class="px-4 py-4 flex flex-col items-center text-center">
                <p class="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Lines</p>
                <p class="font-mono text-lg text-zinc-300">${problem.loc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${(() => {
        const similar = getSimilarProblems(problem);
        if (similar.length === 0) return '';
        return `
        <div class="mt-16 pt-10 border-t border-zinc-800/70">
          <h2 class="text-sm font-semibold text-zinc-200 mb-5 flex items-center gap-2">
            <span class="w-1 h-4 bg-accent rounded-full"></span> Similar problems
          </h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${similar.map(p => `
              <a href="#problem/${p.id}" class="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 hover:border-accent-soft/50 transition-colors duration-200">
                <div class="min-w-0">
                  <p class="text-sm text-zinc-200 group-hover:text-accent-soft transition-colors duration-200 truncate">${escapeHtml(p.title)}</p>
                  <p class="text-xs text-zinc-600 mt-0.5">${escapeHtml(p.category)}</p>
                </div>
                ${difficultyBadge(p.difficulty)}
              </a>`).join('')}
          </div>
        </div>`;
      })()}
    </section>
  `;

  const descEl = document.getElementById('problem-description');
  if (descEl) {
    const walker = document.createTreeWalker(descEl, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const text = node.nodeValue.trim();
      if (/^(Example\s*\d*:?|Examples:)/i.test(text)) {
        if (node.parentNode) {
          node.parentNode.style.color = '#22c55e';
          node.parentNode.style.display = 'block';
          node.parentNode.style.marginTop = '1rem';
          node.parentNode.style.marginBottom = '0.25rem';
          node.parentNode.style.fontSize = '1.125rem';
          node.parentNode.style.fontWeight = 'bold';
          node.parentNode.style.borderBottom = '1px solid #27272a';
          node.parentNode.style.paddingBottom = '0.5rem';
        }
      } else if (/^constraints?:/i.test(text)) {
        if (node.parentNode) {
          node.parentNode.style.color = '#ef4444';
          node.parentNode.style.display = 'block';
          node.parentNode.style.marginTop = '1rem';
          node.parentNode.style.marginBottom = '0.25rem';
          node.parentNode.style.fontSize = '1.125rem';
          node.parentNode.style.fontWeight = 'bold';
          node.parentNode.style.borderBottom = '1px solid #27272a';
          node.parentNode.style.paddingBottom = '0.5rem';
        }
      }
    }
  }

  const codeBlock = document.querySelector('#code-panel code');
  if (codeBlock && window.hljs) {
    hljs.highlightElement(codeBlock);
  }

  const copyBtn = document.getElementById('copy-code-btn');
  const copyLabel = document.getElementById('copy-code-label');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(problem.python_code);
      copyLabel.textContent = 'Copied!';
      copyBtn.classList.add('text-easy');
      setTimeout(() => {
        copyLabel.textContent = 'Copy';
        copyBtn.classList.remove('text-easy');
      }, 1600);
    } catch (err) {
      copyLabel.textContent = 'Failed';
      setTimeout(() => { copyLabel.textContent = 'Copy'; }, 1600);
    }
  });

  async function updateProblemData(updates) {
    try {
      const response = await fetch(`/api/problems/${problem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        Object.assign(problem, updates);
        return true;
      }
    } catch (err) {
      console.error("Eroare la salvare:", err);
    }
    return false;
  }

  const editBtn = document.getElementById('edit-solution-btn');
  const cancelBtn = document.getElementById('cancel-solution-btn');
  const saveBtn = document.getElementById('save-solution-btn');
  const displayMode = document.getElementById('solution-display');
  const editMode = document.getElementById('solution-edit-mode');
  const textarea = document.getElementById('solution-textarea');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      displayMode.classList.add('hidden');
      editMode.classList.remove('hidden');
      editMode.classList.add('flex');
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      editMode.classList.add('hidden');
      editMode.classList.remove('flex');
      displayMode.classList.remove('hidden');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const newText = textarea.value.trim();
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
      
      const success = await updateProblemData({ solution_logic: newText });
      if (success) {
        displayMode.querySelector('p').textContent = newText;
        editMode.classList.add('hidden');
        editMode.classList.remove('flex');
        displayMode.classList.remove('hidden');
      } else {
        alert("Eroare la salvare. Verifică dacă serverul tău acceptă ruta PUT /api/problems/:id.");
      }
      saveBtn.textContent = "Save Notes";
      saveBtn.disabled = false;
    });
  }

  const ratingBars = document.querySelectorAll('.rating-bar');
  const colors = ['bg-white', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  
  ratingBars.forEach(bar => {
    bar.addEventListener('click', async (e) => {
      const newRating = parseInt(e.target.dataset.rating);
      const success = await updateProblemData({ struggle_rating: newRating });
      
      if (success) {
        ratingBars.forEach(b => {
          const r = parseInt(b.dataset.rating);
          b.classList.remove('bg-zinc-800', ...colors);
          if (r <= newRating) {
            b.classList.add(colors[r - 1]);
          } else {
            b.classList.add('bg-zinc-800');
          }
        });
        const label = document.getElementById('struggle-text-label');
        if (label) label.textContent = `${newRating}/5`;
      }
    });
  });

  initReadingProgress();
}

// view: My Journey
function renderJourney() {
  const solvedCategories = new Set(state.problems.map(p => p.category));

  const items = CATEGORY_ORDER.map((cat, i) => {
    const solved = solvedCategories.has(cat);
    const count = state.problems.filter(p => p.category === cat).length;
    return `
      <div class="relative pl-12 pb-10 last:pb-0">
        <div class="absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs
          ${solved ? 'border-accent-soft bg-accent-dim text-accent-soft' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}">
          ${solved ? '✓' : i + 1}
        </div>
        <div class="rounded-lg border ${solved ? 'border-zinc-800' : 'border-zinc-900'} bg-zinc-900/30 px-5 py-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium ${solved ? 'text-zinc-100' : 'text-zinc-600'}">${escapeHtml(cat)}</h3>
            <span class="text-xs font-mono ${solved ? 'text-accent-soft' : 'text-zinc-700'}">${count} solved</span>
          </div>
        </div>
      </div>`;
  }).join('');

  root.innerHTML = `
    <section class="max-w-3xl mx-auto px-6 pt-8 pb-24">
      <p class="font-mono text-xs text-accent-soft mb-2">Progression</p>
      <h1 class="text-3xl font-bold text-zinc-50 tracking-tight mb-2">My journey through Blind 75</h1>
      <p class="text-zinc-500 mb-12">Moving category by category, from array fundamentals to dynamic programming.</p>

      <div class="relative">
        <div class="absolute left-4 top-2 bottom-2 w-px bg-zinc-800"></div>
        ${items}
      </div>
    </section>
  `;
}

// view: Analytics
function renderAnalytics() {
  const problems = state.problems;
  const total = problems.length || 1;

  const byDifficulty = { Easy: [], Medium: [], Hard: [] };
  problems.forEach(p => { if (byDifficulty[p.difficulty]) byDifficulty[p.difficulty].push(p); });

  const avgLoc = (arr) => arr.length ? Math.round(arr.reduce((s, p) => s + p.loc, 0) / arr.length) : 0;

  const dsGuess = (p) => {
    const t = (p.category + ' ' + p.title + ' ' + p.solution_logic).toLowerCase();
    if (t.includes('hash') || t.includes('map')) return 'Hash Map';
    if (t.includes('stack')) return 'Stack';
    if (t.includes('queue') || t.includes('heap')) return 'Heap / Queue';
    if (t.includes('tree')) return 'Tree';
    if (t.includes('graph')) return 'Graph';
    if (t.includes('linked list')) return 'Linked List';
    if (t.includes('array') || t.includes('pointer') || t.includes('window')) return 'Array';
    return 'Array';
  };

  const dsCounts = {};
  problems.forEach(p => {
    const ds = dsGuess(p);
    dsCounts[ds] = (dsCounts[ds] || 0) + 1;
  });
  const dsSorted = Object.entries(dsCounts).sort((a, b) => b[1] - a[1]);
  const maxDs = dsSorted.length ? dsSorted[0][1] : 1;

  const catCounts = {};
  problems.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const maxCat = Math.max(1, ...Object.values(catCounts));

  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-8 pb-24">
      <p class="font-mono text-xs text-accent-soft mb-2">Insights</p>
      <h1 class="text-3xl font-bold text-zinc-50 tracking-tight mb-2">Analytics</h1>
      <p class="text-zinc-500 mb-12">A read-out of patterns across ${problems.length} logged solution${problems.length === 1 ? '' : 's'}.</p>

      <div class="grid lg:grid-cols-2 gap-8 mb-12">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 class="text-sm font-semibold text-zinc-200 mb-5">Most used data structures</h2>
          <div class="space-y-3">
            ${dsSorted.map(([name, count]) => `
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-zinc-400">${escapeHtml(name)}</span>
                  <span class="font-mono text-zinc-600">${count}</span>
                </div>
                <div class="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-accent rounded-full" style="width:${(count / maxDs) * 100}%"></div>
                </div>
              </div>`).join('') || `<p class="text-sm text-zinc-600">Not enough data yet.</p>`}
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 class="text-sm font-semibold text-zinc-200 mb-5">Average LOC per difficulty</h2>
          <div class="space-y-4">
            ${['Easy', 'Medium', 'Hard'].map(diff => `
              <div class="flex items-center gap-4">
                <span class="w-16 text-xs ${DIFF_STYLES[diff].text}">${diff}</span>
                <div class="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full rounded-full ${diff === 'Easy' ? 'bg-easy' : diff === 'Medium' ? 'bg-medium' : 'bg-hard'}" style="width:${Math.min(100, avgLoc(byDifficulty[diff]) * 3)}%"></div>
                </div>
                <span class="font-mono text-xs text-zinc-500 w-16 text-right">${avgLoc(byDifficulty[diff])} loc</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 class="text-sm font-semibold text-zinc-200 mb-5">Coverage by category</h2>
        <div class="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          ${CATEGORY_ORDER.map(cat => {
            const count = catCounts[cat] || 0;
            return `
            <div>
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-zinc-400">${escapeHtml(cat)}</span>
                <span class="font-mono text-zinc-600">${count}</span>
              </div>
              <div class="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div class="h-full bg-accent-soft/70 rounded-full" style="width:${(count / maxCat) * 100}%"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 mt-8">
        <h2 class="text-sm font-semibold text-zinc-200 mb-5">Competence radar</h2>
        <div class="max-w-lg mx-auto">
          <canvas id="competence-radar" height="280"></canvas>
        </div>
      </div>
    </section>
  `;

  renderCompetenceRadar(catCounts);
}

function renderCompetenceRadar(catCounts) {
  const canvas = document.getElementById('competence-radar');
  if (!canvas || !window.Chart) return;

  if (analyticsRadarChart) {
    analyticsRadarChart.destroy();
    analyticsRadarChart = null;
  }

  const labels = CATEGORY_ORDER.filter(cat => (catCounts[cat] || 0) > 0);
  const data = labels.map(cat => catCounts[cat] || 0);

  if (labels.length < 3) return;

  analyticsRadarChart = new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Problems solved',
        data,
        backgroundColor: 'rgba(108, 92, 233, 0.18)',
        borderColor: '#8B7CF6',
        borderWidth: 2,
        pointBackgroundColor: '#8B7CF6',
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          angleLines: { color: 'rgba(63, 63, 70, 0.6)' },
          grid: { color: 'rgba(63, 63, 70, 0.6)' },
          pointLabels: { color: '#a1a1aa', font: { size: 11 } },
          ticks: { display: false, stepSize: 1, beginAtZero: true }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// view: Flashcards (Spaced Repetition)
function pickRandomProblem(excludeId = null) {
  const pool = excludeId ? state.problems.filter(p => String(p.id) !== String(excludeId)) : state.problems;
  const source = pool.length ? pool : state.problems;
  return source[Math.floor(Math.random() * source.length)];
}

function renderFlashcards() {
  if (state.problems.length === 0) {
    root.innerHTML = `
      <section class="max-w-xl mx-auto px-6 pt-24 pb-24 text-center">
        <p class="text-zinc-500">No problems logged yet — add some to start reviewing.</p>
      </section>`;
    return;
  }

  const card = pickRandomProblem();

  root.innerHTML = `
    <section class="max-w-2xl mx-auto px-6 pt-8 pb-24">
      <div class="mb-10 text-center">
        <p class="font-mono text-xs text-accent-soft mb-2">Spaced Repetition</p>
        <h1 class="text-3xl font-bold text-zinc-50 tracking-tight mb-2">Flashcard mode</h1>
        <p class="text-zinc-500">Click the card to flip it. Try to recall the approach before you peek.</p>
      </div>

      <div id="flip-card" class="flip-card w-full h-80 cursor-pointer mb-8" data-id="${card.id}">
        <div class="flip-card-inner">
          <div class="flip-card-face flip-card-front rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-center justify-center text-center px-8">
            ${difficultyBadge(card.difficulty)}
            <h2 class="text-2xl font-bold text-zinc-50 mt-4">${escapeHtml(card.title)}</h2>
            <p class="text-sm text-zinc-500 mt-2">${escapeHtml(card.category)}</p>
            <p class="text-xs text-zinc-600 mt-8 font-mono">Click to reveal →</p>
          </div>
          <div class="flip-card-face flip-card-back rounded-2xl border border-accent-soft/40 bg-zinc-900 flex flex-col items-center justify-center text-center px-8">
            <div class="flex items-center gap-4 font-mono text-sm text-accent-soft mb-4">
              <span>${card.time_complexity}</span>
              <span class="text-zinc-700">·</span>
              <span>${card.space_complexity}</span>
            </div>
            <p class="text-sm text-zinc-400 leading-relaxed max-h-40 overflow-y-auto">${escapeHtml(card.solution_logic)}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3">
        <a href="#problem/${card.id}" class="px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 transition-colors duration-200">View full problem</a>
        <button id="next-card-btn" class="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-soft text-white text-sm font-medium transition-colors duration-200">Next card</button>
      </div>
    </section>
  `;

  const flipCard = document.getElementById('flip-card');
  flipCard?.addEventListener('click', () => flipCard.classList.toggle('is-flipped'));

  document.getElementById('next-card-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentId = flipCard?.dataset.id;
    const next = pickRandomProblem(currentId);
    window.location.hash = 'flashcards';
    renderFlashcardFace(next);
  });
}

function renderFlashcardFace(card) {
  const flipCard = document.getElementById('flip-card');
  if (!flipCard) return;
  flipCard.classList.remove('is-flipped');
  flipCard.dataset.id = card.id;
  flipCard.querySelector('.flip-card-front').innerHTML = `
    ${difficultyBadge(card.difficulty)}
    <h2 class="text-2xl font-bold text-zinc-50 mt-4">${escapeHtml(card.title)}</h2>
    <p class="text-sm text-zinc-500 mt-2">${escapeHtml(card.category)}</p>
    <p class="text-xs text-zinc-600 mt-8 font-mono">Click to reveal →</p>`;
  flipCard.querySelector('.flip-card-back').innerHTML = `
    <div class="flex items-center gap-4 font-mono text-sm text-accent-soft mb-4">
      <span>${card.time_complexity}</span>
      <span class="text-zinc-700">·</span>
      <span>${card.space_complexity}</span>
    </div>
    <p class="text-sm text-zinc-400 leading-relaxed max-h-40 overflow-y-auto">${escapeHtml(card.solution_logic)}</p>`;
  const viewLink = document.querySelector('#app-root a[href^="#problem/"]');
  if (viewLink) viewLink.setAttribute('href', `#problem/${card.id}`);
}

// router
async function router() {
  await loadProblems();

  if (document.startViewTransition) {
    document.startViewTransition(() => renderRoute());
  } else {
    root.classList.add('opacity-0');
    await new Promise(resolve => setTimeout(resolve, 180));
    renderRoute();
    requestAnimationFrame(() => root.classList.remove('opacity-0'));
  }
}

function renderRoute() {
  const hash = window.location.hash.replace(/^#/, '') || 'home';
  const [routeName, param] = hash.split('/');

  document.body.classList.remove('focus-mode');
  teardownReadingProgress();
  if (routeName !== 'analytics' && analyticsRadarChart) {
    analyticsRadarChart.destroy();
    analyticsRadarChart = null;
  }

  switch (routeName) {
    case 'home':
      setActiveNav('home');
      renderHome();
      break;
    case 'problems':
      setActiveNav('problems');
      renderProblemsDirectory();
      break;
    case 'search':
      setActiveNav(null);
      renderSearchResults(decodeURIComponent(param || ''));
      break;
    case 'problem':
      setActiveNav('problems');
      renderSingleProblem(param);
      break;
    case 'journey':
      setActiveNav('journey');
      renderJourney();
      break;
    case 'analytics':
      setActiveNav('analytics');
      renderAnalytics();
      break;
    case 'flashcards':
      setActiveNav('flashcards');
      renderFlashcards();
      break;
    case 'saved':
      setActiveNav('saved');
      renderSavedProblems();
      break;
    default:
      setActiveNav('home');
      renderHome();
  }

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

// search wiring
function wireSearchInput(input) {
  if (!input) return;
  input.addEventListener('input', debounce((e) => {
    const q = e.target.value.trim();
    if (q.length === 0) {
      if (window.location.hash.startsWith('#search')) window.location.hash = 'home';
      return;
    }
    window.location.hash = `search/${encodeURIComponent(q)}`;
  }, 250));
}

wireSearchInput(document.getElementById('global-search'));
wireSearchInput(document.getElementById('global-search-mobile'));

document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});

// Delegated bookmark toggle — works for every card and the single-problem view
root.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-bookmark-id]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const nowActive = toggleBookmark(btn.dataset.bookmarkId);
  btn.classList.toggle('border-accent-soft/50', nowActive);
  btn.classList.toggle('bg-accent/10', nowActive);
  btn.classList.toggle('text-accent-soft', nowActive);
  btn.classList.toggle('border-zinc-800', !nowActive);
  btn.classList.toggle('text-zinc-500', !nowActive);
  btn.querySelector('svg').setAttribute('fill', nowActive ? 'currentColor' : 'none');

  // On the Saved page, un-bookmarking should remove the card immediately
  const onSavedRoute = window.location.hash.replace(/^#/, '').split('/')[0] === 'saved';
  if (onSavedRoute && !nowActive) {
    const card = btn.closest('#problems-grid > a');
    if (card) {
      card.classList.add('transition-opacity', 'duration-300', 'opacity-0');
      setTimeout(() => {
        card.remove();
        const grid = document.getElementById('problems-grid');
        if (grid && grid.children.length === 0) {
          grid.innerHTML = `<div class="col-span-full text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">You haven't saved any problems yet — tap the bookmark icon on a card to add one here.</div>`;
        }
      }, 300);
    }
  }
});

// boot
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);