// Testimonies screen — root stack screen (auto-registered by expo-router; NOT in the tab bar).
// English UI. White theme, magenta primary, gold accents.
// MOCK: everything is local state — no backend. The "pending -> admin approval" flow is simulated.
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Screen,
  Card,
  SectionTitle,
  BodyText,
  MutedText,
  PrimaryButton,
  Chip,
  GoldDivider,
} from "../components/ui";
import { useAppTheme } from "../theme/ThemeContext";
import { config } from "../config";
import {
  TESTIMONIES,
  FEATURED_TESTIMONY,
  TESTIMONY_CATEGORIES,
  Testimony,
} from "../data/testimonies";

let localId = 0;
const nextId = () => `t-local-${Date.now()}-${localId++}`;

function PrayButton({
  count,
  prayed,
  onPray,
  colors,
  fs,
}: {
  count: number;
  prayed: boolean;
  onPray: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  fs: (b: number) => number;
}) {
  return (
    <TouchableOpacity
      onPress={onPray}
      activeOpacity={0.85}
      style={{
        marginTop: 10,
        borderRadius: 24,
        paddingVertical: 9,
        alignItems: "center",
        backgroundColor: prayed ? colors.primary : colors.primarySoft,
      }}
    >
      <Text
        style={{
          color: prayed ? colors.white : colors.primary,
          fontWeight: "700",
          fontSize: fs(14),
        }}
      >
        {prayed ? "Praying for you" : "I'm praying for you"}  |  {count}
      </Text>
    </TouchableOpacity>
  );
}

function TestimonyCard({
  testimony,
  prayed,
  onPray,
  colors,
  fs,
}: {
  testimony: Testimony;
  prayed: boolean;
  onPray: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  fs: (b: number) => number;
}) {
  const pending = testimony.status === "pending";
  return (
    <Card style={pending ? { borderColor: colors.gold, borderWidth: 1.5 } : undefined}>
      {pending && (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.goldSoft,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.gold, fontWeight: "700", fontSize: fs(11) }}>
            Pending — awaiting admin approval (mock approval flow)
          </Text>
        </View>
      )}
      <Text style={{ fontSize: fs(17), fontWeight: "700", color: colors.text }}>
        {testimony.title}
      </Text>
      <BodyText style={{ marginTop: 8, color: colors.text }}>{testimony.text}</BodyText>
      {testimony.verse ? (
        <Text style={{ marginTop: 8, fontSize: fs(13), fontStyle: "italic", color: colors.primaryDark }}>
          {testimony.verse}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <Text style={{ fontSize: fs(13), fontWeight: "600", color: colors.textMuted }}>
          {testimony.name}  |  {testimony.category}
        </Text>
        <Text style={{ fontSize: fs(12), color: colors.textMuted }}>{testimony.date}</Text>
      </View>
      <PrayButton count={testimony.prayerCount} prayed={prayed} onPray={onPray} colors={colors} fs={fs} />
    </Card>
  );
}

