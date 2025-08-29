import { openDatabaseSync } from 'expo-sqlite';
import { WishlistItem } from './types';

const DB_NAME = 'centscape.db';
const db = openDatabaseSync(DB_NAME);

// Simple migration system using a metadata table
export async function initDB(): Promise<void> {
  await execSql(`PRAGMA foreign_keys = ON;`);
  // metadata table
  await execSql(`CREATE TABLE IF NOT EXISTS metadata (k TEXT PRIMARY KEY, v TEXT);`);
  const row = await one<{ v: string }>('SELECT v FROM metadata WHERE k = ?', ['schema_version']).catch(()=> null);
  const version = row ? Number(row.v) : 0;
  if (version === 0) {
    // v1 schema
    await execSql(`CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      image TEXT,
      price TEXT,
      currency TEXT,
      siteName TEXT,
      sourceUrl TEXT UNIQUE,
      createdAt TEXT
    );`);
    await execSql('INSERT OR REPLACE INTO metadata (k,v) VALUES (?,?)', ['schema_version', '1']);
  }
  if (version < 2) {
    // migrate v1 -> v2: add normalizedUrl column
    await execSql(`ALTER TABLE wishlist ADD COLUMN normalizedUrl TEXT;`);
    await execSql('UPDATE metadata SET v = ? WHERE k = ?', ['2','schema_version']);
  }
}

async function execSql(sql: string, params: any[] = []): Promise<void> {
  await db.runAsync(sql, params);
}

async function all<T>(sql: string, params: any[] = []): Promise<T[]> {
  const rows = await db.getAllAsync<T>(sql, params);
  return rows as T[];
}

async function one<T>(sql: string, params: any[] = []): Promise<T | null> {
  const row = await db.getFirstAsync<T>(sql, params);
  return (row ?? null) as T | null;
}

export async function addItem(item: Partial<WishlistItem> & { sourceUrl: string; normalizedUrl: string | null; createdAt: string; }): Promise<number> {
  // dedupe by normalizedUrl if present, else by sourceUrl unique constraint
  if (item.normalizedUrl) {
    const existing = await one<{ id:number }>('SELECT id FROM wishlist WHERE normalizedUrl = ? LIMIT 1', [item.normalizedUrl]);
    if (existing) return existing.id;
  } else {
    const existing = await one<{ id:number }>('SELECT id FROM wishlist WHERE sourceUrl = ? LIMIT 1', [item.sourceUrl]);
    if (existing) return existing.id;
  }

  await execSql(
    `INSERT INTO wishlist (title, image, price, currency, siteName, sourceUrl, normalizedUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.title ?? null,
      item.image ?? null,
      item.price ?? null,
      item.currency ?? null,
      item.siteName ?? null,
      item.sourceUrl,
      item.normalizedUrl ?? null,
      item.createdAt
    ]
  );
  const row = await one<{ id: number }>('SELECT last_insert_rowid() as id');
  return row ? row.id : -1;
}

export async function getAllItems(): Promise<WishlistItem[]> {
  return all<WishlistItem>('SELECT * FROM wishlist ORDER BY createdAt DESC');
}

export async function deleteItem(id: number): Promise<void> {
  await execSql('DELETE FROM wishlist WHERE id = ?', [id]);
}
