#!/usr/bin/env python3
"""Convert the OTSA Telugu text (per-chapter NNN.txt) to per-book JSON for the app.

Input:  ~/workspace/goals/mahima-ministries-church-photos-app/files/bible-text/<dir>/NNN.txt
        each line: "verse_number text" (ranges like "17-18" use the range start)
Output: ~/workspace/church-app-mobile/src/data/bible-text/telugu/<dir>.json
        { "book": "gen", "chapters": [[[1,"v1 text"],[2,"v2 text"], ...], ...] }
"""
import json
import os
import re

SRC = os.path.expanduser("~/workspace/goals/mahima-ministries-church-photos-app/files/bible-text")
DST = os.path.expanduser("~/workspace/church-app-mobile/src/data/bible-text/telugu")

VERSE_RE = re.compile(r"^(\d+(?:-\d+)?)\s+(.*)$", re.DOTALL)


def verse_num(s):
    # Combined verses like "17-18" -> use the range start (17).
    return int(s.split("-")[0])


def main():
    os.makedirs(DST, exist_ok=True)
    total_ch = 0
    total_v = 0
    books = 0
    for d in sorted(os.listdir(SRC)):
        dpath = os.path.join(SRC, d)
        if not os.path.isdir(dpath):
            continue
        files = sorted(f for f in os.listdir(dpath) if re.fullmatch(r"\d{3}\.txt", f))
        if not files:
            continue
        chapters = []
        for f in files:
            verses = []
            with open(os.path.join(dpath, f), encoding="utf-8") as fh:
                for line in fh.read().splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    m = VERSE_RE.match(line)
                    if m:
                        verses.append([verse_num(m.group(1)), m.group(2).strip()])
                    elif verses:
                        # continuation line (no verse number) — append to previous verse
                        verses[-1][1] += " " + line
            chapters.append(verses)
            total_v += len(verses)
        total_ch += len(chapters)
        books += 1
        out = {"book": d, "chapters": chapters}
        with open(os.path.join(DST, d + ".json"), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
        print(f"{d}: {len(chapters)} chapters, {sum(len(c) for c in chapters)} verses")
    print(f"\nTOTAL: {books} books, {total_ch} chapters, {total_v} verses")


if __name__ == "__main__":
    main()
