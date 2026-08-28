import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import { Star, StarHalf } from "lucide-react-native";
import { useZoriTheme, font, fontSize } from "@/src/design/useTheme";

export function RatingStars({
  value,
  max = 5,
  size = 16,
  showValue = true,
}: {
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}) {
  const t = useZoriTheme();
  const full = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const empty = max - full - (hasHalf ? 1 : 0);

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`Rating ${value} of ${max}`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} color={t.accent} fill={t.accent} size={size} strokeWidth={1.5} />
      ))}
      {hasHalf && <StarHalf color={t.accent} fill={t.accent} size={size} strokeWidth={1.5} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} color={t.mutedForeground} size={size} strokeWidth={1.5} style={{ opacity: 0.3 }} />
      ))}
      {showValue && (
        <Text style={{ color: t.foreground, fontFamily: font.mono, fontSize: fontSize.sm, marginLeft: 6 }}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
});
