import { Badge } from "@/components/ui/badge";

export function SampleBanner({ detail = false }: { detail?: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-coral-dark bg-peach px-4 py-3 text-ink" role="note">
      <p className="font-bold text-coral-dark">
        Sample data, not {detail ? "a real location" : "real locations"}.
      </p>
      <p className="mt-1 text-base leading-relaxed">
        These listings are fictional, so you can try the map. Do not travel to them. Reviewed places
        will replace this sample set.
      </p>
    </div>
  );
}

export function PendingBanner() {
  return (
    <div className="rounded-2xl border-2 border-teal bg-teal-soft px-4 py-3 text-ink" role="note">
      <p className="font-bold text-teal-dark">Saved on this device · pending review</p>
      <p className="mt-1 text-base leading-relaxed">
        This demo did not send your submission anywhere. Other people cannot see it.
      </p>
    </div>
  );
}

export function SampleBadge() {
  return (
    <Badge
      variant="outline"
      className="h-auto border-coral-dark bg-peach px-2 py-1 text-sm font-bold tracking-wide text-coral-dark uppercase"
    >
      Sample data
    </Badge>
  );
}

export function PendingBadge() {
  return (
    <Badge className="h-auto bg-teal px-2 py-1 text-sm font-bold text-white">Pending review</Badge>
  );
}
