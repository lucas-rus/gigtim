import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, radius, font, fontSize } from "@/src/design/useTheme";

type TextareaProps = Omit<TextInputProps, "onChangeText"> & {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  rows?: number;
};

export function Textarea({
  label,
  error,
  value,
  onChangeText,
  rows = 4,
  style,
  ...rest
}: TextareaProps) {
  const t = useZoriTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.destructive : focused ? t.primary : t.input;

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
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={t.mutedForeground}
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        style={[
          {
            backgroundColor: t.card,
            borderColor,
            borderWidth: focused ? 2 : 1,
            borderRadius: radius.md,
            minHeight: rows * 24,
            color: t.foreground,
            fontFamily: font.sans,
            fontSize: fontSize.base,
            paddingHorizontal: 12,
            paddingVertical: 10,
          },
          style,
        ]}
        {...rest}
      />
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
});
