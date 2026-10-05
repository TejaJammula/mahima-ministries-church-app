// Home tab: Today's Word, hero banner, LIVE banner, sermons,
// memories strip, upcoming events, quick links.
// English UI; Telugu only for the daily verse text.
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { getDevotionalForDate } from "../../data/devotional";
import { MEMORIES_STRIP } from "../../data/gallery";
import { store } from "../../storage/store";
import { config } from "../../config";
import {
  Card,
  SectionTitle,
  BodyText,
  MutedText,
  PrimaryButton,
  GoldDivider,
} from "../../components/ui";
import { useAppTheme } from "../../theme/ThemeContext";

/**
 * Live-stream detection placeholder. Currently always false (no live
 * detection implemented). When a real live check lands (e.g. polling the
 * YouTube channel), flip this based on its result — the LIVE banner will
 * render automatically.
 */
const MOCK_LIVE = false;

interface MockSermon {
  title: string;
  date: string;
  duration: string;
}

// MOCK DATA — replace with real data when the sermon feed is available.
const MOCK_SERMONS: MockSermon[] = [
  { title: "Walking in Grace", date: "Sep 28, 2026", duration: "42 min" },
  { title: "The River of Life", date: "Sep 21, 2026", duration: "38 min" },
  { title: "Faith That Moves Mountains", date: "Sep 14, 2026", duration: "45 min" },
];

interface MockEvent {
  title: string;
  date: string;
  location: string;
}

// MOCK DATA — replace with real events from the backend when available.
const MOCK_EVENTS: MockEvent[] = [
  { title: "Sunday Worship Service", date: "Sun, Oct 11 · 10:00 AM", location: "Main Sanctuary, Prasadampadu" },
  { title: "Night of Worship", date: "Fri, Oct 17 · 7:00 PM", location: "Hyderabad Branch" },
  { title: "Youth Fellowship", date: "Sat, Oct 25 · 4:00 PM", location: "Church Hall" },
];

