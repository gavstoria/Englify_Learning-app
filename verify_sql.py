import re
import os

file_path = r'c:\KULIAHH\SEMESTER 4\dpsi\Projek_DPSI\public\supasql\clean_restore.sql'

def verify_sql():
    if not os.path.exists(file_path):
        print("File not found.")
        return

    dangerous_lines = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            stripped = line.strip()
            if not stripped or stripped.startswith('--'):
                continue
            
            is_set = stripped.startswith('SET ')
            is_public = re.search(r'(^|[^a-zA-Z0-9_])public\.', line) or 'public"' in line
            is_setval = 'pg_catalog.setval' in line and is_public
            
            if not (is_set or is_public or is_setval):
                dangerous_lines.append(f"Line {i}: {stripped}")

    if dangerous_lines:
        print(f"Found {len(dangerous_lines)} potentially dangerous lines:")
        for line in dangerous_lines[:20]:
            print(line)
        if len(dangerous_lines) > 20:
            print("...")
    else:
        print("SQL file looks clean (only public schema and session settings found).")

if __name__ == "__main__":
    verify_sql()
