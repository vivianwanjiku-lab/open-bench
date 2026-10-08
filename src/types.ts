export type YesNoUnknown = "yes" | "no" | "unknown";

export type BenchType = "height-adjustable" | "fixed" | "unknown";

export type HoistType = "ceiling" | "mobile" | "none" | "unknown";

export type AccessMode = "free" | "key" | "code" | "staff";

export type RoomKind = "gender-neutral" | "family" | "either" | "other" | "unknown";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface DayHours {
  closed: boolean;
  open: string | null;
  close: string | null;
}

export interface WeekHours {
  twentyFourHours: boolean;
  days: Record<Weekday, DayHours>;
}

export interface StationPhoto {
  src: string;
  alt: string;
}

export interface Station {
  id: string;
  sample: boolean;
  pendingReview: boolean;
  localOnly: boolean;
  name: string;
  venueKind: string;
  addressLine: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  locationApproximate: boolean;
  timezone: string;
  locationInside: string;
  accessMode: AccessMode;
  accessNotes: string;
  hours: WeekHours;
  benchType: BenchType;
  benchLengthCm: number | null;
  benchWidthCm: number | null;
  maxWeightKg: number | null;
  hoist: HoistType;
  sling: YesNoUnknown;
  slingNotes: string;
  roomLengthM: number | null;
  roomWidthM: number | null;
  turningCircleMm: number | null;
  peninsulaToilet: YesNoUnknown;
  grabRails: YesNoUnknown;
  privacyScreen: YesNoUnknown;
  lockableDoor: YesNoUnknown;
  sinkHeightCm: number | null;
  wasteBin: YesNoUnknown;
  paperRoll: YesNoUnknown;
  emergencyCord: YesNoUnknown;
  accessibleParking: YesNoUnknown;
  parkingNotes: string;
  stepFreeRoute: YesNoUnknown;
  wheelchairEntrance: YesNoUnknown;
  roomKind: RoomKind;
  photos: StationPhoto[];
  lastVerified: string | null;
  verifiedBy: string;
  notes: string;
}

export interface DayDraft {
  closed: boolean;
  open: string;
  close: string;
}

export interface StationDraft {
  name: string;
  venueKind: string;
  addressLine: string;
  city: string;
  region: string;
  country: string;
  lat: string;
  lng: string;
  locationApproximate: boolean;
  timezone: string;
  locationInside: string;
  accessMode: AccessMode | "";
  accessNotes: string;
  twentyFourHours: boolean;
  days: Record<Weekday, DayDraft>;
  benchType: BenchType | "";
  benchLengthCm: string;
  benchWidthCm: string;
  maxWeightKg: string;
  hoist: HoistType | "";
  sling: YesNoUnknown;
  slingNotes: string;
  roomLengthM: string;
  roomWidthM: string;
  turningCircleMm: string;
  peninsulaToilet: YesNoUnknown;
  grabRails: YesNoUnknown;
  privacyScreen: YesNoUnknown;
  lockableDoor: YesNoUnknown | "";
  sinkHeightCm: string;
  wasteBin: YesNoUnknown;
  paperRoll: YesNoUnknown;
  emergencyCord: YesNoUnknown;
  accessibleParking: YesNoUnknown;
  parkingNotes: string;
  stepFreeRoute: YesNoUnknown | "";
  wheelchairEntrance: YesNoUnknown | "";
  roomKind: RoomKind | "";
  photos: StationPhoto[];
  submittedBy: string;
  acknowledged: boolean;
  notes: string;
}

export type ConfirmationStatus = "still-there" | "broken" | "gone";

export interface Confirmation {
  id: string;
  stationId: string;
  status: ConfirmationStatus;
  note: string;
  createdAt: string;
}

export type ReportCategory = "wrong-details" | "access-changed" | "equipment" | "safety" | "other";

export interface ProblemReport {
  id: string;
  stationId: string;
  category: ReportCategory;
  message: string;
  createdAt: string;
}

export interface FieldError {
  id: string;
  message: string;
}

export interface StationFilters {
  query: string;
  city: string;
  heightAdjustable: boolean;
  hoist: boolean;
  privacy: boolean;
  wheelchairEntrance: boolean;
  stepFree: boolean;
  access: "any" | "free" | "restricted";
  openNow: boolean;
  open24: boolean;
  neutralOrFamily: boolean;
}
