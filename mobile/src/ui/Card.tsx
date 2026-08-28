import { Pressable, type PressableProps, StyleSheet, View, ViewStyle } from "react-native";
import { useZoriTheme, radius } from "@/src/design/useTheme";
import { type ReactNode, useMemo } from "react";

type CardProps = Omit<PressableProps, "children"> & {
  elevated?: boolean;
  padding?: "sm" | "md" | "lg";
  onPress?: PressableProps["onPress"];
  style?: ViewStyle;
  children: ReactNode;
};

const padMap = { sm: 8, md: 16, lg: 24 };

export function Card({
  elevated = false,
  padding = "md",
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const t = useZoriTheme();
  const paddingVal = padMap[padding];

  const baseStyle: ViewStyle = useMemo(
    () => ({
      backgroundColor: t.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      padding: paddingVal,
    }),
    [t, paddingVal]
  );

  const shadowStyle: ViewStyle = elevated
    ? {
        shadowColor: "#221812",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }
    : {};

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          baseStyle,
          shadowStyle,
          { transform: [{ translateY: pressed ? -2 : 0 }] },
          style,
        ]}
        onPress={onPress}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, shadowStyle, style]} {...(rest as ViewStyle)}>
      {children}
    </View>
  );
}
