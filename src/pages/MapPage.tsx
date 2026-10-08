import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Filters } from "@/components/Filters";
import { MapView, type MapFocus } from "@/components/MapView";
import { PageMeta } from "@/components/PageMeta";
import { SampleBanner } from "@/components/SampleBanner";
import { StationCard } from "@/components/StationCard";
import { site } from "@/config/site";
import { cityGuideFor } from "@/data/cities";
import { useNarrowScreen } from "@/hooks/useNarrowScreen";
import { useNow, usePrefersReducedMotion, useStationList } from "@/hooks/useStations";
import { exactCityName, geocodePlace, type GeocodedPlace } from "@/lib/geo";
import { distanceKm } from "@/lib/geo";
import {
  activeFilterCount,
  emptyFilters,
  filterStations,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortStations,
} from "@/lib/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(params), [params]);
  const navigate = useNavigate();
  const location = useLocation();
  const { stations, warning } = useStationList();
  const now = useNow();
  const reduce = usePrefersReducedMotion();
  const [view, setView] = useState<"map" | "list">("map");
  const narrow = useNarrowScreen();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectNonce, setSelectNonce] = useState(0);
  const [queryDraft, setQueryDraft] = useState(filters.query);
  const [syncedQuery, setSyncedQuery] = useState(filters.query);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locateMessage, setLocateMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [geo, setGeo] = useState<GeocodedPlace | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const located = useRef(false);
  if (filters.query !== syncedQuery) {
    setSyncedQuery(filters.query);
    setQueryDraft(filters.query);
  }

  function writeFilters(next: typeof filters) {
    const search = filtersToSearchParams(next).toString();
    setParams(new URLSearchParams(search), { replace: true });
  }

  function selectStation(id: string) {
    setSelectedId(id);
    setSelectNonce((value) => value + 1);
    setView("map");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`station-${id}`)?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocateMessage("This browser cannot share your location. Search by city instead.");
      return;
    }
    setLocating(true);
    setLocateMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocateMessage("The map is centered near you. Distances are on each card.");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocateMessage(
          "We couldn't use your location. You can search by city instead. If you blocked location access, you can allow it in the browser and try again.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    const state = location.state as { locate?: boolean } | null;
    if (!state?.locate || located.current) return;
    located.current = true;
    requestLocation();
    navigate("/map", { replace: true, state: null });
  }, [location.state, navigate]);

  const filtered = useMemo(() => filterStations(stations, filters, now), [stations, filters, now]);
  const ordered = useMemo(
    () => sortStations(filtered, userLocation),
    [filtered, userLocation],
  );

  const selectedVisible = filtered.some((station) => station.id === selectedId) ? selectedId : null;
  const canGeocode = filters.query.trim().length >= 3 && filtered.length === 0 && !filters.city;

  useEffect(() => {
    if (!canGeocode) return;
    const query = filters.query.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setGeoLoading(true);
      setGeoMessage("Looking up that place…");
      geocodePlace(query, controller.signal)
        .then((place) => {
          setGeoLoading(false);
          if (!place) {
            setGeo(null);
            setGeoMessage("No map match for that place. You can still browse the sample cities.");
            return;
          }
          setGeo(place);
          setGeoMessage(`No listings match. The map is centered on ${place.label}.`);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setGeoLoading(false);
          setGeo(null);
          setGeoMessage("The place search could not reach OpenStreetMap. Pick a city below, or try again.");
        });
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [canGeocode, filters.query]);

  const cityFocus = filters.city ? cityGuideFor(filters.city) : undefined;
  const activeGeo = canGeocode ? geo : null;
  const focus: MapFocus | null = activeGeo
    ? { lat: activeGeo.lat, lng: activeGeo.lng, zoom: 12 }
    : cityFocus
      ? { lat: cityFocus.lat, lng: cityFocus.lng, zoom: 12 }
      : userLocation
        ? { ...userLocation, zoom: 13 }
        : null;
  const focusKey = `${focus?.lat ?? ""}:${focus?.lng ?? ""}:${filters.city}:${filters.query}:${ordered.map((station) => station.id).join(",")}`;
  const showSample = site.showSampleData && ordered.some((station) => station.sample);

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const city = exactCityName(queryDraft);
    if (city) {
      writeFilters({ ...filters, city, query: "" });
      return;
    }
    writeFilters({ ...filters, query: queryDraft.trim(), city: "" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageMeta
        title="Find an adult changing table"
        description={`Search sample adult changing tables on ${site.name}. Listings are fictional.`}
        path="/map"
      />
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold text-teal-dark">Find an adult changing table near you</h1>
        <p className="mt-2 text-ink-soft">
          The list has the same places as the map. If the map is hard to use, stay with the list.
        </p>
      </div>
      {showSample ? (
        <div className="mt-4">
          <SampleBanner />
        </div>
      ) : null}
      {warning ? (
        <p className="mt-4 rounded-2xl border-2 border-coral-dark bg-peach px-4 py-3" role="alert">
          {warning}
        </p>
      ) : null}

      <form role="search" onSubmit={onSearch} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div>
          <Label htmlFor="map-query" className="text-base font-bold">
            Search by place
          </Label>
          <Input
            id="map-query"
            type="search"
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder="City, neighborhood, or venue"
            autoComplete="off"
            className="mt-1 bg-paper"
          />
        </div>
        <Button type="submit">Search</Button>
        <Button type="button" variant="outline" onClick={requestLocation} aria-busy={locating}>
          Use my location
        </Button>
      </form>
      <div className="mt-3 space-y-2" aria-live="polite">
        {locateMessage ? <p>{locateMessage}</p> : null}
        {canGeocode && geoMessage ? <p>{geoMessage}</p> : null}
        {geoLoading ? <p>Looking up that place…</p> : null}
      </div>

      <div className="mt-5">
        <Filters filters={filters} onChange={writeFilters} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" aria-atomic="true">
          <span className="font-bold">{ordered.length}</span>{" "}
          {ordered.length === 1 ? "listing" : "listings"}
          {filters.city ? ` in ${filters.city}` : ""}
          {site.showSampleData ? " · sample data, not real locations" : ""}
          {activeFilterCount(filters) > 0 ? ` · ${activeFilterCount(filters)} filters` : ""}
        </p>
        <div className="flex gap-2 md:hidden" role="group" aria-label="Choose map or list">
          <Button type="button" variant={view === "map" ? "default" : "outline"} aria-pressed={view === "map"} onClick={() => setView("map")}>
            Map
          </Button>
          <Button type="button" variant={view === "list" ? "default" : "outline"} aria-pressed={view === "list"} onClick={() => setView("list")}>
            List
          </Button>
        </div>
      </div>

      <div className="mt-4 md:grid md:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] md:items-start md:gap-5">
        <section
          aria-label="List of adult changing tables"
          className={view === "map" ? "max-md:hidden" : ""}
        >
          <h2 className="sr-only">List</h2>
          {ordered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-line-strong bg-paper p-4">
              <p className="font-bold">No listings match.</p>
              <p className="mt-2 text-ink-soft">
                Clear a filter, try another city, or add a station you know. Sample data covers Nairobi, London, New
                York, and Providence.
              </p>
              <Button type="button" className="mt-4" variant="outline" onClick={() => writeFilters(emptyFilters)}>
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="space-y-3 md:max-h-[calc(100dvh-8rem)] md:overflow-auto md:pr-1">
              {ordered.map((station) => (
                <li key={station.id}>
                  <StationCard
                    station={station}
                    selected={station.id === selectedVisible}
                    distanceKm={userLocation ? distanceKm(userLocation, station) : null}
                    now={now}
                    onHighlight={setSelectedId}
                    onShow={selectStation}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section
          aria-label="Map of adult changing tables"
          aria-describedby="map-help"
          className={`md:sticky md:top-24 ${view === "list" ? "max-md:hidden" : ""}`}
        >
          <h2 className="sr-only">Map</h2>
          <p id="map-help" className="sr-only">
            Pins are sample listings unless marked pending on this device. Click the map to zoom with the scroll
            wheel. The list is the same set of places.
          </p>
          {narrow && view === "list" ? null : (
            <MapView
              stations={ordered}
              selectedId={selectedVisible}
              selectNonce={selectNonce}
              focus={ordered.length > 0 && !userLocation && !activeGeo && !filters.city ? null : focus}
              focusKey={focusKey}
              userLocation={userLocation}
              layoutKey={`${view}-${reduce ? "still" : "move"}`}
              onSelect={selectStation}
            />
          )}
        </section>
      </div>
    </div>
  );
}
