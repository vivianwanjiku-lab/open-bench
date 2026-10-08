import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AboutPage } from "@/pages/AboutPage";
import { AddPage } from "@/pages/AddPage";
import { ContactPage } from "@/pages/ContactPage";
import { FaqPage } from "@/pages/FaqPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { StationPage } from "@/pages/StationPage";
import { VenuesPage } from "@/pages/VenuesPage";

const MapPage = lazy(() => import("@/pages/MapPage").then((module) => ({ default: module.MapPage })));

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<p className="px-4 py-10">Loading the map…</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/stations/:id" element={<StationPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}
