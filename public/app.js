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
    <div class="flex items-start justify-between mb-3 relative">
      <span class="font-mono text-xs text-zinc-600">#${String(p.id).padStart(3, '0')}</span>
      ${difficultyBadge(p.difficulty)}
    </div>
    <h3 class="text-zinc-100 font-semibold mb-1.5 group-hover:text-accent-soft transition-colors duration-200">${escapeHtml(p.title)}</h3>
    <p class="text-xs text-zinc-500 mb-4">${escapeHtml(p.category)}</p>
    <div class="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-3 border-t border-zinc-800/70">
      <span title="Time complexity">⏱ ${p.time_complexity}</span>
      <span title="Space complexity">▦ ${p.space_complexity}</span>
      <span title="Lines of code">${p.loc} loc</span>
    </div>
  </a>`;
}
 
// view: home
function renderHome() {
  const problems = state.problems;
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach(p => { if (counts[p.difficulty] !== undefined) counts[p.difficulty]++; });
 
  const topByDiff = (diff) => problems.filter(p => p.difficulty === diff).slice(0, 3);
 
  const tierColumn = (diff, colorClass) => {
    const items = topByDiff(diff);
    if (items.length === 0) {
      return `<div class="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-600">More ${diff.toLowerCase()} solutions on the way.</div>`;
    }
    return items.map(p => `
      <a href="#problem/${p.id}" class="group flex items-center justify-between gap-3 py-3 border-b border-zinc-800/70 last:border-0 hover:pl-1 transition-all duration-200">
        <div class="min-w-0">
          <p class="text-sm text-zinc-200 group-hover:text-accent-soft transition-colors duration-200 truncate">${escapeHtml(p.title)}</p>
          <p class="text-xs text-zinc-600 font-mono mt-0.5">${p.time_complexity} · ${p.loc} loc</p>
        </div>
        <svg class="w-4 h-4 text-zinc-700 group-hover:text-accent-soft shrink-0 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </a>`).join('');
  };
 
  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-24 pb-20">
      <div class="max-w-3xl stagger" id="hero-stagger">
        <p class="font-mono text-xs text-accent-soft mb-4">LeetCode Portfolio · Interactive Problem Log</p>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-50 tracking-tight leading-[1.1] mb-6">
          Seventy-five problems.<br class="hidden sm:block" /> One way of thinking about complexity.
        </h1>
        <p class="text-lg text-zinc-400 max-w-xl leading-relaxed">
          A running log of solved interview problems — annotated with reasoning, time and space complexity, and the code behind each one.
        </p>
        <div class="flex flex-wrap gap-3 mt-8">
          <a href="#problems" class="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-soft text-white text-sm font-medium transition-colors duration-200">Browse all problems</a>
          <a href="#journey" class="px-5 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-medium transition-colors duration-200">See the journey</a>
        </div>
      </div>
    </section>
 
    <section class="max-w-7xl mx-auto px-6 pb-20">
      <div class="grid grid-cols-3 gap-4 sm:gap-6">
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p class="text-3xl sm:text-4xl font-bold font-mono text-easy" data-counter="${counts.Easy}">0</p>
          <p class="text-sm text-zinc-500 mt-1">Easy solved</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p class="text-3xl sm:text-4xl font-bold font-mono text-medium" data-counter="${counts.Medium}">0</p>
          <p class="text-sm text-zinc-500 mt-1">Medium solved</p>
        </div>
        <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <p class="text-3xl sm:text-4xl font-bold font-mono text-hard" data-counter="${counts.Hard}">0</p>
          <p class="text-sm text-zinc-500 mt-1">Hard solved</p>
        </div>
      </div>
    </section>
 
    <section class="max-w-7xl mx-auto px-6 pb-24">
      <div class="flex items-baseline justify-between mb-8">
        <h2 class="text-xl font-semibold text-zinc-100">Top tier solutions</h2>
        <a href="#problems" class="text-sm text-accent-soft hover:text-accent transition-colors duration-200">View all →</a>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="rounded-xl border border-zinc-800 p-5">
          <h3 class="text-sm font-semibold text-easy mb-3">Easy</h3>
          <div>${tierColumn('Easy')}</div>
        </div>
        <div class="rounded-xl border border-zinc-800 p-5">
          <h3 class="text-sm font-semibold text-medium mb-3">Medium</h3>
          <div>${tierColumn('Medium')}</div>
        </div>
        <div class="rounded-xl border border-zinc-800 p-5">
          <h3 class="text-sm font-semibold text-hard mb-3">Hard</h3>
          <div>${tierColumn('Hard')}</div>
        </div>
      </div>
    </section>
 
    <section class="border-t border-zinc-800/70">
      <div class="max-w-7xl mx-auto px-6 py-24">
        <div class="grid lg:grid-cols-[1fr,1.3fr] gap-12 items-start">
          <div>
            <p class="font-mono text-xs text-accent-soft mb-3">Methodology</p>
            <h2 class="text-3xl font-bold text-zinc-50 mb-4 tracking-tight">The optimization mindset</h2>
            <p class="text-zinc-400 leading-relaxed">
              Every solution here starts brute-force, then gets pushed until the complexity can't drop any further without sacrificing readability. The goal isn't the cleverest one-liner — it's the version a teammate could read once and trust.
            </p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors duration-200">
              <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg class="w-4.5 h-4.5 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 class="text-zinc-100 font-medium mb-1.5">Start brute, then cut</h3>
              <p class="text-sm text-zinc-500 leading-relaxed">Every problem begins with the naive O(n²) or worse — the baseline every later optimization is measured against.</p>
            </div>
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors duration-200">
              <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg class="w-4.5 h-4.5 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <h3 class="text-zinc-100 font-medium mb-1.5">Trade space deliberately</h3>
              <p class="text-sm text-zinc-500 leading-relaxed">Hash maps, prefix sums, and memoization tables are used on purpose — every extra byte of space buys a specific drop in time.</p>
            </div>
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors duration-200">
              <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg class="w-4.5 h-4.5 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
              </div>
              <h3 class="text-zinc-100 font-medium mb-1.5">Fewer lines, same clarity</h3>
              <p class="text-sm text-zinc-500 leading-relaxed">LOC is tracked per solution not to golf the code, but to notice when a shorter version is genuinely easier to follow.</p>
            </div>
            <div class="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-colors duration-200">
              <div class="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <svg class="w-4.5 h-4.5 text-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 class="text-zinc-100 font-medium mb-1.5">Complexity is the scoreboard</h3>
              <p class="text-sm text-zinc-500 leading-relaxed">Big O isn't a footnote — it's the first thing recorded for every problem, before the code is even considered finished.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
 
  animateCounters();
  const hero = document.getElementById('hero-stagger');
  if (hero) {
    hero.style.opacity = '1';
    hero.classList.add('animate-fadeUp');
  }
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
 
