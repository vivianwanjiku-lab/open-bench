import { Link } from "react-router-dom";
import { PendingBadge, SampleBadge } from "@/components/SampleBanner";
import { formatDistance } from "@/lib/geo";
import { openingStatus } from "@/lib/hours";
import { accessLabel, benchLabel, hoistLabel } from "@/lib/labels";
import type { Station } from "@/types";
import { Button } from "@/components/ui/button";

export function StationCard({
  station,
  selected,
  distanceKm,
  now,
  onHighlight,
  onShow,
}: {
  station: Station;
  selected: boolean;
  distanceKm: number | null;
  now: Date;
  onHighlight: (id: string) => void;
  onShow: (id: string) => void;
}) {
  const status = openingStatus(station.hours, station.timezone, now);
  return (
    <article
      id={`station-${station.id}`}
      aria-current={selected ? "true" : undefined}
      onMouseEnter={() => onHighlight(station.id)}
      onFocusCapture={() => onHighlight(station.id)}
      className={`rounded-2xl border-2 bg-paper p-4 ${selected ? "border-teal" : "border-line"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {station.sample ? <SampleBadge /> : null}
        {station.pendingReview ? <PendingBadge /> : null}
        <StatusText open={status.open} label={status.label} />
      </div>
      <h3 className="mt-2 text-2xl font-semibold">
        <Link to={`/stations/${station.id}`} className="text-teal-dark underline decoration-2 underline-offset-2">
          {station.name}
        </Link>
      </h3>
      <p className="mt-1 text-ink-soft">
        {station.venueKind} · {station.city}
      </p>
      <p className="mt-1">{station.addressLine}</p>
      <p className="mt-2">{station.locationInside}</p>
      <ul className="mt-3 space-y-1 text-base">
        <li>{benchLabel(station.benchType)}</li>
        <li>{hoistLabel(station.hoist)}</li>
        <li>{accessLabel(station.accessMode)}</li>
        {distanceKm !== null ? <li>{formatDistance(distanceKm)}</li> : null}
      </ul>
      <Button type="button" variant="outline" className="mt-4" onClick={() => onShow(station.id)}>
        Show on map
      </Button>
    </article>
  );
}

export function StatusText({ open, label }: { open: boolean; label: string }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2 py-1 text-sm font-bold ${
        open ? "bg-moss-soft text-moss" : "bg-peach text-coral-dark"
      }`}
    >
      {label}
    </span>
  );
}
