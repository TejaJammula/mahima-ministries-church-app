// Word tab — Today's Word: daily verse + 4-paragraph prayer with one
// Telugu/English switcher, a shareable verse image, WhatsApp share, and
// PNG download (react-native-view-shot + expo-media-library).
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Share,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import ViewShot, { captureRef, type ViewShotRef } from "react-native-view-shot";
import { Asset, requestPermissionsAsync } from "expo-media-library";
import { getDevotionalForDate } from "../../data/devotional";
import {
  BodyText,
  Card,
  GoldDivider,
  MutedText,
  PrimaryButton,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { VerseCard, themeForVerse } from "../../components/devotional/VerseCard";

type Lang = "te" | "en";

function SegmentedOption({
  value,
  label,
  lang,
  onSelect,
  colors,
  fs,
}: {
  value: Lang;
  label: string;
  lang: Lang;
  onSelect: (v: Lang) => void;
  colors: { primary: string; white: string };
  fs: (base: number) => number;
}) {
  const selected = lang === value;
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      activeOpacity={0.85}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: selected ? colors.primary : "transparent",
      }}
    >
      <Text
        style={{
          color: selected ? colors.white : colors.primary,
          fontWeight: "700",
          fontSize: fs(15),
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function DevotionalScreen() {
  const { colors, fs } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [lang, setLang] = useState<Lang>("te");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const shotRef = useRef<ViewShotRef>(null);

  const devotional = useMemo(() => getDevotionalForDate(new Date()), []);
  const verse = lang === "te" ? devotional.verseTe : devotional.verseEn;
  const reference = lang === "te" ? devotional.refTe : devotional.ref;
  const prayer = lang === "te" ? devotional.prayerTe : devotional.prayerEn;
  const theme = useMemo(
    () => themeForVerse(devotional.ref, devotional.verseEn),
    [devotional]
  );
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );
  // Screen applies 16pt horizontal padding on each side.
  const cardWidth = Math.round(screenWidth - 32);

  const shareText = `${verse}\n\n— ${reference}\nMahima Ministries`;

  async function shareOnWhatsApp() {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    try {
      // Note: on iOS, whatsapp:// needs LSApplicationQueriesSchemes in app.json
      // for canOpenURL to succeed; without it we fall through to the share sheet.
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // fall through to the system share sheet
    }
    try {
      await Share.share({ message: shareText });
    } catch {
      // user dismissed the share sheet
    }
  }

  async function downloadImage() {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const uri = await captureRef(shotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      const { status } = await requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Allow photo access so the verse image can be saved to your gallery."
        );
        return;
      }
      await Asset.create(uri);
      setNotice("Saved to your photo gallery.");
    } catch {
      // Capture unavailable (native module missing, e.g. Expo Go) — share the
      // verse text instead so the user still gets something.
      try {
        await Share.share({ message: shareText });
        setNotice("Image capture isn't available in this build — shared the verse text instead.");
      } catch {
        // user dismissed the share sheet
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <SectionTitle style={{ fontSize: fs(22), marginBottom: 2 }}>Today&apos;s Word</SectionTitle>
      <MutedText style={{ fontSize: fs(13), marginBottom: 12 }}>{todayLabel}</MutedText>

      {/* Readable verse card */}
      <Card>
        <Text
          style={{
            fontSize: fs(20),
            lineHeight: fs(20) * 1.55,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
          }}
        >
          {verse}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: fs(15),
            fontWeight: "700",
            color: colors.gold,
            textAlign: "center",
          }}
        >
          {reference}
        </Text>
      </Card>

      {/* ONE language switcher — drives verse + prayer together */}
      <Text
        style={{
          fontSize: fs(13),
          fontWeight: "700",
          color: colors.textMuted,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Language
      </Text>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.primarySoft,
          borderRadius: 14,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <SegmentedOption value="te" label="Telugu" lang={lang} onSelect={setLang} colors={colors} fs={fs} />
        <SegmentedOption value="en" label="English" lang={lang} onSelect={setLang} colors={colors} fs={fs} />
      </View>

      {/* Daily prayer — 4 paragraphs */}
      <SectionTitle style={{ fontSize: fs(18) }}>Today&apos;s Prayer</SectionTitle>
      {prayer.map((paragraph, i) => (
        <BodyText key={i} style={{ fontSize: fs(15), marginBottom: 12 }}>
          {paragraph}
        </BodyText>
      ))}

      <GoldDivider />

      {/* Shareable verse image (this is what gets captured) */}
      <SectionTitle style={{ fontSize: fs(18) }}>Share this verse</SectionTitle>
      <MutedText style={{ fontSize: fs(13), marginBottom: 12 }}>
        This is the image you&apos;ll share or download.
      </MutedText>
      <View style={{ alignItems: "center", marginBottom: 4 }}>
        <ViewShot
          ref={shotRef}
          options={{ format: "png", quality: 1, result: "tmpfile" }}
        >
          <VerseCard verse={verse} reference={reference} theme={theme} width={cardWidth} />
        </ViewShot>
      </View>

      <PrimaryButton
        title="Share on WhatsApp"
        onPress={shareOnWhatsApp}
        color={colors.whatsapp}
      />
      <PrimaryButton
        title={saving ? "Saving image…" : "Download image"}
        onPress={downloadImage}
      />
      {saving && (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      )}
      {notice && (
        <MutedText style={{ fontSize: fs(13), marginTop: 10, textAlign: "center" }}>
          {notice}
        </MutedText>
      )}
    </Screen>
  );
}
