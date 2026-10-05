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

/** Everything that syncs to the member's cloud account. */
export interface ProgressSnapshot {
  plan: ReadingPlan | null;
  completions: Record<string, boolean>;
  chaptersDone: string[];
  quizScores: Record<string, QuizScore>;
  streak: { count: number; lastDate: string | null };
  bookmarks: Bookmark[];
  readingSeconds: Record<string, number>;
  settings: Settings;
}

type ProgressListener = () => void;
const progressListeners = new Set<ProgressListener>();

/**
 * Subscribe to local progress changes. The cloud-sync module registers here
 * so every mutation below triggers a debounced Firestore push.
 */
export function onProgressChanged(cb: ProgressListener): () => void {
  progressListeners.add(cb);
  return () => {
    progressListeners.delete(cb);
  };
}

function notifyProgressChanged(): void {
  for (const cb of progressListeners) {
    try {
      cb();
    } catch {
      // Listener failures must never break local storage.
    }
  }
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
  savePlan: async (p: ReadingPlan) => {
    await set(KEYS.plan, p);
    notifyProgressChanged();
  },

  // Daily completions: { "2026-10-05": true }
  getCompletions: () => get<Record<string, boolean>>(KEYS.completions, {}),
  markDayComplete: async (date = todayKey()) => {
    const c = await get<Record<string, boolean>>(KEYS.completions, {});
    c[date] = true;
    await set(KEYS.completions, c);
    notifyProgressChanged();
  },

  // Chapters finished: ["gen:1", "psa:23"]
  getChaptersDone: () => get<string[]>(KEYS.chaptersDone, []),
  addChapterDone: async (key: string) => {
    const list = await get<string[]>(KEYS.chaptersDone, []);
    if (!list.includes(key)) {
      list.push(key);
      await set(KEYS.chaptersDone, list);
      notifyProgressChanged();
    }
  },

  // Quiz scores keyed by chapter: { "gen:1": {score,total,date} }
  getQuizScores: () => get<Record<string, QuizScore>>(KEYS.quizScores, {}),
  saveQuizScore: async (chapterKey: string, score: number, total: number) => {
    const s = await get<Record<string, QuizScore>>(KEYS.quizScores, {});
    s[chapterKey] = { score, total, date: todayKey() };
    await set(KEYS.quizScores, s);
    notifyProgressChanged();
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
    notifyProgressChanged();
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
    notifyProgressChanged();
    return i < 0; // true if now bookmarked
  },

  // Settings
  getSettings: () => get<Settings>(KEYS.settings, { textSize: 1, theme: "light" }),
  saveSettings: async (s: Settings) => {
    await set(KEYS.settings, s);
    notifyProgressChanged();
  },

  // Reading seconds per day (honest read tracking): { "2026-10-05": 320 }
  getReadingSeconds: () => get<Record<string, number>>(KEYS.readingSeconds, {}),
  addReadingSeconds: async (secs: number, date = todayKey()) => {
    const r = await get<Record<string, number>>(KEYS.readingSeconds, {});
    r[date] = (r[date] || 0) + secs;
    await set(KEYS.readingSeconds, r);
    notifyProgressChanged();
  },

  // ---- Firebase sync interface ----
  // Read/write the whole progress snapshot at once so the cloud adapter
  // can push/pull without knowing individual keys.
  loadAll: async (): Promise<ProgressSnapshot> => {
    const [plan, completions, chaptersDone, quizScores, streak, bookmarks, readingSeconds, settings] =
      await Promise.all([
        get<ReadingPlan | null>(KEYS.plan, null),
        get<Record<string, boolean>>(KEYS.completions, {}),
        get<string[]>(KEYS.chaptersDone, []),
        get<Record<string, QuizScore>>(KEYS.quizScores, {}),
        get<{ count: number; lastDate: string | null }>(KEYS.streak, { count: 0, lastDate: null }),
        get<Bookmark[]>(KEYS.bookmarks, []),
        get<Record<string, number>>(KEYS.readingSeconds, {}),
        get<Settings>(KEYS.settings, { textSize: 1, theme: "light" }),
      ]);
    return { plan, completions, chaptersDone, quizScores, streak, bookmarks, readingSeconds, settings };
  },

  saveAll: async (snap: ProgressSnapshot): Promise<void> => {
    await Promise.all([
      set(KEYS.plan, snap.plan),
      set(KEYS.completions, snap.completions),
      set(KEYS.chaptersDone, snap.chaptersDone),
      set(KEYS.quizScores, snap.quizScores),
      set(KEYS.streak, snap.streak),
      set(KEYS.bookmarks, snap.bookmarks),
      set(KEYS.readingSeconds, snap.readingSeconds),
      set(KEYS.settings, snap.settings),
    ]);
    notifyProgressChanged();
  },
};
