import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SRC_ROOT = path.resolve(__dirname, "..");
const SO_CLOUDY_ALLOWED = new Set([
  "app/stash/StashPage.tsx",
  "components/stash/AddShoeDialog.tsx",
  "components/EditShoeDialog.tsx",
  "components/ShoeStatsModal/index.tsx",
  "app/layout.tsx",
  "app/globals.css",
]);

function collectFiles(dir: string, ext: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === "__tests__" || entry === "node_modules") continue;
    if (statSync(full).isDirectory()) out.push(...collectFiles(full, ext));
    else if (ext.some((e) => entry.endsWith(e))) out.push(path.relative(SRC_ROOT, full));
  }
  return out;
}

const files = collectFiles(SRC_ROOT, [".ts", ".tsx", ".css"]);

describe("site typography", () => {
  it("never uses removed font families", () => {
    for (const file of files) {
      const content = readFileSync(path.join(SRC_ROOT, file), "utf8");
      expect(content, file).not.toContain("font-sora");
      expect(content, file).not.toContain("--font-sora");
      expect(content, file).not.toContain("font-basteleur");
      expect(content, file).not.toContain("font-tanker");
      expect(content, file).not.toContain("font-ball-pill");
      expect(content, file).not.toContain("--font-ball-pill");
    }
  });

  it("keeps So Cloudy inside Sanctuary files only", () => {
    for (const file of files) {
      const content = readFileSync(path.join(SRC_ROOT, file), "utf8");
      if (!content.includes("font-so-cloudy")) continue;
      expect(SO_CLOUDY_ALLOWED.has(file), `${file} uses font-so-cloudy`).toBe(true);
    }
  });
});
