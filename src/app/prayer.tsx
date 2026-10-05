// Prayer Requests screen — root stack screen (auto-registered by expo-router; NOT in the tab bar).
// English UI. White theme, magenta primary, gold accents.
// MOCK: everything is local state — no backend. No prayer chain, no push notifications yet.
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
} from "../components/ui";
import { useAppTheme } from "../theme/ThemeContext";
import { PRAYER_REQUESTS, PrayerRequest } from "../data/testimonies";

let localId = 0;
const nextId = () => `p-local-${Date.now()}-${localId++}`;

function PrayerCard({
  request,
  prayed,
  onPray,
  onAnswered,
  colors,
  fs,
}: {
  request: PrayerRequest;
  prayed: boolean;
  onPray: () => void;
  onAnswered: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  fs: (b: number) => number;
}) {
  return (
    <Card
      style={
        request.answered
          ? { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: colors.goldSoft }
          : undefined
      }
    >
      {request.answered ? (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.gold,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: "800", fontSize: fs(12) }}>
            Answered!
          </Text>
        </View>
      ) : null}

      <BodyText>{request.text}</BodyText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: fs(13), fontWeight: "600", color: colors.textMuted }}>
          {request.name}
        </Text>
        <Text style={{ fontSize: fs(12), color: colors.textMuted }}>{request.date}</Text>
      </View>

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
          {prayed ? "Praying for you" : "I'm praying for you"}  |  {request.prayerCount}
        </Text>
      </TouchableOpacity>

      {request.answered ? (
        <Text
          style={{
            marginTop: 10,
            fontSize: fs(13),
            fontStyle: "italic",
            color: colors.textMuted,
            textAlign: "center",
          }}
        >
          Answered prayers become testimonies.
        </Text>
      ) : (
        <TouchableOpacity onPress={onAnswered} style={{ marginTop: 10 }} hitSlop={8}>
          <Text
            style={{
              color: colors.success,
              fontWeight: "700",
              fontSize: fs(14),
              textAlign: "center",
            }}
          >
            This prayer has been answered
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

function SubmitPrayerForm({
  visible,
  onClose,
  onSubmit,
  colors,
  fs,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (p: PrayerRequest) => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  fs: (b: number) => number;
}) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
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
    if (!text.trim()) {
      setError("Please write your prayer request.");
      return;
    }
    setError("");
    onSubmit({
      id: nextId(),
      text: text.trim(),
      name: anonymous || !name.trim() ? "Anonymous" : name.trim(),
      prayerCount: 0,
      answered: false,
      date: "Just now",
    });
    setText("");
    setName("");
    setAnonymous(false);
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
              maxHeight: "85%",
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
                Submit a Prayer Request
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
                The church family will pray for you. Requests appear immediately (mock — no moderation yet).
              </MutedText>
              <TextInput
                placeholder="How can we pray for you?"
                placeholderTextColor={colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[inputStyle, { minHeight: 100 }]}
              />

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

              {error ? (
                <Text style={{ color: colors.primary, fontSize: fs(13), marginBottom: 8 }}>{error}</Text>
              ) : null}
              <PrimaryButton title="Submit Request" onPress={handleSubmit} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function PrayerScreen() {
  const { colors, fs } = useAppTheme();
  const [requests, setRequests] = useState<PrayerRequest[]>(PRAYER_REQUESTS);
  const [prayedIds, setPrayedIds] = useState<string[]>([]);
  const [formVisible, setFormVisible] = useState(false);

  const pray = (id: string) => {
    if (prayedIds.includes(id)) return;
    setPrayedIds((prev) => [...prev, id]);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, prayerCount: r.prayerCount + 1 } : r))
    );
  };

  const markAnswered = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, answered: true } : r)));
  };

  const addRequest = (p: PrayerRequest) => setRequests((prev) => [p, ...prev]);

  return (
    <>
      <Screen>
        <Text style={{ fontSize: fs(28), fontWeight: "800", color: colors.text }}>Prayer Requests</Text>
        <MutedText style={{ marginTop: 4, marginBottom: 8 }}>
          Lift one another up in prayer. Tap to let someone know you&apos;re praying.
        </MutedText>
        <PrimaryButton title="Submit a Prayer Request" onPress={() => setFormVisible(true)} />

        <View style={{ marginTop: 16 }}>
          <SectionTitle>Requests</SectionTitle>
          {requests.map((r) => (
            <PrayerCard
              key={r.id}
              request={r}
              prayed={prayedIds.includes(r.id)}
              onPray={() => pray(r.id)}
              onAnswered={() => markAnswered(r.id)}
              colors={colors}
              fs={fs}
            />
          ))}
        </View>
      </Screen>
      <SubmitPrayerForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={addRequest}
        colors={colors}
        fs={fs}
      />
    </>
  );
}
