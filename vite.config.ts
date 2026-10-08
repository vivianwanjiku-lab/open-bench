import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

function readSiteSource(): string {
  return readFileSync(new URL("./src/config/site.ts", import.meta.url), "utf8");
}

function readSiteString(source: string, key: string): string {
  const match = new RegExp(`\\b${key}:\\s*"((?:\\\\.|[^"\\\\])*)"`).exec(source);
  if (!match) {
    throw new Error(
      `src/config/site.ts is missing a single-line double-quoted field "${key}".`,
    );
  }
  return match[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function readSiteBoolean(source: string, key: string): boolean {
  const match = new RegExp(`\\b${key}:\\s*(true|false)`).exec(source);
  if (!match) {
    throw new Error(`src/config/site.ts is missing a boolean field "${key}".`);
  }
  return match[1] === "true";
}

function siteHtml(): Plugin {
  return {
    name: "open-bench-site-html",
    transformIndexHtml(html) {
      const source = readSiteSource();
      const name = readSiteString(source, "name");
      const description = readSiteString(source, "description");
      const themeColor = readSiteString(source, "themeColor");
      const sample = readSiteBoolean(source, "showSampleData");
      const replacements: Record<string, string> = {
        "%SITE_NAME%": escapeHtml(name),
        "%SITE_DESCRIPTION%": escapeHtml(description),
        "%SITE_THEME_COLOR%": escapeHtml(themeColor),
        "%SITE_ROBOTS%": sample ? "noindex, nofollow" : "index, follow",
        "%SITE_NAME_JSON%": JSON.stringify(name),
        "%SITE_DESCRIPTION_JSON%": JSON.stringify(description),
      };
      return Object.entries(replacements).reduce(
        (result, [token, value]) => result.replaceAll(token, value),
        html,
      );
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteHtml()],
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4317,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4317,
    strictPort: true,
  },
});
