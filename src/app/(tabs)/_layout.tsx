import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { colors } from "../../theme/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: focused ? colors.primary : "transparent",
        marginTop: label === "Bible" ? -18 : 0,
        transform: [{ scale: label === "Bible" ? 1.15 : 1 }],
      }}
    >
      <Text
        style={{
          color: focused ? colors.white : colors.textMuted,
          fontWeight: "700",
          fontSize: 11,
        }}
      >
        {label.slice(0, 1)}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="devotional"
        options={{
          title: "Word",
          tabBarIcon: ({ focused }) => <TabIcon label="Word" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: "Bible",
          tabBarIcon: ({ focused }) => <TabIcon label="Bible" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ focused }) => <TabIcon label="Gallery" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon label="More" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
