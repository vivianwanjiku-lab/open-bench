import { Link } from "react-router-dom";
import { ExternalLink } from "@/components/ExternalLink";
import { PageMeta } from "@/components/PageMeta";
import { contactEmailIsPlaceholder, site, sources } from "@/config/site";
import { Button } from "@/components/ui/button";

const groups = [
  {
    title: "Bench",
    items: [
      "A full-size bench, not a baby changing table",
      "Whether it is height-adjustable or fixed",
      "The length, width, and the weight it is rated for",
    ],
  },
  {
    title: "Hoist and sling",
    items: [
      "A ceiling track, a mobile hoist, or a clear note that there is no hoist",
      "Whether a sling is kept in the room, and where",
    ],
  },
  {
    title: "Room and privacy",
    items: [
      "Enough floor space for a wheelchair and a caregiver, with the size written down",
      "Turning space, if you can measure it",
      "A door that locks, or a privacy screen, and which one you have",
      "A gender-neutral or family room when you can offer one",
    ],
  },
  {
    title: "Toilet, sink, and supplies",
    items: [
      "A toilet with grab rails, and a peninsula layout if you have one",
      "Sink height",
      "A waste or disposal bin, a paper roll, and an emergency pull cord",
    ],
  },
  {
    title: "Getting there",
    items: [
      "Accessible parking, and how many bays",
      "A step-free route from the entrance to the door",
      "A wheelchair-accessible entrance",
      "A sentence that says which floor, and which entrance, the room is near",
      "Opening hours, and whether people need a key, a code, or a staff member",
    ],
  },
];

export function VenuesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta
        title="For venues"
        description={`Why install an adult changing room, what to include, and how to get listed on ${site.name}.`}
        path="/venues"
      />
      <h1 className="text-4xl font-semibold text-teal-dark">For venues</h1>
      <p className="mt-4 text-lg text-ink-soft">
        An adult changing room lets someone be changed in private, with space for a wheelchair and a caregiver, and
        equipment that is strong enough for an adult.
      </p>

      <section className="mt-8" aria-labelledby="why-install">
        <h2 id="why-install" className="text-3xl font-semibold text-teal-dark">
          Why install one
        </h2>
        <p className="mt-3">
          Caregivers of disabled adults often cannot find a public adult changing station. In the study “
          {sources.study.name},” from the {sources.study.campaign} campaign, all {sources.study.changedInVehicle}{" "}
          caregivers had changed someone in a vehicle, and {sources.study.changedOnFloor} had changed someone on a
          restroom floor.
        </p>
        <p className="mt-3 text-sm">
          <ExternalLink href={sources.study.href} className="font-bold text-teal">
            {sources.study.campaign} campaign, “{sources.study.name}” (PDF)
          </ExternalLink>
        </p>
        <p className="mt-3">
          People who saw a photo of an adult changing station asked for them to be “more common and mapped for easy
          discovery.” The United Kingdom has a Changing Places network. In the United States, some states require
          adult changing stations in new public buildings. A news report described a Rhode Island rule; this page has
          not reviewed that statute or its date, and it is not legal advice. Check the rule where you are.
        </p>
        <p className="mt-3 text-sm">
          <ExternalLink href={sources.redditPost.href} className="font-bold text-teal">
            {sources.redditPost.community} post, {sources.redditPost.date}
          </ExternalLink>
          {" · "}
          <ExternalLink href={sources.rhodeIslandNews.href} className="font-bold text-teal">
            Rhode Island news report
          </ExternalLink>
        </p>
      </section>

      <section className="mt-10" aria-labelledby="checklist">
        <h2 id="checklist" className="text-3xl font-semibold text-teal-dark">
          What a good room lets people record
        </h2>
        <p className="mt-3">
          This is the same list caregivers use on {site.name}. It is not a building code. Write down what the room
          actually has, including when something is missing.
        </p>
        <div className="mt-4 space-y-4">
          {groups.map((group) => (
            <section key={group.title} className="rounded-2xl border-2 border-line bg-paper p-4" aria-labelledby={group.title}>
              <h3 id={group.title} className="text-2xl font-semibold text-teal-dark">
                {group.title}
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="listed">
        <h2 id="listed" className="text-3xl font-semibold text-teal-dark">
          How to get listed
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Use the add-a-station form and fill in the room as it is, not as you hope it will be.</li>
          <li>Add photos of the empty room, the bench, the hoist, and the door.</li>
          <li>Submissions are reviewed before they are published for everyone.</li>
        </ol>
        <p className="mt-3">
          This website is still a demo. The form saves a listing only in your browser. It is not sent to {site.founder.name}.
          {contactEmailIsPlaceholder()
            ? " The contact email is a placeholder until a real address is added."
            : " You can also write using the contact page."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/add">Add a station</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
