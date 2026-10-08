import { site } from "@/config/site";
import { sampleStations } from "@/data/stations";
import { draftToStation } from "@/lib/draft";
import {
  deleteSubmission,
  loadConfirmations,
  loadReports,
  loadSubmissions,
  saveConfirmation,
  saveReport,
  saveSubmission,
  storageWarning,
} from "@/lib/storage";
import type { Confirmation, ConfirmationStatus, ProblemReport, ReportCategory, Station, StationDraft } from "@/types";

/**
 * Data access for listings, checks, and problem reports.
 *
 * The running app uses this local adapter: seed listings in code, plus anything
 * saved in localStorage. To use Supabase later, implement the same functions in
 * src/data/supabase.example.ts and change the export at the bottom of this file.
 */
export interface StationRepository {
  readStations(): Station[] | null;
  listStations(): Promise<Station[]>;
  readStation(id: string): Station | null;
  warning(): string | null;
  submitStation(draft: StationDraft): Promise<Station>;
  deleteLocalStation(id: string): Promise<void>;
  listConfirmations(stationId: string): Promise<Confirmation[]>;
  addConfirmation(input: { stationId: string; status: ConfirmationStatus; note: string }): Promise<Confirmation>;
  listReports(stationId: string): Promise<ProblemReport[]>;
  addReport(input: { stationId: string; category: ReportCategory; message: string }): Promise<ProblemReport>;
}

export const localRepository: StationRepository = {
  readStations() {
    const local = loadSubmissions();
    const samples = site.showSampleData ? sampleStations : [];
    return [...local, ...samples];
  },
  async listStations() {
    return this.readStations() ?? [];
  },
  readStation(id) {
    return (this.readStations() ?? []).find((station) => station.id === id) ?? null;
  },
  warning() {
    return storageWarning();
  },
  async submitStation(draft) {
    const station = draftToStation(draft);
    saveSubmission(station);
    return station;
  },
  async deleteLocalStation(id) {
    deleteSubmission(id);
  },
  async listConfirmations(stationId) {
    return loadConfirmations().filter((item) => item.stationId === stationId);
  },
  async addConfirmation(input) {
    const entry: Confirmation = {
      id: `check-${crypto.randomUUID()}`,
      stationId: input.stationId,
      status: input.status,
      note: input.note.trim(),
      createdAt: new Date().toISOString(),
    };
    saveConfirmation(entry);
    return entry;
  },
  async listReports(stationId) {
    return loadReports().filter((item) => item.stationId === stationId);
  },
  async addReport(input) {
    const entry: ProblemReport = {
      id: `report-${crypto.randomUUID()}`,
      stationId: input.stationId,
      category: input.category,
      message: input.message.trim(),
      createdAt: new Date().toISOString(),
    };
    saveReport(entry);
    return entry;
  },
};

export const repository: StationRepository = localRepository;
