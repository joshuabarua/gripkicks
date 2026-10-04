import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local"), override: true });

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
if (!privateKey) throw new Error("Missing IMAGEKIT_PRIVATE_KEY");
const headers = { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` };
const assetDirectory = path.join(root, "packages/web/public/imgs/brands");
const aliases = { red_chili: "red_chilli" };
const assets = (await fs.readdir(assetDirectory)).filter((name) => /\.(svg|png)$/i.test(name)).sort();
const manifest = {};

for (const name of assets) {
  const brandKey = path.parse(name).name;
  const catalogKey = aliases[brandKey] ?? brandKey;
  const catalog = JSON.parse(await fs.readFile(path.join(root, `data/shoe-catalog/${catalogKey}.json`), "utf8"));
  if (!catalog.imagekitFolder) throw new Error(`Missing ImageKit folder for ${catalogKey}`);
  const folder = `/${catalog.imagekitFolder.replace(/^\/+|\/+$/g, "")}/logos`;
  const query = new URLSearchParams({ path: folder, limit: "1000" });
  const listed = await fetch(`https://api.imagekit.io/v1/files?${query}`, { headers });
  if (!listed.ok) throw new Error(`ImageKit list failed for ${catalogKey}: ${listed.status}`);
  const existing = (await listed.json()).find((file) => file.filePath === `${folder}/${name}`);
  let asset = existing;

  if (!asset) {
    const body = new FormData();
    body.set("file", new Blob([await fs.readFile(path.join(assetDirectory, name))], {
      type: name.endsWith(".svg") ? "image/svg+xml" : "image/png",
    }), name);
    body.set("fileName", name);
    body.set("folder", folder);
    body.set("useUniqueFileName", "false");
    body.set("overwriteFile", "false");
    const uploaded = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", headers, body });
    if (!uploaded.ok) throw new Error(`ImageKit upload failed for ${name}: ${uploaded.status}`);
    asset = await uploaded.json();
  }

  if (asset.filePath !== `${folder}/${name}` || !asset.url?.startsWith("https://")) {
    throw new Error(`Unexpected ImageKit upload location for ${name}`);
  }
  const originalUrl = new URL(asset.url);
  originalUrl.searchParams.set("tr", "orig-true");
  const delivered = await fetch(originalUrl);
  if (!delivered.ok) throw new Error(`ImageKit delivery failed for ${name}: ${delivered.status}`);
  const remote = Buffer.from(await delivered.arrayBuffer());
  const local = await fs.readFile(path.join(assetDirectory, name));
  if (!remote.equals(local)) throw new Error(`ImageKit asset differs from local original: ${name}`);
  manifest[name] = asset.url;
  console.log(`${existing ? "Verified existing" : "Uploaded and verified"}: ${asset.filePath}`);
}

console.log(JSON.stringify(manifest, null, 2));
