import { useEffect } from "react";
import { site } from "@/config/site";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function PageMeta({
  title,
  description,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
}) {
  useEffect(() => {
    const pageTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
    const pageDescription = description ?? site.description;
    document.title = pageTitle;
    setMeta("name", "description", pageDescription);
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", pageDescription);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", pageDescription);
    setMeta("name", "robots", site.showSampleData ? "noindex, nofollow" : "index, follow");
    if (typeof window !== "undefined") {
      setMeta("property", "og:url", new URL(path, window.location.origin).toString());
    }
  }, [title, description, path]);
  return null;
}
