// Bible text data layer — FULL 66-book text in both versions.
//
// Architecture: per-book JSON files are loaded LAZILY through static require
// maps (see bookList.generated.ts). Metro bundles every book, but a book's
// JSON is parsed only the first time it is opened — the whole 14MB is never
// held in memory at once.
//
// IMPORTANT: The Telugu text bundled here is OTSA (Biblica Open Telugu
// Contemporary Version, CC BY-SA 4.0) as a STAND-IN. Tj ultimately wants a
// Telugu KJV-tradition text. Do NOT label the Telugu version "KJV" anywhere
// user-facing until a verified Telugu KJV source is in place.
import {
  BOOK_LIST,
  ENGLISH_BOOKS,
  TELUGU_BOOKS,
} from "./bookList.generated";

export type BibleVersionId = "telugu" | "english-kjv";

export interface BibleVersion {
  id: BibleVersionId;
  /** User-facing label. Telugu version is NOT labelled KJV (stand-in text). */
  label: string;
  language: "te" | "en";
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "telugu", label: "తెలుగు", language: "te" },
  { id: "english-kjv", label: "English KJV", language: "en" },
];

export interface Verse {
  n: number;
  text: string;
}

export interface ChapterData {
  bookId: string;
  book: string;
  bookTe: string;
  chapter: number;
  verses: Verse[];
  /** True when this chapter is a bundled demo subset rather than full text. */
  isPartial?: boolean;
}

export interface BookInfo {
  id: string;
  name: string;
  nameTe: string;
  chapters: number;
}

export { BOOK_LIST };

const LOADERS: Record<
  BibleVersionId,
  Record<string, () => { book: string; chapters: [number, string][][] }>
> = {
  telugu: TELUGU_BOOKS,
  "english-kjv": ENGLISH_BOOKS,
};

function bookInfo(bookId: string): BookInfo | undefined {
  return BOOK_LIST.find((b) => b.id === bookId);
}

/** Load one chapter. Key format: "bookId:chapter", e.g. "gen:1", "psa:23". */
export function getChapter(version: BibleVersionId, key: string): ChapterData | undefined {
  const sep = key.indexOf(":");
  if (sep < 0) return undefined;
  const bookId = key.slice(0, sep);
  const chapter = parseInt(key.slice(sep + 1), 10);
  const info = bookInfo(bookId);
  const load = LOADERS[version][bookId];
  if (!info || !load || !chapter || chapter < 1 || chapter > info.chapters) return undefined;
  const data = load();
  const verses = data.chapters[chapter - 1];
  if (!verses || verses.length === 0) return undefined;
  return {
    bookId,
    book: info.name,
    bookTe: info.nameTe,
    chapter,
    // Verse numbers come from the source text (Telugu OTSA merges a few
    // verses, e.g. "17-18", which is stored under the range start).
    verses: verses.map(([n, text]) => ({ n, text })),
  };
}

export function chapterLabel(ch: ChapterData, language: "te" | "en"): string {
  return language === "te" ? `${ch.bookTe} ${ch.chapter}` : `${ch.book} ${ch.chapter}`;
}

/** Total chapters across the whole Bible (1,189). */
export const TOTAL_CHAPTERS: number = BOOK_LIST.reduce((sum, b) => sum + b.chapters, 0);

/**
 * Deterministic chapter key at a flat 0-based index across the whole Bible.
 * Used to rotate "today's portion" through all 1,189 chapters.
 */
export function chapterKeyAtIndex(index: number): string {
  let i = ((index % TOTAL_CHAPTERS) + TOTAL_CHAPTERS) % TOTAL_CHAPTERS;
  for (const b of BOOK_LIST) {
    if (i < b.chapters) return `${b.id}:${i + 1}`;
    i -= b.chapters;
  }
  return "gen:1";
}

export interface SearchHit {
  version: BibleVersionId;
  key: string;
  verse: number;
  text: string;
  label: string;
}

/**
 * Search verses across the whole Bible in one version. Books load lazily as
 * the search walks them; the walk stops once `limit` hits are found.
 */
export function searchVersion(
  version: BibleVersionId,
  query: string,
  limit: number = 30
): SearchHit[] {
  const q = query.trim().toLowerCase();
  const hits: SearchHit[] = [];
  if (q.length < 2) return hits;
  const lang = version === "telugu" ? "te" : "en";
  for (const b of BOOK_LIST) {
    for (let c = 1; c <= b.chapters; c++) {
      const ch = getChapter(version, `${b.id}:${c}`);
      if (!ch) continue;
      const label = chapterLabel(ch, lang);
      for (const verse of ch.verses) {
        if (verse.text.toLowerCase().includes(q)) {
          hits.push({ version, key: `${b.id}:${c}`, verse: verse.n, text: verse.text, label });
          if (hits.length >= limit) return hits;
        }
      }
    }
  }
  return hits;
}
