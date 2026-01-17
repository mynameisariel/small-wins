import * as SQLite from 'expo-sqlite';
import { getTodayLocalDate, getISOTimestamp } from './dateUtils';

export interface Entry {
  id: number;
  date: string;
  mood: number | null;
  highlight: string | null;
  created_at: string;
}

let db: SQLite.SQLiteDatabase;

/**
 * Initialize database and create table if not exists
 */
export const initDb = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('smallwins.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        mood INTEGER,
        highlight TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_date ON entries(date);
    `);
    
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database init error:', error);
    throw error;
  }
};

/**
 * Get entry by specific date
 */
export const getEntryByDate = async (date: string): Promise<Entry | null> => {
  try {
    const result = await db.getFirstAsync<Entry>(
      'SELECT * FROM entries WHERE date = ?',
      [date]
    );
    return result || null;
  } catch (error) {
    console.error('Error getting entry:', error);
    return null;
  }
};

/**
 * Upsert entry (insert or update if date exists)
 */
export const upsertEntry = async (
  date: string,
  mood: number | null,
  highlight: string | null
): Promise<void> => {
  try {
    const existing = await getEntryByDate(date);
    
    if (existing) {
      // Update existing
      await db.runAsync(
        'UPDATE entries SET mood = ?, highlight = ?, created_at = ? WHERE date = ?',
        [mood, highlight, getISOTimestamp(), date]
      );
    } else {
      // Insert new
      await db.runAsync(
        'INSERT INTO entries (date, mood, highlight, created_at) VALUES (?, ?, ?, ?)',
        [date, mood, highlight, getISOTimestamp()]
      );
    }
    console.log('✅ Entry saved:', date);
  } catch (error) {
    console.error('❌ Error upserting entry:', error);
    throw error;
  }
};

/**
 * Get all entries, sorted newest first
 */
export const getAllEntries = async (): Promise<Entry[]> => {
  try {
    const entries = await db.getAllAsync<Entry>(
      'SELECT * FROM entries ORDER BY date DESC'
    );
    return entries;
  } catch (error) {
    console.error('Error getting all entries:', error);
    return [];
  }
};

/**
 * Get entries with non-empty highlights
 */
export const getEntriesWithHighlights = async (): Promise<Entry[]> => {
  try {
    const entries = await db.getAllAsync<Entry>(
      'SELECT * FROM entries WHERE highlight IS NOT NULL AND highlight != "" ORDER BY date DESC'
    );
    return entries;
  } catch (error) {
    console.error('Error getting highlights:', error);
    return [];
  }
};