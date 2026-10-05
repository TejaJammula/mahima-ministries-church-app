// Bible text data layer.
// Architecture: version-switching is built in. The bundled subset (Genesis 1,
// Psalm 23, John 1) demonstrates the reader; the full 66-book text swaps in
// later by replacing getChapter()'s source with the complete JSON/downloaded pack.
// IMPORTANT: The Telugu text bundled here is OTSA (Biblica Open Telugu
// Contemporary Version, CC BY-SA 4.0) as a STAND-IN. Tj ultimately wants a
// Telugu KJV-tradition text. Do NOT label the Telugu version "KJV" anywhere
// user-facing until a verified Telugu KJV source is in place.
import teluguChapters from "./teluguChapters.json";

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

const TELUGU = teluguChapters as Record<string, ChapterData>;

// English KJV — public domain. Subset mirrors the bundled Telugu chapters.
const ENGLISH: Record<string, ChapterData> = {
  "gen:1": {
    bookId: "gen",
    book: "Genesis",
    bookTe: "ఆదికాండం",
    chapter: 1,
    isPartial: true,
    verses: [
      { n: 1, text: "In the beginning God created the heaven and the earth." },
      { n: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
      { n: 3, text: "And God said, Let there be light: and there was light." },
      { n: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
      { n: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
      { n: 6, text: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters." },
      { n: 7, text: "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so." },
      { n: 8, text: "And God called the firmament Heaven. And the evening and the morning were the second day." },
      { n: 9, text: "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so." },
      { n: 10, text: "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good." },
    ],
  },
  "psa:23": {
    bookId: "psa",
    book: "Psalms",
    bookTe: "కీర్తనలు",
    chapter: 23,
    verses: [
      { n: 1, text: "The LORD is my shepherd; I shall not want." },
      { n: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
      { n: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
      { n: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
      { n: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
      { n: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
    ],
  },
  "jhn:1": {
    bookId: "jhn",
    book: "John",
    bookTe: "యోహాను",
    chapter: 1,
    isPartial: true,
    verses: [
      { n: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { n: 2, text: "The same was in the beginning with God." },
      { n: 3, text: "All things were made by him; and without him was not any thing made that was made." },
      { n: 4, text: "In him was life; and the life was the light of men." },
      { n: 5, text: "And the light shineth in darkness; and the darkness comprehended it not." },
      { n: 6, text: "There was a man sent from God, whose name was John." },
      { n: 7, text: "The same came for a witness, to bear witness of the Light, that all men through him might believe." },
      { n: 8, text: "He was not that Light, but was sent to bear witness of that Light." },
      { n: 9, text: "That was the true Light, which lighteth every man that cometh into the world." },
    ],
  },
};

export const BUNDLED_CHAPTER_KEYS = ["gen:1", "psa:23", "jhn:1"] as const;

export interface BookInfo {
  id: string;
  name: string;
  nameTe: string;
  chapters: number;
}

export const BOOK_LIST: BookInfo[] = [
  { id: "gen", name: "Genesis", nameTe: "ఆదికాండం", chapters: 50 },
  { id: "psa", name: "Psalms", nameTe: "కీర్తనలు", chapters: 150 },
  { id: "jhn", name: "John", nameTe: "యోహాను", chapters: 21 },
];

export function getChapter(version: BibleVersionId, key: string): ChapterData | undefined {
  return version === "telugu" ? TELUGU[key] : ENGLISH[key];
}

export function chapterLabel(ch: ChapterData, language: "te" | "en"): string {
  return language === "te" ? `${ch.bookTe} ${ch.chapter}` : `${ch.book} ${ch.chapter}`;
}
