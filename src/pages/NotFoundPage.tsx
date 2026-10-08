import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <PageMeta title="Page not found" description={`That page is not on ${site.name}.`} path="/404" />
      <h1 className="text-4xl font-semibold text-teal-dark">That page is not here</h1>
      <p className="mt-3 text-ink-soft">The link may be old, or the address may be mistyped.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/map">Find a table</Link>
        </Button>
      </div>
    </div>
  );
}
