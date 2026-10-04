import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import sharp from "sharp";
import { buildImagePlan, decode, extractCandidates, imageKey, shoeSlug as slug, validateImagePaths, verifyTransparentImage } from "./shoe-image-utils.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local"), override: true });
const manifestPath = path.join(root, "data/shoe-images.json");
const assetRoot = path.join(root, "temp/shoe-images");
const command = process.argv[2];
const brand = process.argv.find((arg) => arg.startsWith("--brand="))?.slice(8);
const production = process.argv.includes("--prod");
const deploymentUrl = production ? process.env.CONVEX_PROD_URL : process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const save = (records) => fs.writeFile(manifestPath, `${JSON.stringify(records, null, 2)}\n`);
const fetchPublic = (url) => fetch(url, { signal: AbortSignal.timeout(30000), headers: { "User-Agent": "GripKicks catalog image backfill", Accept: "*/*" } });

if (command === "audit") {
  if (!deploymentUrl) throw new Error("Missing Convex URL");
  const shoes = await new ConvexHttpClient(deploymentUrl).query("shoes:listAll", {});
  const catalogs = await Promise.all((await fs.readdir(path.join(root, "data/shoe-catalog"))).filter((file) => file.endsWith(".json")).map(async (file) => JSON.parse(await fs.readFile(path.join(root, "data/shoe-catalog", file), "utf8"))));
  const records = shoes.filter((shoe) => !shoe.imageUrl?.trim()).map((shoe) => {
    const catalog = catalogs.find((item) => item.brand === shoe.brand);
    if (!catalog) throw new Error(`Missing catalog for ${shoe.brand}`);
    return { brand: shoe.brand, name: shoe.name, devId: shoe._id, brandKey: catalog.brandKey, imagekitFolder: catalog.imagekitFolder, slug: slug(shoe.name), sourcePage: shoe.officialUrl ?? null, status: "pending", candidates: [] };
  });
  try { await fs.access(manifestPath); throw new Error("Manifest already exists; refusing to replace prior progress"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  await save(records);
  console.log(`Recorded ${records.length} missing shoes from ${new URL(deploymentUrl).hostname}`);
  process.exit(0);
}

const records = JSON.parse(await fs.readFile(manifestPath, "utf8"));
validateImagePaths(records);
const sourceFilter = process.argv.find((arg) => arg.startsWith("--source="))?.slice(9);
const selected = records.filter((shoe) => shoe.status !== "removed" && (!brand || shoe.brand === brand) && (!sourceFilter || shoe.sourcePage?.includes(sourceFilter)));

if (command === "sources") {
  const sources = JSON.parse(await fs.readFile(path.join(root, "data/shoe-image-sources.json"), "utf8"));
  for (const shoe of selected) {
    const source = sources[imageKey(shoe)];
    if (!source || source === shoe.sourcePage || shoe.status === "approved") continue;
    shoe.previousSourcePage = shoe.sourcePage;
    shoe.sourcePage = source;
    shoe.candidates = [];
    shoe.status = "pending";
  }
  await save(records);
} else if (command === "discover") {
  let index = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (index < selected.length) {
      const shoe = selected[index++];
      if (!shoe.sourcePage || (shoe.candidates.length && !process.argv.includes("--refresh")) || shoe.status === "approved") continue;
      try {
        const response = await fetchPublic(shoe.sourcePage);
        const html = await response.text();
        shoe.sourceStatus = response.status;
        shoe.resolvedPage = response.url;
        shoe.pageTitle = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
        shoe.candidates = response.ok ? extractCandidates(html, response.url, shoe) : [];
        shoe.status = shoe.candidates.length ? "needs_review" : "source_unavailable";
        console.log(`${shoe.brand} ${shoe.name}: ${response.status}, ${shoe.candidates.length} candidates, ${shoe.pageTitle}`);
      } catch (error) {
        shoe.status = "source_unavailable";
        shoe.error = error.message;
        console.log(`${shoe.brand} ${shoe.name}: ${error.message}`);
      }
    }
  }));
  await save(records);
} else if (command === "download") {
  for (const shoe of selected) {
    const directory = path.join(assetRoot, shoe.brandKey, shoe.slug);
    await fs.mkdir(directory, { recursive: true });
    const count = Number(process.argv.find((arg) => arg.startsWith("--candidates="))?.slice(13) || 4);
    for (const [index, candidate] of shoe.candidates.slice(0, count).entries()) {
      if (candidate.localPath) continue;
      try {
        const response = await fetchPublic(candidate.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const metadata = await sharp(bytes).metadata();
        if (metadata.width < 250 || metadata.height < 100) throw new Error("Image too small");
        const destination = path.join(directory, `candidate-${index}.${metadata.format === "jpeg" ? "jpg" : metadata.format}`);
        await fs.writeFile(destination, bytes);
        Object.assign(candidate, { localPath: path.relative(root, destination), width: metadata.width, height: metadata.height, hasAlpha: metadata.hasAlpha });
        console.log(`Downloaded ${shoe.brand} ${shoe.name} #${index}: ${metadata.width}x${metadata.height}`);
      } catch (error) { candidate.error = error.message; }
    }
    await save(records);
  }
} else if (command === "sheet") {
  const items = selected.flatMap((shoe) => shoe.candidates.filter((candidate) => candidate.localPath).map((candidate) => ({ shoe, candidate, index: shoe.candidates.indexOf(candidate) })));
  await fs.mkdir(assetRoot, { recursive: true });
  for (let start = 0; start < items.length; start += 24) {
    const page = items.slice(start, start + 24);
    const overlays = [];
    for (const [index, { shoe, candidate, index: candidateIndex }] of page.entries()) {
      const left = (index % 4) * 320;
      const top = Math.floor(index / 4) * 210;
      const label = `${shoe.brand} ${shoe.name} #${candidateIndex}`.replace(/[<>&]/g, "");
      const thumb = await sharp(path.join(root, candidate.localPath)).resize(304, 168, { fit: "contain", background: "#ddd" }).png().toBuffer();
      overlays.push({ input: thumb, left: left + 8, top });
      overlays.push({ input: Buffer.from(`<svg width="320" height="40"><rect width="320" height="40" fill="#ddd"/><text x="8" y="25" font-size="14">${label}</text></svg>`), left, top: top + 170 });
    }
    const destination = path.join(assetRoot, `sheet-${slug(brand || "all")}-${start / 24}.jpg`);
    await sharp({ create: { width: 1280, height: Math.ceil(page.length / 4) * 210, channels: 3, background: "#ddd" } }).composite(overlays).jpeg({ quality: 85 }).toFile(destination);
    console.log(destination);
  }
} else if (command === "approve") {
  if (!process.argv.includes("--reviewed")) throw new Error("Inspect prepared contact sheets before approving with --reviewed");
  const processed = JSON.parse(await fs.readFile(path.join(assetRoot, "processed.json"), "utf8"));
  const selections = JSON.parse(await fs.readFile(path.join(root, "data/shoe-image-selections.json"), "utf8"));
  for (const shoe of selected) {
    const asset = processed[imageKey(shoe)];
    const selection = selections[imageKey(shoe)];
    if (!asset || !selection) continue;
    const candidate = shoe.candidates[selection.index];
    if (JSON.stringify(asset.selection) !== JSON.stringify(selection) || asset.sourceImageUrl !== candidate?.url || asset.sourcePage !== shoe.sourcePage) throw new Error(`Stale processed source for ${imageKey(shoe)}`);
    const statistics = await verifyTransparentImage(await fs.readFile(path.join(root, asset.localPath)), asset.sha256);
    Object.assign(shoe, { transparentPath: asset.localPath, sourceImageUrl: asset.sourceImageUrl, sha256: asset.sha256, imageStatistics: statistics, status: "approved" });
  }
  await save(records);
  console.log(`Approved ${selected.filter((shoe) => shoe.status === "approved").length} reviewed images`);
} else if (command === "upload") {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new Error("Missing IMAGEKIT_PRIVATE_KEY");
  const headers = { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` };
  const folders = new Map();
  for (const shoe of selected.filter((item) => item.status === "approved" && item.transparentPath && !item.imageUrl)) {
    const bytes = await fs.readFile(path.join(root, shoe.transparentPath));
    await verifyTransparentImage(bytes, shoe.sha256);
    const folder = `/${shoe.imagekitFolder.replace(/^\/+|\/+$/g, "")}`;
    const filename = `${shoe.slug}_side_profile.png`;
    if (!folders.has(folder)) {
      const query = new URLSearchParams({ path: folder, limit: "1000" });
      const listed = await fetch(`https://api.imagekit.io/v1/files?${query}`, { headers, signal: AbortSignal.timeout(30000) });
      if (!listed.ok) throw new Error(`ImageKit list failed: ${listed.status}`);
      folders.set(folder, await listed.json());
    }
    let asset = folders.get(folder).find((file) => file.filePath === `${folder}/${filename}`);
    if (!asset) {
      const body = new FormData();
      body.set("file", new Blob([bytes], { type: "image/png" }), filename);
      body.set("fileName", filename);
      body.set("folder", folder);
      body.set("useUniqueFileName", "false");
      body.set("overwriteFile", "false");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", headers, body, signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`Upload failed for ${shoe.name}: ${response.status}`);
      asset = await response.json();
    }
    if (asset.filePath !== `${folder}/${filename}` || new URL(asset.url).hostname !== "ik.imagekit.io") throw new Error(`Unexpected ImageKit upload location for ${shoe.name}`);
    const original = new URL(asset.url);
    original.searchParams.set("tr", "orig-true");
    const delivered = await fetchPublic(original);
    if (!delivered.ok) throw new Error(`ImageKit delivery failed for ${shoe.name}`);
    await verifyTransparentImage(Buffer.from(await delivered.arrayBuffer()), shoe.sha256);
    shoe.imageUrl = asset.url;
    shoe.imagekitFileId = asset.fileId;
    await save(records);
    console.log(`Uploaded and verified ${imageKey(shoe)}: ${asset.url}`);
  }
} else if (["plan", "apply", "status"].includes(command)) {
  if (!deploymentUrl) throw new Error("Missing Convex URL");
  if (command === "apply" && !process.env.CONVEX_SERVICE_TOKEN) throw new Error("Missing Convex service token");
  const client = new ConvexHttpClient(deploymentUrl);
  const current = await client.query("shoes:listAll", {});
  const environment = production ? "prod" : "dev";
  const snapshotPath = path.join(assetRoot, `before-${environment}.json`);
  if (command === "apply") {
    try { await fs.writeFile(snapshotPath, `${JSON.stringify({ deploymentUrl, shoes: current }, null, 2)}\n`, { flag: "wx" }); } catch (error) { if (error.code !== "EEXIST") throw error; }
  }
  const plan = buildImagePlan(selected, current, production);
  console.log(JSON.stringify({ environment, total: current.length, missing: current.filter((shoe) => !shoe.imageUrl?.trim()).length, approved: plan.length, toFill: plan.filter(({ existing, preserve }) => !preserve && !existing.imageUrl?.trim()).length, preserve: plan.filter(({ preserve }) => preserve).length }, null, 2));
  if (command === "apply") {
    for (const { shoe, existing, preserve } of plan) {
      if (preserve) continue;
      const original = new URL(shoe.imageUrl);
      original.searchParams.set("tr", "orig-true");
      const delivered = await fetchPublic(original);
      if (!delivered.ok) throw new Error(`Image delivery failed for ${shoe.name}`);
      await verifyTransparentImage(Buffer.from(await delivered.arrayBuffer()), shoe.sha256);
      const fresh = await client.query("shoes:getById", { id: existing._id });
      if (!fresh || imageKey(fresh) !== imageKey(shoe)) throw new Error(`Database identity changed for ${shoe.name}`);
      if (fresh.imageUrl?.trim() && fresh.imageUrl !== shoe.imageUrl) {
        console.log(`Preserving newly assigned image: ${imageKey(shoe)}`);
        continue;
      }
      if (!fresh.imageUrl?.trim()) {
        const response = await fetch(`${deploymentUrl.replace(".convex.cloud", ".convex.site")}/api/shoes/updateImageUrl`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CONVEX_SERVICE_TOKEN}` }, body: JSON.stringify({ id: existing._id, imageUrl: shoe.imageUrl }), signal: AbortSignal.timeout(30000) });
        if (!response.ok || !(await response.json()).success) throw new Error(`Database image update failed for ${shoe.name}: ${response.status}`);
      }
      const updated = await client.query("shoes:getById", { id: existing._id });
      if (updated.imageUrl !== shoe.imageUrl) throw new Error(`Database verification failed for ${shoe.name}`);
      shoe[production ? "prodVerified" : "devVerified"] = true;
      await save(records);
      console.log(`Verified ${environment}: ${imageKey(shoe)}`);
    }
  }
  if (command !== "plan") {
    const after = await client.query("shoes:listAll", {});
    let preserved = null;
    try {
      const before = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
      if (before.deploymentUrl !== deploymentUrl) throw new Error("Snapshot belongs to a different deployment");
      const images = new Map(after.map((shoe) => [shoe._id, shoe.imageUrl]));
      const removed = new Set(records.filter((shoe) => shoe.status === "removed" && shoe.removedFrom?.includes(environment)).map(imageKey));
      if (after.some((shoe) => removed.has(imageKey(shoe)))) throw new Error("A removed catalog shoe is still present");
      const baseline = before.shoes.filter((shoe) => !removed.has(imageKey(shoe)));
      const existing = baseline.filter((shoe) => shoe.imageUrl?.trim());
      for (const shoe of existing) if (images.get(shoe._id) !== shoe.imageUrl) throw new Error(`Previously existing image changed: ${imageKey(shoe)}`);
      preserved = existing.length;
      if (after.length !== baseline.length) throw new Error("Database shoe count changed during backfill");
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    console.log(JSON.stringify({ environment, total: after.length, missing: after.filter((shoe) => !shoe.imageUrl?.trim()).length, existingImagesPreserved: preserved, remaining: after.filter((shoe) => !shoe.imageUrl?.trim()).map(imageKey) }, null, 2));
  }
} else {
  throw new Error("Usage: node scripts/backfill-shoe-images.mjs <audit|sources|discover|download|sheet|approve|upload|plan|apply|status> [--brand=Brand] [--prod]");
}
