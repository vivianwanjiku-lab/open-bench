import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { PendingBanner, PendingBadge, SampleBadge, SampleBanner } from "@/components/SampleBanner";
import { StatusText } from "@/components/StationCard";
import { repository } from "@/data/repository";
import { useNow, useStation, useStationList } from "@/hooks/useStations";
import { googleDirectionsUrl, osmUrl } from "@/lib/geo";
import { DAY_NAME, formatLongDate, formatWhen, openingStatus } from "@/lib/hours";
import {
  accessLabel,
  benchLabel,
  benchSize,
  confirmationLabel,
  hoistLabel,
  measurement,
  reportLabel,
  roomKindLabel,
  roomSize,
  routeSummary,
  yesNoLabel,
} from "@/lib/labels";
import { site } from "@/config/site";
import type { Confirmation, ConfirmationStatus, ProblemReport, ReportCategory, Station } from "@/types";
import { WEEKDAYS } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export function StationPage() {
  const { id } = useParams();
  const station = useStation(id);
  const { stations } = useStationList();
  const now = useNow();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<Confirmation[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [photo, setPhoto] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancel = false;
    void repository.listConfirmations(id).then((items) => {
      if (!cancel) setChecks(items);
    });
    void repository.listReports(id).then((items) => {
      if (!cancel) setReports(items);
    });
    return () => {
      cancel = true;
    };
  }, [id, stations]);

  if (!station) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <PageMeta title="Listing not found" path={`/stations/${id ?? ""}`} />
        <h1 className="text-4xl font-semibold text-teal-dark">We can't find that listing</h1>
        <p className="mt-3 text-ink-soft">It may have been removed from this browser, or the link is mistyped.</p>
        <Button asChild className="mt-6">
          <Link to="/map">Back to the map</Link>
        </Button>
      </div>
    );
  }

  const status = openingStatus(station.hours, station.timezone, now);
  const pageUrl = typeof window === "undefined" ? "" : window.location.href;
  const activePhoto = photo === null ? null : station.photos[photo];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setShareMessage("Link copied.");
    } catch {
      setShareMessage("Select the link and copy it.");
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `${station?.name ?? site.name} · ${site.name}`,
        text: station?.sample
          ? `${station.name} is a sample listing on ${site.name}, not a real place.`
          : `${station?.name ?? ""} on ${site.name}`,
        url: pageUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("Sharing was not available. You can copy the link.");
    }
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <PageMeta
        title={station.name}
        description={`${station.name} in ${station.city}. ${station.sample ? "Sample data, not a real location." : "Pending review on this device."}`}
        path={`/stations/${station.id}`}
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link to="/" className="font-bold text-teal underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/map" className="font-bold text-teal underline">
              Map
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{station.city}</li>
        </ol>
      </nav>

      <div className="mt-4 space-y-3">
        {station.sample ? <SampleBanner detail /> : null}
        {station.pendingReview ? <PendingBanner /> : null}
      </div>

      <header className="mt-6">
        <p className="font-bold text-coral-dark">
          {station.city}, {station.region ? `${station.region}, ` : ""}
          {station.country}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {station.sample ? <SampleBadge /> : null}
          {station.pendingReview ? <PendingBadge /> : null}
        </div>
        <h1 className="mt-3 text-4xl font-semibold text-teal-dark sm:text-5xl">{station.name}</h1>
        <p className="mt-2 text-lg">{station.addressLine}</p>
        <p className="text-ink-soft">{station.venueKind}</p>
        <div className="no-print mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href={googleDirectionsUrl(station.lat, station.lng)} target="_blank" rel="noopener noreferrer">
              Get directions
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          <Button type="button" variant="outline" onClick={() => void copyLink()}>
            Copy link
          </Button>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <Button type="button" variant="outline" onClick={() => void nativeShare()}>
              Share
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <a href="#report">Report a problem</a>
          </Button>
        </div>
        <p className="mt-3 text-sm">
          <a className="font-bold text-teal underline" href={osmUrl(station.lat, station.lng)} target="_blank" rel="noopener noreferrer">
            Open the pin in OpenStreetMap
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        {shareMessage ? (
          <p className="mt-2" role="status">
            {shareMessage}
          </p>
        ) : null}
        <div className="mt-3">
          <Label htmlFor="share-url">Page link</Label>
          <Input id="share-url" readOnly value={pageUrl} onFocus={(event) => event.currentTarget.select()} className="mt-1 bg-paper" />
        </div>
      </header>

      <section className="mt-8 rounded-3xl bg-teal px-5 py-5 text-white" aria-labelledby="before">
        <h2 id="before" className="text-3xl font-semibold text-white">
          Before you go
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <SummaryItem term="Right now" value={`${status.label}. ${status.detail}`} />
          <SummaryItem term="Getting in" value={`${accessLabel(station.accessMode)}. ${station.accessNotes}`} />
          <SummaryItem
            term="Bench"
            value={`${benchLabel(station.benchType)}. ${benchSize(station)}. Weight ${measurement(station.maxWeightKg, "kg")}.`}
          />
          <SummaryItem
            term="Hoist"
            value={`${hoistLabel(station.hoist)}. Sling: ${yesNoLabel(station.sling)}.`}
          />
          <SummaryItem
            term="Privacy"
            value={`Lockable door: ${yesNoLabel(station.lockableDoor)}. Privacy screen: ${yesNoLabel(station.privacyScreen)}.`}
          />
          <SummaryItem term="Route" value={routeSummary(station)} />
        </dl>
      </section>

      <section className="mt-4 rounded-3xl bg-teal-soft px-5 py-5" aria-labelledby="inside">
        <h2 id="inside" className="text-3xl font-semibold text-teal-dark">
          Where it is inside
        </h2>
        <p className="mt-3 font-serif text-2xl text-ink">{station.locationInside}</p>
        {station.locationApproximate ? (
          <p className="mt-3">The map pin is approximate, so directions may not stop at the door.</p>
        ) : null}
      </section>

      {station.notes ? (
        <p className="mt-4 rounded-2xl border-2 border-line bg-paper px-4 py-3">{station.notes}</p>
      ) : null}

      {station.photos.length > 0 ? (
        <section className="mt-8" aria-labelledby="photos">
          <h2 id="photos" className="text-3xl font-semibold text-teal-dark">
            Photos
          </h2>
          <p className="mt-2 text-ink-soft">Sample illustrations are drawings, not photographs of a real room.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {station.photos.map((item, index) => (
              <li key={`${item.src}-${index}`}>
                <button
                  type="button"
                  className="w-full rounded-2xl border-2 border-line bg-paper p-2 text-left"
                  onClick={() => setPhoto(index)}
                >
                  <img src={item.src} alt={item.alt} className="aspect-[4/3] w-full rounded-xl object-cover" />
                  <span className="mt-2 block text-sm font-bold text-teal">View larger</span>
                </button>
              </li>
            ))}
          </ul>
          <Dialog open={photo !== null} onOpenChange={(open) => !open && setPhoto(null)}>
            <DialogContent className="max-w-3xl bg-paper">
              <DialogHeader>
                <DialogTitle>Changing room illustration</DialogTitle>
                <DialogDescription>{activePhoto?.alt}</DialogDescription>
              </DialogHeader>
              {activePhoto ? <img src={activePhoto.src} alt={activePhoto.alt} className="w-full rounded-xl" /> : null}
            </DialogContent>
          </Dialog>
        </section>
      ) : null}

      <section className="mt-8" aria-labelledby="hours">
        <h2 id="hours" className="text-3xl font-semibold text-teal-dark">
          Opening hours
        </h2>
        <p className="mt-2">
          <StatusText open={status.open} label={status.label} />
        </p>
        <p className="mt-2 text-ink-soft">{status.detail}</p>
        {station.hours.twentyFourHours ? (
          <p className="mt-3 font-bold">Open 24 hours, every day.</p>
        ) : (
          <table className="mt-4 w-full border-collapse text-left">
            <caption className="sr-only">Weekly opening hours</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2">
                  Day
                </th>
                <th scope="col" className="py-2">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {WEEKDAYS.map((day) => {
                const value = station.hours.days[day];
                return (
                  <tr key={day} className="border-b border-line">
                    <th scope="row" className="py-2 font-bold">
                      {DAY_NAME[day]}
                    </th>
                    <td className="py-2">
                      {value.closed || !value.open || !value.close ? "Closed" : `${value.open} – ${value.close}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-8" aria-labelledby="equipment">
        <h2 id="equipment" className="text-3xl font-semibold text-teal-dark">
          Equipment and room
        </h2>
        <dl className="mt-2">
          <Fact term="Bench" value={benchLabel(station.benchType)} />
          <Fact term="Bench size" value={benchSize(station)} />
          <Fact term="Maximum weight" value={measurement(station.maxWeightKg, "kg")} />
          <Fact term="Hoist" value={hoistLabel(station.hoist)} />
          <Fact term="Sling available" value={yesNoLabel(station.sling)} />
          {station.slingNotes ? <Fact term="Sling notes" value={station.slingNotes} /> : null}
          <Fact term="Room size" value={roomSize(station)} />
          <Fact term="Turning space" value={measurement(station.turningCircleMm, "mm")} />
          <Fact term="Peninsula toilet" value={yesNoLabel(station.peninsulaToilet)} />
          <Fact term="Grab rails" value={yesNoLabel(station.grabRails)} />
          <Fact term="Privacy screen" value={yesNoLabel(station.privacyScreen)} />
          <Fact term="Lockable door" value={yesNoLabel(station.lockableDoor)} />
          <Fact term="Sink height" value={measurement(station.sinkHeightCm, "cm")} />
          <Fact term="Waste bin" value={yesNoLabel(station.wasteBin)} />
          <Fact term="Paper roll" value={yesNoLabel(station.paperRoll)} />
          <Fact term="Emergency pull cord" value={yesNoLabel(station.emergencyCord)} />
          <Fact term="Room type" value={roomKindLabel(station.roomKind)} />
          <Fact term="Accessible parking" value={yesNoLabel(station.accessibleParking)} />
          {station.parkingNotes ? <Fact term="Parking notes" value={station.parkingNotes} /> : null}
          <Fact term="Step-free route" value={yesNoLabel(station.stepFreeRoute)} />
          <Fact term="Wheelchair-accessible entrance" value={yesNoLabel(station.wheelchairEntrance)} />
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="verified">
        <h2 id="verified" className="text-3xl font-semibold text-teal-dark">
          Last checked
        </h2>
        <p className="mt-2">
          {station.lastVerified ? formatLongDate(station.lastVerified) : "No date recorded"} · {station.verifiedBy}
        </p>
      </section>

      <Checks
        station={station}
        checks={checks}
        onSaved={(entry) => setChecks((current) => [entry, ...current])}
      />
      <ReportForm
        stationId={station.id}
        reports={reports}
        onSaved={(entry) => setReports((current) => [entry, ...current])}
      />

      {station.localOnly ? (
        <section className="no-print mt-8 rounded-2xl border-2 border-line p-4">
          <h2 className="text-2xl font-semibold text-teal-dark">On this device</h2>
          {!confirmRemove ? (
            <Button type="button" variant="outline" className="mt-3" onClick={() => setConfirmRemove(true)}>
              Remove from this device
            </Button>
          ) : (
            <div className="mt-3" role="group" aria-label="Confirm removal">
              <p>Remove this submission from this browser?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    void repository.deleteLocalStation(station.id).then(() => navigate("/map"));
                  }}
                >
                  Yes, remove it
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmRemove(false)}>
                  Keep it
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </article>
  );
}

function SummaryItem({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-bold text-cream">{term}</dt>
      <dd className="text-lg">{value}</dd>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-line py-3 sm:grid-cols-[minmax(12rem,16rem)_1fr] sm:gap-4">
      <dt className="font-bold">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Checks({
  station,
  checks,
  onSaved,
}: {
  station: Station;
  checks: Confirmation[];
  onSaved: (entry: Confirmation) => void;
}) {
  const [status, setStatus] = useState<ConfirmationStatus | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <section className="no-print mt-8" aria-labelledby="checks">
      <h2 id="checks" className="text-3xl font-semibold text-teal-dark">
        Community checks on this device
      </h2>
      <p className="mt-2 text-ink-soft">
        {station.sample
          ? "You can practice a check here. It stays in this browser and does not verify a real place."
          : "Checks you save here stay in this browser. They are not sent to a reviewer yet."}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!status) {
            setError("Choose what you found.");
            return;
          }
          setError(null);
          void repository
            .addConfirmation({ stationId: station.id, status, note })
            .then((entry) => {
              onSaved(entry);
              setSaved("Saved on this device.");
              setNote("");
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Could not save that check.");
            });
        }}
      >
        <fieldset>
          <legend className="font-bold">What did you find?</legend>
          <RadioGroup
            value={status}
            onValueChange={(value) => setStatus(value as ConfirmationStatus)}
            className="mt-2"
            aria-invalid={error ? true : undefined}
          >
            <Choice id="check-there" value="still-there" label="Still there" />
            <Choice id="check-broken" value="broken" label="Something is broken" />
            <Choice id="check-gone" value="gone" label="It's gone" />
          </RadioGroup>
        </fieldset>
        <div>
          <Label htmlFor="check-note">Note, optional</Label>
          <Textarea
            id="check-note"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 bg-paper"
          />
        </div>
        {error ? (
          <p role="alert" className="font-bold text-coral-dark">
            {error}
          </p>
        ) : null}
        {saved ? <p role="status">{saved}</p> : null}
        <Button type="submit">Save check on this device</Button>
      </form>
      {checks.length === 0 ? (
        <p className="mt-4 text-ink-soft">No community checks yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {checks.map((check) => (
            <li key={check.id} className="rounded-2xl border-2 border-line bg-paper px-4 py-3">
              <p className="font-bold">{confirmationLabel(check.status)}</p>
              {check.note ? <p className="mt-1">{check.note}</p> : null}
              <p className="mt-1 text-sm text-ink-soft">{formatWhen(check.createdAt)} · this device</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReportForm({
  stationId,
  reports,
  onSaved,
}: {
  stationId: string;
  reports: ProblemReport[];
  onSaved: (entry: ProblemReport) => void;
}) {
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <section id="report" className="no-print mt-10 scroll-mt-24" aria-labelledby="report-heading">
      <h2 id="report-heading" className="text-3xl font-semibold text-teal-dark">
        Report a problem
      </h2>
      <p className="mt-2 text-ink-soft">
        Tell us what is wrong. Please don't include medical details about a person. In this demo the report stays on
        this device and is not sent.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!category) {
            setError("Choose a kind of problem.");
            return;
          }
          if (message.trim().length < 8) {
            setError("Describe the problem in a sentence or two.");
            return;
          }
          setError(null);
          void repository
            .addReport({ stationId, category, message })
            .then((entry) => {
              onSaved(entry);
              setSaved("Report saved on this device. Nothing was sent.");
              setMessage("");
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Could not save that report.");
            });
        }}
      >
        <fieldset>
          <legend className="font-bold">What kind of problem?</legend>
          <RadioGroup value={category} onValueChange={(value) => setCategory(value as ReportCategory)} className="mt-2">
            <Choice id="report-wrong" value="wrong-details" label="Details are wrong" />
            <Choice id="report-access" value="access-changed" label="Access has changed" />
            <Choice id="report-equipment" value="equipment" label="Equipment problem" />
            <Choice id="report-safety" value="safety" label="Safety concern" />
            <Choice id="report-other" value="other" label="Something else" />
          </RadioGroup>
        </fieldset>
        <div>
          <Label htmlFor="report-message">What should a reviewer know?</Label>
          <Textarea
            id="report-message"
            value={message}
            maxLength={1000}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1 bg-paper"
          />
        </div>
        {error ? (
          <p role="alert" className="font-bold text-coral-dark">
            {error}
          </p>
        ) : null}
        {saved ? <p role="status">{saved}</p> : null}
        <Button type="submit">Save report on this device</Button>
      </form>
      {reports.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border-2 border-line px-4 py-3">
              <p className="font-bold">{reportLabel(report.category)}</p>
              <p className="mt-1">{report.message}</p>
              <p className="mt-1 text-sm text-ink-soft">{formatWhen(report.createdAt)} · this device</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Choice({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="text-base font-bold">
        {label}
      </Label>
    </div>
  );
}
