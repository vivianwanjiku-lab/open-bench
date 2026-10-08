import type { StationRepository } from "@/data/repository";

/**
 * Example only. This file is not used by the app.
 *
 * 1. npm install @supabase/supabase-js
 * 2. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Create tables that match Station, Confirmation, and ProblemReport
 *    (keep submissions in a status column such as pending | published)
 * 4. Replace `repository` in src/data/repository.ts with createSupabaseRepository()
 *
 * readStations() should return null so the interface can show a loading state
 * while listStations() talks to the network.
 */
export function createSupabaseRepository(): StationRepository {
  const unavailable = () => {
    throw new Error("Supabase is not connected. See the README and this file.");
  };
  return {
    readStations: () => null,
    listStations: async () => unavailable(),
    readStation: () => null,
    warning: () => null,
    submitStation: async () => unavailable(),
    deleteLocalStation: async () => unavailable(),
    listConfirmations: async () => unavailable(),
    addConfirmation: async () => unavailable(),
    listReports: async () => unavailable(),
    addReport: async () => unavailable(),
  };
}
