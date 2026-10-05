#!/usr/bin/env python3
"""Convert the Telugu IRV 2019 text (eBible VPL) to per-book JSON for the app.

Source: https://eBible.org/Scriptures/tel2017_vpl.zip
        "The Indian Revised Version Holy Bible in the Telugu language of India
         copyright (c) 2017, 2019 Bridge Connectivity Solutions"
        Licensed CC BY-SA 4.0.
Input:  /tmp/tel2017_vpl/tel2017_vpl.txt  (lines: "GEN 1:1 text...")
        66 books, 1,189 chapters, verse numbers explicit (a few chapters merge
        verses, e.g. DEU 1 skips v4 — stored with their real numbers, same as
        the previous OTSA text handled "17-18" ranges).
Output: ~/workspace/church-app-mobile/src/data/bible-text/telugu/<book>.json
        { "book": "gen", "chapters": [[[1,"v1 text"],[2,"v2 text"], ...], ...] }
"""
import json
import os
import re
from collections import OrderedDict

SRC = "/tmp/tel2017_vpl/tel2017_vpl.txt"
DST = os.path.expanduser("~/workspace/church-app-mobile/src/data/bible-text/telugu")

# VPL code -> app book id (66 canonical books, same ids as the English set)
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

VPL_RE = re.compile(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s?(.*)$")


def main():
    code_to_id = dict(BOOKS)
    books: "OrderedDict[str, OrderedDict[int, list]]" = OrderedDict()
    skipped = 0
    with open(SRC, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            m = VPL_RE.match(line)
            if not m or m.group(1) not in code_to_id:
                skipped += 1
                continue
            book_id = code_to_id[m.group(1)]
            ch, v, text = int(m.group(2)), int(m.group(3)), m.group(4).strip()
            books.setdefault(book_id, OrderedDict()).setdefault(ch, []).append([v, text])

    assert len(books) == 66, f"expected 66 books, got {len(books)}"
    total_ch = total_v = 0
    for _code, book_id in BOOKS:
        chs = books[book_id]
        # chapters must be contiguous 1..N
        assert sorted(chs.keys()) == list(range(1, len(chs) + 1)), f"gap in {book_id}"
        chapters = [chs[i] for i in range(1, len(chs) + 1)]
        total_ch += len(chapters)
        total_v += sum(len(c) for c in chapters)
        out = {"book": book_id, "chapters": chapters}
        with open(os.path.join(DST, book_id + ".json"), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
        print(f"{book_id}: {len(chapters)} chapters, {sum(len(c) for c in chapters)} verses")
    print(f"\nTOTAL: {len(books)} books, {total_ch} chapters, {total_v} verses, skipped lines: {skipped}")


if __name__ == "__main__":
    main()
