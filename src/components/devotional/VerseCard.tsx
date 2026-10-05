// Shareable verse image — this exact view is captured to PNG for download/share.
// The background gradient is picked from the verse's keywords (water / light /
// shepherd / word). Verse text is centered horizontally + vertically with equal
// margins, inside a thin gold frame; the reference sits below in gold.
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { config } from "../../config";
import { useAppTheme } from "../../theme/ThemeContext";

export interface VerseTheme {
  id: "water" | "light" | "shepherd" | "word";
  /** [top, bottom] gradient stops — dark enough for white verse text. */
  colors: [string, string];
}

const THEMES: Record<VerseTheme["id"], VerseTheme> = {
  water: { id: "water", colors: ["#062A45", "#0E639B"] },
  light: { id: "light", colors: ["#3A2306", "#B4831F"] },
  shepherd: { id: "shepherd", colors: ["#09382A", "#14805F"] },
  word: { id: "word", colors: ["#2B0A20", "#A61E63"] },
};

/** Pick a gradient theme from the English verse/ref keywords. Falls back to "word". */
export function themeForVerse(ref: string, verseEn: string): VerseTheme {
  const text = `${ref} ${verseEn}`.toLowerCase();
  if (/(river|water|sea|ocean|rain|thirst|baptis|flood|well)/.test(text)) return THEMES.water;
  if (/(light|sun|morning|dawn|glor|shine|stars?|lamp)/.test(text)) return THEMES.light;
  if (/(shepherd|sheep|flock|pasture|lamb)/.test(text)) return THEMES.shepherd;
  return THEMES.word;
}

interface Props {
  verse: string;
  reference: string;
  theme: VerseTheme;
  /** Logical width of the card; height follows a 4:5 portrait ratio. */
  width: number;
}

const GOLD = "#F2CE6B";

export function VerseCard({ verse, reference, theme, width }: Props) {
  const { colors } = useAppTheme();
  const height = Math.round(width * 1.25);
  const orb = { backgroundColor: colors.white, opacity: 0.07, position: "absolute" as const };

  return (
    // collapsable={false}: required on Android so view-shot can capture this view.
    <View
      collapsable={false}
      style={{ width, height, borderRadius: 24, overflow: "hidden", backgroundColor: theme.colors[0] }}
    >
      <LinearGradient
        colors={theme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* soft decorative light orbs */}
      <View style={[orb, { width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375, top: -width * 0.28, right: -width * 0.22 }]} />
      <View style={[orb, { width: width * 0.55, height: width * 0.55, borderRadius: width * 0.275, bottom: -width * 0.18, left: -width * 0.14 }]} />

      <View style={{ flex: 1, padding: 28 }}>
        {/* Church logo — unaltered PNG, natural aspect, modest size, no frame */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={config.church.logo}
            style={{ width: 76, height: 80 }}
            resizeMode="contain"
          />
        </View>

        {/* Verse block: perfectly centered, equal margins all around, thin gold frame */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: "rgba(242, 206, 107, 0.55)",
              borderRadius: 16,
              padding: 22,
              width: "100%",
            }}
          >
            <Text
              style={{
                color: colors.white,
                fontSize: 22,
                lineHeight: 33,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {verse}
            </Text>
          </View>
        </View>

        {/* Reference in gold + church name */}
        <View style={{ alignItems: "center" }}>
          <View style={{ width: 56, height: 2, borderRadius: 1, backgroundColor: GOLD, marginBottom: 10 }} />
          <Text style={{ color: GOLD, fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            {reference}
          </Text>
          <Text
            style={{
              color: colors.white,
              opacity: 0.75,
              fontSize: 12,
              letterSpacing: 2,
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            Mahima Ministries
          </Text>
        </View>
      </View>
    </View>
  );
}
