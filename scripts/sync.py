import os
import re
import json
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PORTFOLIO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
SOLUTIONS_ROOT = os.environ.get(
    'SOLUTIONS_REPO_PATH',
    os.path.abspath(os.path.join(PORTFOLIO_ROOT, '..', 'leetcode-explained'))
)

DB_PATH = os.path.join(PORTFOLIO_ROOT, 'database.json')
README_PATH = os.path.join(PORTFOLIO_ROOT, 'README.md')

GITHUB_USERNAME = os.environ.get('GITHUB_USERNAME', 'edvt-exe')
SOLUTIONS_REPO_NAME = os.environ.get('SOLUTIONS_REPO_NAME', 'leetcode-explained')
SOLUTIONS_REPO_URL = f"https://github.com/{GITHUB_USERNAME}/{SOLUTIONS_REPO_NAME}"

CATEGORY_MAP = {
    "two sum": "Array & Hashing", "contains duplicate": "Array & Hashing",
    "valid anagram": "Array & Hashing", "group anagrams": "Array & Hashing",
    "top k frequent elements": "Array & Hashing", "product of array except self": "Array & Hashing",
    "valid sudoku": "Array & Hashing", "encode and decode strings": "Array & Hashing",
    "longest consecutive sequence": "Array & Hashing",

    "valid palindrome": "Two Pointers", "two sum ii input array is sorted": "Two Pointers",
    "3sum": "Two Pointers", "container with most water": "Two Pointers",
    "trapping rain water": "Two Pointers",

    "best time to buy and sell stock": "Sliding Window",
    "longest substring without repeating characters": "Sliding Window",
    "longest repeating character replacement": "Sliding Window",
    "permutation in string": "Sliding Window", "minimum window substring": "Sliding Window",
    "sliding window maximum": "Sliding Window",

    "valid parentheses": "Stack", "min stack": "Stack",
    "evaluate reverse polish notation": "Stack", "generate parentheses": "Stack",
    "daily temperatures": "Stack", "car fleet": "Stack",
    "largest rectangle in histogram": "Stack",

    "binary search": "Binary Search", "search a 2d matrix": "Binary Search",
    "koko eating bananas": "Binary Search", "find minimum in rotated sorted array": "Binary Search",
    "search in rotated sorted array": "Binary Search", "time based key value store": "Binary Search",
    "median of two sorted arrays": "Binary Search",

    "reverse linked list": "Linked List", "merge two sorted lists": "Linked List",
    "reorder list": "Linked List", "remove nth node from end of list": "Linked List",
    "copy list with random pointer": "Linked List", "add two numbers": "Linked List",
    "linked list cycle": "Linked List", "find the duplicate number": "Linked List",
    "lru cache": "Linked List", "merge k sorted lists": "Linked List",
    "reverse nodes in k group": "Linked List",

    "invert binary tree": "Trees", "maximum depth of binary tree": "Trees",
    "diameter of binary tree": "Trees", "balanced binary tree": "Trees",
    "same tree": "Trees", "subtree of another tree": "Trees",
    "lowest common ancestor of a binary search tree": "Trees",
    "binary tree level order traversal": "Trees", "binary tree right side view": "Trees",
    "count good nodes in binary tree": "Trees", "validate binary search tree": "Trees",
    "kth smallest element in a bst": "Trees",
    "construct binary tree from preorder and inorder traversal": "Trees",
    "binary tree maximum path sum": "Trees", "serialize and deserialize binary tree": "Trees",

    "implement trie prefix tree": "Tries",
    "design add and search words data structure": "Tries",
    "word search ii": "Tries",

    "kth largest element in a stream": "Heap / Priority Queue",
    "last stone weight": "Heap / Priority Queue", "k closest points to origin": "Heap / Priority Queue",
    "kth largest element in an array": "Heap / Priority Queue", "task scheduler": "Heap / Priority Queue",
    "design twitter": "Heap / Priority Queue", "find median from data stream": "Heap / Priority Queue",

    "subsets": "Backtracking", "combination sum": "Backtracking",
    "permutations": "Backtracking", "subsets ii": "Backtracking",
    "combination sum ii": "Backtracking", "word search": "Backtracking",
    "palindrome partitioning": "Backtracking", "letter combinations of a phone number": "Backtracking",
    "n queens": "Backtracking",

    "number of islands": "Graphs", "clone graph": "Graphs", "max area of island": "Graphs",
    "pacific atlantic water flow": "Graphs", "surrounded regions": "Graphs",
    "rotting oranges": "Graphs", "walls and gates": "Graphs", "course schedule": "Graphs",
    "course schedule ii": "Graphs", "redundant connection": "Graphs",
    "number of connected components in an undirected graph": "Graphs",
    "graph valid tree": "Graphs", "word ladder": "Graphs",

    "reconstruct itinerary": "Advanced Graphs", "min cost to connect all points": "Advanced Graphs",
    "network delay time": "Advanced Graphs", "swim in rising water": "Advanced Graphs",
    "alien dictionary": "Advanced Graphs", "cheapest flights within k stops": "Advanced Graphs",

    "climbing stairs": "1-D Dynamic Programming", "min cost climbing stairs": "1-D Dynamic Programming",
    "house robber": "1-D Dynamic Programming", "house robber ii": "1-D Dynamic Programming",
    "longest palindromic substring": "1-D Dynamic Programming", "palindromic substrings": "1-D Dynamic Programming",
    "decode ways": "1-D Dynamic Programming", "coin change": "1-D Dynamic Programming",
    "maximum product subarray": "1-D Dynamic Programming", "word break": "1-D Dynamic Programming",
    "longest increasing subsequence": "1-D Dynamic Programming",
    "partition equal subset sum": "1-D Dynamic Programming",

    "unique paths": "2-D Dynamic Programming", "longest common subsequence": "2-D Dynamic Programming",
    "best time to buy and sell stock with cooldown": "2-D Dynamic Programming",
    "coin change ii": "2-D Dynamic Programming", "target sum": "2-D Dynamic Programming",
    "interleaving string": "2-D Dynamic Programming",
    "longest increasing path in a matrix": "2-D Dynamic Programming",
    "distinct subsequences": "2-D Dynamic Programming", "edit distance": "2-D Dynamic Programming",
    "burst balloons": "2-D Dynamic Programming", "regular expression matching": "2-D Dynamic Programming",

    "maximum subarray": "Greedy", "jump game": "Greedy", "jump game ii": "Greedy",
    "gas station": "Greedy", "hand of straights": "Greedy",
    "merge triplets to form target triplet": "Greedy", "partition labels": "Greedy",
    "valid parenthesis string": "Greedy",

    "insert interval": "Intervals", "merge intervals": "Intervals",
    "non overlapping intervals": "Intervals", "meeting rooms": "Intervals",
    "meeting rooms ii": "Intervals", "minimum interval to include each query": "Intervals",

    "rotate image": "Math & Geometry", "spiral matrix": "Math & Geometry",
    "set matrix zeroes": "Math & Geometry", "happy number": "Math & Geometry",
    "plus one": "Math & Geometry", "pow x n": "Math & Geometry",
    "multiply strings": "Math & Geometry", "detect squares": "Math & Geometry",

    "single number": "Bit Manipulation", "number of 1 bits": "Bit Manipulation",
    "counting bits": "Bit Manipulation", "reverse bits": "Bit Manipulation",
    "missing number": "Bit Manipulation", "sum of two integers": "Bit Manipulation",
    "reverse integer": "Bit Manipulation",
}

