import * as SQLite from 'expo-sqlite';
import { getTodayLocalDate, getISOTimestamp } from './dateUtils';

export interface Entry {
  id: number;
  date: string;
  mood: number | null;
  highlight: string | null;
  created_at: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  thisWeekCount: number;
  thisMonthCount: number;
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

/**
 * Calculate streak statistics
 */
export const getStreakStats = async (): Promise<StreakStats> => {
  try {
    const entries = await getAllEntries();
    
    if (entries.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        thisWeekCount: 0,
        thisMonthCount: 0,
      };
    }

    // Sort by date ascending for streak calculation
    const sortedEntries = [...entries].sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    // Calculate current streak (working backwards from today)
    let currentStreak = 0;
    const today = getTodayLocalDate();
    let checkDate = new Date(today + 'T00:00:00');
    
    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const entryDate = sortedEntries[i].date;
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate < expectedDate) {
        // Gap found
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date + 'T00:00:00');
      const currDate = new Date(sortedEntries[i].date + 'T00:00:00');
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // This week count
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const thisWeekCount = entries.filter(e => e.date >= weekAgoStr).length;

    // This month count
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const thisMonthCount = entries.filter(e => e.date >= monthStartStr).length;

    return {
      currentStreak,
      longestStreak,
      totalEntries: entries.length,
      thisWeekCount,
      thisMonthCount,
    };
  } catch (error) {
    console.error('Error calculating streaks:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      thisWeekCount: 0,
      thisMonthCount: 0,
    };
  }
};

/**
 * Delete all entries (for reset functionality)
 */
export const deleteAllEntries = async (): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM entries');
    console.log('✅ All entries deleted');
  } catch (error) {
    console.error('❌ Error deleting entries:', error);
    throw error;
  }
};

/**
 * Generate test data for the past 2 months (for testing purposes)
 */
export const generateTestData = async (): Promise<void> => {
  try {
    const today = new Date(getTodayLocalDate() + 'T00:00:00');
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Sample highlights for variety
    const highlights = [
      'Finished reading a good book',
      'Had a great conversation with a friend',
      'Completed a workout at the gym',
      'Cooked a delicious homemade meal',
      'Got 8 hours of sleep',
      'Learned something new today',
      'Spent quality time with family',
      'Finished a work project I was proud of',
      'Went for a peaceful walk in nature',
      'Tried a new coffee shop and loved it',
      'Helped someone with a task',
      'Practiced a new hobby',
      'Watched a beautiful sunset',
      'Had a productive day at work',
      'Caught up with an old friend',
      'Finally cleaned and organized my space',
      'Enjoyed a relaxing evening with music',
      'Made progress on a personal goal',
      'Discovered a new favorite podcast',
      'Had a good laugh with colleagues',
      'Treated myself to something nice',
      'Felt grateful for small moments',
      'Completed a challenging task',
      'Spent time in the garden',
      'Watched a movie that moved me',
      'Had a breakthrough moment',
      'Enjoyed a quiet morning routine',
      'Made someone smile today',
      'Tried a new recipe that turned out great',
      'Felt proud of a small achievement',
      'Had a moment of clarity',
      'Enjoyed some good music',
      'Finished a creative project',
      'Had meaningful conversations',
      'Felt content and peaceful',
      'Made good progress on my goals',
      'Appreciated the little things',
      'Had a day full of small joys',
      'Felt energized and motivated',
      'Enjoyed some alone time',
      'Had fun with friends',
    ];

    // Mood distribution (1-5, with more positive moods)
    const getRandomMood = (): number => {
      const rand = Math.random();
      if (rand < 0.1) return 1; // 10% Rough
      if (rand < 0.2) return 2; // 10% Meh
      if (rand < 0.4) return 3; // 20% Good
      if (rand < 0.7) return 4; // 30% Great
      return 5; // 30% Amazing
    };

    const entries: Array<{ date: string; mood: number; highlight: string }> = [];
    const currentDate = new Date(twoMonthsAgo);
    const todayDateStr = getTodayLocalDate();

    // Generate entries for the past ~60 days, but skip some days randomly (70% fill rate)
    // Exclude today's date from test data generation
    while (currentDate < today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Skip today's date if it somehow gets included
      if (dateStr === todayDateStr) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      // Skip about 30% of days to make it realistic
      if (Math.random() > 0.3) {
        const mood = getRandomMood();
        const highlight = highlights[Math.floor(Math.random() * highlights.length)];
        
        entries.push({ date: dateStr, mood, highlight });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert all entries (using upsert to avoid conflicts)
    for (const entry of entries) {
      await upsertEntry(entry.date, entry.mood, entry.highlight);
    }

    console.log(`✅ Generated ${entries.length} test entries`);
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
};