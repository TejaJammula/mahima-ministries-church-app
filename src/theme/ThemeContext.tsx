// App-wide theme: day/night mode + text size, persisted in the store.
// Every screen uses useAppTheme() instead of importing colors directly.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import { colors as lightColors } from "./colors";
import { store, Settings } from "../storage/store";

type Palette = typeof lightColors;

const darkColors: Palette = {
  ...lightColors,
  background: "#14101A",
  surface: "#1E1826",
  card: "#211B2B",
  text: "#F5F0F7",
  textMuted: "#B9AEC4",
  border: "#352B44",
  primarySoft: "#3A1F2E",
  goldSoft: "#3A2F18",
};

interface AppTheme {
  colors: Palette;
  textSize: number; // multiplier
  theme: Settings["theme"];
  setTheme: (t: Settings["theme"]) => void;
  setTextSize: (n: number) => void;
  /** Scale a base font size by the user's text-size preference. */
  fs: (base: number) => number;
}

const Ctx = createContext<AppTheme>({
  colors: lightColors,
  textSize: 1,
  theme: "light",
  setTheme: () => {},
  setTextSize: () => {},
  fs: (b) => b,
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<Settings>({ textSize: 1, theme: "light" });

  useEffect(() => {
    store.getSettings().then(setSettings);
  }, []);

  const persist = useCallback((s: Settings) => {
    setSettings(s);
    store.saveSettings(s);
  }, []);

  const setTheme = useCallback(
    (theme: Settings["theme"]) => persist({ ...settings, theme }),
    [settings, persist]
  );
  const setTextSize = useCallback(
    (textSize: number) => persist({ ...settings, textSize }),
    [settings, persist]
  );

  const dark = settings.theme === "dark" || (settings.theme === "system" && system === "dark");
  const value: AppTheme = {
    colors: dark ? darkColors : lightColors,
    textSize: settings.textSize,
    theme: settings.theme,
    setTheme,
    setTextSize,
    fs: (base: number) => Math.round(base * settings.textSize),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppTheme(): AppTheme {
  return useContext(Ctx);
}
