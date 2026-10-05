// Gallery tab — year-first browsing: Years -> Events -> Photos -> full-screen viewer.
//
// PRODUCTION NOTE: the gallery is server-driven. The app fetches the
// year/event/photo manifest from the Telegram CDN feed and caches it, so new
// albums appear without a rebuild. GALLERY_YEARS (bundled demo photos) is the
// fallback shown until that feed is live.
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GALLERY_YEARS, GalleryEvent, GalleryYear } from "../../data/gallery";
import { BodyText, GoldDivider, MutedText, SectionTitle } from "../../components/ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { PhotoViewer } from "../../components/gallery/PhotoViewer";
import { spacing } from "../../theme/colors";

type Level =
  | { name: "years" }
  | { name: "events"; year: GalleryYear }
  | { name: "photos"; year: GalleryYear; event: GalleryEvent };

const photoCount = (year: GalleryYear) =>
  year.events.reduce((sum, e) => sum + e.photos.length, 0);

function Header({ title, onBack }: { title: string; onBack: (() => void) | null }) {
  const { colors, fs } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ paddingVertical: 6, paddingRight: 12 }}
        >
          <Text style={{ color: colors.primary, fontSize: fs(16), fontWeight: "600" }}>‹ Back</Text>
        </Pressable>
      ) : null}
      <Text style={{ fontSize: fs(20), fontWeight: "800", color: colors.text }}>{title}</Text>
    </View>
  );
}

function YearCard({ year, onPress }: { year: GalleryYear; onPress: () => void }) {
  const { colors, fs } = useAppTheme();
  const cover: ImageSourcePropType | undefined = year.events[0]?.cover;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${year.year} albums`}
      style={{
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        marginBottom: spacing.md,
      }}
    >
      {cover ? (
        <Image source={cover} style={{ width: "100%", height: 170 }} resizeMode="cover" />
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: spacing.md,
        }}
      >
        <View>
          <Text style={{ fontSize: fs(22), fontWeight: "800", color: colors.text }}>{year.year}</Text>
          <MutedText style={{ marginTop: 2 }}>
            {year.events.length} {year.events.length === 1 ? "event" : "events"} ·{" "}
            {photoCount(year)} photos
          </MutedText>
        </View>
        <Text style={{ fontSize: fs(22), color: colors.primary, fontWeight: "700" }}>›</Text>
      </View>
    </Pressable>
  );
}

function EventCard({ event, onPress }: { event: GalleryEvent; onPress: () => void }) {
  const { colors, fs } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.title} photos`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Image
        source={event.cover}
        style={{ width: 88, height: 88, borderRadius: 10 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ fontSize: fs(16), fontWeight: "700", color: colors.text }}>{event.title}</Text>
        <MutedText style={{ marginTop: 4 }}>
          {event.date} · {event.photos.length} {event.photos.length === 1 ? "photo" : "photos"}
        </MutedText>
      </View>
      <Text style={{ fontSize: fs(22), color: colors.primary, fontWeight: "700", marginRight: 6 }}>
        ›
      </Text>
    </Pressable>
  );
}

export default function GalleryScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [level, setLevel] = useState<Level>({ name: "years" });
  const [viewer, setViewer] = useState<{ event: GalleryEvent; index: number } | null>(null);

  const title =
    level.name === "years" ? "Gallery" : level.name === "events" ? level.year.year : level.event.title;
  const onBack =
    level.name === "years"
      ? null
      : level.name === "events"
        ? () => setLevel({ name: "years" })
        : () => setLevel({ name: "events", year: level.year });

  const cellSize = (width - spacing.md * 2 - 8) / 3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={title} onBack={onBack} />

      {level.name === "years" && (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle>Church Memories</SectionTitle>
          <GoldDivider />
          <MutedText style={{ marginBottom: spacing.md }}>
            Every memory tells a story of grace. Browse albums by year.
          </MutedText>
          {GALLERY_YEARS.length === 0 ? (
            <BodyText>No albums yet — check back soon.</BodyText>
          ) : (
            GALLERY_YEARS.map((year) => (
              <YearCard
                key={year.year}
                year={year}
                onPress={() => setLevel({ name: "events", year })}
              />
            ))
          )}
        </ScrollView>
      )}

      {level.name === "events" && (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle>{level.year.year} Events</SectionTitle>
          <GoldDivider />
          <MutedText style={{ marginBottom: spacing.md }}>
            {level.year.events.length} {level.year.events.length === 1 ? "event" : "events"} ·{" "}
            {photoCount(level.year)} photos
          </MutedText>
          {level.year.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => setLevel({ name: "photos", year: level.year, event })}
            />
          ))}
        </ScrollView>
      )}

      {level.name === "photos" && (
        <FlatList
          data={level.event.photos}
          keyExtractor={(_, i) => `${level.event.id}-${i}`}
          numColumns={3}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
          columnWrapperStyle={{ gap: 4, marginBottom: 4 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              <SectionTitle>{level.event.title}</SectionTitle>
              <GoldDivider />
              <MutedText>
                {level.event.date} · {level.event.photos.length}{" "}
                {level.event.photos.length === 1 ? "photo" : "photos"}
              </MutedText>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setViewer({ event: level.event, index })}
              accessibilityRole="button"
              accessibilityLabel={`View photo ${index + 1}`}
              style={{ width: cellSize, height: cellSize, borderRadius: 8, overflow: "hidden" }}
            >
              <Image source={item} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </Pressable>
          )}
        />
      )}

      <PhotoViewer
        visible={viewer !== null}
        photos={viewer?.event.photos ?? []}
        initialIndex={viewer?.index ?? 0}
        eventTitle={viewer?.event.title ?? ""}
        onClose={() => setViewer(null)}
      />
    </SafeAreaView>
  );
}
