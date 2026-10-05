// Shared UI primitives — every section uses these so the app looks like one app.
// White theme, magenta primary, gold accents. English labels everywhere.
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../theme/colors";

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[{ padding: spacing.md, paddingBottom: spacing.xl }, style as object]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.sm }, style]}>
      {children}
    </Text>
  );
}

export function BodyText({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontSize: 15, color: colors.text, lineHeight: 22 }, style]}>{children}</Text>
  );
}

export function MutedText({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }, style]}>{children}</Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  style,
  color,
}: {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          backgroundColor: color ?? colors.primary,
          borderRadius: radius.md,
          paddingVertical: 14,
          alignItems: "center",
          marginTop: spacing.sm,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? colors.primary : colors.primarySoft,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Text
        style={{
          color: selected ? colors.white : colors.primary,
          fontWeight: "600",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function GoldDivider() {
  return (
    <View
      style={{
        height: 2,
        backgroundColor: colors.gold,
        borderRadius: 1,
        marginVertical: spacing.sm,
        width: 48,
      }}
    />
  );
}