CATEGORY_KEYWORDS = [
    (("linked list",), "Linked List"),
    (("tree", "bst"), "Trees"),
    (("trie",), "Tries"),
    (("graph", "island", "course schedule", "bipartite"), "Graphs"),
    (("heap", "kth largest", "priority queue"), "Heap / Priority Queue"),
    (("subset", "permutation", "combination", "n queens", "backtrack"), "Backtracking"),
    (("interval",), "Intervals"),
    (("binary search", "rotated sorted"), "Binary Search"),
    (("stack", "parenthes"), "Stack"),
    (("window", "substring"), "Sliding Window"),
    (("bit", "xor", "binary representation"), "Bit Manipulation"),
    (("matrix", "spiral", "rotate image"), "Math & Geometry"),
    (("two pointer", "palindrome", "container", "trapping"), "Two Pointers"),
]

def resolve_category(title):
    key = title.lower().strip()
    if key in CATEGORY_MAP:
        return CATEGORY_MAP[key]
    for keywords, category in CATEGORY_KEYWORDS:
        if any(kw in key for kw in keywords):
            return category
    return None

def load_existing_db():
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            try:
                return json.load(f).get('problems', [])
            except json.JSONDecodeError:
                return []
    return []

def parse_leethub_readme(filepath):
    """Returns (description, time_comp, space_comp, difficulty, readme_title)."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        parts = content.split('<hr>', 1)
        if len(parts) > 1:
            description = parts[1].strip()
        else:
            lines = content.split('\n')
            desc_lines = [l for l in lines if not l.strip().startswith('<h') and not l.strip().startswith('#')]
            description = '\n'.join(desc_lines).strip()

        time_comp, space_comp = "O(n)", "O(n)"
        time_match = re.search(r'(?i)Time Complexity:\s*(O\([^)]+\))', content)
        space_match = re.search(r'(?i)Space Complexity:\s*(O\([^)]+\))', content)
        if time_match: time_comp = time_match.group(1)
        if space_match: space_comp = space_match.group(1)

        difficulty = None
        for pattern in (
            r'<h3>\s*(Easy|Medium|Hard)\s*</h3>',
            r'(?im)^#{1,6}\s*(Easy|Medium|Hard)\s*$',
            r'(?i)difficulty:\s*(Easy|Medium|Hard)',
        ):
            m = re.search(pattern, content)
            if m:
                difficulty = m.group(1).capitalize()
                break

        readme_title = None
        for pattern in (
            r'<h2>\s*\d+\.\s*(.+?)\s*</h2>',
            r'(?m)^#{1,3}\s*\d+\.\s*(.+?)\s*$',
        ):
            m = re.search(pattern, content)
            if m:
                readme_title = m.group(1).strip()
                break

        return description, time_comp, space_comp, difficulty, readme_title
    except Exception:
        return "Description unavailable.", "O(unknown)", "O(unknown)", None, None

def get_git_commit_info(item_path):
    time_comp, space_comp = "O(n)", "O(n)"
    runtime_beats, memory_beats = 0, 0
    solved_at = ""
    try:
        result = subprocess.run(
            ['git', 'log', '-1', '--pretty=%B', '--', '.'],
            cwd=item_path, 
            capture_output=True, text=True, check=True
        )
        commit_msg = result.stdout

        time_match = re.search(r'(?i)(?:Time Complexity|Time):\s*(O\([^)]+\))', commit_msg)
        space_match = re.search(r'(?i)(?:Space Complexity|Space):\s*(O\([^)]+\))', commit_msg)
        
        runtime_match = re.search(r'Time:\s*[\d.]+\s*\w+\s*\(([\d.]+)%\)', commit_msg, re.IGNORECASE)
        memory_match = re.search(r'Space:\s*[\d.]+\s*[KMG]?[Bb]\s*\(([\d.]+)%\)', commit_msg, re.IGNORECASE)

        if time_match: time_comp = time_match.group(1)
        if space_match: space_comp = space_match.group(1)
        if runtime_match: runtime_beats = round(float(runtime_match.group(1)))
        if memory_match: memory_beats = round(float(memory_match.group(1)))

        date_result = subprocess.run(
            ['git', 'log', '-1', '--format=%ai', '--', '.'],
            cwd=item_path, 
            capture_output=True, text=True, check=True
        )
        solved_at = date_result.stdout.strip()

    except Exception:
        pass
        
    return time_comp, space_comp, runtime_beats, memory_beats, solved_at

def generate_readme(problems):
    total = len(problems)
    counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    for p in problems:
        if p["difficulty"] in counts:
            counts[p["difficulty"]] += 1

    lines = [
        "# LeetCode · Solved",
        "",
        f"Auto-generated by `scripts/sync.py` — {total}/75 Blind 75 problems logged, "
        f"solved via [{SOLUTIONS_REPO_NAME}]({SOLUTIONS_REPO_URL}).",
        "",
        f"**Easy:** {counts['Easy']} &nbsp;·&nbsp; **Medium:** {counts['Medium']} &nbsp;·&nbsp; **Hard:** {counts['Hard']}",
        "",
        "| # | Problem | Difficulty | Category | Time | Space | LOC |",
        "|---|---------|------------|----------|------|-------|-----|",
    ]
    for p in problems:
        link = f"[{p['title']}]({SOLUTIONS_REPO_URL}/tree/main/{p['folder_name']})"
        lines.append(
            f"| {p['id']:04d} | {link} | {p['difficulty']} | {p['category']} | "
            f"{p['time_complexity']} | {p['space_complexity']} | {p['loc']} |"
        )
    lines.append("")

    with open(README_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    abs_root = SOLUTIONS_ROOT
    print(f"Scanning solutions repo: {abs_root}")
    existing_problems = {p['id']: p for p in load_existing_db()}
    updated_problems = []

    folder_pattern = re.compile(r'^(\d{4})-(.+)$')

    if not os.path.exists(abs_root):
        print(f"Error: Solutions repo not found at {abs_root}")
        print("Set SOLUTIONS_REPO_PATH if leetcode-explained lives somewhere else.")
        return

    matched, skipped = 0, 0
    skipped_names = []
    for item in sorted(os.listdir(abs_root)):
        item_path = os.path.join(abs_root, item)
        if not os.path.isdir(item_path):
            continue
        match = folder_pattern.match(item)
        if not match:
            skipped += 1
            skipped_names.append(item)
            continue
        matched += 1

        prob_id = int(match.group(1))
        slug_title = match.group(2).replace('-', ' ').title()

        py_file = next((f for f in os.listdir(item_path) if f.endswith('.py')), None)
        readme_file = 'README.md' if 'README.md' in os.listdir(item_path) else None

        loc = 0
        description = ""
        time_comp, space_comp = "O(n)", "O(n)"
        python_code = ""
        detected_difficulty = None
        readme_title = None

        if py_file:
            with open(os.path.join(item_path, py_file), 'r', encoding='utf-8') as f:
                python_code = f.read()
                loc = len([line for line in python_code.split('\n') if line.strip() and not line.strip().startswith('#')])

        if readme_file:
            description, time_comp, space_comp, detected_difficulty, readme_title = \
                parse_leethub_readme(os.path.join(item_path, readme_file))

        git_time, git_space, git_runtime, git_memory, git_date = get_git_commit_info(item_path)
        
        final_time = git_time if git_time != "O(n)" else time_comp
        final_space = git_space if git_space != "O(n)" else space_comp

        best_title = readme_title or slug_title
        existing = existing_problems.get(prob_id, {})

        existing_category = existing.get('category')
        resolved_category = (
            existing_category if existing_category and existing_category != 'Uncategorized'
            else (resolve_category(best_title) or existing_category or 'Uncategorized')
        )
        existing_difficulty = existing.get('difficulty')
        resolved_difficulty = existing_difficulty or detected_difficulty or 'Medium'

        db_time = existing.get('time_complexity', final_time)
        if db_time == "O(n)" and final_time != "O(n)":
            db_time = final_time
            
        db_space = existing.get('space_complexity', final_space)
        if db_space == "O(n)" and final_space != "O(n)":
            db_space = final_space

        problem_data = {
            "id": prob_id,
            "title": existing.get('title', best_title),
            "folder_name": item,
            "category": resolved_category,
            "difficulty": resolved_difficulty,
            "time_complexity": db_time,
            "space_complexity": db_space,
            "loc": loc if loc > 0 else existing.get('loc', 0),
            "description": description if description else existing.get('description', ''),
            "solution_logic": existing.get('solution_logic', ''),
            "python_code": python_code if python_code else existing.get('python_code', ''),
            "solved_at": git_date or existing.get('solved_at', '1970-01-01 00:00:00')
        }

        db_runtime = existing.get('runtime_beats', 0)
        problem_data['runtime_beats'] = db_runtime if db_runtime > 0 else git_runtime
        
        db_memory = existing.get('memory_beats', 0)
        problem_data['memory_beats'] = db_memory if db_memory > 0 else git_memory
        
        problem_data['struggle_rating'] = existing.get('struggle_rating', 0)

        updated_problems.append(problem_data)

    print(f"Matched {matched} problem folder(s), skipped {skipped} non-matching entr{'y' if skipped == 1 else 'ies'}.")
    if skipped_names:
        print(f"Skipped directories: {skipped_names}")

    updated_problems.sort(key=lambda x: x['id'])

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump({"problems": updated_problems}, f, indent=2, ensure_ascii=False)

    generate_readme(updated_problems)

    uncategorized = sum(1 for p in updated_problems if p['category'] == 'Uncategorized')
    print(f"Database successfully updated! Total problems processed: {len(updated_problems)}")
    print(f"Root README.md regenerated at {README_PATH}")
    if uncategorized:
        print(f"Note: {uncategorized} problem(s) still 'Uncategorized' — not in the built-in map. "
              f"Edit their 'category' field in database.json manually; the script will preserve it from then on.")

if __name__ == "__main__":
    main()