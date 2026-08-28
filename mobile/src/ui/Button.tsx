import { Pressable, type PressableProps, ActivityIndicator, StyleSheet, View, type ViewStyle } from "react-native";
import { Text } from "@/components/Themed";
import { useZoriTheme, radius, font, fontSize, fontWeight, tapTarget } from "@/src/design/useTheme";
import { type LucideIcon } from "lucide-react-native";
import { useMemo } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: string;
  style?: ViewStyle;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const t = useZoriTheme();
  const palette = useMemo(() => {
    switch (variant) {
      case "secondary":
        return { bg: t.secondaryStrong, fg: t.secondaryForeground, border: "transparent" };
      case "outline":
        return { bg: "transparent", fg: t.foreground, border: t.border };
      case "ghost":
        return { bg: "transparent", fg: t.foreground, border: "transparent" };
      case "destructive":
        return { bg: t.destructive, fg: t.destructiveForeground, border: "transparent" };
      default:
        return { bg: t.primaryStrong, fg: t.primaryForeground, border: "transparent" };
    }
  }, [variant, t]);

  const dims = useMemo(() => {
    switch (size) {
      case "sm":
        return { minHeight: 36, paddingVertical: 8, paddingHorizontal: 12, fs: fontSize.sm, iconSize: 16, square: undefined as number | undefined };
      case "lg":
        return { minHeight: 52, paddingVertical: 14, paddingHorizontal: 20, fs: fontSize.lg, iconSize: 22, square: undefined as number | undefined };
      case "icon":
        return { minHeight: tapTarget.min, paddingVertical: 0, paddingHorizontal: 0, fs: fontSize.base, iconSize: 22, square: tapTarget.min as number | undefined };
      default:
        return { minHeight: tapTarget.min, paddingVertical: 12, paddingHorizontal: 16, fs: fontSize.base, iconSize: 20, square: undefined as number | undefined };
    }
  }, [size]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === "outline" ? 1 : 0,
          minHeight: dims.minHeight,
          paddingVertical: dims.paddingVertical,
          paddingHorizontal: dims.paddingHorizontal,
          width: dims.square ?? (fullWidth ? "100%" : undefined),
          height: dims.square ?? undefined,
          borderRadius: radius.md,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        } as ViewStyle,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <View style={styles.content}>
          {LeftIcon && <LeftIcon color={palette.fg} size={dims.iconSize} strokeWidth={2} />}
          <Text
            style={{
              color: palette.fg,
              fontFamily: font.sans,
              fontSize: dims.fs,
              fontWeight: fontWeight.semibold,
            }}
          >
            {children}
          </Text>
          {RightIcon && <RightIcon color={palette.fg} size={dims.iconSize} strokeWidth={2} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
