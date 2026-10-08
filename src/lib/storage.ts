import { site } from "@/config/site";
import type { Confirmation, ProblemReport, Station } from "@/types";

const listeners = new Set<() => void>();
let warning: string | null = null;

function storageKey(name: string): string {
  return `${site.storageKey}:${name}`;
}

export function subscribeStations(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitStations(): void {
  listeners.forEach((listener) => listener());
}

export function storageWarning(): string | null {
  return warning;
}

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function readArray<T>(name: string, accept: (value: unknown) => value is T): T[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(storageKey(name));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      warning = "Some saved information on this device could not be read.";
      return [];
    }
    return parsed.filter(accept);
  } catch {
    warning = "Some saved information on this device could not be read.";
    return [];
  }
}

function writeArray(name: string, value: unknown[]): void {
  if (!canUseStorage()) {
    throw new Error("This browser cannot store submissions.");
  }
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value));
  } catch {
    throw new Error(
      "This browser could not save that. Photos may be too large. Remove one and try again.",
    );
  }
}

function isStation(value: unknown): value is Station {
  if (!value || typeof value !== "object") return false;
  const station = value as Partial<Station>;
  return typeof station.id === "string" && typeof station.name === "string" && typeof station.lat === "number";
}

function isConfirmation(value: unknown): value is Confirmation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Confirmation>;
  return typeof item.id === "string" && typeof item.stationId === "string" && typeof item.status === "string";
}

function isReport(value: unknown): value is ProblemReport {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ProblemReport>;
  return typeof item.id === "string" && typeof item.stationId === "string" && typeof item.message === "string";
}

export function loadSubmissions(): Station[] {
  return readArray("submissions", isStation).filter((station) => station.localOnly);
}

export function saveSubmission(station: Station): void {
  const next = [station, ...loadSubmissions().filter((item) => item.id !== station.id)];
  writeArray("submissions", next);
  emitStations();
}

export function deleteSubmission(id: string): void {
  writeArray(
    "submissions",
    loadSubmissions().filter((station) => station.id !== id),
  );
  writeArray(
    "confirmations",
    loadConfirmations().filter((item) => item.stationId !== id),
  );
  writeArray(
    "reports",
    loadReports().filter((item) => item.stationId !== id),
  );
  emitStations();
}

export function loadConfirmations(): Confirmation[] {
  return readArray("confirmations", isConfirmation);
}

export function saveConfirmation(entry: Confirmation): void {
  writeArray("confirmations", [entry, ...loadConfirmations()]);
  emitStations();
}

export function loadReports(): ProblemReport[] {
  return readArray("reports", isReport);
}

export function saveReport(entry: ProblemReport): void {
  writeArray("reports", [entry, ...loadReports()]);
  emitStations();
}
