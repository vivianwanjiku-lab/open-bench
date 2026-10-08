import { describe, expect, it } from "vitest";
import { alwaysOpen, isOpenAt, openingStatus, weekly } from "@/lib/hours";

const wednesdayNoonUtc = new Date("2026-10-07T12:00:00Z");

describe("isOpenAt", () => {
  it("treats a 24-hour room as open", () => {
    expect(isOpenAt(alwaysOpen(), "Africa/Nairobi", wednesdayNoonUtc)).toBe(true);
  });

  it("uses the building timezone", () => {
    const hours = weekly(["09:00", "17:00"]);
    expect(isOpenAt(hours, "Africa/Nairobi", wednesdayNoonUtc)).toBe(true);
    expect(isOpenAt(hours, "America/New_York", wednesdayNoonUtc)).toBe(false);
  });

  it("respects a closed Sunday", () => {
    const hours = weekly(["09:00", "17:00"], ["09:00", "17:00"], "closed");
    const sunday = new Date("2026-10-04T12:00:00Z");
    expect(isOpenAt(hours, "Africa/Nairobi", sunday)).toBe(false);
  });

  it("covers overnight ranges across midnight", () => {
    const hours = weekly(["22:00", "06:00"]);
    expect(isOpenAt(hours, "Africa/Nairobi", new Date("2026-10-07T20:00:00Z"))).toBe(true);
    expect(isOpenAt(hours, "Africa/Nairobi", new Date("2026-10-08T02:00:00Z"))).toBe(true);
    expect(isOpenAt(hours, "Africa/Nairobi", wednesdayNoonUtc)).toBe(false);
  });
});

describe("openingStatus", () => {
  it("names the closing time while open", () => {
    const status = openingStatus(weekly(["09:00", "17:00"]), "Africa/Nairobi", wednesdayNoonUtc);
    expect(status.open).toBe(true);
    expect(status.label).toBe("Open now");
    expect(status.detail).toContain("5:00 PM");
  });

  it("names the next opening while closed", () => {
    const status = openingStatus(weekly(["09:00", "17:00"]), "America/New_York", wednesdayNoonUtc);
    expect(status.open).toBe(false);
    expect(status.label).toBe("Closed now");
    expect(status.detail).toContain("today");
    expect(status.detail).toContain("9:00 AM");
  });
});
