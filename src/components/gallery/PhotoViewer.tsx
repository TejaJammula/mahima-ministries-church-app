// Full-screen photo viewer: swipe between photos, share, download.
// Pinch-to-zoom is enabled via ScrollView zoom scales (works on iOS;
// Android ignores the zoom props without crashing).
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";

// Loaded lazily so the screen never breaks in Expo Go even if the native
// module is missing: falls back to an explanatory alert instead.
let MediaLibrary: typeof import("expo-media-library") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- deliberate guarded require for Expo Go safety
  MediaLibrary = require("expo-media-library");
} catch {
  MediaLibrary = null;
}

interface PhotoViewerProps {
  visible: boolean;
  photos: ImageSourcePropType[];
  initialIndex: number;
  eventTitle: string;
  onClose: () => void;
}

export function PhotoViewer({ visible, photos, initialIndex, eventTitle, onClose }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = viewableItems[0]?.index;
      if (next != null) setIndex(next);
    },
    []
  );

  const onShare = async () => {
    try {
      await Share.share({
        // Production app shares the photo's Telegram CDN URL here.
        message: `A photo from "${eventTitle}" — Mahima Ministries church gallery.\n\nIn the production app this shares the photo's Telegram CDN link.`,
      });
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  const onDownload = async () => {
    if (!MediaLibrary) {
      Alert.alert(
        "Download unavailable",
        "Saving photos needs the expo-media-library native module (a development build). This preview keeps working without it."
      );
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to save this photo.");
        return;
      }
      const resolved = Image.resolveAssetSource(photos[index]);
      const uri = resolved?.uri;
      if (!uri) {
        Alert.alert("Couldn't save", "The photo URI is unavailable.");
        return;
      }
      // Production photos are remote CDN URLs: they get downloaded to a local
      // file (expo-file-system) first, then saved with saveToLibraryAsync.
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "Photo saved to your phone's gallery.");
    } catch {
      Alert.alert("Couldn't save", "Something went wrong while saving the photo.");
    }
  };

  const pageHeight = height;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      {/* Remount per event so the viewer always starts at initialIndex */}
      <View key={`${eventTitle}-${photos.length}`} style={{ flex: 1, backgroundColor: "#000" }}>
        <FlatList
          data={photos}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <ScrollView
              style={{ width, height: pageHeight }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image source={item} style={{ width, height: pageHeight }} resizeMode="contain" />
            </ScrollView>
          )}
        />

        {/* Top bar: close + counter */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 54,
            paddingBottom: 12,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close viewer">
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>✕</Text>
          </Pressable>
          <Text
            style={{ flex: 1, textAlign: "center", color: "#fff", fontSize: 15, fontWeight: "600" }}
          >{`${index + 1} of ${photos.length}`}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Bottom bar: share + download */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 12,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <Pressable
            onPress={onShare}
            style={{
              flex: 1,
              backgroundColor: "#C2185B",
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Share</Text>
          </Pressable>
          <Pressable
            onPress={onDownload}
            style={{
              flex: 1,
              borderWidth: 1.5,
              borderColor: "#fff",
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Download</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
