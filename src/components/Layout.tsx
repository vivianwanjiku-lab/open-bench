import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/map", label: "Find" },
  { to: "/add", label: "Add a station" },
  { to: "/venues", label: "For venues" },
  { to: "/about", label: "About" },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center rounded-full px-3 font-bold underline-offset-4 ${
              isActive ? "bg-teal-soft text-teal-dark underline" : "text-ink hover:underline"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === location.pathname;

  useEffect(() => {
    if (!open) return;
    const panel = document.getElementById(menuId);
    const focusable = panel?.querySelector<HTMLElement>("a, button");
    focusable?.focus();
    const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setMenuPath(null);
          buttonRef.current?.focus();
        }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, menuId]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-2 rounded-full pr-2">
            <BenchMark />
            <span className="font-serif text-2xl font-semibold tracking-tight text-teal-dark">{site.name}</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            <NavItems />
          </nav>
          <Button asChild className="hidden lg:inline-flex">
            <Link to="/map">Find a table</Link>
          </Button>
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setMenuPath(open ? null : location.pathname)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            {open ? "Close" : "Menu"}
          </Button>
        </div>
        {open ? (
          <div id={menuId} className="border-t border-line px-4 py-3 lg:hidden">
            <nav aria-label="Primary" className="flex flex-col">
              <NavItems onNavigate={() => setMenuPath(null)} />
            </nav>
          </div>
        ) : null}
      </header>
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <footer className="mt-16 border-t border-line bg-teal-dark text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-serif text-2xl">{site.name}</p>
            <p className="mt-2 max-w-sm text-cream">{site.tagline}.</p>
            <p className="mt-3 text-sm text-cream">
              A project by {site.founder.name}, {site.founder.location}. Sample listings are fictional.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-2">
            <FooterLink to="/map">Find a table</FooterLink>
            <FooterLink to="/add">Add a station</FooterLink>
            <FooterLink to="/venues">For venues</FooterLink>
            <FooterLink to="/about">About</FooterLink>
          </nav>
          <nav aria-label="More" className="flex flex-col gap-2">
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/privacy">Privacy</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <a
              className="min-h-11 font-bold text-cream underline decoration-2 underline-offset-2"
              href={site.founder.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube {site.founder.youtubeHandle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center font-bold text-cream underline decoration-2 underline-offset-2">
      {children}
    </Link>
  );
}

function BenchMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0E5C58" />
      <rect x="7" y="16" width="22" height="5" rx="1.5" fill="#F6F1E8" />
      <path d="M10 21v6M26 21v6" stroke="#F6F1E8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="10" r="2.2" fill="#C24D36" />
      <path d="M18 12v3" stroke="#FDE8E2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
