export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodedPlace extends LatLng {
  label: string;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const step =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(step)));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m away`;
  if (km < 100) return `${km.toFixed(km < 10 ? 1 : 0)} km away`;
  return `${Math.round(km)} km away`;
}

const CITY_ALIASES: Record<string, string> = {
  nairobi: "Nairobi",
  london: "London",
  "new york": "New York",
  nyc: "New York",
  "new york city": "New York",
  providence: "Providence",
};

export function exactCityName(query: string): string | null {
  return CITY_ALIASES[query.trim().toLowerCase()] ?? null;
}

export function validCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export async function geocodePlace(query: string, signal?: AbortSignal): Promise<GeocodedPlace | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error("Place search failed.");
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0] as { lat?: string; lon?: string; display_name?: string };
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!validCoordinate(lat, lng)) return null;
  return {
    lat,
    lng,
    label: first.display_name || query,
  };
}

export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function osmUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
