import { StyleSheet, View, Pressable } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, font, fontSize, spacing } from "@/src/design/useTheme";
import { type LucideIcon } from "lucide-react-native";
import { Button } from "./Button";

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
}) {
  const t = useZoriTheme();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {Icon && <Icon color={t.primary} size={20} strokeWidth={2} />}
        <View style={styles.textCol}>
          <Text
            accessibilityRole="header"
            style={{
              color: t.foreground,
              fontFamily: font.heading,
              fontSize: fontSize.lg,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: t.mutedForeground,
                fontFamily: font.sans,
                fontSize: fontSize.sm,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Text
            style={{
              color: t.primary,
              fontFamily: font.sans,
              fontSize: fontSize.sm,
              fontWeight: "600",
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  textCol: { flexShrink: 1 },
});
