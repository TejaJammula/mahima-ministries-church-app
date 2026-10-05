// Book -> chapter picker for the full 66-book Bible.
// Tapping a book expands a grid of its chapter numbers.
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Card, MutedText, SectionTitle } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { BOOK_LIST } from "../../data/bible";

interface Props {
  lang: "te" | "en";
  chaptersDone: string[];
  onOpenChapter: (key: string) => void;
}

export function BookChapterPicker({ lang, chaptersDone, onOpenChapter }: Props) {
  const { colors, fs } = useAppTheme();
  const [openBook, setOpenBook] = useState<string | null>(null);

  return (
    <View>
      <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Chapters</SectionTitle>
      {BOOK_LIST.map((b) => {
        const name = lang === "te" ? b.nameTe : b.name;
        const expanded = openBook === b.id;
        return (
          <View key={b.id}>
            <Pressable
              onPress={() => setOpenBook(expanded ? null : b.id)}
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${b.chapters} chapters`}
            >
              <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: fs(16), fontWeight: "700" }}>
                      {name}
                    </Text>
                    <MutedText style={{ color: colors.textMuted, fontSize: fs(13), marginTop: 2 }}>
                      {b.chapters} chapters
                    </MutedText>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: fs(20) }}>
                    {expanded ? "▾" : "›"}
                  </Text>
                </View>
              </Card>
            </Pressable>
            {expanded ? (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  paddingHorizontal: 4,
                  marginBottom: 8,
                }}
              >
                {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => {
                  const key = `${b.id}:${c}`;
                  const done = chaptersDone.includes(key);
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onOpenChapter(key)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${name} ${c}`}
                      style={{
                        width: 44,
                        height: 40,
                        margin: 4,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: done ? colors.goldSoft : colors.card,
                        borderWidth: 1,
                        borderColor: done ? colors.gold : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: done ? colors.text : colors.primary,
                          fontSize: fs(14),
                          fontWeight: "700",
                        }}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
