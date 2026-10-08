import { describe, expect, it } from "vitest";
import { sampleStations } from "@/data/stations";
import { emptyFilters, filterStations, filtersFromSearchParams, filtersToSearchParams } from "@/lib/filters";

const now = new Date("2026-10-07T12:00:00Z");

describe("filters", () => {
  it("round-trips through the query string", () => {
    const filters = {
      ...emptyFilters,
      query: "library",
      city: "Nairobi",
      heightAdjustable: true,
      hoist: true,
      access: "free" as const,
      openNow: true,
    };
    const again = filtersFromSearchParams(filtersToSearchParams(filters));
    expect(again).toEqual(filters);
  });

  it("keeps only height-adjustable benches", () => {
    const matches = filterStations(sampleStations, { ...emptyFilters, heightAdjustable: true }, now);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((station) => station.benchType === "height-adjustable")).toBe(true);
    expect(matches.length).toBeLessThan(sampleStations.length);
  });

  it("keeps ceiling and mobile hoists", () => {
    const matches = filterStations(sampleStations, { ...emptyFilters, hoist: true }, now);
    expect(matches.every((station) => station.hoist === "ceiling" || station.hoist === "mobile")).toBe(true);
  });

  it("separates free access from key, code, or staff", () => {
    const free = filterStations(sampleStations, { ...emptyFilters, access: "free" }, now);
    const restricted = filterStations(sampleStations, { ...emptyFilters, access: "restricted" }, now);
    expect(free.every((station) => station.accessMode === "free")).toBe(true);
    expect(restricted.every((station) => station.accessMode !== "free")).toBe(true);
    expect(free.length + restricted.length).toBe(sampleStations.length);
  });

  it("matches a city and a text query together", () => {
    const matches = filterStations(
      sampleStations,
      { ...emptyFilters, city: "London", query: "wrenwillow" },
      now,
    );
    expect(matches.map((station) => station.id)).toEqual(["lon-wrenwillow"]);
  });
});
