import { useEffect } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { Stack, router } from "expo-router";
import { AppThemeProvider } from "../theme/ThemeContext";
import { colors } from "../theme/colors";
import {
  isSignInLink,
  completeSignInWithLink,
  authErrorMessage,
} from "../auth";
import { initCloudSync } from "../sync/cloudSync";

/**
 * Extract the Firebase email sign-in link from an incoming deep link.
 * Handles both:
 *   - the raw Firebase link (if universal links ever open the app directly)
 *   - our redirect page's scheme link: mahimaministries://auth?link=<encoded>
 */
function extractSignInLink(url: string): string | null {
  if (isSignInLink(url)) return url;
  try {
    const parsed = Linking.parse(url);
    const param = parsed.queryParams?.link;
    const link = Array.isArray(param) ? param[0] : param;
    if (typeof link === "string" && isSignInLink(link)) return link;
  } catch {
    // Not a parseable link — ignore.
  }
  return null;
}

async function handleIncomingUrl(url: string): Promise<void> {
  const signInLink = extractSignInLink(url);
  if (!signInLink) return;
  try {
    const { needsRegistration } = await completeSignInWithLink(signInLink);
    if (needsRegistration) {
      // Brand-new member — collect name + branch.
      router.navigate("/login");
    } else {
      // Returning member — profile restored, back to Home.
      router.replace("/");
    }
  } catch (e) {
    Alert.alert("Sign-in failed", authErrorMessage(e));
  }
}

export default function RootLayout() {
  useEffect(() => {
    const unsubSync = initCloudSync();

    Linking.getInitialURL().then((url) => {
      if (url) handleIncomingUrl(url);
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleIncomingUrl(url);
    });

    return () => {
      sub.remove();
      unsubSync();
    };
  }, []);

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
