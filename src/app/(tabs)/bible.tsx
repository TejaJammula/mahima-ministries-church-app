// Bible tab: My Spiritual Journey dashboard, reading-plan onboarding,
// version switcher, chapter picker, search, and bookmarks.
// English UI; Telugu appears only inside Telugu Bible text.
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Chip, MutedText, SectionTitle } from "../../components/ui";
import { useAppTheme } from "../../theme/ThemeContext";
import {
  BIBLE_VERSIONS,
  BUNDLED_CHAPTER_KEYS,
  chapterLabel,
  getChapter,
  type BibleVersionId,
} from "../../data/bible";
import {
  store,
  todayKey,
  type Bookmark,
  type Profile,
  type ReadingPlan,
} from "../../storage/store";
import { JourneyCard, TOTAL_CHAPTERS, type JourneyStats } from "../../components/bible/JourneyCard";
import { PlanCard } from "../../components/bible/PlanCard";
import { ChapterView } from "../../components/bible/ChapterView";

interface SearchHit {
  version: BibleVersionId;
  key: string;
  verse: number;
  text: string;
  label: string;
}

const EMPTY_STATS: JourneyStats = { biblePct: 0, chaptersDone: 0, streakDays: 0, quizAvg: null };

export default function BibleScreen() {
  const { colors, fs } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [chaptersDone, setChaptersDone] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<JourneyStats>(EMPTY_STATS);
  const [version, setVersion] = useState<BibleVersionId>("telugu");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const versionLocked = useRef(false);

  const loadAll = useCallback(async () => {
    const [p, pl, done, st, scores, bm] = await Promise.all([
      store.getProfile(),
      store.getPlan(),
      store.getChaptersDone(),
      store.getStreak(),
      store.getQuizScores(),
      store.getBookmarks(),
    ]);
    setProfile(p);
    setPlan(pl);
    setChaptersDone(done);
    setBookmarks(bm);
    const entries = Object.values(scores);
    const avg =
      entries.length > 0
        ? (entries.reduce((a, s) => a + s.score / Math.max(1, s.total), 0) / entries.length) * 100
        : null;
    setStats({
      biblePct: (done.length / TOTAL_CHAPTERS) * 100,
      chaptersDone: done.length,
      streakDays: st.count,
      quizAvg: avg,
    });
    if (pl && !versionLocked.current) setVersion(pl.version);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAll();
    }, [loadAll])
  );

  const openChapter = useCallback((key: string, v?: BibleVersionId) => {
    if (v) {
      versionLocked.current = true;
      setVersion(v);
    }
    setOpenKey(key);
  }, []);

  const startPlan = useCallback(
    async (durationDays: number, v: BibleVersionId) => {
      const p: ReadingPlan = { durationDays, version: v, startDate: todayKey() };
      await store.savePlan(p);
      setPlan(p);
      versionLocked.current = true;
      setVersion(v);
    },
    []
  );

  const handleToggleVerse = useCallback(
    async (verseNum: number) => {
      if (!openKey) return;
      const ch = getChapter(version, openKey);
      if (!ch) return;
      await store.toggleBookmark({ version, bookId: ch.bookId, chapter: ch.chapter, verse: verseNum });
      setBookmarks(await store.getBookmarks());
    },
    [openKey, version]
  );

  const removeBookmark = useCallback(async (b: Bookmark) => {
    await store.toggleBookmark(b);
    setBookmarks(await store.getBookmarks());
  }, []);

  const bookmarkedVerses = useMemo(() => {
    if (!openKey) return new Set<number>();
    const ch = getChapter(version, openKey);
    if (!ch) return new Set<number>();
    return new Set(
      bookmarks
        .filter((b) => b.version === version && b.bookId === ch.bookId && b.chapter === ch.chapter)
        .map((b) => b.verse)
    );
  }, [bookmarks, openKey, version]);

  const results = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const hits: SearchHit[] = [];
    for (const key of BUNDLED_CHAPTER_KEYS) {
      for (const v of BIBLE_VERSIONS) {
        const ch = getChapter(v.id, key);
        if (!ch) continue;
        const label = chapterLabel(ch, v.language);
        for (const verse of ch.verses) {
          if (verse.text.toLowerCase().includes(q)) {
            hits.push({ version: v.id, key, verse: verse.n, text: verse.text, label });
            if (hits.length >= 30) return hits;
          }
        }
      }
    }
    return hits;
  }, [query]);

  if (openKey) {
    return (
      <ChapterView
        key={`${openKey}:${version}`}
        chapterKey={openKey}
        version={version}
        alreadyDone={chaptersDone.includes(openKey)}
        bookmarkedVerses={bookmarkedVerses}
        onToggleVerse={(n) => void handleToggleVerse(n)}
        onBack={() => setOpenKey(null)}
        onCompleted={() => void loadAll()}
      />
    );
  }

  const lang = version === "telugu" ? "te" : "en";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. My Spiritual Journey dashboard */}
          <JourneyCard profile={profile} stats={stats} />

          {/* 2. Plan onboarding / today's portion */}
          <PlanCard
            profile={profile}
            plan={plan}
            onLogin={() => router.push("/login")}
            onStartPlan={(d, v) => void startPlan(d, v)}
            onOpenChapter={openChapter}
          />

          {/* 3. Version switcher — Telugu is never labelled KJV */}
          <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Bible version</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 4 }}>
            {BIBLE_VERSIONS.map((v) => (
              <Chip
                key={v.id}
                label={v.label}
                selected={version === v.id}
                onPress={() => {
                  versionLocked.current = true;
                  setVersion(v.id);
                }}
              />
            ))}
          </View>

          {/* 4. Chapter picker (bundled subset) */}
          <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Chapters</SectionTitle>
          {BUNDLED_CHAPTER_KEYS.map((key) => {
            const ch = getChapter(version, key);
            if (!ch) return null;
            const done = chaptersDone.includes(key);
            return (
              <Pressable
                key={key}
                onPress={() => openChapter(key)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${chapterLabel(ch, lang)}`}
              >
                <Card style={{ backgroundColor: colors.card, borderColor: done ? colors.gold : colors.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: fs(17), fontWeight: "700" }}>
                        {chapterLabel(ch, lang)}
                      </Text>
                      <MutedText style={{ color: colors.textMuted, fontSize: fs(13), marginTop: 2 }}>
                        {ch.verses.length} verses
                      </MutedText>
                    </View>
                    {done ? (
                      <Text style={{ color: colors.primary, fontSize: fs(13), fontWeight: "700" }}>✓ Done</Text>
                    ) : null}
                    <Text style={{ color: colors.primary, fontSize: fs(20), marginLeft: 8 }}>›</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
          <MutedText style={{ color: colors.textMuted, fontSize: fs(13), fontStyle: "italic", marginBottom: 4 }}>
            Full 66-book text coming soon.
          </MutedText>

          {/* 5. Search across bundled chapters in both versions */}
          <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Search the Bible</SectionTitle>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search verses…"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text,
              fontSize: fs(15),
              marginBottom: 8,
            }}
          />
          {query.trim().length >= 2 && results.length === 0 ? (
            <MutedText style={{ color: colors.textMuted, fontSize: fs(14), marginBottom: 8 }}>
              No verses found.
            </MutedText>
          ) : null}
          {results.map((r, i) => (
            <Pressable
              key={`${r.version}:${r.key}:${r.verse}:${i}`}
              onPress={() => openChapter(r.key, r.version)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${r.label} verse ${r.verse}`}
            >
              <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text style={{ color: colors.primary, fontSize: fs(13), fontWeight: "700" }}>
                  {r.label} · v{r.verse} · {r.version === "telugu" ? "తెలుగు" : "English"}
                </Text>
                <Text style={{ color: colors.text, fontSize: fs(14), marginTop: 4 }} numberOfLines={2}>
                  {r.text}
                </Text>
              </Card>
            </Pressable>
          ))}

          {/* 6. Bookmarks */}
          <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Bookmarks</SectionTitle>
          {bookmarks.length === 0 ? (
            <MutedText style={{ color: colors.textMuted, fontSize: fs(14) }}>
              No bookmarks yet — tap a verse while reading to save it here.
            </MutedText>
          ) : (
            bookmarks.map((b, i) => {
              const bch = getChapter(b.version, `${b.bookId}:${b.chapter}`);
              const bverse = bch?.verses.find((v) => v.n === b.verse);
              const blabel = bch
                ? chapterLabel(bch, b.version === "telugu" ? "te" : "en")
                : `${b.bookId} ${b.chapter}`;
              return (
                <Pressable
                  key={`${b.version}:${b.bookId}:${b.chapter}:${b.verse}:${i}`}
                  onPress={() => openChapter(`${b.bookId}:${b.chapter}`, b.version)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open bookmark ${blabel} verse ${b.verse}`}
                >
                  <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.primary, fontSize: fs(13), fontWeight: "700" }}>
                          {blabel} · v{b.verse} · {b.version === "telugu" ? "తెలుగు" : "English"}
                        </Text>
                        {bverse ? (
                          <Text style={{ color: colors.text, fontSize: fs(14), marginTop: 4 }} numberOfLines={2}>
                            {bverse.text}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => void removeBookmark(b)}
                        accessibilityRole="button"
                        accessibilityLabel="Remove bookmark"
                        style={{ padding: 8, marginLeft: 4 }}
                      >
                        <Text style={{ color: colors.textMuted, fontSize: fs(18) }}>✕</Text>
                      </Pressable>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
