"""
MIRAVERSE OSx — SQLite → TypeScript Data Pipeline
Reads miraverse.db (read-only) and emits one JSON file per table
into frontend/src/data/, ready for the TypeScript frontend to import.

Usage:
    npm run data:build
    -- or --
    python scripts/build_data.py
"""
import sqlite3, json, os, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'miraverse.db')
OUT_DIR = os.path.join(ROOT, 'frontend', 'src', 'data')

# Columns holding semicolon-delimited values that should become arrays.
LIST_COLUMNS = {
    ('Careers',      'Passive_Bonus'),
    ('Careers',      'Compatible_Modules'),
    ('Events',       'Reward_Type'),
    ('Factions',     'Enemy_Faction_Ids'),
    ('Factions',     'Allied_Faction_Ids'),
    ('Factions',     'Member_Perks'),
    ('Lore_Entries', 'Connected_Lore_Ids'),
    ('Lore_Entries', 'Tags'),
    ('Missions',     'Objectives'),
    ('Modules',      'Compatible_Career_Ids'),
    ('Modules',      'Craft_Materials'),
    ('NPCs',         'Personality_Traits'),
    ('Regions',      'Key_Resources'),
    ('Regions',      'Subzones'),
    ('Regions',      'Ambient_Event_Pool'),
}

# Columns holding serialized JSON strings that should be parsed into objects.
JSON_COLUMNS = {
    ('Modules', 'Stat_Bonus_Json'),
    ('NPCs',    'Notes_Lore_Json'),
}

def transform(table, column, value):
    if value is None:
        return None
    col_key = (table, column)
    if col_key in LIST_COLUMNS:
        return [part.strip() for part in str(value).split(';') if part.strip()]
    if col_key in JSON_COLUMNS:
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            print(f'   WARN {table}.{column}: not valid JSON, keeping as string')
            return value
    return value

def to_camel(s: str) -> str:
    """Convert Snake_Case column names to camelCase for TypeScript."""
    parts = s.split('_')
    return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])

def main():
    if not os.path.exists(DB_PATH):
        raise SystemExit(
            f'\n  ✗  {DB_PATH} not found.\n'
            '     Open DataGrip → connect to miraverse.db → run miraverse_schema.sql\n'
            '     then populate your tables before running this script.\n'
        )

    con = sqlite3.connect(f'file:{DB_PATH}?mode=ro', uri=True)
    con.row_factory = sqlite3.Row
    os.makedirs(OUT_DIR, exist_ok=True)

    tables = [r[0] for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]

    if not tables:
        print('  ⚠  No tables found in miraverse.db — populate tables in DataGrip first.')
        con.close()
        return

    total = 0
    exports = {}   # table -> list of rows

    for table in tables:
        rows = []
        for row in con.execute(f'SELECT * FROM "{table}"'):
            obj = {}
            for col in row.keys():
                obj[to_camel(col)] = transform(table, col, row[col])
            rows.append(obj)

        path = os.path.join(OUT_DIR, f'{table}.json')
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(rows, fh, ensure_ascii=False, separators=(',', ':'))

        exports[table] = rows
        total += len(rows)
        print(f'   {table:16s}  {len(rows):4d} rows   {os.path.getsize(path):>8,} B  → {path}')

    # Also emit a single worldData.json for convenient world-store consumption
    world = {
        'metadata': { 'title': 'MIRAVERSE OSx', 'generated': __import__('datetime').datetime.utcnow().isoformat() },
        'version': '2.0.0',
        'regions':  exports.get('Regions', []),
        'factions': exports.get('Factions', []),
        'npcs':     exports.get('NPCs', []),
        'careers':  exports.get('Careers', []),
        'lore':     exports.get('Lore_Entries', []),
    }
    world_path = os.path.join(OUT_DIR, 'worldData.json')
    with open(world_path, 'w', encoding='utf-8') as fh:
        json.dump(world, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'\n   worldData.json  (combined world snapshot)  → {world_path}')
    print(f'\n✅  Exported {total} rows across {len(tables)} tables to {OUT_DIR}')

if __name__ == '__main__':
    main()
