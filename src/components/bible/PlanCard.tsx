// Reading-plan onboarding card + "Today's portion".
// - No profile  -> prompt to sign in (mock login route).
// - Profile, no plan -> duration picker (90/180/365 days) + version choice -> savePlan.
// - Plan exists -> today's portion (rotates through all 1,189 chapters by day).
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card, Chip, MutedText, PrimaryButton, SectionTitle } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import {
  BIBLE_VERSIONS,
  chapterKeyAtIndex,
  chapterLabel,
  getChapter,
  type BibleVersionId,
} from "../../data/bible";
import type { Profile, ReadingPlan } from "../../storage/store";

const DURATIONS = [90, 180, 365] as const;

/** Deterministic rotation through all 1,189 chapters, one per day. */
export function todaysChapterKey(d = new Date()): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return chapterKeyAtIndex(dayOfYear);
}

interface PlanCardProps {
  profile: Profile | null;
  plan: ReadingPlan | null;
  onLogin: () => void;
  onStartPlan: (durationDays: number, version: BibleVersionId) => void;
  onOpenChapter: (key: string, version?: BibleVersionId) => void;
}

export function PlanCard({ profile, plan, onLogin, onStartPlan, onOpenChapter }: PlanCardProps) {
  const { colors, fs } = useAppTheme();
  const [duration, setDuration] = useState<number>(365);
  const [version, setVersion] = useState<BibleVersionId>("telugu");

  if (!profile) {
    return (
      <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Reading plan</SectionTitle>
        <MutedText style={{ color: colors.textMuted, fontSize: fs(14) }}>
          Sign in to start a personal reading plan and track your journey.
        </MutedText>
        <PrimaryButton title="Sign in to begin" onPress={onLogin} />
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <SectionTitle style={{ color: colors.text, fontSize: fs(17) }}>Start your reading plan</SectionTitle>
        <MutedText style={{ color: colors.textMuted, fontSize: fs(14), marginBottom: 8 }}>
          How long should your journey through the Bible take?
        </MutedText>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {DURATIONS.map((d) => (
            <Chip key={d} label={`${d} days`} selected={duration === d} onPress={() => setDuration(d)} />
          ))}
        </View>
        <MutedText style={{ color: colors.textMuted, fontSize: fs(14), marginBottom: 8, marginTop: 4 }}>
          Which version will you read in?
        </MutedText>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {BIBLE_VERSIONS.map((v) => (
            <Chip key={v.id} label={v.label} selected={version === v.id} onPress={() => setVersion(v.id)} />
          ))}
        </View>
        <PrimaryButton title="Start my plan" onPress={() => onStartPlan(duration, version)} />
      </Card>
    );
  }

  const key = todaysChapterKey();
  const chapter = getChapter(plan.version, key);
  const label = chapter
    ? chapterLabel(chapter, plan.version === "telugu" ? "te" : "en")
    : key;

  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.gold }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.primary, fontSize: fs(12), fontWeight: "800", letterSpacing: 1.2 }}>
          TODAY&apos;S PORTION
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>{plan.durationDays}-day plan</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: fs(20), fontWeight: "800", marginTop: 6 }}>{label}</Text>
      <MutedText style={{ color: colors.textMuted, fontSize: fs(13), marginTop: 2 }}>
        {chapter ? `${chapter.verses.length} verses` : ""}
      </MutedText>
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <TouchableOpacity
          onPress={() => onOpenChapter(key, plan.version)}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: "700", fontSize: fs(15) }}>Continue reading</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