function Header({ logoWidth, logoHeight }: { logoWidth: number; logoHeight: number }) {
  const { colors, fs } = useAppTheme();
  return (
    <View style={styles.header}>
      <Image
        source={config.church.logo}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
        accessibilityLabel={`${config.church.name} logo`}
      />
      <Text style={[styles.headerTitle, { color: colors.text, fontSize: fs(22) }]}>
        {config.church.name}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { colors, fs } = useAppTheme();
  const [firstName, setFirstName] = useState<string | null>(null);
  const devotional = getDevotionalForDate(new Date());

  useEffect(() => {
    store.getProfile().then((p) => setFirstName(p?.firstName ?? null));
  }, []);

  // Church logo at its natural size (capped so it fits the header).
  const logoAsset = Image.resolveAssetSource(config.church.logo);
  const MAX_LOGO_W = 120;
  const logoScale = logoAsset.width > MAX_LOGO_W ? MAX_LOGO_W / logoAsset.width : 1;
  const logoWidth = Math.round(logoAsset.width * logoScale);
  const logoHeight = Math.round(logoAsset.height * logoScale);

  const greeting = firstName ? `Welcome home, ${firstName}` : "Welcome home";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header logoWidth={logoWidth} logoHeight={logoHeight} />

        {/* 1. TODAY'S WORD — first thing below the header */}
        <Pressable
          onPress={() => router.push("/devotional")}
          accessibilityRole="button"
          accessibilityLabel="Today's Word — open the Word tab"
        >
          <Card style={{ backgroundColor: colors.card, borderColor: colors.gold }}>
            <View style={styles.verseKickerRow}>
              <Text style={[styles.verseKicker, { color: colors.primary, fontSize: fs(12) }]}>
                TODAY&apos;S WORD
              </Text>
              <Text style={[styles.verseKicker, { color: colors.primary, fontSize: fs(12) }]}>→</Text>
            </View>
            <Text style={[styles.verseText, { color: colors.text, fontSize: fs(17) }]}>
              {devotional.verseTe}
            </Text>
            <Text style={[styles.verseRef, { color: colors.primary, fontSize: fs(14) }]}>
              {devotional.refTe}
            </Text>
          </Card>
        </Pressable>

        {/* 2. Hero banner */}
        <View style={styles.heroWrap}>
          <ImageBackground
            source={MEMORIES_STRIP[0]}
            style={styles.hero}
            imageStyle={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroTitle, { fontSize: fs(26) }]}>{greeting}</Text>
              <Text style={[styles.heroSub, { fontSize: fs(15) }]}>
                Growing together in grace
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* 3. LIVE banner — renders only when MOCK_LIVE is true */}
        {MOCK_LIVE && (
          <Pressable
            onPress={() => Linking.openURL(config.youtube.channelUrl)}
            accessibilityRole="button"
            accessibilityLabel="Watch live on YouTube"
          >
            <View style={styles.liveBanner}>
              <View style={styles.liveDot} />
              <Text style={[styles.liveText, { fontSize: fs(16) }]}>
                LIVE — Join us now
              </Text>
            </View>
          </Pressable>
        )}

        {/* 4. Sermons */}
        <SectionTitle style={{ color: colors.text, fontSize: fs(18) }}>Sermons</SectionTitle>
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {MOCK_SERMONS.map((s, i) => (
            <View
              key={s.title}
              style={[
                styles.sermonRow,
                i < MOCK_SERMONS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.sermonPlay}>
                <Text style={[styles.sermonPlayIcon, { color: colors.primary, fontSize: fs(14) }]}>
                  ▶
                </Text>
              </View>
              <View style={styles.sermonInfo}>
                <Text style={[styles.sermonTitle, { color: colors.text, fontSize: fs(15) }]}>
                  {s.title}
                </Text>
                <Text style={[styles.sermonMeta, { color: colors.textMuted, fontSize: fs(13) }]}>
                  {s.date} · {s.duration}
                </Text>
              </View>
            </View>
          ))}
          <PrimaryButton
            title="Watch on YouTube"
            onPress={() => Linking.openURL(config.youtube.sermonPlaylistUrl)}
          />
        </Card>

        {/* 5. Memories strip */}
        <Pressable
          onPress={() => router.push("/gallery")}
          accessibilityRole="button"
          accessibilityLabel="Every memory tells a story of grace — open the Gallery"
        >
          <View>
            <SectionTitle style={{ color: colors.text, fontSize: fs(18) }}>
              Every memory tells a story of grace.
            </SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stripContent}
            >
              {MEMORIES_STRIP.map((src, i) => (
                <Image
                  key={i}
                  source={src}
                  style={styles.stripPhoto}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <GoldDivider />
          </View>
        </Pressable>

        {/* 6. Upcoming events */}
        <SectionTitle style={{ color: colors.text, fontSize: fs(18) }}>Upcoming Events</SectionTitle>
        {MOCK_EVENTS.map((e) => (
          <Card
            key={e.title}
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text style={[styles.eventTitle, { color: colors.text, fontSize: fs(15) }]}>
              {e.title}
            </Text>
            <Text style={[styles.eventMeta, { color: colors.primary, fontSize: fs(13) }]}>
              {e.date}
            </Text>
            <Text style={[styles.eventMeta, { color: colors.textMuted, fontSize: fs(13) }]}>
              {e.location}
            </Text>
          </Card>
        ))}

        {/* 7. Quick links */}
        <SectionTitle style={{ color: colors.text, fontSize: fs(18) }}>Quick Links</SectionTitle>
        <View style={styles.quickRow}>
          <Pressable
            onPress={() => router.push("/testimony")}
            accessibilityRole="button"
            style={[styles.quickCard, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
          >
            <Text style={[styles.quickTitle, { color: colors.primary, fontSize: fs(15) }]}>
              Share Testimony
            </Text>
            <MutedText style={{ fontSize: fs(12) }}>Tell what God has done</MutedText>
          </Pressable>
          <Pressable
            onPress={() => router.push("/prayer")}
            accessibilityRole="button"
            style={[styles.quickCard, { backgroundColor: colors.goldSoft, borderColor: colors.border }]}
          >
            <Text style={[styles.quickTitle, { color: colors.text, fontSize: fs(15) }]}>
              Prayer Request
            </Text>
            <MutedText style={{ fontSize: fs(12) }}>We will pray for you</MutedText>
          </Pressable>
        </View>
        <BodyText style={{ color: colors.textMuted, fontSize: fs(13), textAlign: "center", marginTop: 8 }}>
          {config.church.tagline}
        </BodyText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    marginLeft: 12,
    fontWeight: "800",
  },
  verseKickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  verseKicker: {
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  verseText: {
    lineHeight: 26,
    marginBottom: 6,
  },
  verseRef: {
    fontWeight: "700",
    textAlign: "right",
  },
  heroWrap: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: "hidden",
  },
  hero: {
    height: 190,
    justifyContent: "flex-end",
  },
  heroImage: {
    borderRadius: 22,
  },
  heroOverlay: {
    backgroundColor: "rgba(20, 10, 16, 0.55)",
    padding: 18,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSub: {
    color: "#F3E9EE",
    fontWeight: "500",
  },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },
  liveText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  sermonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sermonPlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FBE9F1",
  },
  sermonPlayIcon: {
    fontWeight: "700",
  },
  sermonInfo: {
    flex: 1,
  },
  sermonTitle: {
    fontWeight: "700",
    marginBottom: 2,
  },
  sermonMeta: {},
  stripContent: {
    paddingRight: 16,
  },
  stripPhoto: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
  eventTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  eventMeta: {
    marginTop: 2,
  },
  quickRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginRight: 8,
  },
  quickTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
});
