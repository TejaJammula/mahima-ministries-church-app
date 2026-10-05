// Chapter detail screen: READ / LISTEN tabs, honest auto-completion, quiz.
// - Reading auto-completes after 60 seconds of active screen time on the chapter
//   (counted only while the screen is focused and the app is in the foreground).
// - Listening auto-completes when playback finishes (didJustFinish).
// - No manual "mark complete" button anywhere.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, MutedText } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { chapterLabel, getChapter, type BibleVersionId } from "../../data/bible";
import { store } from "../../storage/store";
import { ChapterReader } from "./ChapterReader";
import { ChapterPlayer } from "./ChapterPlayer";
import { QuizFlow } from "./QuizFlow";

const READ_COMPLETE_SECONDS = 60;

interface ChapterViewProps {
  chapterKey: string;
  version: BibleVersionId;
  alreadyDone: boolean;
  bookmarkedVerses: Set<number>;
  onToggleVerse: (verse: number) => void;
  onBack: () => void;
  /** Called once per completion so the parent refreshes its stats. */
  onCompleted: () => void;
}

export function ChapterView({
  chapterKey,
  version,
  alreadyDone,
  bookmarkedVerses,
  onToggleVerse,
  onBack,
  onCompleted,
}: ChapterViewProps) {
  const { colors, fs } = useAppTheme();
  const [tab, setTab] = useState<"read" | "listen">("read");
  const [completed, setCompleted] = useState(alreadyDone);
  const [elapsed, setElapsed] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [quizPrompt, setQuizPrompt] = useState(false);
  const [screenFocused, setScreenFocused] = useState(true);
  const [appActive, setAppActive] = useState(true);
  const completedRef = useRef(alreadyDone);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const chapter = getChapter(version, chapterKey);
  const lang = version === "telugu" ? "te" : "en";
  const title = chapter ? chapterLabel(chapter, lang) : chapterKey;

  const doComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;
    await store.addChapterDone(chapterKey);
    await store.markDayComplete();
    await store.touchStreak();
    setCompleted(true);
    setQuizPrompt(true);
    onCompleted();
  }, [chapterKey, onCompleted]);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, [])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => setAppActive(s === "active"));
    return () => sub.remove();
  }, []);

  // Honest read tracking: 60s of active screen time on the chapter.
  useEffect(() => {
    if (!screenFocused || !appActive || completed) return;
    const iv = setInterval(() => {
      setElapsed((e) => {
        const n = e + 1;
        if (n >= READ_COMPLETE_SECONDS) {
          clearInterval(iv);
          void doComplete();
        }
        return n;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [screenFocused, appActive, completed, doComplete]);

  if (!chapter) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: fs(16) }}>Chapter not available.</Text>
        <Pressable onPress={onBack} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontSize: fs(15), fontWeight: "700" }}>‹ Back to Bible</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to Bible"
            style={{ paddingVertical: 8, paddingRight: 12 }}
          >
            <Text style={{ color: colors.primary, fontSize: fs(16), fontWeight: "700" }}>‹ Bible</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontSize: fs(20), fontWeight: "800", flex: 1 }}>{title}</Text>
          {completed ? (
            <Text style={{ color: colors.primary, fontSize: fs(13), fontWeight: "700" }}>✓ Completed</Text>
          ) : null}
        </View>

        {/* Tabs + quiz */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 8 }}>
          {(["read", "listen"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
              style={{
                backgroundColor: tab === t ? colors.primary : colors.primarySoft,
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 9,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: tab === t ? colors.white : colors.primary,
                  fontWeight: "700",
                  fontSize: fs(14),
                }}
              >
                {t === "read" ? "📖 Read" : "🔊 Listen"}
              </Text>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => setQuizActive(true)}
            accessibilityRole="button"
            accessibilityLabel="Take quiz"
            style={{
              borderWidth: 1.5,
              borderColor: colors.gold,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: colors.text, fontSize: fs(13), fontWeight: "700" }}>📝 Quiz</Text>
          </Pressable>
        </View>

        {!completed ? (
          <MutedText style={{ color: colors.textMuted, fontSize: fs(12), paddingHorizontal: 18, marginTop: 6 }}>
            ⏱ Reading time {elapsed}s / {READ_COMPLETE_SECONDS}s
          </MutedText>
        ) : null}

        {/* Completion → quiz prompt */}
        {quizPrompt && !quizActive ? (
          <Card style={{ backgroundColor: colors.card, borderColor: colors.gold, borderWidth: 1.5, marginHorizontal: 16, marginTop: 10 }}>
            <Text style={{ color: colors.text, fontSize: fs(17), fontWeight: "800", textAlign: "center" }}>
              Chapter complete! 🎉
            </Text>
            <MutedText style={{ color: colors.textMuted, fontSize: fs(14), textAlign: "center", marginTop: 4 }}>
              Test what you learned with a quick quiz.
            </MutedText>
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
              <Pressable
                onPress={() => {
                  setQuizPrompt(false);
                  setQuizActive(true);
                }}
                style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 22, marginRight: 8 }}
              >
                <Text style={{ color: colors.white, fontWeight: "700", fontSize: fs(15) }}>Take the quiz</Text>
              </Pressable>
              <Pressable
                onPress={() => setQuizPrompt(false)}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 22 }}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: fs(15) }}>Later</Text>
              </Pressable>
            </View>
          </Card>
        ) : null}

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {tab === "read" ? (
            <ChapterReader
              chapter={chapter}
              version={version}
              bookmarkedVerses={bookmarkedVerses}
              onToggleVerse={onToggleVerse}
            />
          ) : (
            <ChapterPlayer
              version={version}
              bookId={chapter.bookId}
              chapter={chapter.chapter}
              title={title}
              onFinished={() => void doComplete()}
            />
          )}
        </ScrollView>

        {quizActive ? (
          <QuizFlow
            chapterKey={chapterKey}
            language={lang}
            chapterLabel={title}
            onClose={() => setQuizActive(false)}
            onFinished={() => {
              setQuizActive(false);
              onCompleted();
            }}
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}
