import { ExternalLink } from "@/components/ExternalLink";
import { PageMeta } from "@/components/PageMeta";
import { contactEmailIsPlaceholder, site } from "@/config/site";

export function ContactPage() {
  const placeholder = contactEmailIsPlaceholder();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title="Contact" description={`Contact ${site.name}. The email address is still a placeholder.`} path="/contact" />
      <h1 className="text-4xl font-semibold text-teal-dark">Contact</h1>
      {placeholder ? (
        <div className="mt-4 rounded-2xl border-2 border-coral-dark bg-peach px-4 py-3" role="note">
          <p className="font-bold text-coral-dark">TODO: the email address is a placeholder.</p>
          <p className="mt-1">
            Replace <code className="rounded bg-cream px-1">{site.contactEmail}</code> in{" "}
            <code className="rounded bg-cream px-1">src/config/site.ts</code> before you publish. Mail sent to the
            placeholder is not monitored for this project.
          </p>
        </div>
      ) : null}
      <p className="mt-4">
        <a className="text-lg font-bold text-teal underline" href={`mailto:${site.contactEmail}`}>
          {site.contactEmail}
        </a>
      </p>
      <p className="mt-4 text-ink-soft">
        When a real address is in place, write about a room you want listed, a correction, or a venue that has
        installed an adult changing table.
      </p>
      <p className="mt-4">
        You can also find {site.founder.name} on YouTube:{" "}
        <ExternalLink href={site.founder.youtubeUrl} className="font-bold text-teal">
          {site.founder.youtubeHandle}
        </ExternalLink>
        .
      </p>
    </div>
  );
}
