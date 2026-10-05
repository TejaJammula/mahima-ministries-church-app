#!/usr/bin/env python3
"""Generate src/data/bookList.generated.ts: 66-book list + lazy require maps.

Verifies chapter counts against the generated JSON before writing.
Run after convert_telugu.py / convert_english.py.
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BIBLE = os.path.expanduser(
    "~/workspace/goals/mahima-ministries-church-photos-app/files/bible-text")
OUT = os.path.join(BASE, "src", "data", "bookList.generated.ts")

ENGLISH = [
    ("gen", "Genesis", 50), ("exo", "Exodus", 40), ("lev", "Leviticus", 27),
    ("num", "Numbers", 36), ("deu", "Deuteronomy", 34), ("jos", "Joshua", 24),
    ("jdg", "Judges", 21), ("rut", "Ruth", 4), ("1sa", "1 Samuel", 31),
    ("2sa", "2 Samuel", 24), ("1ki", "1 Kings", 22), ("2ki", "2 Kings", 25),
    ("1ch", "1 Chronicles", 29), ("2ch", "2 Chronicles", 36), ("ezr", "Ezra", 10),
    ("neh", "Nehemiah", 13), ("est", "Esther", 10), ("job", "Job", 42),
    ("psa", "Psalms", 150), ("pro", "Proverbs", 31), ("ecc", "Ecclesiastes", 12),
    ("sng", "Song of Solomon", 8), ("isa", "Isaiah", 66), ("jer", "Jeremiah", 52),
    ("lam", "Lamentations", 5), ("ezk", "Ezekiel", 48), ("dan", "Daniel", 12),
    ("hos", "Hosea", 14), ("jol", "Joel", 3), ("amo", "Amos", 9),
    ("oba", "Obadiah", 1), ("jon", "Jonah", 4), ("mic", "Micah", 7),
    ("nam", "Nahum", 3), ("hab", "Habakkuk", 3), ("zep", "Zephaniah", 3),
    ("hag", "Haggai", 2), ("zec", "Zechariah", 14), ("mal", "Malachi", 4),
    ("mat", "Matthew", 28), ("mrk", "Mark", 16), ("luk", "Luke", 24),
    ("jhn", "John", 21), ("act", "Acts", 28), ("rom", "Romans", 16),
    ("1co", "1 Corinthians", 16), ("2co", "2 Corinthians", 13),
    ("gal", "Galatians", 6), ("eph", "Ephesians", 6), ("php", "Philippians", 4),
    ("col", "Colossians", 4), ("1th", "1 Thessalonians", 5),
    ("2th", "2 Thessalonians", 3), ("1ti", "1 Timothy", 6), ("2ti", "2 Timothy", 4),
    ("tit", "Titus", 3), ("phm", "Philemon", 1), ("heb", "Hebrews", 13),
    ("jas", "James", 5), ("1pe", "1 Peter", 5), ("2pe", "2 Peter", 3),
    ("1jn", "1 John", 5), ("2jn", "2 John", 1), ("3jn", "3 John", 1),
    ("jud", "Jude", 1), ("rev", "Revelation", 22),
]

BOOK_JSON = "Record<string, () => { book: string; chapters: [number, string][][] }>"


def main():
    te_names = {b["dir"]: b["telugu_name"]
                for b in json.load(open(os.path.join(SRC_BIBLE, "books.json")))["books"]}
    assert len(ENGLISH) == 66 and len(te_names) == 66
    for bid, _, ch in ENGLISH:
        assert bid in te_names, bid
        for lang in ("telugu", "english"):
            d = json.load(open(os.path.join(
                BASE, "src", "data", "bible-text", lang, bid + ".json")))
            assert len(d["chapters"]) == ch, f"{lang}/{bid}"

    lines = [
        "// Generated book list — 66 books. Do not edit by hand.",
        "// Regenerate with: python3 tools/gen_booklist.py",
        "// Lazy per-book loaders: Metro statically bundles each literal require();",
        "// a book's JSON is parsed only the first time its loader is called.",
        'import type { BookInfo } from "./bible";',
        "declare function require(path: string): { book: string; chapters: [number, string][][] };",
        "",
        "export const BOOK_LIST: BookInfo[] = [",
    ]
    for bid, name, ch in ENGLISH:
        te = te_names[bid].replace('"', '\\"')
        lines.append(f'  {{ id: "{bid}", name: "{name}", nameTe: "{te}", chapters: {ch} }},')
    lines.append("];")
    lines.append("")
    for lang in ("telugu", "english"):
        lines.append(f"export const {lang.upper()}_BOOKS: {BOOK_JSON} = {{")
        for bid, _, _ in ENGLISH:
            lines.append(f'  "{bid}": () => require("./bible-text/{lang}/{bid}.json"),')
        lines.append("};")
        lines.append("")
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines))
    print(f"wrote {OUT} — all chapter counts verified")


if __name__ == "__main__":
    main()
