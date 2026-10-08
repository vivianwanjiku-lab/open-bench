export interface CityGuide {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const cityGuides: CityGuide[] = [
  {
    city: "Nairobi",
    region: "Nairobi County",
    country: "Kenya",
    lat: -1.286389,
    lng: 36.817223,
    timezone: "Africa/Nairobi",
  },
  {
    city: "London",
    region: "Greater London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
  },
  {
    city: "New York",
    region: "New York",
    country: "United States",
    lat: 40.7484,
    lng: -73.9857,
    timezone: "America/New_York",
  },
  {
    city: "Providence",
    region: "Rhode Island",
    country: "United States",
    lat: 41.824,
    lng: -71.4128,
    timezone: "America/New_York",
  },
];

export function cityGuideFor(name: string): CityGuide | undefined {
  const key = name.trim().toLowerCase();
  return cityGuides.find((city) => city.city.toLowerCase() === key);
}
