"""
MIRAVERSEOSX Game Data Exporter
Reads miraverse.db (read-only) and emits one JSON file per table into src/data/.

The game is a static site with no backend, so the data ships as plain JSON rather
than as a SQLite file behind a WASM engine -- the whole dataset is ~34 KB gzipped,
a fraction of what sql.js would cost to query 182 read-only rows.

Usage: npm run data:build   (or: python scripts/export_game_data.py)
"""
import sqlite3, json, os, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH  = os.path.join(ROOT, 'miraverse.db')
OUT_DIR  = os.path.join(ROOT, 'src', 'data')

# Semicolon-delimited columns that are genuinely lists. Deliberately an explicit
# allowlist and not a heuristic: Careers.Signature_Ability holds prose containing
# semicolons and must stay a single string.
LIST_COLUMNS = {
    ('Apps',         'Compatible_Modules'),
    ('Careers',      'Passive_Bonus'),
    ('Careers',      'Compatible_Modules'),
    ('Events',       'Reward_Type'),
    ('Factions',     'Enemy_Faction_ID'),
    ('Factions',     'Allied_Faction_ID'),
    ('Factions',     'Member_Perks'),
    ('Lore_Entries', 'Connected_Lore_IDs'),
    ('Lore_Entries', 'Tags'),
    ('Modules',      'Compatible_Career_IDs'),
    ('Modules',      'Craft_Materials'),
    ('NPCs',         'Personality_Traits'),
    ('Regions',      'Key_Resources'),
    ('Regions',      'Subzones'),
    ('Regions',      'Ambient_Event_Pool'),
}

# Columns holding serialized JSON, parsed into real objects on the way out.
JSON_COLUMNS = {
    ('Modules', 'Stat_Bonus_JSON'),
    ('NPCs',    'Notes_Lore_JSON'),
}


def transform(table, column, value):
    # NULL must survive as null -- the importer nulls empty references on purpose
    # (Factions.Allied_Faction_ID for FAC006/FAC007), and "" would erase that.
    if value is None:
        return None
    if (table, column) in LIST_COLUMNS:
        return [part.strip() for part in str(value).split(';') if part.strip()]
    if (table, column) in JSON_COLUMNS:
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            print(f'   WARN {table}.{column}: not valid JSON, keeping as string')
            return value
    return value


def main():
    if not os.path.exists(DB_PATH):
        raise SystemExit(f'{DB_PATH} not found -- run python miraverse_importer.py first')

    con = sqlite3.connect(f'file:{DB_PATH}?mode=ro', uri=True)
    con.row_factory = sqlite3.Row
    os.makedirs(OUT_DIR, exist_ok=True)

    tables = [r[0] for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]

    total = 0
    for table in tables:
        rows = []
        for row in con.execute(f'SELECT * FROM "{table}"'):
            rows.append({col: transform(table, col, row[col]) for col in row.keys()})

        path = os.path.join(OUT_DIR, f'{table}.json')
        with open(path, 'w', encoding='utf-8') as fh:
            # ensure_ascii=False keeps em dashes as UTF-8 rather than — escapes.
            json.dump(rows, fh, ensure_ascii=False, separators=(',', ':'))

        total += len(rows)
        print(f'   {table:14s} {len(rows):3d} rows  {os.path.getsize(path):>7,} B')

    con.close()
    print(f'✅ exported {total} rows across {len(tables)} tables to src/data/')


if __name__ == '__main__':
    main()
