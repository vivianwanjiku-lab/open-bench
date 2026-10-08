import { cityGuideFor } from "@/data/cities";
import { optionalNumber } from "@/lib/draft";
import { isValidTimeZone, toMinutes } from "@/lib/hours";
import type { FieldError, StationDraft } from "@/types";
import { WEEKDAYS } from "@/types";

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateDraft(draft: StationDraft): FieldError[] {
  const errors: FieldError[] = [];
  const add = (id: string, message: string) => errors.push({ id, message });

  if (draft.name.trim().length < 3) add("name", "Enter the venue name.");
  if (!draft.venueKind) add("venue-kind", "Choose a venue type.");
  if (draft.addressLine.trim().length < 5) add("address", "Enter a street address.");
  if (draft.city.trim().length < 2) add("city", "Enter the city.");
  if (draft.country.trim().length < 2) add("country", "Enter the country.");
  if (draft.locationInside.trim().length < 8) {
    add("location-inside", "Say which floor it is on, and which entrance it is near.");
  }

  const latText = draft.lat.trim();
  const lngText = draft.lng.trim();
  const lat = optionalNumber(draft.lat);
  const lng = optionalNumber(draft.lng);
  if ((latText && !lngText) || (!latText && lngText)) {
    add("lat", "Enter both latitude and longitude, or leave both blank.");
  } else if (latText || lngText) {
    if (lat === null || lat < -90 || lat > 90) add("lat", "Latitude must be between -90 and 90.");
    if (lng === null || lng < -180 || lng > 180) add("lng", "Longitude must be between -180 and 180.");
  } else if (!cityGuideFor(draft.city)) {
    add(
      "lat",
      "Look up the address or enter latitude and longitude. Blank coordinates only work for Nairobi, London, New York, and Providence, and those pins are marked approximate.",
    );
  }

  if (!draft.timezone || !isValidTimeZone(draft.timezone)) {
    add("timezone", "Choose the timezone for the opening hours.");
  }
  if (!draft.accessMode) add("access-mode", "Say how someone gets into the room.");
  if (draft.accessNotes.trim().length < 8) {
    add("access-notes", "Explain how to get in. If the door is unlocked, say that.");
  }

  if (!draft.twentyFourHours) {
    let openDays = 0;
    for (const day of WEEKDAYS) {
      const value = draft.days[day];
      if (value.closed) continue;
      openDays += 1;
      if (toMinutes(value.open) === null || toMinutes(value.close) === null) {
        add("hours", "Each open day needs an opening time and a closing time.");
        break;
      }
      if (value.open === value.close) {
        add("hours", "Opening and closing times cannot be the same. Use open 24 hours if it never closes.");
        break;
      }
    }
    if (openDays === 0 && !errors.some((error) => error.id === "hours")) {
      add("hours", "Mark at least one day as open, or choose open 24 hours.");
    }
  }

  if (!draft.benchType) add("bench-type", "Say whether the bench is height-adjustable, fixed, or not sure.");
  checkOptional(draft.benchLengthCm, "bench-length", "Bench length", 80, 250, "cm", add);
  checkOptional(draft.benchWidthCm, "bench-width", "Bench width", 40, 120, "cm", add);
  checkOptional(draft.maxWeightKg, "max-weight", "Maximum weight", 40, 500, "kg", add);
  if (!draft.hoist) add("hoist", "Say whether there is a ceiling hoist, a mobile hoist, no hoist, or you are not sure.");
  checkOptional(draft.roomLengthM, "room-length", "Room length", 1, 20, "m", add);
  checkOptional(draft.roomWidthM, "room-width", "Room width", 1, 20, "m", add);
  checkOptional(draft.turningCircleMm, "turning", "Turning space", 500, 5000, "mm", add);
  checkOptional(draft.sinkHeightCm, "sink", "Sink height", 40, 120, "cm", add);
  if (!draft.lockableDoor) add("lockable", "Say whether the door locks, or that you are not sure.");
  if (!draft.stepFreeRoute) add("step-free", "Say whether the route is step-free, or that you are not sure.");
  if (!draft.wheelchairEntrance) add("entrance", "Say whether the entrance is wheelchair accessible, or that you are not sure.");
  if (!draft.roomKind) add("room-kind", "Choose the kind of room.");

  draft.photos.forEach((photo, index) => {
    if (!photo.alt.trim()) add(`photo-${index}`, `Add a description for photo ${index + 1}.`);
  });

  if (!draft.acknowledged) {
    add("acknowledge", "Confirm that you understand this demo saves the form only in this browser.");
  }

  return errors;
}

function checkOptional(
  raw: string,
  id: string,
  label: string,
  min: number,
  max: number,
  unit: string,
  add: (id: string, message: string) => void,
) {
  if (!raw.trim()) return;
  const value = optionalNumber(raw);
  if (value === null || !inRange(value, min, max)) {
    add(id, `${label} should be a number from ${min} to ${max} ${unit}, or left blank if you could not check.`);
  }
}
