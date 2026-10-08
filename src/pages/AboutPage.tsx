import { ExternalLink } from "@/components/ExternalLink";
import { PageMeta } from "@/components/PageMeta";
import { site } from "@/config/site";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta
        title="About"
        description={`${site.name} is a crowd-sourced map of adult changing tables, started by ${site.founder.name} in ${site.founder.location}.`}
        path="/about"
      />
      <h1 className="text-4xl font-semibold text-teal-dark">About {site.name}</h1>
      <section className="mt-6" aria-labelledby="mission">
        <h2 id="mission" className="text-3xl font-semibold text-teal-dark">
          Mission
        </h2>
        <p className="mt-3">
          {site.name} is a map of full-size adult changing tables in public restrooms. It is for disabled adults,
          caregivers, families, and the venues that can install a room. The aim is simple: know the bench, the hoist,
          the door, and the way in before you make the trip.
        </p>
        <p className="mt-3">
          The listings you can see today are sample data. They are fictional, labeled as sample, and not a directory
          of real rooms. A real directory starts when places are added and reviewed.
        </p>
      </section>
      <section className="mt-8" aria-labelledby="founder">
        <h2 id="founder" className="text-3xl font-semibold text-teal-dark">
          Founder
        </h2>
        <p className="mt-3">
          {site.name} was started by {site.founder.name}, who is based in {site.founder.location}. She shares her work
          on YouTube at {site.founder.youtubeHandle}.
        </p>
        <p className="mt-3">
          <ExternalLink href={site.founder.youtubeUrl} className="text-lg font-bold text-teal">
            Watch {site.founder.youtubeHandle} on YouTube
          </ExternalLink>
        </p>
      </section>
      <section className="mt-8" aria-labelledby="not">
        <h2 id="not" className="text-3xl font-semibold text-teal-dark">
          What this site is not
        </h2>
        <p className="mt-3">
          {site.name} is not the United Kingdom’s Changing Places network, and it is not the Changing Spaces campaign.
          Those names belong to their own projects. We mention them because caregivers already know them.
        </p>
        <p className="mt-3">This site is not medical advice and not legal advice.</p>
      </section>
    </div>
  );
}
