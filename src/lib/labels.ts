import type {
  AccessMode,
  BenchType,
  ConfirmationStatus,
  HoistType,
  ReportCategory,
  RoomKind,
  Station,
  YesNoUnknown,
} from "@/types";

export function benchLabel(type: BenchType): string {
  if (type === "height-adjustable") return "Height-adjustable bench";
  if (type === "fixed") return "Fixed-height bench";
  return "Bench type not recorded";
}

export function hoistLabel(hoist: HoistType): string {
  if (hoist === "ceiling") return "Ceiling track hoist";
  if (hoist === "mobile") return "Mobile hoist";
  if (hoist === "none") return "No hoist";
  return "Hoist not recorded";
}

export function accessLabel(mode: AccessMode): string {
  if (mode === "free") return "Open to the public, no key";
  if (mode === "key") return "Key needed (RADAR-style or similar)";
  if (mode === "code") return "Code needed";
  return "Ask staff to open it";
}

export function roomKindLabel(kind: RoomKind): string {
  if (kind === "gender-neutral") return "Gender-neutral room";
  if (kind === "family") return "Family room";
  if (kind === "either") return "Gender-neutral family room";
  if (kind === "other") return "Separate accessible room";
  return "Room type not recorded";
}

export function yesNoLabel(value: YesNoUnknown): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Not recorded";
}

export function confirmationLabel(status: ConfirmationStatus): string {
  if (status === "still-there") return "Still there";
  if (status === "broken") return "Something is broken";
  return "It's gone";
}

export function reportLabel(category: ReportCategory): string {
  if (category === "wrong-details") return "Details are wrong";
  if (category === "access-changed") return "Access has changed";
  if (category === "equipment") return "Equipment problem";
  if (category === "safety") return "Safety concern";
  return "Something else";
}

export function measurement(value: number | null, unit: string): string {
  if (value === null) return "Not recorded";
  return `${value} ${unit}`;
}

export function benchSize(station: Station): string {
  if (station.benchLengthCm === null && station.benchWidthCm === null) return "Not recorded";
  const length = station.benchLengthCm === null ? "length not recorded" : `${station.benchLengthCm} cm long`;
  const width = station.benchWidthCm === null ? "width not recorded" : `${station.benchWidthCm} cm wide`;
  return `${length} × ${width}`;
}

export function roomSize(station: Station): string {
  if (station.roomLengthM === null && station.roomWidthM === null) return "Not recorded";
  const length = station.roomLengthM === null ? "?" : `${station.roomLengthM} m`;
  const width = station.roomWidthM === null ? "?" : `${station.roomWidthM} m`;
  return `${length} × ${width}`;
}

export function routeSummary(station: Station): string {
  const step =
    station.stepFreeRoute === "yes"
      ? "Step-free route"
      : station.stepFreeRoute === "no"
        ? "Not a step-free route"
        : "Step-free route not recorded";
  const entrance =
    station.wheelchairEntrance === "yes"
      ? "wheelchair-accessible entrance"
      : station.wheelchairEntrance === "no"
        ? "entrance not recorded as wheelchair-accessible"
        : "wheelchair entrance not recorded";
  return `${step} · ${entrance}`;
}

export const VENUE_KINDS = [
  "Shopping",
  "Library",
  "Museum or gallery",
  "Transit station",
  "Park or recreation",
  "Hospital or clinic",
  "Sports or leisure",
  "Civic or community building",
  "Place of worship",
  "Other",
] as const;

export const TIMEZONES: Array<[string, string]> = [
  ["Africa/Nairobi", "Nairobi (East Africa Time)"],
  ["Europe/London", "London"],
  ["America/New_York", "US Eastern (New York, Providence)"],
  ["America/Chicago", "US Central"],
  ["America/Denver", "US Mountain"],
  ["America/Los_Angeles", "US Pacific"],
  ["UTC", "UTC"],
];
