#!/usr/bin/env python3
"""Convert eBible KJV VPL (verse-per-line) to per-book JSON for the app.

Input:  /tmp/kjv_vpl/eng-kjv_vpl.txt  (lines: "GEN 1:1 text...")
        Apocrypha books are skipped — 66 canonical books only.
Output: ~/workspace/church-app-mobile/src/data/bible-text/english/<book>.json
        { "book": "gen", "chapters": [["v1 text", "v2 text", ...], ...] }
"""
import json
import os
import re
from collections import OrderedDict

SRC = "/tmp/kjv_vpl/eng-kjv_vpl.txt"
DST = os.path.expanduser("~/workspace/church-app-mobile/src/data/bible-text/english")

# VPL code -> app book id (66 canonical books, KJV order)
BOOKS = [
    ("GEN", "gen"), ("EXO", "exo"), ("LEV", "lev"), ("NUM", "num"), ("DEU", "deu"),
    ("JOS", "jos"), ("JDG", "jdg"), ("RUT", "rut"), ("1SA", "1sa"), ("2SA", "2sa"),
    ("1KI", "1ki"), ("2KI", "2ki"), ("1CH", "1ch"), ("2CH", "2ch"), ("EZR", "ezr"),
    ("NEH", "neh"), ("EST", "est"), ("JOB", "job"), ("PSA", "psa"), ("PRO", "pro"),
    ("ECC", "ecc"), ("SOL", "sng"), ("ISA", "isa"), ("JER", "jer"), ("LAM", "lam"),
    ("EZE", "ezk"), ("DAN", "dan"), ("HOS", "hos"), ("JOE", "jol"), ("AMO", "amo"),
    ("OBA", "oba"), ("JON", "jon"), ("MIC", "mic"), ("NAH", "nam"), ("HAB", "hab"),
    ("ZEP", "zep"), ("HAG", "hag"), ("ZEC", "zec"), ("MAL", "mal"), ("MAT", "mat"),
    ("MAR", "mrk"), ("LUK", "luk"), ("JOH", "jhn"), ("ACT", "act"), ("ROM", "rom"),
    ("1CO", "1co"), ("2CO", "2co"), ("GAL", "gal"), ("EPH", "eph"), ("PHI", "php"),
    ("COL", "col"), ("1TH", "1th"), ("2TH", "2th"), ("1TI", "1ti"), ("2TI", "2ti"),
    ("TIT", "tit"), ("PHM", "phm"), ("HEB", "heb"), ("JAM", "jas"), ("1PE", "1pe"),
    ("2PE", "2pe"), ("1JO", "1jn"), ("2JO", "2jn"), ("3JO", "3jn"), ("JUD", "jud"),
    ("REV", "rev"),
]
VPL2ID = dict(BOOKS)
LINE_RE = re.compile(r"^([A-Z0-9]{3}) (\d+):(\d+) (.*)$")


def main():
    os.makedirs(DST, exist_ok=True)
    # book_id -> list of chapters -> list of verse texts
    data = OrderedDict((bid, []) for _, bid in BOOKS)
    total_v = 0
    with open(SRC, encoding="utf-8") as fh:
        for line in fh:
            line = line.rstrip("\n")
            m = LINE_RE.match(line)
            if not m:
                continue
            code, ch, _vs, text = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4)
            if code not in VPL2ID:
                continue  # Apocrypha — skip
            bid = VPL2ID[code]
            chapters = data[bid]
            while len(chapters) < ch:
                chapters.append([])
            chapters[ch - 1].append([_vs, text.strip()])
            total_v += 1
    total_ch = 0
    for _, bid in BOOKS:
        chapters = data[bid]
        total_ch += len(chapters)
        out = {"book": bid, "chapters": chapters}
        with open(os.path.join(DST, bid + ".json"), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
        print(f"{bid}: {len(chapters)} chapters, {sum(len(c) for c in chapters)} verses")
    print(f"\nTOTAL: {len(BOOKS)} books, {total_ch} chapters, {total_v} verses")


if __name__ == "__main__":
    main()
