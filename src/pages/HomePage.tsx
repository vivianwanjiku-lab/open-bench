import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { ExternalLink } from "@/components/ExternalLink";
import { site, sources } from "@/config/site";
import { cityGuides } from "@/data/cities";
import { sampleStations } from "@/data/stations";
import { exactCityName } from "@/lib/geo";
import { publicPath } from "@/lib/publicPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const city = exactCityName(query);
    if (city) {
      navigate(`/map?city=${encodeURIComponent(city)}`);
      return;
    }
    const trimmed = query.trim();
    navigate(trimmed ? `/map?q=${encodeURIComponent(trimmed)}` : "/map");
  }

  return (
    <>
      <PageMeta path="/" />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-12 md:py-16">
        <div className="rise md:col-span-7">
          <p className="text-sm font-bold tracking-[0.14em] text-coral-dark uppercase">Adult changing tables</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold text-teal-dark sm:text-5xl">
            Find a full-size changing bench before you make the trip.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Caregivers of disabled adults often cannot find a public restroom with an adult changing table.{" "}
            {site.name} is a crowd-sourced map of those rooms: a bench long enough for an adult, space for a
            wheelchair and a caregiver, and the details you need before you leave the house.
          </p>
          <form role="search" onSubmit={onSearch} className="mt-8 max-w-xl">
            <Label htmlFor="home-query" className="text-lg font-bold">
              Find an adult changing table near you
            </Label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Input
                id="home-query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try Nairobi, London, New York, or Providence"
                autoComplete="off"
                className="bg-paper"
              />
              <Button type="submit">Search</Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => navigate("/map", { state: { locate: true } })}
            >
              Use my location
            </Button>
          </form>
          <p className="mt-4 max-w-xl text-base text-ink-soft">
            The places on this map are sample data, not real locations. Every pin is marked sample until a real
            room has been reviewed.
          </p>
        </div>
        <div className="md:col-span-5">
          <img
            src={publicPath("illustrations/hero.svg")}
            width={800}
            height={640}
            alt="Illustration of a wide, lockable restroom with a full-size changing bench, a ceiling hoist track, and space to turn a wheelchair. It is a drawing, not a photo of a real room."
            className="w-full rounded-3xl border-2 border-line bg-paper"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4" aria-labelledby="cities-heading">
        <h2 id="cities-heading" className="text-3xl font-semibold text-teal-dark">
          Browse the sample cities
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cityGuides.map((city) => {
            const count = sampleStations.filter((station) => station.city === city.city).length;
            return (
              <li key={city.city}>
                <Link
                  to={`/map?city=${encodeURIComponent(city.city)}`}
                  className="flex min-h-24 flex-col justify-between rounded-2xl border-2 border-line bg-paper p-4 underline-offset-2 hover:border-teal"
                >
                  <span className="font-serif text-2xl text-teal-dark">{city.city}</span>
                  <span className="text-ink-soft">
                    {count} sample {count === 1 ? "listing" : "listings"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-3xl font-semibold text-teal-dark">
          Why this map exists
        </h2>
        <p className="mt-3 max-w-3xl text-ink-soft">
          People are already managing without these rooms. The notes below are the only figures used on this site,
          and each one is cited.
        </p>
        <div className="mt-6 grid gap-4">
          <Fact>
            <p>
              On a March 2026 post showing an adult changing station, commenters asked for these rooms to be “more
              common and mapped for easy discovery.”
            </p>
            <p className="mt-2 text-sm">
              <ExternalLink href={sources.redditPost.href} className="font-bold text-teal">
                {sources.redditPost.community}, “{sources.redditPost.title},” {sources.redditPost.date}
              </ExternalLink>
              . {sources.redditPost.points.toLocaleString("en-US")} points and {sources.redditPost.comments} comments
              in an archive snapshot. Live numbers may be higher. The wording comes from search snippets of the
              comments.
            </p>
          </Fact>
          <Fact>
            <p>
              In the caregiver study “{sources.study.name},” from the {sources.study.campaign} campaign, all{" "}
              {sources.study.changedInVehicle} caregivers had changed someone in a vehicle, and{" "}
              {sources.study.changedOnFloor} had changed someone on a restroom floor.
            </p>
            <p className="mt-2 text-sm">
              <ExternalLink href={sources.study.href} className="font-bold text-teal">
                {sources.study.campaign} campaign, “{sources.study.name}” (PDF)
              </ExternalLink>
              . Figure as given in this project’s background research.
            </p>
          </Fact>
          <Fact>
            <p>
              The United Kingdom has a Changing Places network. In the United States, some states require adult
              changing stations in new public buildings. A news report described a Rhode Island rule. This project
              has not reviewed the statute or confirmed the date. Few stations are installed, and people still ask
              for a map.
            </p>
            <p className="mt-2 text-sm">
              <ExternalLink href={sources.rhodeIslandNews.href} className="font-bold text-teal">
                News report on a Rhode Island mandate
              </ExternalLink>
              . {site.name} is not the Changing Places network and is not the Changing Spaces campaign.
            </p>
          </Fact>
        </div>
      </section>

      <section className="bg-paper py-14" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="how-heading" className="text-3xl font-semibold text-teal-dark">
            How it works
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <Step n="1" title="Find">
              Search the map, or read the same places as a list. Filters cover the bench, hoist, privacy, entrance,
              and whether you need a key.
            </Step>
            <Step n="2" title="Add">
              If you know a room, add what a caregiver needs: where it is inside the building, how to get in, the
              bench, the hoist, and the hours.
            </Step>
            <Step n="3" title="Verify">
              Confirm a listing is still there, or report a problem. In this demo, checks stay on your device until a
              review service is connected.
            </Step>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="know-heading">
        <h2 id="know-heading" className="text-3xl font-semibold text-teal-dark">
          What you can know before you go
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Where the room is inside the building, including the floor and the nearest entrance",
            "Whether the door is open, needs a key or code, or you have to ask staff",
            "Bench type, size, and the weight it is rated for",
            "A ceiling hoist, a mobile hoist, or none, and whether a sling is there",
            "Room size, turning space, a lockable door, and a toilet with grab rails",
            "Accessible parking, a step-free route, and when someone last checked the listing",
          ].map((item) => (
            <li key={item} className="rounded-2xl border-2 border-line bg-paper px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-teal text-white" aria-labelledby="venue-heading">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 id="venue-heading" className="text-3xl font-semibold text-white">
              Own a building? A quiet room changes the day.
            </h2>
            <p className="mt-3 text-lg text-cream">
              Venues can see what a good adult changing room includes, and how to get a real room listed after it is
              reviewed.
            </p>
          </div>
          <Button asChild variant="secondary" className="bg-cream text-teal-dark">
            <Link to="/venues">For venues</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return <article className="rounded-2xl border-l-4 border-coral bg-paper px-4 py-4">{children}</article>;
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-2xl border-2 border-line bg-cream p-4">
      <p className="font-serif text-3xl text-coral-dark">{n}</p>
      <h3 className="mt-2 text-2xl font-semibold text-teal-dark">{title}</h3>
      <p className="mt-2 text-ink-soft">{children}</p>
    </li>
  );
}
