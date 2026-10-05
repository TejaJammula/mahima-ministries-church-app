// LISTEN tab: expo-av audio player — play/pause + progress + seek.
// Source: config.audioUrlFor(version, bookId, chapter) first (remote, may not
// exist yet); on failure, falls back to the bundled Telugu Genesis 1 demo.
// Errors are handled gracefully with an explanatory message.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { Card, MutedText } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { config } from "../../config";
import type { BibleVersionId } from "../../data/bible";

interface ChapterPlayerProps {
  version: BibleVersionId;
  bookId: string;
  chapter: number;
  /** Human label, e.g. "ఆదికాండం 1" — shown while playing. */
  title: string;
  onFinished: () => void;
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ChapterPlayer({ version, bookId, chapter, title, onFinished }: ChapterPlayerProps) {
  const { colors, fs } = useAppTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const finishedRef = useRef(onFinished);
  useEffect(() => {
    finishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    let cancelled = false;
    let s: Audio.Sound | null = null;

    const onStatus = (st: AVPlaybackStatus) => {
      if (cancelled) return;
      setStatus(st);
      if (st.isLoaded && st.didJustFinish) {
        finishedRef.current();
      }
    };

    (async () => {
      setLoading(true);
      setError(null);
      setUsingDemo(false);
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch {
        // Non-fatal: playback still works without the mode tweak.
      }
      try {
        s = new Audio.Sound();
        s.setOnPlaybackStatusUpdate(onStatus);
        await s.loadAsync({ uri: config.audioUrlFor(version, bookId, chapter) }, { progressUpdateIntervalMillis: 500 });
        if (!cancelled) setSound(s);
      } catch {
        // Remote audio not published yet — fall back to the bundled demo for
        // the Telugu Genesis 1 recording only.
        const isDemoChapter = version === "telugu" && bookId === "gen" && chapter === 1;
        if (isDemoChapter) {
          try {
            s = new Audio.Sound();
            s.setOnPlaybackStatusUpdate(onStatus);
            await s.loadAsync(config.demoAudio, { progressUpdateIntervalMillis: 500 });
            if (!cancelled) {
              setUsingDemo(true);
              setSound(s);
            }
          } catch {
            if (!cancelled) setError("Could not load the audio. Please try again later.");
          }
        } else if (!cancelled) {
          setError("Audio for this chapter is not available yet — check back soon.");
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      if (s) void s.unloadAsync();
    };
  }, [version, bookId, chapter]);

  const toggle = useCallback(async () => {
    if (!sound) return;
    const st = await sound.getStatusAsync();
    if (!st.isLoaded) return;
    if (st.isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  }, [sound]);

  const seek = useCallback(
    async (ratio: number) => {
      if (!sound || !status?.isLoaded || !status.durationMillis) return;
      const clamped = Math.min(0.999, Math.max(0, ratio));
      await sound.setPositionAsync(clamped * status.durationMillis);
    },
    [sound, status]
  );

  const loaded = status?.isLoaded === true;
  const position = loaded ? status.positionMillis ?? 0 : 0;
  const duration = loaded ? status.durationMillis ?? 0 : 0;
  const progress = duration > 0 ? position / duration : 0;
  const playing = loaded && (status.isPlaying ?? false);
  const buffering = loaded && (status.isBuffering ?? false);

  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <Text style={{ color: colors.text, fontSize: fs(17), fontWeight: "800" }}>{title}</Text>
      <MutedText style={{ color: colors.textMuted, fontSize: fs(13), marginTop: 2 }}>
        {version === "telugu" ? "తెలుగు audio" : "English audio"}
        {usingDemo ? " · bundled demo recording" : ""}
      </MutedText>

      {loading ? (
        <Text style={{ color: colors.textMuted, fontSize: fs(14), marginTop: 16, textAlign: "center" }}>
          Loading audio…
        </Text>
      ) : error ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: colors.text, fontSize: fs(14), textAlign: "center" }}>{error}</Text>
          <MutedText style={{ color: colors.textMuted, fontSize: fs(13), textAlign: "center", marginTop: 6 }}>
            You can still read the chapter in the Read tab.
          </MutedText>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          {/* Progress track (tap to seek) */}
          <Pressable
            onPress={(e) => {
              if (trackWidth > 0) void seek(e.nativeEvent.locationX / trackWidth);
            }}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            accessibilityRole="adjustable"
            accessibilityLabel="Audio progress — tap to seek"
            style={{
              height: 28,
              justifyContent: "center",
            }}
          >
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" }}>
              <View
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                  width: `${Math.round(progress * 100)}%`,
                }}
              />
            </View>
          </Pressable>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
            <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>{fmt(position)}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>{fmt(duration)}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12 }}>
            <Pressable
              onPress={() => void toggle()}
              disabled={!loaded}
              accessibilityRole="button"
              accessibilityLabel={playing ? "Pause" : "Play"}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: loaded ? colors.primary : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.white, fontSize: fs(28), fontWeight: "800" }}>
                {playing ? "❚❚" : "▶"}
              </Text>
            </Pressable>
          </View>
          {buffering ? (
            <Text style={{ color: colors.textMuted, fontSize: fs(12), textAlign: "center", marginTop: 8 }}>
              Buffering…
            </Text>
          ) : null}
        </View>
      )}
    </Card>
  );
}
