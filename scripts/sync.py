import os
import re
import json

# paths
ROOT_DIR = '.'
DB_PATH = os.path.join('public', 'database.json')
README_PATH = 'README.md'

def load_existing_db():
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            try:
                return json.load(f).get('problems', [])
            except json.JSONDecodeError:
                return []
    return []

def extract_complexity(readme_content):
    # fallbacks
    time_comp = "O(n)" 
    space_comp = "O(n)"
    
    # try to find standard LeetHub or typical complexity mentions
    time_match = re.search(r'(?i)Time Complexity:\s*(O\([^)]+\))', readme_content)
    space_match = re.search(r'(?i)Space Complexity:\s*(O\([^)]+\))', readme_content)
    
    if time_match:
        time_comp = time_match.group(1)
    if space_match:
        space_comp = space_match.group(1)
        
    return time_comp, space_comp

def main():
    existing_problems = {p['id']: p for p in load_existing_db()}
    updated_problems = []
    
    # scan root directory for LeetHub folders
    folder_pattern = re.compile(r'^(\d{4})-(.+)$')
    
    for item in os.listdir(ROOT_DIR):
        if os.path.isdir(item):
            match = folder_pattern.match(item)
            if not match:
                continue
                
            prob_id = int(match.group(1))
            # convert "two-sum" to "Two Sum"
            title = match.group(2).replace('-', ' ').title()
            folder_path = item
            
            # find python file and README
            py_file = next((f for f in os.listdir(folder_path) if f.endswith('.py')), None)
            readme_file = 'README.md' if 'README.md' in os.listdir(folder_path) else None
            
            loc = 0
            time_comp = "O(unknown)"
            space_comp = "O(unknown)"
            
            if py_file:
                with open(os.path.join(folder_path, py_file), 'r', encoding='utf-8') as f:
                    loc = sum(1 for line in f if line.strip() and not line.strip().startswith('#'))
                    
            if readme_file:
                with open(os.path.join(folder_path, readme_file), 'r', encoding='utf-8') as f:
                    time_comp, space_comp = extract_complexity(f.read())
            
            # merge with existing data to prevent overwriting manual notes
            existing = existing_problems.get(prob_id, {})
            
            problem_data = {
                "id": prob_id,
                "title": existing.get('title', title),
                "folder_name": folder_path,
                "category": existing.get('category', 'Uncategorized'),
                "difficulty": existing.get('difficulty', 'Medium'),
                "time_complexity": existing.get('time_complexity', time_comp),
                "space_complexity": existing.get('space_complexity', space_comp),
                "loc": loc if loc > 0 else existing.get('loc', 0),
                "description": existing.get('description', 'Description pending...'),
                "solution_logic": existing.get('solution_logic', 'Logic pending...'),
                "python_code": existing.get('python_code', 'Code pending...')
            }
            
            problem_data['runtime_beats'] = existing.get('runtime_beats', 0)
            problem_data['memory_beats'] = existing.get('memory_beats', 0)
            problem_data['struggle_rating'] = existing.get('struggle_rating', 1)
            
            updated_problems.append(problem_data)

    # sort by ID
    updated_problems.sort(key=lambda x: x['id'])
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump({"problems": updated_problems}, f, indent=2)
        
    readme_lines = [
        "# LeetCode Journey\n",
        "An automated, clean portfolio of my LeetCode solutions. Built with Vanilla JS and Python CI/CD.\n",
        "## Solved Problems\n",
        "| ID | Title | Category | Difficulty | Time | Space |",
        "|---|---|---|---|---|---|"
    ]
    
    for p in updated_problems:
        readme_lines.append(f"| {p['id']} | [{p['title']}](./{p.get('folder_name', '')}) | {p['category']} | {p['difficulty']} | `{p['time_complexity']}` | `{p['space_complexity']}` |")
        
    with open(README_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(readme_lines) + '\n')

    print(f"Successfully synced {len(updated_problems)} problems!")

if __name__ == "__main__":
    main()