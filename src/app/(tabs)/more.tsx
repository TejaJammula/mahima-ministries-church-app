// More tab — settings-style menu: profile, events, sermons, testimonies,
// prayer, giving, about the church, app settings, app info.
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { BRANCHES, signOut } from "../../auth/mock";
import { store, Profile } from "../../storage/store";
import { config } from "../../config";
import { Chip, GoldDivider, PrimaryButton } from "../../components/ui";
import { useAppTheme } from "../../theme/ThemeContext";

// Mock upcoming events — real event data comes with the admin/event feed later.
const MOCK_EVENTS = [
  {
    title: "Sunday Worship Service",
    date: "Sun, Oct 11, 2026 · 10:00 AM",
    location: "Prasadampadu Main Campus",
  },
  {
    title: "Youth Fellowship Night",
    date: "Fri, Oct 16, 2026 · 6:30 PM",
    location: "Currency Nagar / Ramavarappadu",
  },
  {
    title: "Night Prayer & Fasting",
    date: "Sat, Oct 24, 2026 · 7:00 PM",
    location: "Hyderabad",
  },
];

function MenuRow({
  title,
  subtitle,
  onPress,
  last,
  titleStyle,
  mutedStyle,
  chevronStyle,
  rowStyle,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
  titleStyle: TextStyle;
  mutedStyle: TextStyle;
  chevronStyle: TextStyle;
  rowStyle: (last?: boolean) => object;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={rowStyle(last)}>
      <View style={{ flex: 1 }}>
        <Text style={titleStyle}>{title}</Text>
        {subtitle ? <Text style={[mutedStyle, { marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      <Text style={chevronStyle}>›</Text>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { colors, fs, textSize, setTextSize, theme, setTheme } = useAppTheme();
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      store.getProfile().then(setProfile);
    }, [])
  );

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
  };

  const adjustTextSize = (delta: number) => {
    const next = Math.round((textSize + delta) * 100) / 100;
    setTextSize(Math.min(1.3, Math.max(0.85, next)));
  };

  const titleStyle = (size: number, weight?: TextStyle["fontWeight"]): TextStyle => ({
    fontSize: fs(size),
    fontWeight: weight ?? "700",
    color: colors.text,
  });
  const bodyStyle = (size = 15): TextStyle => ({
    fontSize: fs(size),
    color: colors.text,
    lineHeight: fs(size) * 1.45,
  });
  const mutedStyle = (size = 13): TextStyle => ({
    fontSize: fs(size),
    color: colors.textMuted,
    lineHeight: fs(size) * 1.45,
  });

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  } as const;

  const menuRowStyle = (last?: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 13,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: colors.border,
  });
  const chevronStyle: TextStyle = {
    fontSize: fs(18),
    color: colors.primary,
    fontWeight: "700",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile */}
        <Text style={[titleStyle(22, "800"), { marginBottom: 12 }]}>More</Text>
        <View style={cardStyle}>
          {profile ? (
            <>
              <Text style={titleStyle(18)}>Welcome home, {profile.firstName}</Text>
              <Text style={[mutedStyle(14), { marginTop: 4 }]}>
                {profile.firstName} {profile.lastName} · {profile.branch}
              </Text>
              <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 12 }}>
                <Text style={{ fontSize: fs(15), fontWeight: "600", color: colors.primary }}>
                  Sign out
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={titleStyle(18)}>Welcome</Text>
              <Text style={[mutedStyle(14), { marginTop: 4 }]}>
                Sign in to personalize your app — your name, your branch, and
                notifications that greet you by name.
              </Text>
              <PrimaryButton
                title="Sign in"
                onPress={() => router.push("/login")}
                color={colors.primary}
              />
            </>
          )}
        </View>

        {/* 2. Events */}
        <Text style={[titleStyle(18), { marginTop: 8, marginBottom: 10 }]}>Upcoming Events</Text>
        {MOCK_EVENTS.map((e) => (
          <View key={e.title} style={cardStyle}>
            <Text style={titleStyle(16)}>{e.title}</Text>
            <Text style={[mutedStyle(14), { marginTop: 6 }]}>{e.date}</Text>
            <Text style={[mutedStyle(14), { marginTop: 2 }]}>{e.location}</Text>
          </View>
        ))}

        {/* 3 & 4. Sermons / Testimonies / Prayer */}
        <Text style={[titleStyle(18), { marginTop: 8, marginBottom: 10 }]}>Watch &amp; Pray</Text>
        <View style={cardStyle}>
          <MenuRow
            title="Sermons"
            subtitle="Watch on the Mahima Swaramu YouTube channel"
            onPress={() => Linking.openURL(config.youtube.sermonPlaylistUrl)}
            titleStyle={bodyStyle(15)}
            mutedStyle={mutedStyle(13)}
            chevronStyle={chevronStyle}
            rowStyle={menuRowStyle}
          />
          <MenuRow
            title="Testimonies"
            subtitle="Stories of grace"
            onPress={() => router.push("/testimony")}
            titleStyle={bodyStyle(15)}
            mutedStyle={mutedStyle(13)}
            chevronStyle={chevronStyle}
            rowStyle={menuRowStyle}
          />
          <MenuRow
            title="Prayer"
            subtitle="Prayer requests and daily prayer"
            onPress={() => router.push("/prayer")}
            last
            titleStyle={bodyStyle(15)}
            mutedStyle={mutedStyle(13)}
            chevronStyle={chevronStyle}
            rowStyle={menuRowStyle}
          />
        </View>

        {/* 5. Giving */}
        <Text style={[titleStyle(18), { marginTop: 8, marginBottom: 10 }]}>Giving</Text>
        <View style={[cardStyle, { backgroundColor: colors.goldSoft }]}>
          <Text style={titleStyle(17)}>Support Mahima Ministries</Text>
          <Text style={[mutedStyle(14), { marginTop: 6 }]}>
            Your giving to {config.giving.payeeName} helps carry the gospel to
            villages and cities across Andhra Pradesh, Telangana, and beyond.
          </Text>
          <PrimaryButton
            title="Donate"
            color={colors.primary}
            onPress={() =>
              Linking.openURL(config.giving.upiLink).catch(() =>
                Alert.alert(
                  "Could not open",
                  "We couldn't open your UPI app. Please try again, or make sure a UPI app like PhonePe is installed."
                )
              )
            }
          />
          <Text style={[mutedStyle(12), { marginTop: 8 }]}>
            Opens your UPI app (PhonePe) with {config.giving.payeeName} prefilled.
          </Text>
        </View>

        {/* 6. About the Church */}
        <Text style={[titleStyle(18), { marginTop: 8, marginBottom: 4 }]}>About the Church</Text>
        <GoldDivider />
        <Text style={[mutedStyle(14), { marginBottom: 10 }]}>
          Address, service times and photos coming soon.
        </Text>
        {BRANCHES.map((branch) => (
          <View key={branch} style={cardStyle}>
            <Text style={titleStyle(16)}>{branch}</Text>
            <Text style={[mutedStyle(13), { marginTop: 4 }]}>
              Address, service times and photos coming soon.
            </Text>
          </View>
        ))}

        {/* 7. App Settings */}
        <Text style={[titleStyle(18), { marginTop: 8, marginBottom: 10 }]}>App Settings</Text>
        <View style={cardStyle}>
          <Text style={bodyStyle(15)}>Text size</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => adjustTextSize(-0.05)}
              style={{
                backgroundColor: colors.primarySoft,
                borderRadius: 8,
                paddingHorizontal: 18,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: fs(18), fontWeight: "700", color: colors.primary }}>A−</Text>
            </TouchableOpacity>
            <Text
              style={[
                bodyStyle(16),
                { flex: 1, textAlign: "center", marginHorizontal: 8 },
              ]}
            >
              The Lord is my shepherd, I shall not want.
            </Text>
            <TouchableOpacity
              onPress={() => adjustTextSize(0.05)}
              style={{
                backgroundColor: colors.primarySoft,
                borderRadius: 8,
                paddingHorizontal: 18,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: fs(18), fontWeight: "700", color: colors.primary }}>A+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[bodyStyle(15), { marginTop: 16, marginBottom: 8 }]}>Appearance</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(["light", "dark", "system"] as const).map((t) => (
              <Chip
                key={t}
                label={t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
                selected={theme === t}
                onPress={() => setTheme(t)}
              />
            ))}
          </View>
        </View>

        {/* 8. App info footer */}
        <Text
          style={[
            mutedStyle(13),
            { textAlign: "center", marginTop: 16, marginBottom: 8 },
          ]}
        >
          Mahima Ministries v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
