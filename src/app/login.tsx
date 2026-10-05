// DEMO login screen — MOCK ONLY. The real Gmail OTP goes through Firebase
// (one step needs Tj's Google account) and comes with the real build.
// This screen simulates email OTP + name/branch collection so every
// personalized feature works now.
import React, { useState } from "react";
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
import { BRANCHES, DEMO_OTP, completeRegistration, requestOtp, verifyOtp } from "../auth/mock";
import { PrimaryButton } from "../components/ui";
import { useAppTheme } from "../theme/ThemeContext";

type Step = 1 | 2 | 3;

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

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await requestOtp(email.trim());
      setStep(2);
    } catch {
      setError("Something went wrong sending the code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = () => {
    if (verifyOtp(code)) {
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
    } catch {
      setError("Something went wrong saving your profile. Please try again.");
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
        <Text
          style={{
            fontSize: fs(13),
            fontWeight: "600",
            color: colors.primary,
            marginBottom: 16,
          }}
        >
          DEMO login (mock — real Gmail OTP via Firebase comes later)
        </Text>

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
              A one-time code will be sent to your email. (Mock: no real email is sent.)
            </Text>
            <PrimaryButton
              title={busy ? "Sending…" : "Send code"}
              onPress={busy ? () => {} : handleSendCode}
            />
          </>
        )}

        {step === 2 && (
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
            <PrimaryButton title="Verify" onPress={handleVerify} />
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