// view: all problems / category directory
function renderProblemsDirectory(initialFilters = {}) {
  const categories = [...new Set(state.problems.map(p => p.category))];
 
  const filters = {
    difficulty: initialFilters.difficulty || 'All',
    category: initialFilters.category || 'All',
    sort: initialFilters.sort || 'id-asc'
  };
 
  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-16 pb-24">
      <div class="mb-10">
        <p class="font-mono text-xs text-accent-soft mb-2">Directory</p>
        <h1 class="text-3xl font-bold text-zinc-50 tracking-tight">All problems</h1>
        <p class="text-zinc-500 mt-2">${state.problems.length} problems logged so far.</p>
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
    let list = [...state.problems];
 
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
      grid.innerHTML = `<div class="col-span-full text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">No problems match these filters yet.</div>`;
      return;
    }
    grid.innerHTML = list.map(problemCard).join('');
  }
 
  document.getElementById('filter-difficulty').addEventListener('change', e => { filters.difficulty = e.target.value; applyAndRender(); });
  document.getElementById('filter-category').addEventListener('change', e => { filters.category = e.target.value; applyAndRender(); });
  document.getElementById('filter-sort').addEventListener('change', e => { filters.sort = e.target.value; applyAndRender(); });
 
  applyAndRender();
}

// view: Search results
function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  const results = q
    ? state.problems.filter(p =>
        String(p.id).includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q))
    : [];
 
  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-16 pb-24">
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
 
