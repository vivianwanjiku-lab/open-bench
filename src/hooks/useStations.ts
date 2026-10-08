import { useEffect, useState } from "react";
import { repository } from "@/data/repository";
import { subscribeStations } from "@/lib/storage";
import type { Station } from "@/types";

export function useStationList(): { stations: Station[]; warning: string | null } {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeStations(() => setTick((value) => value + 1)), []);
  return {
    stations: tick >= 0 ? (repository.readStations() ?? []) : [],
    warning: repository.warning(),
  };
}

export function useStation(id: string | undefined): Station | null {
  const { stations } = useStationList();
  if (!id) return null;
  return stations.find((station) => station.id === id) ?? null;
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduce;
}

export function useNow(intervalMs = 60000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