function SubmitForm({
  visible,
  onClose,
  onSubmit,
  colors,
  fs,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (t: Testimony) => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  fs: (b: number) => number;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [verse, setVerse] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState("Answered Prayer");
  const [photoNote, setPhotoNote] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fs(15),
    color: colors.text,
    marginBottom: 12,
  } as const;

  const handleSubmit = () => {
    if (!title.trim() || !text.trim()) {
      setError("Please add a title and your testimony.");
      return;
    }
    setError("");
    onSubmit({
      id: nextId(),
      title: title.trim(),
      text: text.trim(),
      name: anonymous || !name.trim() ? "Anonymous" : name.trim(),
      category,
      verse: verse.trim() ? verse.trim() : undefined,
      prayerCount: 0,
      status: "pending",
      date: "Just now",
    });
    setTitle("");
    setText("");
    setVerse("");
    setName("");
    setAnonymous(false);
    setCategory("Answered Prayer");
    setPhotoNote("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              maxHeight: "92%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: fs(18), fontWeight: "800", color: colors.text }}>
                Share Your Testimony
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={{ fontSize: fs(16), color: colors.primary, fontWeight: "700" }}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ paddingHorizontal: 20, paddingTop: 14 }}
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              <MutedText style={{ marginBottom: 12 }}>
                Awaiting admin approval (mock approval flow)
              </MutedText>

              <TextInput
                placeholder="Testimony title"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                style={inputStyle}
              />
              <TextInput
                placeholder="Share what God has done in your life..."
                placeholderTextColor={colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[inputStyle, { minHeight: 110 }]}
              />
              <TextInput
                placeholder="Bible verse (optional, e.g. Jeremiah 30:17)"
                placeholderTextColor={colors.textMuted}
                value={verse}
                onChangeText={setVerse}
                style={inputStyle}
              />

              {/* Photo — mock placeholder */}
              <TouchableOpacity
                onPress={() =>
                  setPhotoNote("Photo upload is mocked in this build — coming in the real version.")
                }
                style={{
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: colors.gold,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                  backgroundColor: colors.goldSoft,
                }}
              >
                <Text style={{ color: colors.gold, fontWeight: "700", fontSize: fs(14) }}>
                  + Add a photo (mock)
                </Text>
              </TouchableOpacity>
              {photoNote ? <MutedText style={{ marginBottom: 12 }}>{photoNote}</MutedText> : null}

              {/* Name / Anonymous toggle */}
              <Text style={{ fontSize: fs(14), fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                Your name
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => setAnonymous(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: !anonymous ? colors.primary : colors.primarySoft,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: !anonymous ? colors.white : colors.primary,
                      fontWeight: "700",
                      fontSize: fs(14),
                    }}
                  >
                    Show my name
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAnonymous(true)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: anonymous ? colors.primary : colors.primarySoft,
                  }}
                >
                  <Text
                    style={{
                      color: anonymous ? colors.white : colors.primary,
                      fontWeight: "700",
                      fontSize: fs(14),
                    }}
                  >
                    Anonymous
                  </Text>
                </TouchableOpacity>
              </View>
              {!anonymous && (
                <TextInput
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  style={inputStyle}
                />
              )}

              {/* Category picker */}
              <Text style={{ fontSize: fs(14), fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                Category
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                {TESTIMONY_CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>

              {error ? (
                <Text style={{ color: colors.primary, fontSize: fs(13), marginBottom: 8 }}>{error}</Text>
              ) : null}
              <PrimaryButton title="Submit Testimony" onPress={handleSubmit} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function TestimonyScreen() {
  const { colors, fs } = useAppTheme();
  const [list, setList] = useState<Testimony[]>(TESTIMONIES);
  const [category, setCategory] = useState("All");
  const [prayedIds, setPrayedIds] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);

  const pray = (id: string) => {
    if (prayedIds.includes(id)) return;
    setPrayedIds((prev) => [...prev, id]);
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, prayerCount: t.prayerCount + 1 } : t)));
  };

  const addTestimony = (t: Testimony) => setList((prev) => [t, ...prev]);

  const feed = list.filter(
    (t) => t.id !== FEATURED_TESTIMONY.id && (category === "All" || t.category === category)
  );

  const openPlaylist = () => Linking.openURL(config.youtube.testimonyPlaylistUrl);

  return (
    <>
      <Screen>
        <Text style={{ fontSize: fs(28), fontWeight: "800", color: colors.text }}>Testimonies</Text>
        <PrimaryButton title="Share Your Testimony" onPress={() => setFormVisible(true)} />

        {/* YouTube testimony playlist */}
        <TouchableOpacity onPress={openPlaylist} activeOpacity={0.85} style={{ marginTop: 16 }}>
          <Card>
            <Text style={{ fontSize: fs(16), fontWeight: "700", color: colors.primary }}>
              Watch video testimonies
            </Text>
            <MutedText style={{ marginTop: 4 }}>
              Video testimony playlist link is pending — this opens our YouTube channel for now.
            </MutedText>
          </Card>
        </TouchableOpacity>

        {/* Featured testimony */}
        <View style={{ marginTop: 8 }}>
          <SectionTitle style={{ color: colors.gold }}>This Week&apos;s Featured Testimony</SectionTitle>
          <Card style={{ borderColor: colors.gold, borderWidth: 1.5, backgroundColor: colors.goldSoft }}>
            <Text style={{ fontSize: fs(18), fontWeight: "800", color: colors.text }}>
              {FEATURED_TESTIMONY.title}
            </Text>
            <GoldDivider />
            <BodyText>{FEATURED_TESTIMONY.text}</BodyText>
            {FEATURED_TESTIMONY.verse ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: fs(13),
                  fontStyle: "italic",
                  color: colors.primaryDark,
                }}
              >
                {FEATURED_TESTIMONY.verse}
              </Text>
            ) : null}
            <Text style={{ marginTop: 8, fontSize: fs(13), fontWeight: "600", color: colors.textMuted }}>
              {FEATURED_TESTIMONY.name}  |  {FEATURED_TESTIMONY.category}  |  {FEATURED_TESTIMONY.date}
            </Text>
          </Card>
        </View>

        {/* Category filter */}
        <SectionTitle>Browse Testimonies</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {TESTIMONY_CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        {/* Feed */}
        {feed.map((t) => (
          <TestimonyCard
            key={t.id}
            testimony={t}
            prayed={prayedIds.includes(t.id)}
            onPray={() => pray(t.id)}
            colors={colors}
            fs={fs}
          />
        ))}
        {feed.length === 0 && (
          <MutedText>No testimonies in this category yet.</MutedText>
        )}
      </Screen>
      <SubmitForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={addTestimony}
        colors={colors}
        fs={fs}
      />
    </>
  );
}
