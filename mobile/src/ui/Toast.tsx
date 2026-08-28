import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Text } from "@/components/Themed";
import { CheckCircle2, Info, TriangleAlert, OctagonX } from "lucide-react-native";
import { useZoriTheme, radius, font, fontSize, fontWeight, spacing } from "@/src/design/useTheme";

type ToastVariant = "success" | "error" | "info" | "warning";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

type ShowFn = (message: string, variant?: ToastVariant) => void;

const ToastCtx = createContext<{ show: ShowFn } | null>(null);

let _id = 0;

/**
 * Imperative toast API — call from anywhere after <ToastProvider> is mounted.
 *   toast.success("Salvat!"); toast.error("Eșec"); toast.info("Info");
 */
export const toast = {
  success: (m: string) => _dispatch(m, "success"),
  error: (m: string) => _dispatch(m, "error"),
  info: (m: string) => _dispatch(m, "info"),
  warning: (m: string) => _dispatch(m, "warning"),
};

let _dispatch: ShowFn = () => {
  console.warn("[toast] ToastProvider not mounted");
};
function _register(show: ShowFn) {
  _dispatch = show;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const fade = useRef(new Animated.Value(0)).current;
  const current = items[0];

  const show = useCallback<ShowFn>((message, variant = "info") => {
    setItems((prev) => [...prev, { id: ++_id, message, variant }]);
  }, []);

  useEffect(() => {
    _register(show);
  }, [show]);

  useEffect(() => {
    if (!current) return;
    Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setItems((prev) => prev.slice(1));
      });
    }, 3800);
    return () => clearTimeout(timer);
  }, [current, fade]);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <ToastOverlay item={current} fade={fade} onDismiss={() => setItems((p) => p.slice(1))} />
    </ToastCtx.Provider>
  );
}

function ToastOverlay({
  item,
  fade,
  onDismiss,
}: {
  item: ToastItem | undefined;
  fade: Animated.Value;
  onDismiss: () => void;
}) {
  const t = useZoriTheme();
  if (!item) return null;
  const meta = variantMeta(item.variant);
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }] },
      ]}
    >
      <Pressable onPress={onDismiss} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <View
          style={[
            styles.card,
            {
              backgroundColor: t.popover,
              borderColor: t.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <View style={[styles.stripe, { backgroundColor: meta.color }]} />
          <meta.Icon color={meta.color} size={20} strokeWidth={2} />
          <Text
            style={{
              color: t.foreground,
              fontFamily: font.sans,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              flex: 1,
            }}
          >
            {item.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function variantMeta(v: ToastVariant) {
  switch (v) {
    case "error":
      return { color: "#DB2D27", Icon: OctagonX };
    case "warning":
      return { color: "#F7B83D", Icon: TriangleAlert };
    case "success":
      return { color: "#33854A", Icon: CheckCircle2 };
    default:
      return { color: "#E14D28", Icon: Info };
  }
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowColor: "#221812",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  stripe: { width: 4, height: 28, borderRadius: 2, marginLeft: -4 },
});
