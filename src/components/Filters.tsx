import { useState } from "react";
import { cityGuides } from "@/data/cities";
import { useNarrowScreen } from "@/hooks/useNarrowScreen";
import { activeFilterCount, emptyFilters } from "@/lib/filters";
import type { StationFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const toggles: Array<{ key: keyof StationFilters; label: string }> = [
  { key: "heightAdjustable", label: "Height-adjustable bench" },
  { key: "hoist", label: "Ceiling or mobile hoist" },
  { key: "privacy", label: "Lockable door or privacy screen" },
  { key: "wheelchairEntrance", label: "Wheelchair-accessible entrance" },
  { key: "stepFree", label: "Step-free route" },
  { key: "openNow", label: "Open now" },
  { key: "open24", label: "Open 24 hours" },
  { key: "neutralOrFamily", label: "Gender-neutral or family room" },
];

export function Filters({
  filters,
  onChange,
}: {
  filters: StationFilters;
  onChange: (next: StationFilters) => void;
}) {
  const count = activeFilterCount(filters);
  const narrow = useNarrowScreen();
  const [moreOpen, setMoreOpen] = useState(false);
  const extraCount = count - (filters.city ? 1 : 0) - (filters.query.trim() ? 1 : 0);
  const showMore = !narrow || moreOpen;
  return (
    <div className="space-y-4">
      <div role="group" aria-label="Cities">
        <p className="mb-2 font-bold" id="city-filters">
          City
        </p>
        <div className="flex flex-wrap gap-2" aria-labelledby="city-filters">
          <FilterChip pressed={filters.city === ""} onClick={() => onChange({ ...filters, city: "" })}>
            All cities
          </FilterChip>
          {cityGuides.map((city) => (
            <FilterChip
              key={city.city}
              pressed={filters.city === city.city}
              onClick={() => onChange({ ...filters, city: city.city, query: "" })}
            >
              {city.city}
            </FilterChip>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="md:hidden"
        aria-expanded={showMore}
        aria-controls="more-filters"
        onClick={() => setMoreOpen((open) => !open)}
      >
        {showMore ? "Hide extra filters" : "More filters"}
        {extraCount > 0 ? ` (${extraCount})` : ""}
      </Button>
      <div id="more-filters" hidden={!showMore} className="space-y-4">
      <div role="group" aria-label="Equipment and access filters">
        <div className="flex flex-wrap gap-2">
          {toggles.map((toggle) => {
            const pressed = Boolean(filters[toggle.key]);
            return (
              <FilterChip
                key={toggle.key}
                pressed={pressed}
                onClick={() => onChange({ ...filters, [toggle.key]: !pressed })}
              >
                {toggle.label}
              </FilterChip>
            );
          })}
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 font-bold">Access</legend>
        <RadioGroup
          value={filters.access}
          onValueChange={(value) =>
            onChange({ ...filters, access: value as StationFilters["access"] })
          }
          className="gap-2"
        >
          <AccessOption value="any" label="Any access" />
          <AccessOption value="free" label="Free to use" />
          <AccessOption value="restricted" label="Key, code, or staff" />
        </RadioGroup>
      </fieldset>
      {count > 0 ? (
        <Button type="button" variant="outline" onClick={() => onChange({ ...emptyFilters })}>
          Clear filters
          <span className="sr-only">, {count} active</span>
        </Button>
      ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 rounded-full border-2 px-3 py-2 text-left text-base font-bold ${
        pressed ? "border-teal bg-teal text-white" : "border-line-strong bg-paper text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function AccessOption({ value, label }: { value: string; label: string }) {
  const id = `access-${value}`;
  return (
    <div className="flex min-h-11 items-center gap-3">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="text-base font-bold">
        {label}
      </Label>
    </div>
  );
}
