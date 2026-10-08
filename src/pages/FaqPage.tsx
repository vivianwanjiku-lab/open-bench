import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { site, sources } from "@/config/site";

const faqs = [
  {
    q: "What is an adult changing table?",
    a: "It is a full-size bench in a public restroom, strong enough for an adult, usually in a room with space for a wheelchair and a caregiver. A baby changing table is not a substitute.",
  },
  {
    q: "Who is this for?",
    a: "Disabled adults, the people who care for them, families planning a day out, and venue owners who want a room to be findable.",
  },
  {
    q: "Are the places on the map real?",
    a: "No. The pins are sample listings with made-up names and addresses, so you can try the map. Each one is marked sample data. Do not travel to them.",
  },
  {
    q: `Is ${site.name} the same as Changing Places?`,
    a: `No. The United Kingdom has a Changing Places network, and there is a separate Changing Spaces campaign. ${site.name} is not either of those, and it is not affiliated with them.`,
  },
  {
    q: "What does pending review mean?",
    a: "A new listing is meant to be checked before other people rely on it. In this demo, pending means the form was saved in your browser only. It was not sent to a reviewer.",
  },
  {
    q: "How do I add a station?",
    a: "Use Add a station and fill in the bench, hoist, access, hours, and where the room is inside the building. Leave a measurement blank if you could not check it.",
  },
  {
    q: "A listing is wrong. What should I do?",
    a: "Open the listing and use Report a problem, or save a community check. In this demo that note stays on your device.",
  },
  {
    q: "Do you store my location or my photos?",
    a: "Use my location stays in the browser for that visit and is not uploaded by this demo. Photos you add are saved in this browser with the submission. The privacy page has the rest.",
  },
  {
    q: "Is this medical or legal advice?",
    a: `No. The study figures on the home page come from “${sources.study.name}” and the other cited sources. They are not a promise about a building, a law, or a person's care.`,
  },
];

export function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageMeta title="FAQ" description={`Common questions about ${site.name} and adult changing tables.`} path="/faq" />
      <h1 className="text-4xl font-semibold text-teal-dark">FAQ</h1>
      <div className="mt-6 space-y-3">
        {faqs.map((item) => (
          <details key={item.q} className="rounded-2xl border-2 border-line bg-paper px-4 py-3">
            <summary className="cursor-pointer min-h-11 text-lg font-bold text-teal-dark">{item.q}</summary>
            <p className="mt-2 text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6">
        <Link to="/contact" className="font-bold text-teal underline">
          Contact
        </Link>
      </p>
    </div>
  );
}
