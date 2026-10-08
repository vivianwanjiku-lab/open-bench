import { cityGuideFor } from "@/data/cities";
import { isOpenAt } from "@/lib/hours";
import { accessLabel, benchLabel, hoistLabel, roomKindLabel } from "@/lib/labels";
import type { Station, StationFilters } from "@/types";
import { distanceKm, type LatLng } from "@/lib/geo";

export const emptyFilters: StationFilters = {
  query: "",
  city: "",
  heightAdjustable: false,
  hoist: false,
  privacy: false,
  wheelchairEntrance: false,
  stepFree: false,
  access: "any",
  openNow: false,
  open24: false,
  neutralOrFamily: false,
};

export function filtersFromSearchParams(params: URLSearchParams): StationFilters {
  const access = params.get("access");
  return {
    query: params.get("q") ?? "",
    city: params.get("city") ?? "",
    heightAdjustable: params.get("bench") === "adjustable",
    hoist: params.get("hoist") === "1",
    privacy: params.get("privacy") === "1",
    wheelchairEntrance: params.get("entrance") === "1",
    stepFree: params.get("stepfree") === "1",
    access: access === "free" || access === "restricted" ? access : "any",
    openNow: params.get("opennow") === "1",
    open24: params.get("allday") === "1",
    neutralOrFamily: params.get("room") === "family",
  };
}

export function filtersToSearchParams(filters: StationFilters): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: string, value: string | null) => {
    if (value) params.set(key, value);
  };
  set("q", filters.query.trim() || null);
  set("city", filters.city || null);
  set("bench", filters.heightAdjustable ? "adjustable" : null);
  set("hoist", filters.hoist ? "1" : null);
  set("privacy", filters.privacy ? "1" : null);
  set("entrance", filters.wheelchairEntrance ? "1" : null);
  set("stepfree", filters.stepFree ? "1" : null);
  set("access", filters.access === "any" ? null : filters.access);
  set("opennow", filters.openNow ? "1" : null);
  set("allday", filters.open24 ? "1" : null);
  set("room", filters.neutralOrFamily ? "family" : null);
  return params;
}

export function activeFilterCount(filters: StationFilters): number {
  return [
    filters.query.trim() !== "",
    filters.city !== "",
    filters.heightAdjustable,
    filters.hoist,
    filters.privacy,
    filters.wheelchairEntrance,
    filters.stepFree,
    filters.access !== "any",
    filters.openNow,
    filters.open24,
    filters.neutralOrFamily,
  ].filter(Boolean).length;
}

function haystack(station: Station): string {
  return [
    station.name,
    station.city,
    station.region,
    station.country,
    station.addressLine,
    station.venueKind,
    station.locationInside,
    benchLabel(station.benchType),
    hoistLabel(station.hoist),
    accessLabel(station.accessMode),
    roomKindLabel(station.roomKind),
  ]
    .join(" ")
    .toLowerCase();
}

export function stationMatches(station: Station, filters: StationFilters, now = new Date()): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query && !haystack(station).includes(query)) return false;
  if (filters.city && station.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.heightAdjustable && station.benchType !== "height-adjustable") return false;
  if (filters.hoist && station.hoist !== "ceiling" && station.hoist !== "mobile") return false;
  if (filters.privacy && station.lockableDoor !== "yes" && station.privacyScreen !== "yes") return false;
  if (filters.wheelchairEntrance && station.wheelchairEntrance !== "yes") return false;
  if (filters.stepFree && station.stepFreeRoute !== "yes") return false;
  if (filters.access === "free" && station.accessMode !== "free") return false;
  if (filters.access === "restricted" && station.accessMode === "free") return false;
  if (filters.open24 && !station.hours.twentyFourHours) return false;
  if (filters.openNow && !isOpenAt(station.hours, station.timezone, now)) return false;
  if (
    filters.neutralOrFamily &&
    station.roomKind !== "gender-neutral" &&
    station.roomKind !== "family" &&
    station.roomKind !== "either"
  ) {
    return false;
  }
  return true;
}

export function filterStations(stations: Station[], filters: StationFilters, now = new Date()): Station[] {
  return stations.filter((station) => stationMatches(station, filters, now));
}

export function sortStations(stations: Station[], origin: LatLng | null): Station[] {
  const copy = [...stations];
  if (!origin) {
    copy.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
    return copy;
  }
  copy.sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
  return copy;
}

export function focusForFilters(filters: StationFilters): { lat: number; lng: number; zoom: number } | null {
  if (!filters.city) return null;
  const city = cityGuideFor(filters.city);
  if (!city) return null;
  return { lat: city.lat, lng: city.lng, zoom: 12 };
}
