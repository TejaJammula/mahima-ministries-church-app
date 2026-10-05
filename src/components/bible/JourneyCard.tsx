// "My Spiritual Journey" dashboard: personalized greeting + reading stats.
// English UI. All colors and font sizes come from useAppTheme().
import React from "react";
import { Text, View } from "react-native";
import { Card, GoldDivider } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import type { Profile } from "../../storage/store";

export interface JourneyStats {
  /** 0-100 */
  biblePct: number;
  chaptersDone: number;
  streakDays: number;
  /** 0-100, null when no quiz taken yet */
  quizAvg: number | null;
}

export const TOTAL_CHAPTERS = 1189;

function daypart(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { colors, fs } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        margin: 4,
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.primary, fontSize: fs(22), fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: colors.text, fontSize: fs(12), fontWeight: "600", marginTop: 4, textAlign: "center" }}>
        {label}
      </Text>
      {sub ? (
        <Text style={{ color: colors.textMuted, fontSize: fs(11), marginTop: 2, textAlign: "center" }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

export function JourneyCard({ profile, stats }: { profile: Profile | null; stats: JourneyStats }) {
  const { colors, fs } = useAppTheme();
  const name = profile?.firstName?.trim();
  const greeting = name ? `${daypart(new Date())}, ${name}` : "Welcome";

  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.gold, borderWidth: 1.5 }}>
      <Text style={{ color: colors.textMuted, fontSize: fs(12), fontWeight: "700", letterSpacing: 1.2 }}>
        MY SPIRITUAL JOURNEY
      </Text>
      <Text style={{ color: colors.text, fontSize: fs(22), fontWeight: "800", marginTop: 4 }}>
        {greeting}
      </Text>
      <GoldDivider />
      <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
        <StatTile
          label="Bible complete"
          value={`${stats.biblePct.toFixed(1)}%`}
          sub={`${stats.chaptersDone} of ${TOTAL_CHAPTERS} chapters`}
        />
        <StatTile label="Day streak" value={`${stats.streakDays}`} sub={stats.streakDays === 1 ? "day" : "days"} />
      </View>
      <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
        <StatTile
          label="Chapters read"
          value={`${stats.chaptersDone}`}
          sub="completed honestly"
        />
        <StatTile
          label="Quiz average"
          value={stats.quizAvg === null ? "—" : `${Math.round(stats.quizAvg)}%`}
          sub={stats.quizAvg === null ? "take a quiz" : "across quizzes"}
        />
      </View>
    </Card>
  );
}
