import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { cityGuideFor } from "@/data/cities";
import { repository } from "@/data/repository";
import { emptyDraft } from "@/lib/draft";
import { geocodePlace } from "@/lib/geo";
import { DAY_NAME } from "@/lib/hours";
import { TIMEZONES, VENUE_KINDS } from "@/lib/labels";
import { fileToPhoto, maxPhotos } from "@/lib/photos";
import { validateDraft } from "@/lib/validateDraft";
import type { FieldError, Station, StationDraft, Weekday, YesNoUnknown } from "@/types";
import { WEEKDAYS } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddPage() {
  const [draft, setDraft] = useState<StationDraft>(() => emptyDraft());
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Station | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const dirty = draft.name.trim().length > 0 && !saved;

  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  function update<K extends keyof StationDraft>(key: K, value: StationDraft[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "city" && !current.timezone) {
        const guide = cityGuideFor(String(value));
        if (guide) next.timezone = guide.timezone;
      }
      return next;
    });
  }

  function errorFor(id: string): string | undefined {
    return errors.find((error) => error.id === id)?.message;
  }

  async function lookupAddress() {
    setLookupMessage("Looking up that address…");
    try {
      const query = [draft.addressLine, draft.city, draft.region, draft.country].filter(Boolean).join(", ");
      if (query.trim().length < 3) {
        setLookupMessage("Enter an address and city first.");
        return;
      }
      const place = await geocodePlace(query);
      if (!place) {
        setLookupMessage("No match. Try a fuller address, or enter latitude and longitude.");
        return;
      }
      setDraft((current) => ({
        ...current,
        lat: place.lat.toFixed(5),
        lng: place.lng.toFixed(5),
        locationApproximate: false,
      }));
      setLookupMessage(`Pin set near ${place.label}. Change the numbers if the door is somewhere else.`);
    } catch {
      setLookupMessage("The address lookup could not reach OpenStreetMap. Enter latitude and longitude instead.");
    }
  }

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    setPhotoError(null);
    const room = maxPhotos() - draft.photos.length;
    if (room <= 0) {
      setPhotoError(`You can add up to ${maxPhotos()} photos.`);
      return;
    }
    const next = [...draft.photos];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        next.push(await fileToPhoto(file));
      } catch (reason) {
        setPhotoError(reason instanceof Error ? reason.message : "Could not add that photo.");
      }
    }
    update("photos", next);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (nextErrors.length > 0) {
      summaryRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const station = await repository.submitStation(draft);
      setSaved(station);
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (reason) {
      setErrors([{ id: "form", message: reason instanceof Error ? reason.message : "Could not save the form." }]);
      summaryRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <PageMeta title="Submission saved" path="/add" />
        <h1 className="text-4xl font-semibold text-teal-dark">Saved on this device</h1>
        <p className="mt-4 text-lg">
          In this demo nothing was sent to a server. A reviewer would check a submission before it is published for
          everyone. You can open your pending listing, or go back to the map.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={`/stations/${saved.id}`}>View your submission</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/map">Back to the map</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageMeta
        title="Add a station"
        description="Add an adult changing table. Submissions are reviewed. This demo stores them only in your browser."
        path="/add"
      />
      <h1 className="text-4xl font-semibold text-teal-dark">Add a station</h1>
      <div className="mt-4 rounded-2xl border-2 border-teal bg-teal-soft px-4 py-3" role="note">
        <p className="font-bold text-teal-dark">Submissions are reviewed before they are published.</p>
        <p className="mt-1">
          This demo has no server yet, so the form is saved only in this browser and shown to you as pending review.
          Leave a measurement blank if you could not check it. Please don't guess.
        </p>
      </div>
      <p className="mt-4 text-sm">
        Required fields are marked with <span aria-hidden="true">*</span>
        <span className="sr-only">an asterisk</span>.
      </p>

      <form className="mt-6 space-y-8" onSubmit={onSubmit} noValidate>
        {errors.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="rounded-2xl border-2 border-coral-dark bg-peach px-4 py-3"
          >
            <h2 className="text-xl font-semibold text-coral-dark">Please fix the following</h2>
            <ul className="mt-2 list-disc pl-5">
              {errors.map((error) => (
                <li key={error.id}>
                  <a className="font-bold text-coral-dark underline" href={`#${error.id}`}>
                    {error.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div ref={summaryRef} tabIndex={-1} />
        )}

        <Section title="Where it is">
          <TextField id="name" label="Venue name" required value={draft.name} onChange={(value) => update("name", value)} error={errorFor("name")} autoComplete="organization" />
          <SelectField
            id="venue-kind"
            label="Venue type"
            required
            value={draft.venueKind}
            onChange={(value) => update("venueKind", value)}
            error={errorFor("venue-kind")}
            placeholder="Choose a venue type"
            options={VENUE_KINDS.map((kind) => [kind, kind])}
          />
          <TextField id="address" label="Street address" required value={draft.addressLine} onChange={(value) => update("addressLine", value)} error={errorFor("address")} autoComplete="street-address" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="city" label="City" required value={draft.city} onChange={(value) => update("city", value)} error={errorFor("city")} autoComplete="address-level2" />
            <TextField id="region" label="Region, state, or county" value={draft.region} onChange={(value) => update("region", value)} autoComplete="address-level1" />
          </div>
          <TextField id="country" label="Country" required value={draft.country} onChange={(value) => update("country", value)} error={errorFor("country")} autoComplete="country-name" />
          <TextField
            id="location-inside"
            label="Exact location inside the building"
            required
            hint="Include the floor and which entrance it is near."
            value={draft.locationInside}
            onChange={(value) => update("locationInside", value)}
            error={errorFor("location-inside")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="lat" label="Latitude" value={draft.lat} onChange={(value) => update("lat", value)} error={errorFor("lat")} inputMode="decimal" />
            <TextField id="lng" label="Longitude" value={draft.lng} onChange={(value) => update("lng", value)} error={errorFor("lng")} inputMode="decimal" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => void lookupAddress()}>
              Look up this address
            </Button>
          </div>
          {lookupMessage ? <p role="status">{lookupMessage}</p> : null}
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox
              id="approximate"
              checked={draft.locationApproximate}
              onCheckedChange={(checked) => update("locationApproximate", checked === true)}
            />
            <Label htmlFor="approximate" className="text-base font-bold">
              This pin is approximate
            </Label>
          </div>
        </Section>

        <Section title="How to get in">
          <SelectField
            id="access-mode"
            label="Access"
            required
            value={draft.accessMode}
            onChange={(value) => update("accessMode", value as StationDraft["accessMode"])}
            error={errorFor("access-mode")}
            placeholder="How does someone get in?"
            options={[
              ["free", "Open to the public, no key"],
              ["key", "Key needed (RADAR-style or similar)"],
              ["code", "Code needed"],
              ["staff", "Ask staff"],
            ]}
          />
          <AreaField
            id="access-notes"
            label="Access notes"
            required
            hint="Where is the key, who do you ask, or is the door unlocked?"
            value={draft.accessNotes}
            onChange={(value) => update("accessNotes", value)}
            error={errorFor("access-notes")}
          />
          <SelectField
            id="timezone"
            label="Timezone for the hours"
            required
            value={draft.timezone}
            onChange={(value) => update("timezone", value)}
            error={errorFor("timezone")}
            placeholder="Choose a timezone"
            options={TIMEZONES}
          />
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox
              id="all-day"
              checked={draft.twentyFourHours}
              onCheckedChange={(checked) => update("twentyFourHours", checked === true)}
            />
            <Label htmlFor="all-day" className="text-base font-bold">
              Open 24 hours
            </Label>
          </div>
          <fieldset id="hours" disabled={draft.twentyFourHours} className="space-y-3 disabled:opacity-60" aria-describedby={errorFor("hours") ? "hours-error" : "hours-hint"}>
            <legend className="font-bold">Opening hours</legend>
            <p id="hours-hint" className="text-sm text-ink-soft">
              {draft.twentyFourHours
                ? "Hours below are not used while open 24 hours is checked."
                : "Uncheck a day if it is closed. Overnight hours are allowed, such as 20:00 to 02:00."}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const monday = draft.days.mon;
                setDraft((current) => ({
                  ...current,
                  days: Object.fromEntries(WEEKDAYS.map((day) => [day, { ...monday }])) as StationDraft["days"],
                }));
              }}
            >
              Copy Monday to every day
            </Button>
            {WEEKDAYS.map((day) => (
              <DayRow
                key={day}
                day={day}
                value={draft.days[day]}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, days: { ...current.days, [day]: value } }))
                }
              />
            ))}
            {errorFor("hours") ? (
              <p id="hours-error" className="font-bold text-coral-dark">
                {errorFor("hours")}
              </p>
            ) : null}
          </fieldset>
        </Section>

        <Section title="Bench, hoist, and room">
          <SelectField
            id="bench-type"
            label="Bench type"
            required
            value={draft.benchType}
            onChange={(value) => update("benchType", value as StationDraft["benchType"])}
            error={errorFor("bench-type")}
            placeholder="Choose a bench type"
            options={[
              ["height-adjustable", "Height-adjustable"],
              ["fixed", "Fixed height"],
              ["unknown", "Not sure"],
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField id="bench-length" label="Bench length (cm)" value={draft.benchLengthCm} onChange={(value) => update("benchLengthCm", value)} error={errorFor("bench-length")} inputMode="decimal" />
            <TextField id="bench-width" label="Bench width (cm)" value={draft.benchWidthCm} onChange={(value) => update("benchWidthCm", value)} error={errorFor("bench-width")} inputMode="decimal" />
            <TextField id="max-weight" label="Maximum weight (kg)" value={draft.maxWeightKg} onChange={(value) => update("maxWeightKg", value)} error={errorFor("max-weight")} inputMode="decimal" />
          </div>
          <SelectField
            id="hoist"
            label="Hoist"
            required
            value={draft.hoist}
            onChange={(value) => update("hoist", value as StationDraft["hoist"])}
            error={errorFor("hoist")}
            placeholder="Choose a hoist"
            options={[
              ["ceiling", "Ceiling track"],
              ["mobile", "Mobile hoist"],
              ["none", "No hoist"],
              ["unknown", "Not sure"],
            ]}
          />
          <YesNoField id="sling" label="Sling available" value={draft.sling} onChange={(value) => update("sling", value)} />
          <TextField id="sling-notes" label="Sling notes" value={draft.slingNotes} onChange={(value) => update("slingNotes", value)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField id="room-length" label="Room length (m)" value={draft.roomLengthM} onChange={(value) => update("roomLengthM", value)} error={errorFor("room-length")} inputMode="decimal" />
            <TextField id="room-width" label="Room width (m)" value={draft.roomWidthM} onChange={(value) => update("roomWidthM", value)} error={errorFor("room-width")} inputMode="decimal" />
            <TextField id="turning" label="Turning space (mm)" value={draft.turningCircleMm} onChange={(value) => update("turningCircleMm", value)} error={errorFor("turning")} inputMode="decimal" />
          </div>
        </Section>

        <Section title="Toilet, sink, and supplies">
          <YesNoField id="peninsula" label="Peninsula toilet" value={draft.peninsulaToilet} onChange={(value) => update("peninsulaToilet", value)} />
          <YesNoField id="rails" label="Grab rails" value={draft.grabRails} onChange={(value) => update("grabRails", value)} />
          <YesNoField id="privacy" label="Privacy screen" value={draft.privacyScreen} onChange={(value) => update("privacyScreen", value)} />
          <ChoiceField
            id="lockable"
            label="Lockable door"
            required
            value={draft.lockableDoor}
            onChange={(value) => update("lockableDoor", value)}
            error={errorFor("lockable")}
          />
          <TextField id="sink" label="Sink height (cm)" value={draft.sinkHeightCm} onChange={(value) => update("sinkHeightCm", value)} error={errorFor("sink")} inputMode="decimal" />
          <YesNoField id="waste" label="Waste or disposal bin" value={draft.wasteBin} onChange={(value) => update("wasteBin", value)} />
          <YesNoField id="paper" label="Paper roll" value={draft.paperRoll} onChange={(value) => update("paperRoll", value)} />
          <YesNoField id="cord" label="Emergency pull cord" value={draft.emergencyCord} onChange={(value) => update("emergencyCord", value)} />
          <SelectField
            id="room-kind"
            label="Room type"
            required
            value={draft.roomKind}
            onChange={(value) => update("roomKind", value as StationDraft["roomKind"])}
            error={errorFor("room-kind")}
            placeholder="Choose a room type"
            options={[
              ["gender-neutral", "Gender-neutral"],
              ["family", "Family room"],
              ["either", "Gender-neutral family room"],
              ["other", "Separate accessible room"],
              ["unknown", "Not sure"],
            ]}
          />
        </Section>

        <Section title="Parking and route">
          <YesNoField id="parking" label="Accessible parking" value={draft.accessibleParking} onChange={(value) => update("accessibleParking", value)} />
          <TextField id="parking-notes" label="Parking notes" value={draft.parkingNotes} onChange={(value) => update("parkingNotes", value)} />
          <ChoiceField
            id="step-free"
            label="Step-free route"
            required
            value={draft.stepFreeRoute}
            onChange={(value) => update("stepFreeRoute", value)}
            error={errorFor("step-free")}
          />
          <ChoiceField
            id="entrance"
            label="Wheelchair-accessible entrance"
            required
            value={draft.wheelchairEntrance}
            onChange={(value) => update("wheelchairEntrance", value)}
            error={errorFor("entrance")}
          />
        </Section>

        <Section title="Photos">
          <div>
            <Label htmlFor="photos" className="text-base font-bold">
              Photos of the room
            </Label>
            <p id="photos-hint" className="text-sm text-ink-soft">
              Up to {maxPhotos()} images. JPEG or PNG. They stay in this browser.
            </p>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              aria-describedby="photos-hint"
              className="mt-2 bg-paper"
              onChange={(event) => {
                void onPhotos(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          {photoError ? (
            <p role="alert" className="font-bold text-coral-dark">
              {photoError}
            </p>
          ) : null}
          <ul className="space-y-4">
            {draft.photos.map((photo, index) => (
              <li key={`${photo.src.slice(0, 32)}-${index}`} className="rounded-2xl border-2 border-line p-3">
                <img src={photo.src} alt={photo.alt || "Photo preview"} className="max-h-48 rounded-xl" />
                <TextField
                  id={`photo-${index}`}
                  label={`Description for photo ${index + 1}`}
                  required
                  value={photo.alt}
                  error={errorFor(`photo-${index}`)}
                  onChange={(value) => {
                    const photos = draft.photos.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, alt: value } : item,
                    );
                    update("photos", photos);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => update("photos", draft.photos.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove photo
                </Button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Check and submit">
          <TextField
            id="submitted-by"
            label="Your name or initials, optional"
            hint="Shown on this device as the person who submitted the listing."
            value={draft.submittedBy}
            onChange={(value) => update("submittedBy", value)}
            autoComplete="name"
          />
          <AreaField id="notes" label="Anything else a caregiver should know" value={draft.notes} onChange={(value) => update("notes", value)} />
          <div className="flex items-start gap-3">
            <Checkbox
              id="acknowledge"
              checked={draft.acknowledged}
              onCheckedChange={(checked) => update("acknowledged", checked === true)}
              aria-invalid={errorFor("acknowledge") ? true : undefined}
              aria-describedby={errorFor("acknowledge") ? "acknowledge-error" : undefined}
            />
            <Label htmlFor="acknowledge" className="text-base font-bold">
              I understand this demo saves my submission only in this browser.
              <span className="text-coral-dark"> *</span>
            </Label>
          </div>
          {errorFor("acknowledge") ? (
            <p id="acknowledge-error" className="font-bold text-coral-dark">
              {errorFor("acknowledge")}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Submit for review"}
          </Button>
        </Section>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border-2 border-line bg-paper p-4 sm:p-6">
      <h2 className="text-2xl font-semibold text-teal-dark">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} className="text-base font-bold">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <Input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 bg-paper"
      />
      {error ? (
        <p id={errorId} className="mt-1 font-bold text-coral-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AreaField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <Label htmlFor={id} className="text-base font-bold">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <Textarea
        id={id}
        value={value}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-28 bg-paper"
      />
      {error ? (
        <p id={errorId} className="mt-1 font-bold text-coral-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<readonly [string, string]>;
  placeholder: string;
  error?: string;
  required?: boolean;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} className="text-base font-bold">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="mt-1 bg-paper"
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue} className="min-h-11 text-base">
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} className="mt-1 font-bold text-coral-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function YesNoField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: YesNoUnknown;
  onChange: (value: YesNoUnknown) => void;
}) {
  return (
    <fieldset>
      <legend className="font-bold">{label}</legend>
      <RadioGroup value={value} onValueChange={(next) => onChange(next as YesNoUnknown)} className="mt-2 sm:grid-cols-3">
        <RadioChoice name={id} value="yes" label="Yes" />
        <RadioChoice name={id} value="no" label="No" />
        <RadioChoice name={id} value="unknown" label="Not sure" />
      </RadioGroup>
    </fieldset>
  );
}

function ChoiceField({
  id,
  label,
  value,
  onChange,
  error,
  required,
}: {
  id: string;
  label: string;
  value: YesNoUnknown | "";
  onChange: (value: YesNoUnknown) => void;
  error?: string;
  required?: boolean;
}) {
  const errorId = `${id}-error`;
  return (
    <fieldset id={id} aria-describedby={error ? errorId : undefined}>
      <legend className="font-bold">
        {label}
        {required ? <RequiredMark /> : null}
      </legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as YesNoUnknown)}
        className="mt-2 sm:grid-cols-3"
        aria-invalid={error ? true : undefined}
      >
        <RadioChoice name={id} value="yes" label="Yes" />
        <RadioChoice name={id} value="no" label="No" />
        <RadioChoice name={id} value="unknown" label="Not sure" />
      </RadioGroup>
      {error ? (
        <p id={errorId} className="mt-1 font-bold text-coral-dark">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function RadioChoice({ name, value, label }: { name: string; value: string; label: string }) {
  const id = `${name}-${value}`;
  return (
    <div className="flex min-h-11 items-center gap-3">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="text-base font-bold">
        {label}
      </Label>
    </div>
  );
}

function DayRow({
  day,
  value,
  onChange,
}: {
  day: Weekday;
  value: StationDraft["days"][Weekday];
  onChange: (value: StationDraft["days"][Weekday]) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-line p-3">
      <legend className="px-1 font-bold">{DAY_NAME[day]}</legend>
      <div className="mt-2 flex min-h-11 items-center gap-3">
        <Checkbox
          id={`${day}-closed`}
          checked={value.closed}
          onCheckedChange={(checked) => onChange({ ...value, closed: checked === true })}
        />
        <Label htmlFor={`${day}-closed`}>Closed</Label>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${day}-open`}>Opens</Label>
          <Input
            id={`${day}-open`}
            type="time"
            value={value.open}
            disabled={value.closed}
            onChange={(event) => onChange({ ...value, open: event.target.value })}
            className="mt-1 bg-paper"
          />
        </div>
        <div>
          <Label htmlFor={`${day}-close`}>Closes</Label>
          <Input
            id={`${day}-close`}
            type="time"
            value={value.close}
            disabled={value.closed}
            onChange={(event) => onChange({ ...value, close: event.target.value })}
            className="mt-1 bg-paper"
          />
        </div>
      </div>
    </fieldset>
  );
}

function RequiredMark() {
  return (
    <span className="text-coral-dark">
      {" "}
      <span aria-hidden="true">*</span>
      <span className="sr-only">required</span>
    </span>
  );
}
