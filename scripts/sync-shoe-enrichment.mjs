import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";

config();
config({ path: ".env.local", override: true });

const enrichmentDirectory = path.resolve("data/shoe-enrichment");
const brandKey = process.argv.slice(2).find((argument) => !argument.startsWith("--") && argument.endsWith(".json"));
const shouldApply = process.argv.includes("--apply");
const useProduction = process.argv.includes("--prod");
const allowedSpecKeys = new Set([
  "closure",
  "upper",
  "lining",
  "midsole",
  "sole",
  "weight",
  "sensitivity",
  "rigidity",
]);
const metricVocabs = {
  aggressiveness: new Set(["flat", "moderate", "aggressive"]),
  climbingDiscipline: new Set(["bouldering", "competition", "gym", "sport", "trad"]),
  stiffness: new Set(["soft", "medium", "stiff"]),
  volume: new Set(["low", "medium", "high"]),
};
const allowedMetricKeys = new Set([
  ...Object.keys(metricVocabs),
  "brandAggressiveness",
  "brandStiffness",
  "rubber",
]);
const allowedRubberKeys = new Set(["brand", "compound", "stickiness", "durability"]);

function assertRubberMetric(rubber, fileName, name) {
  if (!rubber || typeof rubber !== "object" || Array.isArray(rubber)) {
    throw new Error(`${fileName}: ${name} metrics.rubber must be an object`);
  }
  for (const [key, value] of Object.entries(rubber)) {
    if (!allowedRubberKeys.has(key) || typeof value !== "string") {
      throw new Error(`${fileName}: ${name} has invalid rubber field ${key}`);
    }
  }
  for (const field of ["brand", "compound"]) {
    if (typeof rubber[field] !== "string" || !rubber[field].trim()) {
      throw new Error(`${fileName}: ${name} metrics.rubber requires a non-empty ${field}`);
    }
  }
}

function assertMetrics(metrics, fileName, name) {
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
    throw new Error(`${fileName}: ${name} metrics must be an object`);
  }
  for (const [key, value] of Object.entries(metrics)) {
    if (!allowedMetricKeys.has(key)) {
      throw new Error(`${fileName}: ${name} has invalid metric ${key}`);
    }
    const vocab = metricVocabs[key];
    if (vocab) {
      if (typeof value !== "string" || !vocab.has(value)) {
        throw new Error(`${fileName}: ${name} has invalid metric ${key} value`);
      }
    } else if (key === "rubber") {
      assertRubberMetric(value, fileName, name);
    } else if (typeof value !== "number") {
      throw new Error(`${fileName}: ${name} metric ${key} must be a number`);
    }
  }
}

function assertEntry(entry, fileName) {
  if (!entry || typeof entry !== "object") throw new Error(`${fileName}: entry must be an object`);
  for (const field of ["brand", "name", "officialUrl", "description"]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) {
      throw new Error(`${fileName}: ${entry.name ?? "unknown"} has invalid ${field}`);
    }
  }
  if (!entry.officialUrl.startsWith("https://")) {
    throw new Error(`${fileName}: ${entry.name} must use an HTTPS source URL`);
  }
  if (entry.description.length > 220) {
    throw new Error(`${fileName}: ${entry.name} description exceeds 220 characters`);
  }
  if (typeof entry.confidence !== "number" || entry.confidence < 0 || entry.confidence > 1) {
    throw new Error(`${fileName}: ${entry.name} confidence must be between 0 and 1`);
  }
  if (!["pending", "approved", "rejected"].includes(entry.reviewStatus)) {
    throw new Error(`${fileName}: ${entry.name} has invalid reviewStatus`);
  }
  if (!entry.officialSpecs || typeof entry.officialSpecs !== "object") {
    throw new Error(`${fileName}: ${entry.name} must include officialSpecs`);
  }
  for (const [key, value] of Object.entries(entry.officialSpecs)) {
    if (!allowedSpecKeys.has(key) || typeof value !== "string") {
      throw new Error(`${fileName}: ${entry.name} has invalid spec ${key}`);
    }
  }
  if (entry.metrics !== undefined) {
    assertMetrics(entry.metrics, fileName, entry.name);
  }
}

function loadEntries() {
  const fileNames = brandKey
    ? [brandKey]
    : fs.readdirSync(enrichmentDirectory).filter((fileName) => fileName.endsWith(".json")).sort();
  const entries = [];

  for (const fileName of fileNames) {
    const filePath = path.join(enrichmentDirectory, fileName);
    const records = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(records)) throw new Error(`${fileName}: root must be an array`);
    records.forEach((entry) => assertEntry(entry, fileName));
    entries.push(...records);
    console.log(`${fileName}: ${records.length} verified records`);
  }

  const duplicateKeys = entries
    .map((entry) => `${entry.brand}\u0000${entry.name}`)
    .filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length) throw new Error(`Duplicate entries: ${[...new Set(duplicateKeys)].join(", ")}`);
  return entries;
}

async function applyEntries(entries) {
  const deploymentUrl = useProduction
    ? process.env.CONVEX_PROD_URL
    : process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL || process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  const serviceToken = process.env.CONVEX_SERVICE_TOKEN;
  if (!deploymentUrl) throw new Error(useProduction ? "Missing CONVEX_PROD_URL" : "Missing Convex URL");
  const convexUrl = deploymentUrl.replace(".convex.cloud", ".convex.site");
  if (!serviceToken) throw new Error("Missing CONVEX_SERVICE_TOKEN");

  for (let index = 0; index < entries.length; index += 20) {
    const chunk = entries.slice(index, index + 20);
    const response = await fetch(`${convexUrl}/api/shoes/applyEnrichment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ entries: chunk }),
    });
    const responseText = await response.text();
    let result = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch {
      throw new Error(`Enrichment sync failed with status ${response.status}: ${responseText.slice(0, 160)}`);
    }
    if (!response.ok || result?.success !== true) {
      throw new Error(result?.message || `Enrichment sync failed with status ${response.status}`);
    }
    console.log(`Synced ${result.data.updated.length}; missing ${result.data.missing.length}`);
    if (result.data.missing.length) console.log(`Missing: ${result.data.missing.join(", ")}`);
  }
}

const entries = loadEntries();
console.log(`Total: ${entries.length} enrichment records`);
console.log(`Approved: ${entries.filter((entry) => entry.reviewStatus === "approved").length}`);
console.log(`Pending: ${entries.filter((entry) => entry.reviewStatus === "pending").length}`);

if (!shouldApply) {
  console.log("Validation complete. Pass --apply to sync these records to Convex.");
  process.exit(0);
}

await applyEntries(entries);
