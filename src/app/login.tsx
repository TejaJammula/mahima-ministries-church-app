// Sign-in screen — Gmail-based login.
//
// Two modes, picked automatically (see src/auth/index.ts):
//   DEMO (Firebase not configured yet): 6-digit mock code flow.
//   FIREBASE (config present): real passwordless email-link flow —
//     enter Gmail → tap "Send sign-in link" → tap the link in the email →
//     the app opens and completes sign-in → name/branch registration.
// No SMS, no cost either way.
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import {
  BRANCHES,
  DEMO_OTP,
  authMode,
  requestSignIn,
  verifyDemoCode,
  completeRegistration,
  onAuthChanged,
  getCurrentUid,
  authErrorMessage,
} from "../auth";
import { store } from "../storage/store";
import { PrimaryButton } from "../components/ui";
import { useAppTheme } from "../theme/ThemeContext";

type Step = 1 | 2 | 3;

const MODE = authMode();

export default function LoginScreen() {
  const { colors, fs } = useAppTheme();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Firebase mode: the email link may complete sign-in while this screen is
  // open (member returns from their email app). React to it.
  useEffect(() => {
    if (MODE !== "firebase") return;
    const resolveSignedIn = () => {
      store.getProfile().then((p) => {
        if (p) router.back();
        else setStep(3);
      });
    };
    if (getCurrentUid()) {
      resolveSignedIn();
      return;
    }
    const unsub = onAuthChanged((uid) => {
      if (uid) resolveSignedIn();
    });
    return unsub;
  }, []);

  const labelStyle = (size = 15): TextStyle => ({
    fontSize: fs(size),
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
    marginTop: 14,
  });
  const hintStyle: TextStyle = {
    fontSize: fs(13),
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: fs(13) * 1.45,
  };

  const inputStyle = {
    backgroundColor: colors.surface ?? colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: fs(16),
    color: colors.text,
  } as const;

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSend = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await requestSignIn(email.trim());
      if (MODE === "firebase") {
        setLinkSent(true);
        setStep(2);
      } else {
        setStep(2);
      }
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyDemo = () => {
    if (verifyDemoCode(code)) {
      setError("");
      setStep(3);
    } else {
      setError("That code doesn't match. Try again — the demo code is " + DEMO_OTP + ".");
    }
  };

  const handleComplete = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await completeRegistration(email.trim(), firstName.trim(), lastName.trim(), branch);
      Alert.alert("Welcome!", `Welcome home, ${firstName.trim()}.`, [
        { text: "Continue", onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Sign in" }} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: fs(22),
            fontWeight: "800",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          Sign in
        </Text>
        {MODE === "demo" ? (
          <Text
            style={{
              fontSize: fs(13),
              fontWeight: "600",
              color: colors.primary,
              marginBottom: 16,
            }}
          >
            DEMO login (mock — real Gmail sign-in via Firebase comes later)
          </Text>
        ) : null}

        {step === 1 && (
          <>
            <Text style={labelStyle()}>Gmail address</Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <Text style={hintStyle}>
              {MODE === "firebase"
                ? "We'll email you a secure sign-in link. No password needed."
                : "A one-time code will be sent to your email. (Mock: no real email is sent.)"}
            </Text>
            <PrimaryButton
              title={busy ? "Sending…" : MODE === "firebase" ? "Send sign-in link" : "Send code"}
              onPress={busy ? () => {} : handleSend}
            />
          </>
        )}

        {step === 2 && MODE === "firebase" && (
          <>
            <Text style={labelStyle(17)}>Check your email</Text>
            <Text style={hintStyle}>
              We sent a sign-in link to{"\n"}
              <Text style={{ fontWeight: "700", color: colors.text }}>{email.trim()}</Text>
              {"\n\n"}Open your email app and tap the link — you&apos;ll come right
              back here, signed in. The link expires after a while; if it does,
              just request a new one below.
            </Text>
            {linkSent ? (
              <Text style={{ ...hintStyle, color: colors.primary, fontWeight: "600" }}>
                Link sent. It may take a minute to arrive.
              </Text>
            ) : null}
            <PrimaryButton
              title={busy ? "Sending…" : "Resend link"}
              onPress={busy ? () => {} : handleSend}
            />
            <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 12 }}>
              <Text style={{ fontSize: fs(14), color: colors.primary, fontWeight: "600" }}>
                Use a different email
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && MODE === "demo" && (
          <>
            <Text style={labelStyle()}>Enter the 6-digit code</Text>
            <TextInput
              style={inputStyle}
              value={code}
              onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="••••••"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={hintStyle}>
              Code sent to {email.trim()}.{"\n"}
              <Text style={{ fontWeight: "700", color: colors.primary }}>
                Demo code: {DEMO_OTP}
              </Text>
            </Text>
            <PrimaryButton title="Verify" onPress={handleVerifyDemo} />
            <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 12 }}>
              <Text style={{ fontSize: fs(14), color: colors.primary, fontWeight: "600" }}>
                Use a different email
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={labelStyle()}>First name</Text>
            <TextInput
              style={inputStyle}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoFocus
            />
            <Text style={labelStyle()}>Last name</Text>
            <TextInput
              style={inputStyle}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Your last name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
            <Text style={labelStyle()}>Your branch</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {BRANCHES.map((b) => {
                const selected = branch === b;
                return (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBranch(b)}
                    style={{
                      backgroundColor: selected ? colors.primary : colors.primarySoft,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? colors.white : colors.primary,
                        fontWeight: "600",
                        fontSize: fs(13),
                      }}
                    >
                      {b}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <PrimaryButton
              title={busy ? "Saving…" : "Complete sign in"}
              onPress={busy ? () => {} : handleComplete}
            />
          </>
        )}

        {error ? (
          <Text style={{ fontSize: fs(14), color: "#C62828", marginTop: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ fontSize: fs(14), color: colors.textMuted, fontWeight: "600" }}>
            ← Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
