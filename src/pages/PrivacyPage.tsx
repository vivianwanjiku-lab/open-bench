import { PageMeta } from "@/components/PageMeta";
import { contactEmailIsPlaceholder, site } from "@/config/site";

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta
        title="Privacy"
        description={`How the ${site.name} demo stores information in your browser.`}
        path="/privacy"
      />
      <h1 className="text-4xl font-semibold text-teal-dark">Privacy</h1>
      <p className="mt-4">
        {site.name} is an early demo started by {site.founder.name} in {site.founder.location}. This page describes the
        demo as it works today. If a server is added later, this page has to be rewritten before that launch.
      </p>
      <Section title="What stays on your device">
        <p>
          Submissions, photos, community checks, and problem reports are stored in this browser's local storage under
          the key prefix <code className="rounded bg-cream-deep px-1">{site.storageKey}</code>. They are not sent to{" "}
          {site.name}. Clearing site data in your browser removes them.
        </p>
      </Section>
      <Section title="What this demo does not collect">
        <p>There is no account, no analytics script, and no advertising. Fonts are part of the site and are not loaded from a third party.</p>
      </Section>
      <Section title="Place search">
        <p>
          If you search for a place that is not already in the sample list, the words you type are sent to
          OpenStreetMap's Nominatim service so the map can move there. Your query and IP address are visible to that
          service. Nominatim's usage policy applies.
        </p>
      </Section>
      <Section title="Your location">
        <p>
          “Use my location” asks the browser for your position. This demo uses it to center the map and sort the list.
          It is not uploaded by {site.name}. The browser may remember your permission.
        </p>
      </Section>
      <Section title="Map tiles">
        <p>
          The map loads tiles from OpenStreetMap. That request includes your IP address. The list beside the map shows
          the same places if you would rather not load the map.
        </p>
      </Section>
      <Section title="Links">
        <p>
          YouTube, news pages, the study PDF, and map directions open on other sites. Those sites have their own
          policies. The YouTube channel is linked, not embedded.
        </p>
      </Section>
      <Section title="Contact">
        <p>
          {contactEmailIsPlaceholder()
            ? `The contact address ${site.contactEmail} is a placeholder marked TODO. Mail to it is not a working inbox for this project.`
            : `You can write to ${site.contactEmail}.`}
        </p>
      </Section>
      <Section title="Children">
        <p>
          This site is about adult changing tables and caregivers. It does not ask for a child's name. Do not include
          medical details about anyone in a note or a report.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold text-teal-dark">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
