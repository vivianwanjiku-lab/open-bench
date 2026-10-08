import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L, { type Map as LeafletMap, type Marker as LeafletMarker } from "leaflet";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/useStations";
import { validCoordinate } from "@/lib/geo";
import type { Station } from "@/types";

export interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
}

export function MapView({
  stations,
  selectedId,
  selectNonce,
  focus,
  focusKey,
  userLocation,
  layoutKey,
  onSelect,
}: {
  stations: Station[];
  selectedId: string | null;
  selectNonce: number;
  focus: MapFocus | null;
  focusKey: string;
  userLocation: { lat: number; lng: number } | null;
  layoutKey: string;
  onSelect: (id: string) => void;
}) {
  const plotted = stations.filter((station) => validCoordinate(station.lat, station.lng));
  const selected = plotted.find((station) => station.id === selectedId) ?? null;
  const located =
    userLocation && validCoordinate(userLocation.lat, userLocation.lng) ? userLocation : null;
  return (
    <MapErrorBoundary>
    <div className="overflow-hidden rounded-3xl border-2 border-line bg-teal-soft">
      <div className="h-[min(70dvh,680px)] min-h-80">
        <MapContainer
          center={[-1.286, 36.82]}
          zoom={2}
          minZoom={2}
          scrollWheelZoom={false}
          className="h-full w-full"
          aria-label="Map of adult changing tables"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <WheelOnFocus />
          <MapController focus={focus} focusKey={focusKey} stations={plotted} />
          <SelectionFly nonce={selectNonce} station={selected} />
          <Invalidate layoutKey={layoutKey} />
          {plotted.map((station) => (
            <StationMarker
              key={station.id}
              station={station}
              selected={station.id === selectedId}
              nonce={selectNonce}
              onSelect={onSelect}
            />
          ))}
          {located ? (
            <CircleMarker
              center={[located.lat, located.lng]}
              radius={8}
              pathOptions={{ color: "#0e5c58", weight: 2, fillColor: "#c24d36", fillOpacity: 1 }}
            >
              <Tooltip>Your location</Tooltip>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 px-3 py-3 text-sm">
        <li className="flex items-center gap-2">
          <LegendDot className="bg-teal" /> Sample listing
        </li>
        <li className="flex items-center gap-2">
          <LegendDot className="bg-coral-deep" /> Selected
        </li>
        <li className="flex items-center gap-2">
          <LegendDot className="bg-coral-dark" /> Pending on this device
        </li>
        {located ? (
          <li className="flex items-center gap-2">
            <LegendDot className="bg-coral" /> Your location
          </li>
        ) : null}
      </ul>
    </div>
    </MapErrorBoundary>
  );
}

class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="rounded-3xl border-2 border-coral-dark bg-peach p-4">
          <p className="font-bold text-coral-dark">The map could not be shown.</p>
          <p className="mt-2">The list has the same places. You can keep browsing from the list.</p>
          <button
            type="button"
            className="mt-3 font-bold text-teal underline"
            onClick={() => this.setState({ failed: false })}
          >
            Try the map again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function mapHasSize(map: LeafletMap): boolean {
  const size = map.getSize();
  return size.x > 1 && size.y > 1;
}

function moveMap(map: LeafletMap, lat: number, lng: number, zoom: number, animate: boolean) {
  if (!validCoordinate(lat, lng) || !Number.isFinite(zoom)) return;
  const view: L.LatLngExpression = [lat, lng];
  try {
    if (animate && mapHasSize(map)) {
      map.flyTo(view, zoom, { animate: true, duration: 0.7 });
      return;
    }
    map.setView(view, zoom, { animate: false });
  } catch {
    // A hidden or zero-size map can throw inside Leaflet's animation math.
  }
}

function LegendDot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`inline-block size-3 rounded-full border border-white ${className}`} />;
}

function WheelOnFocus() {
  const map = useMap();
  useEffect(() => {
    const element = map.getContainer();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    element.addEventListener("click", enable);
    element.addEventListener("mouseleave", disable);
    element.addEventListener("blur", disable);
    return () => {
      element.removeEventListener("click", enable);
      element.removeEventListener("mouseleave", disable);
      element.removeEventListener("blur", disable);
    };
  }, [map]);
  return null;
}

function MapController({
  focus,
  focusKey,
  stations,
}: {
  focus: MapFocus | null;
  focusKey: string;
  stations: Station[];
}) {
  const map = useMap();
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    function run() {
      if (cancelled) return;
      if (!mapHasSize(map) && attempts < 8) {
        attempts += 1;
        map.invalidateSize({ animate: false });
        timer = window.setTimeout(run, 50);
        return;
      }
      const animate = !reduce && mapHasSize(map);
      if (focus && validCoordinate(focus.lat, focus.lng)) {
        moveMap(map, focus.lat, focus.lng, focus.zoom, animate);
        return;
      }
      const points = stations.filter((station) => validCoordinate(station.lat, station.lng));
      if (points.length === 1) {
        const only = points[0];
        if (!only) return;
        moveMap(map, only.lat, only.lng, 14, animate);
        return;
      }
      if (points.length > 1) {
        try {
          const bounds = L.latLngBounds(points.map((station) => [station.lat, station.lng] as [number, number]));
          if (!bounds.isValid()) return;
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate });
        } catch {
          const first = points[0];
          if (first) moveMap(map, first.lat, first.lng, 4, false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [focus, focusKey, stations, map, reduce]);
  return null;
}

function SelectionFly({ nonce, station }: { nonce: number; station: Station | null }) {
  const map = useMap();
  const reduce = usePrefersReducedMotion();
  useEffect(() => {
    if (!station || nonce === 0 || !validCoordinate(station.lat, station.lng)) return;
    const zoom = map.getZoom();
    moveMap(map, station.lat, station.lng, Math.max(Number.isFinite(zoom) ? zoom : 2, 15), !reduce);
  }, [nonce, station, map, reduce]);
  return null;
}

function Invalidate({ layoutKey }: { layoutKey: string }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 60);
    return () => window.clearTimeout(id);
  }, [layoutKey, map]);
  return null;
}

function StationMarker({
  station,
  selected,
  nonce,
  onSelect,
}: {
  station: Station;
  selected: boolean;
  nonce: number;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<LeafletMarker | null>(null);
  useEffect(() => {
    if (selected && nonce > 0) ref.current?.openPopup();
  }, [selected, nonce]);
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "bench-pin",
        html: `<span class="bench-pin-dot${selected ? " is-selected" : ""}${station.pendingReview ? " is-pending" : ""}"></span>`,
        iconSize: selected ? [36, 36] : [28, 28],
        iconAnchor: selected ? [18, 18] : [14, 14],
        popupAnchor: [0, -16],
      }),
    [selected, station.pendingReview],
  );
  return (
    <Marker
      ref={ref}
      position={[station.lat, station.lng]}
      icon={icon}
      alt={`${station.name}${station.sample ? ", sample listing, not a real location" : ""}`}
      title={station.name}
      keyboard
      zIndexOffset={selected ? 500 : 0}
      eventHandlers={{ click: () => onSelect(station.id) }}
    >
      <Popup>
        <p className="font-bold">{station.name}</p>
        {station.sample ? <p>Sample data, not a real location.</p> : null}
        {station.pendingReview ? <p>Pending review, saved on this device.</p> : null}
        <p>
          {station.city}, {station.country}
        </p>
        <Link to={`/stations/${station.id}`} className="font-bold text-teal underline">
          View details
        </Link>
      </Popup>
    </Marker>
  );
}
