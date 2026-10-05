import { Stack } from "expo-router";
import { AppThemeProvider } from "../theme/ThemeContext";
import { colors } from "../theme/colors";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppThemeProvider>
  );
}
