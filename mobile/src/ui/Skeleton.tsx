import { Animated, Easing, StyleSheet, type ViewStyle } from "react-native";
import { useEffect, useRef } from "react";
import { useZoriTheme, radius } from "@/src/design/useTheme";

type Dimension = number | `${number}%`;

export function Skeleton({
  width = "100%" as Dimension,
  height = 16 as Dimension,
  radius: r = radius.md,
  style,
}: {
  width?: Dimension;
  height?: Dimension;
  radius?: number;
  style?: ViewStyle;
}) {
  const t = useZoriTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: t.muted, borderRadius: r, opacity } as ViewStyle,
        style,
      ]}
    />
  );
}
