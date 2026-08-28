import { Image, StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, radius, font, fontWeight } from "@/src/design/useTheme";

const sizeMap = { sm: 32, md: 40, lg: 56 };

export function Avatar({
  src,
  name,
  size = "md",
  ring = false,
}: {
  src?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  ring?: boolean;
}) {
  const t = useZoriTheme();
  const px = sizeMap[size];
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const inner = src ? (
    <Image
      source={{ uri: src }}
      style={{ width: px, height: px, borderRadius: px / 2 }}
      accessibilityLabel={name ? `Avatar ${name}` : "Avatar"}
    />
  ) : (
    <View
      style={[
        styles.initials,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: t.primaryStrong,
        },
      ]}
      accessibilityLabel={name ? `Avatar ${name}` : "Avatar"}
    >
      <Text
        style={{
          color: t.primaryForeground,
          fontFamily: font.heading,
          fontWeight: fontWeight.semibold,
          fontSize: px * 0.4,
        }}
      >
        {initials}
      </Text>
    </View>
  );

  if (!ring) return inner;

  return (
    <View
      style={[
        styles.ringWrap,
        {
          width: px + 4,
          height: px + 4,
          borderRadius: (px + 4) / 2,
          backgroundColor: t.card,
          borderColor: t.primary,
        },
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  initials: { alignItems: "center", justifyContent: "center" },
  ringWrap: { borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
