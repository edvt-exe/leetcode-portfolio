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