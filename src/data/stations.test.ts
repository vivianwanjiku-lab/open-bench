import { describe, expect, it } from "vitest";
import { sampleStations } from "@/data/stations";

describe("sample stations", () => {
  it("ships a clearly fictional set", () => {
    expect(sampleStations.length).toBeGreaterThanOrEqual(12);
    expect(sampleStations.length).toBeLessThanOrEqual(20);
    const ids = new Set(sampleStations.map((station) => station.id));
    expect(ids.size).toBe(sampleStations.length);
    for (const station of sampleStations) {
      expect(station.sample).toBe(true);
      expect(station.name.toLowerCase()).toContain("sample");
      expect(station.addressLine.toLowerCase()).toContain("sample");
      expect(station.notes.toLowerCase()).toContain("does not exist");
      expect(station.lat).toBeGreaterThan(-90);
      expect(station.lng).toBeGreaterThan(-180);
    }
  });
});
