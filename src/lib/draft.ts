import { cityGuideFor } from "@/data/cities";
import { todayIso } from "@/lib/hours";
import type { DayHours, Station, StationDraft, Weekday } from "@/types";
import { WEEKDAYS } from "@/types";

function dayDraft(open = "09:00", close = "17:00", closed = false) {
  return { closed, open, close };
}

export function emptyDraft(): StationDraft {
  const days = Object.fromEntries(WEEKDAYS.map((day) => [day, dayDraft()])) as StationDraft["days"];
  return {
    name: "",
    venueKind: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    lat: "",
    lng: "",
    locationApproximate: false,
    timezone: "",
    locationInside: "",
    accessMode: "",
    accessNotes: "",
    twentyFourHours: false,
    days,
    benchType: "",
    benchLengthCm: "",
    benchWidthCm: "",
    maxWeightKg: "",
    hoist: "",
    sling: "unknown",
    slingNotes: "",
    roomLengthM: "",
    roomWidthM: "",
    turningCircleMm: "",
    peninsulaToilet: "unknown",
    grabRails: "unknown",
    privacyScreen: "unknown",
    lockableDoor: "",
    sinkHeightCm: "",
    wasteBin: "unknown",
    paperRoll: "unknown",
    emergencyCord: "unknown",
    accessibleParking: "unknown",
    parkingNotes: "",
    stepFreeRoute: "",
    wheelchairEntrance: "",
    roomKind: "",
    photos: [],
    submittedBy: "",
    acknowledged: false,
    notes: "",
  };
}

export function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

export function draftToStation(draft: StationDraft, id = `local-${crypto.randomUUID()}`): Station {
  const guide = cityGuideFor(draft.city);
  const latText = draft.lat.trim();
  const lngText = draft.lng.trim();
  const hasCoords = latText !== "" && lngText !== "";
  const lat = hasCoords ? Number(latText) : (guide?.lat ?? 0);
  const lng = hasCoords ? Number(lngText) : (guide?.lng ?? 0);
  const days = Object.fromEntries(
    WEEKDAYS.map((day) => {
      const value = draft.days[day];
      const hours: DayHours = value.closed
        ? { closed: true, open: null, close: null }
        : { closed: false, open: value.open, close: value.close };
      return [day, hours];
    }),
  ) as Record<Weekday, DayHours>;

  return {
    id,
    sample: false,
    pendingReview: true,
    localOnly: true,
    name: draft.name.trim(),
    venueKind: draft.venueKind,
    addressLine: draft.addressLine.trim(),
    city: draft.city.trim(),
    region: draft.region.trim(),
    country: draft.country.trim(),
    lat,
    lng,
    locationApproximate: hasCoords ? draft.locationApproximate : true,
    timezone: draft.timezone,
    locationInside: draft.locationInside.trim(),
    accessMode: draft.accessMode || "free",
    accessNotes: draft.accessNotes.trim(),
    hours: { twentyFourHours: draft.twentyFourHours, days },
    benchType: draft.benchType || "unknown",
    benchLengthCm: optionalNumber(draft.benchLengthCm),
    benchWidthCm: optionalNumber(draft.benchWidthCm),
    maxWeightKg: optionalNumber(draft.maxWeightKg),
    hoist: draft.hoist || "unknown",
    sling: draft.sling,
    slingNotes: draft.slingNotes.trim(),
    roomLengthM: optionalNumber(draft.roomLengthM),
    roomWidthM: optionalNumber(draft.roomWidthM),
    turningCircleMm: optionalNumber(draft.turningCircleMm),
    peninsulaToilet: draft.peninsulaToilet,
    grabRails: draft.grabRails,
    privacyScreen: draft.privacyScreen,
    lockableDoor: draft.lockableDoor || "unknown",
    sinkHeightCm: optionalNumber(draft.sinkHeightCm),
    wasteBin: draft.wasteBin,
    paperRoll: draft.paperRoll,
    emergencyCord: draft.emergencyCord,
    accessibleParking: draft.accessibleParking,
    parkingNotes: draft.parkingNotes.trim(),
    stepFreeRoute: draft.stepFreeRoute || "unknown",
    wheelchairEntrance: draft.wheelchairEntrance || "unknown",
    roomKind: draft.roomKind || "unknown",
    photos: draft.photos,
    lastVerified: todayIso(),
    verifiedBy: draft.submittedBy.trim() || "Submitted on this device",
    notes: draft.notes.trim(),
  };
}
