// READ tab: verse list with tap-to-bookmark. Font size follows the app text-size setting.
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import type { BibleVersionId, ChapterData } from "../../data/bible";

interface ChapterReaderProps {
  chapter: ChapterData;
  version: BibleVersionId;
  bookmarkedVerses: Set<number>;
  onToggleVerse: (verse: number) => void;
}

export function ChapterReader({ chapter, version, bookmarkedVerses, onToggleVerse }: ChapterReaderProps) {
  const { colors, fs } = useAppTheme();

  return (
    <View>
      {chapter.verses.map((v) => {
        const saved = bookmarkedVerses.has(v.n);
        return (
          <Pressable
            key={v.n}
            onPress={() => onToggleVerse(v.n)}
            accessibilityRole="button"
            accessibilityLabel={`Verse ${v.n}${saved ? ", bookmarked" : ""} — tap to ${saved ? "remove bookmark" : "bookmark"}`}
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: fs(15),
                fontWeight: "800",
                width: 34,
                marginTop: 2,
              }}
            >
              {v.n}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: fs(17),
                lineHeight: fs(26),
                flex: 1,
              }}
            >
              {v.text}
            </Text>
            <Text
              style={{
                color: saved ? colors.gold : colors.textMuted,
                fontSize: fs(20),
                marginLeft: 8,
                marginTop: 2,
              }}
            >
              {saved ? "★" : "☆"}
            </Text>
          </Pressable>
        );
      })}
      {version === "telugu" ? (
        <Text style={{ color: colors.textMuted, fontSize: fs(12), marginTop: 12, fontStyle: "italic" }}>
          Telugu text shown from the OTSA stand-in edition.
        </Text>
      ) : null}
    </View>
  );
}