// view: Single prolbem
function renderSingleProblem(id) {
  const problem = state.problems.find(p => String(p.id) === String(id));
 
  if (!problem) {
    root.innerHTML = `
      <section class="max-w-3xl mx-auto px-6 pt-24 pb-24 text-center">
        <p class="font-mono text-xs text-hard mb-3">404</p>
        <h1 class="text-2xl font-bold text-zinc-100 mb-3">This problem hasn't been logged yet</h1>
        <a href="#problems" class="text-accent-soft hover:text-accent transition-colors duration-200 text-sm">← Back to all problems</a>
      </section>`;
    return;
  }
 
  root.innerHTML = `
    <section class="max-w-7xl mx-auto px-6 pt-12 pb-24">
      <a href="#problems" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200 mb-8">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        All problems
      </a>
 
      <div class="grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <span class="font-mono text-xs text-zinc-600">#${String(problem.id).padStart(3, '0')}</span>
            ${difficultyBadge(problem.difficulty)}
            <span class="text-xs text-zinc-600">${escapeHtml(problem.category)}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight mb-6">${escapeHtml(problem.title)}</h1>
          <p class="text-zinc-400 leading-relaxed mb-10">${escapeHtml(problem.description)}</p>
 
          <div class="mb-10">
            <h2 class="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full"></span> Problem breakdown
            </h2>
            <p class="text-zinc-400 leading-relaxed pl-3 border-l border-zinc-800">${escapeHtml(problem.description)}</p>
          </div>
 
          <div>
            <h2 class="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <span class="w-1 h-4 bg-accent rounded-full"></span> Solution architecture
            </h2>
            <p class="text-zinc-400 leading-relaxed pl-3 border-l border-zinc-800">${escapeHtml(problem.solution_logic)}</p>
          </div>
        </div>
 
        <div class="lg:sticky lg:top-24">
          <div class="rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-hard/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-medium/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-easy/80"></span>
              </div>
              <span class="font-mono text-xs text-zinc-500">solution.py</span>
            </div>
            <pre class="p-5 overflow-x-auto text-sm leading-relaxed font-mono text-zinc-300"><code>${escapeHtml(problem.python_code)}</code></pre>
            <div class="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800">
              <div class="px-4 py-3">
                <p class="text-xs text-zinc-600 mb-1">Time</p>
                <p class="font-mono text-sm text-accent-soft">${problem.time_complexity}</p>
              </div>
              <div class="px-4 py-3">
                <p class="text-xs text-zinc-600 mb-1">Space</p>
                <p class="font-mono text-sm text-accent-soft">${problem.space_complexity}</p>
              </div>
              <div class="px-4 py-3">
                <p class="text-xs text-zinc-600 mb-1">Lines</p>
                <p class="font-mono text-sm text-accent-soft">${problem.loc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
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
    <section class="max-w-3xl mx-auto px-6 pt-16 pb-24">
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
 
// view: analytics
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
    <section class="max-w-7xl mx-auto px-6 pt-16 pb-24">
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
    </section>
  `;
}
 
// router
async function router() {
  await loadProblems();
 
  const hash = window.location.hash.replace(/^#/, '') || 'home';
  const [routeName, param] = hash.split('/');
 
  root.style.opacity = '0';
 
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
    default:
      setActiveNav('home');
      renderHome();
  }
 
  requestAnimationFrame(() => {
    root.style.transition = 'opacity 0.25s ease';
    root.style.opacity = '1';
  });
 
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
 
// boot
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
 