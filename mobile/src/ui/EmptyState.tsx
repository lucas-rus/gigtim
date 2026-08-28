import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, font, fontSize, spacing } from "@/src/design/useTheme";
import { type LucideIcon } from "lucide-react-native";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}) {
  const t = useZoriTheme();
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.iconWrap, { backgroundColor: t.muted }]}>
        <Icon color={t.mutedForeground} size={32} strokeWidth={1.5} />
      </View>
      <Text
        style={{
          color: t.foreground,
          fontFamily: font.heading,
          fontSize: fontSize.lg,
          fontWeight: "600",
          marginTop: spacing.md,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: font.sans,
            fontSize: fontSize.sm,
            marginTop: spacing.sm,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      )}
      {action && (
        <View style={{ marginTop: spacing.lg }}>
          <Button variant="outline" onPress={action.onPress}>
            {action.label}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
});
