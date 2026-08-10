import {
  AlertTriangle,
  Backpack,
  Ban,
  Banknote,
  Bed,
  Building2,
  Calendar,
  CalendarDays,
  Car,
  Circle,
  CircleDollarSign,
  Compass,
  ForkKnife,
  House,
  Landmark,
  Map,
  MapPin,
  Mountain,
  Pin,
  Plane,
  RotateCcw,
  ScrollText,
  Shield,
  Ticket,
  TriangleAlert,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Maps the original Phosphor class names (used as `{{icon:name}}` markers in
// the migrated data) to their lucide-react equivalents. `ph-fill` has no
// stroke counterpart in lucide, so fill vs. regular is irrelevant here.
const ICON_MAP: Record<string, LucideIcon> = {
  warning: TriangleAlert,
  ticket: Ticket,
  compass: Compass,
  car: Car,
  "map-trifold": Map,
  airplane: Plane,
  "push-pin": Pin,
  mountains: Mountain,
  money: CircleDollarSign,
  house: House,
  "calendar-blank": CalendarDays,
  calendar: Calendar,
  backpack: Backpack,
  "arrow-counter-clockwise": RotateCcw,
  waves: Waves,
  shield: Shield,
  scroll: ScrollText,
  prohibit: Ban,
  lightning: Zap,
  "fork-knife": ForkKnife,
  buildings: Building2,
  bed: Bed,
  bank: Landmark,
  circle: Circle,
  // aliases / extras seen across data
  "alert-triangle": AlertTriangle,
  "map-pin": MapPin,
  banknote: Banknote,
};

export function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Circle;
}

// Urgency dot colors (preserve the original red/amber/orange/green semantics).
const DOT_COLORS: Record<string, string> = {
  red: "#e5484d",
  amber: "#f5a623",
  orange: "#f97316",
  green: "#30a46c",
};

export function dotColor(name: string): string {
  return DOT_COLORS[name] ?? "#94a3b8";
}
