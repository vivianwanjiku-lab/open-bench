/**
 * Site identity. To rename the project, change `name` (and `storageKey` if you
 * also want a fresh browser store). Keep `name`, `description`, and `themeColor`
 * as single-line double-quoted strings so the HTML shell can read them at build time.
 */
export const site = {
  name: "Open Bench",
  tagline: "Find an adult changing table near you",
  description:
    "A crowd-sourced map of full-size adult changing tables in public restrooms, for disabled adults and the people who care for them. Sample listings are fictional.",
  storageKey: "open-bench",
  themeColor: "#0E5C58",
  /** While true, fictional listings stay visible and the site asks search engines not to index it. */
  showSampleData: true,
  founder: {
    name: "Vivian Wanjiku",
    location: "Nairobi",
    youtubeHandle: "@VivianeWanjiku_lab",
    youtubeUrl: "https://www.youtube.com/@VivianeWanjiku_lab",
  },
  contactEmail: "TODO@example.com",
} as const;

export function contactEmailIsPlaceholder(): boolean {
  return (
    site.contactEmail.includes("TODO") || site.contactEmail.endsWith("@example.com")
  );
}

export const sources = {
  redditPost: {
    title: "Adult Changing Station in Bathroom",
    community: "r/mildlyinteresting",
    href: "https://www.reddit.com/r/mildlyinteresting/comments/1rsq5y9/adult_changing_station_in_bathroom/",
    points: 11435,
    comments: 464,
    date: "13 March 2026",
  },
  study: {
    name: "This is not built for me",
    campaign: "Changing Spaces",
    href: "https://www.changingspacescampaign.com/_files/ugd/215a0e_c482292c5ef9475e9c5039cf9b9001ad.pdf",
    caregivers: 16,
    changedInVehicle: 16,
    changedOnFloor: 11,
  },
  rhodeIslandNews: {
    href: "https://abc45.com/news/nation-world/rhode-island-mandates-adult-changing-stations-in-bathrooms-of-all-new-public-buildings-facilities-restrooms-disabilities-handicapped-accessible-medical-needs-inclusive-diapers-diapering-caregivers",
  },
} as const;
