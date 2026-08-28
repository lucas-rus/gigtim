import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps, type TextStyle } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, radius, font, fontSize, tapTarget } from "@/src/design/useTheme";
import { type LucideIcon } from "lucide-react-native";

type InputProps = Omit<TextInputProps, "onChangeText" | "style"> & {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  style?: TextStyle;
};

export function Input({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  value,
  onChangeText,
  style,
  ...rest
}: InputProps) {
  const t = useZoriTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.destructive : focused ? t.primary : t.input;
  const borderWidth = focused ? 2 : 1;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          style={{
            color: t.mutedForeground,
            fontFamily: font.heading,
            fontSize: fontSize.sm,
            fontWeight: "500",
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.row,
          {
            backgroundColor: t.card,
            borderColor,
            borderWidth,
            borderRadius: radius.md,
          },
        ]}
      >
        {LeftIcon && <LeftIcon color={t.mutedForeground} size={18} strokeWidth={2} />}
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={t.mutedForeground}
          style={[
            {
              flex: 1,
              minHeight: tapTarget.min,
              color: t.foreground,
              fontFamily: font.sans,
              fontSize: fontSize.base,
              paddingHorizontal: 12,
              paddingVertical: 8,
            } as TextStyle,
            style,
          ]}
          {...rest}
        />
        {RightIcon && <RightIcon color={t.mutedForeground} size={18} strokeWidth={2} />}
      </View>
      {error && (
        <Text style={{ color: t.destructive, fontFamily: font.sans, fontSize: fontSize.xs, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
});
