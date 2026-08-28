import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import { Calendar, MapPin, CircleDollarSign, Clock } from "lucide-react-native";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { useZoriTheme, font, fontSize, fontWeight, spacing } from "@/src/design/useTheme";

export interface ShiftCardShift {
  role_needed: string;
  hourly_pay_ron: number;
  start_time: string;
  end_time: string;
  employer?: { company_name?: string; address?: string; city?: string; employer_rating?: number } | null;
  city?: string | null;
}

export function ShiftCard({
  shift,
  applied = false,
  onPress,
}: {
  shift: ShiftCardShift;
  applied?: boolean;
  onPress?: () => void;
}) {
  const t = useZoriTheme();
  const start = new Date(shift.start_time);
  const end = new Date(shift.end_time);
  const hours = Math.max(0, (end.getTime() - start.getTime()) / 3600000);
  const total = (shift.hourly_pay_ron * hours).toFixed(0);
  const dateStr = start.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
  const timeStr = `${start.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`;
  const company = shift.employer?.company_name ?? "Angajator";
  const city = shift.city ?? shift.employer?.city ?? "Timișoara";

  return (
    <Card onPress={onPress} padding="md">
      <View style={styles.header}>
        <Text
          style={{
            color: t.foreground,
            fontFamily: font.heading,
            fontSize: fontSize.base,
            fontWeight: fontWeight.bold,
            flexShrink: 1,
          }}
        >
          {roleLabel(shift.role_needed)}
        </Text>
        <Badge variant={applied ? "secondary" : "accent"}>
          {applied ? "Aplicat" : "Deschis"}
        </Badge>
      </View>

      <Text
        style={{
          color: t.mutedForeground,
          fontFamily: font.sans,
          fontSize: fontSize.sm,
          marginTop: 4,
        }}
      >
        {company}
      </Text>

      <View style={[styles.metaRow, { marginTop: spacing.md }]}>
        <Calendar color={t.mutedForeground} size={15} strokeWidth={2} />
        <Text style={metaText(t)}>{dateStr}</Text>
        <Clock color={t.mutedForeground} size={15} strokeWidth={2} style={{ marginLeft: 12 }} />
        <Text style={metaText(t)}>{timeStr}</Text>
      </View>

      <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
        <MapPin color={t.mutedForeground} size={15} strokeWidth={2} />
        <Text style={metaText(t)}>{city}</Text>
      </View>

      <View style={[styles.payRow, { borderTopColor: t.border, marginTop: spacing.md }]}>
        <View style={styles.metaRow}>
          <CircleDollarSign color={t.primary} size={18} strokeWidth={2} />
          <Text style={{ color: t.foreground, fontFamily: font.mono, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>
            {shift.hourly_pay_ron.toFixed(0)} RON/oră
          </Text>
        </View>
        <Text style={{ color: t.mutedForeground, fontFamily: font.mono, fontSize: fontSize.sm }}>
          ≈ {total} RON · {hours.toFixed(1)}h
        </Text>
      </View>
    </Card>
  );
}

function metaText(t: ReturnType<typeof useZoriTheme>) {
  return { color: t.mutedForeground, fontFamily: font.sans, fontSize: fontSize.sm };
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    BARISTA: "Barista",
    WAITER: "Ospătar",
    DISHWASHER: "Spălator vase",
    STAGEHAND: "Tehnician scenă",
  };
  return map[role] ?? role;
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  payRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1 },
});
