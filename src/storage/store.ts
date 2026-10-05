// Local persistence via AsyncStorage.
// All progress, quiz scores, streaks, bookmarks, and settings live here now.
// STRUCTURED FOR FIREBASE SYNC LATER: every record is keyed by user and the
// store module exposes loadAll/saveAll so a Firebase adapter can drop in
// behind the same interface without touching UI code.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  profile: "mm.profile",
  plan: "mm.plan",
  completions: "mm.completions",
  chaptersDone: "mm.chaptersDone",
  quizScores: "mm.quizScores",
  streak: "mm.streak",
  bookmarks: "mm.bookmarks",
  settings: "mm.settings",
  readingSeconds: "mm.readingSeconds",
} as const;

export interface Profile {
  firstName: string;
  lastName: string;
  branch: string;
  email: string;
}

export interface ReadingPlan {
  durationDays: number; // 90 | 180 | 365
  version: "telugu" | "english-kjv";
  startDate: string; // ISO date
}

export interface QuizScore {
  score: number;
  total: number;
  date: string;
}

export interface Bookmark {
  version: "telugu" | "english-kjv";
  bookId: string;
  chapter: number;
  verse: number;
}

export interface Settings {
  textSize: number; // multiplier, 0.85 - 1.3
  theme: "light" | "dark" | "system";
}

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export const store = {
  // Profile
  getProfile: () => get<Profile | null>(KEYS.profile, null),
  saveProfile: (p: Profile) => set(KEYS.profile, p),
  clearProfile: () => AsyncStorage.removeItem(KEYS.profile),

  // Reading plan
  getPlan: () => get<ReadingPlan | null>(KEYS.plan, null),
  savePlan: (p: ReadingPlan) => set(KEYS.plan, p),

  // Daily completions: { "2026-10-05": true }
  getCompletions: () => get<Record<string, boolean>>(KEYS.completions, {}),
  markDayComplete: async (date = todayKey()) => {
    const c = await get<Record<string, boolean>>(KEYS.completions, {});
    c[date] = true;
    await set(KEYS.completions, c);
  },

  // Chapters finished: ["gen:1", "psa:23"]
  getChaptersDone: () => get<string[]>(KEYS.chaptersDone, []),
  addChapterDone: async (key: string) => {
    const list = await get<string[]>(KEYS.chaptersDone, []);
    if (!list.includes(key)) {
      list.push(key);
      await set(KEYS.chaptersDone, list);
    }
  },

  // Quiz scores keyed by chapter: { "gen:1": {score,total,date} }
  getQuizScores: () => get<Record<string, QuizScore>>(KEYS.quizScores, {}),
  saveQuizScore: async (chapterKey: string, score: number, total: number) => {
    const s = await get<Record<string, QuizScore>>(KEYS.quizScores, {});
    s[chapterKey] = { score, total, date: todayKey() };
    await set(KEYS.quizScores, s);
  },

  // Streak: { count, lastDate }
  getStreak: () => get<{ count: number; lastDate: string | null }>(KEYS.streak, { count: 0, lastDate: null }),
  touchStreak: async (date = todayKey()) => {
    const s = await get<{ count: number; lastDate: string | null }>(KEYS.streak, { count: 0, lastDate: null });
    if (s.lastDate === date) return s;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = s.lastDate === todayKey(yesterday);
    const next = { count: isConsecutive ? s.count + 1 : 1, lastDate: date };
    await set(KEYS.streak, next);
    return next;
  },

  // Bookmarks
  getBookmarks: () => get<Bookmark[]>(KEYS.bookmarks, []),
  toggleBookmark: async (b: Bookmark) => {
    const list = await get<Bookmark[]>(KEYS.bookmarks, []);
    const i = list.findIndex(
      (x) => x.version === b.version && x.bookId === b.bookId && x.chapter === b.chapter && x.verse === b.verse
    );
    if (i >= 0) list.splice(i, 1);
    else list.push(b);
    await set(KEYS.bookmarks, list);
    return i < 0; // true if now bookmarked
  },

  // Settings
  getSettings: () => get<Settings>(KEYS.settings, { textSize: 1, theme: "light" }),
  saveSettings: (s: Settings) => set(KEYS.settings, s),

  // Reading seconds per day (honest read tracking): { "2026-10-05": 320 }
  getReadingSeconds: () => get<Record<string, number>>(KEYS.readingSeconds, {}),
  addReadingSeconds: async (secs: number, date = todayKey()) => {
    const r = await get<Record<string, number>>(KEYS.readingSeconds, {});
    r[date] = (r[date] || 0) + secs;
    await set(KEYS.readingSeconds, r);
  },
};
