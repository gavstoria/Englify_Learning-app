import re
import os

input_file = r'c:\KULIAHH\SEMESTER 4\dpsi\Projek_DPSI\public\supasql\db_cluster-24-07-2025@08-20-38.backup'
output_file = r'c:\KULIAHH\SEMESTER 4\dpsi\Projek_DPSI\public\supasql\clean_restore.sql'

# Only the public schema tables we want to restore
PUBLIC_DATA_TABLES = [
    'public.profiles',
    'public.classes',
    'public.class_assignments',
    'public.class_members',
    'public.custom_game_questions',
    'public.custom_game_word_bank',
    'public.games',
    'public.quiz_options',
    'public.quiz_questions',
    'public.quizzes',
    'public.user_activities',
]

def convert_copy_to_inserts(table, columns, data_lines):
    """Convert COPY block rows into INSERT statements."""
    inserts = []
    for data_line in data_lines:
        if not data_line.strip():
            continue
        values = data_line.rstrip('\n').split('\t')
        clean_values = []
        for val in values:
            if val == '\\N':
                clean_values.append('NULL')
            else:
                # Proper SQL escaping
                escaped = val.replace("'", "''")
                clean_values.append(f"'{escaped}'")
        inserts.append(f"INSERT INTO {table} ({columns}) VALUES ({', '.join(clean_values)});")
    return inserts


def is_public_only_statement(block_text):
    """
    Decide if a full SQL statement/block should be included.
    It must ONLY reference the public schema.
    """
    # Check if it's specifically about a public schema object
    public_create = re.search(r'CREATE\s+(TABLE|FUNCTION|TRIGGER|INDEX|SEQUENCE)\s+public\.', block_text, re.IGNORECASE)
    public_alter = re.search(r'ALTER\s+(TABLE|FUNCTION|SEQUENCE)\s+(ONLY\s+)?public\.', block_text, re.IGNORECASE)
    public_select_setval = re.search(r"pg_catalog\.setval\('public\.", block_text)
    
    return bool(public_create or public_alter or public_select_setval)


def clean_sql():
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        return

    output_lines = []
    in_postgres_db = False
    
    # State tracking for COPY blocks
    in_copy_block = False
    copy_table = ""
    copy_columns = ""
    copy_data_lines = []
    
    # State tracking for multi-line statement collection
    collecting_statement = False
    current_statement_lines = []
    # Track if we're inside a dollar-quoted block ($$...$$)
    in_dollar_quote = False
    dollar_quote_tag = ""
    paren_depth = 0
    
    output_lines.append("-- ============================================\n")
    output_lines.append("-- Restored: public schema only\n")
    output_lines.append("-- ============================================\n\n")
    output_lines.append("SET client_encoding = 'UTF8';\n")
    output_lines.append("SET standard_conforming_strings = on;\n\n")

    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # --- Database connection detection ---
        if stripped == '\\connect postgres':
            in_postgres_db = True
            i += 1
            continue
        if stripped.startswith('\\connect'):
            in_postgres_db = False
            i += 1
            continue

        if not in_postgres_db:
            i += 1
            continue

        # --- Skip all psql meta-commands ---
        if stripped.startswith('\\') and not stripped.startswith('\\.'):
            i += 1
            continue

        # --- Handle COPY blocks (data) ---
        if stripped.startswith('COPY '):
            match_public = re.match(r'COPY (public\.\w+) \((.*?)\) FROM stdin;', stripped)
            if match_public:
                in_copy_block = True
                copy_table = match_public.group(1)
                copy_columns = match_public.group(2)
                copy_data_lines = []
                if copy_table in PUBLIC_DATA_TABLES:
                    # Collect data rows
                    i += 1
                    while i < len(lines):
                        data_line = lines[i]
                        if data_line.strip() == '\\.':
                            break
                        copy_data_lines.append(data_line.rstrip('\n'))
                        i += 1
                    # Convert to INSERTs
                    inserts = convert_copy_to_inserts(copy_table, copy_columns, copy_data_lines)
                    if inserts:
                        output_lines.append(f"\n-- Data for {copy_table}\n")
                        for ins in inserts:
                            output_lines.append(ins + '\n')
                else:
                    # Skip non-public copy block
                    i += 1
                    while i < len(lines):
                        if lines[i].strip() == '\\.':
                            break
                        i += 1
            else:
                # Skip any other COPY block
                i += 1
                while i < len(lines):
                    if lines[i].strip() == '\\.':
                        break
                    i += 1
            i += 1
            continue

        # --- Collect full SQL statements for public schema objects ---
        # A statement starts with a keyword and ends with a semicolon
        # (accounting for dollar-quoted bodies)
        
        stmt_starters = ('CREATE TABLE ', 'CREATE FUNCTION ', 'CREATE TRIGGER ', 
                        'CREATE INDEX ', 'CREATE UNIQUE INDEX ', 'CREATE SEQUENCE ',
                        'ALTER TABLE ', 'ALTER FUNCTION ', 'ALTER SEQUENCE ',
                        'SELECT pg_catalog.setval')
        
        is_stmt_start = any(stripped.startswith(kw) for kw in stmt_starters)
        
        if is_stmt_start and not collecting_statement:
            # Start collecting a new statement
            collecting_statement = True
            current_statement_lines = [line]
            in_dollar_quote = False
            dollar_quote_tag = ""
            
            # Check end condition immediately
            if stripped.endswith(';') and '$$' not in stripped:
                statement = ''.join(current_statement_lines)
                if is_public_only_statement(statement):
                    output_lines.append('\n')
                    output_lines.extend(current_statement_lines)
                collecting_statement = False
                current_statement_lines = []
            i += 1
            continue
        
        if collecting_statement:
            current_statement_lines.append(line)
            
            # Track dollar-quoting
            dollar_matches = re.findall(r'(\$[^$]*\$)', line)
            for dm in dollar_matches:
                if not in_dollar_quote:
                    in_dollar_quote = True
                    dollar_quote_tag = dm
                elif dm == dollar_quote_tag:
                    in_dollar_quote = False
                    dollar_quote_tag = ""
            
            # A statement ends at a semicolon outside of dollar quotes
            if not in_dollar_quote and stripped.endswith(';'):
                statement = ''.join(current_statement_lines)
                if is_public_only_statement(statement):
                    output_lines.append('\n')
                    output_lines.extend(current_statement_lines)
                collecting_statement = False
                current_statement_lines = []
            i += 1
            continue

        i += 1

    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    line_count = len(output_lines)
    print(f"Success! Cleaned SQL saved to: {output_file} ({line_count} lines)")


if __name__ == "__main__":
    clean_sql()
