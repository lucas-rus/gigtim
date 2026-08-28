import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, radius, font, fontSize, fontWeight } from "@/src/design/useTheme";
import { type ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
type BadgeSize = "sm" | "md";

export function Badge({
  variant = "primary",
  size = "sm",
  children,
  style,
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  style?: View["props"]["style"];
}) {
  const t = useZoriTheme();
  const palette = (() => {
    switch (variant) {
      case "secondary":
        return { bg: t.secondaryStrong, fg: t.secondaryForeground, border: "transparent" };
      case "accent":
        return { bg: t.accent, fg: t.accentForeground, border: "transparent" };
      case "outline":
        return { bg: "transparent", fg: t.foreground, border: t.border };
      case "ghost":
        return { bg: t.muted, fg: t.mutedForeground, border: "transparent" };
      case "destructive":
        return { bg: t.destructive, fg: t.destructiveForeground, border: "transparent" };
      default:
        return { bg: t.primaryStrong, fg: t.primaryForeground, border: "transparent" };
    }
  })();

  const dims = size === "sm" ? { pv: 3, ph: 10, fs: fontSize.xs } : { pv: 5, ph: 12, fs: fontSize.sm };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === "outline" ? 1 : 0,
          paddingVertical: dims.pv,
          paddingHorizontal: dims.ph,
          borderRadius: radius.full,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: palette.fg,
          fontFamily: font.sans,
          fontSize: dims.fs,
          fontWeight: fontWeight.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});
