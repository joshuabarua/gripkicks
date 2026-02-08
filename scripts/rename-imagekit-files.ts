import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_pQA0HTNiRRSN1Rut2M2i9nr0eZ4=",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_vj6bFMhNptLIwV6lLIPWogyH5U4=",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ie871bk0r",
});

const BRAND_FOLDERS = [
  "la_sportiva",
  "scarpa",
  "five_ten",
  "evolv",
  "butora",
  "tenaya",
  "black_diamond",
  "mad_rock",
  "unparallel",
  "so_ill",
];

const genderTokenMap: Record<string, "m" | "w" | "k" | "u"> = {
  men: "m",
  mens: "m",
  mans: "m",
  man: "m",
  male: "m",
  m: "m",
  womens: "w",
  women: "w",
  womans: "w",
  woman: "w",
  female: "w",
  fem: "w",
  w: "w",
  girls: "w",
  kids: "k",
  kid: "k",
  k: "k",
  youth: "k",
  boys: "k",
  unisex: "u",
  uni: "u",
  u: "u",
};

const normalizeSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const removeCopySuffix = (value: string) => value.replace(/\s*\(\d+\)$/, "");

const computeRename = (fileName: string) => {
  const extensionMatch = fileName.match(/\.[^.]+$/);
  if (!extensionMatch) return null;

  const extension = extensionMatch[0].toLowerCase();
  let base = fileName.slice(0, -extension.length);
  base = removeCopySuffix(base).replace(/\s+/g, "_");

  const numberMatch = base.match(/(\d+)$/);
  if (!numberMatch) return null;
  const number = numberMatch[1];

  let withoutDigits = base.slice(0, -number.length).replace(/[-_]+$/, "");
  if (!withoutDigits) return null;

  const normalized = withoutDigits
    .replace(/-+/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_+|_+$/g, "");

  const segments = normalized.split("_").filter(Boolean);
  if (!segments.length) return null;

  let letter: "m" | "w" | "k" | "u" | undefined;

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const bare = segment.toLowerCase().replace(/\d+$/, "");
    const mapped = genderTokenMap[bare];

    if (mapped) {
      if (!letter) {
        letter = mapped;
      }
      segments.splice(i, 1);
      continue;
    }

    if (segment.length === 1 && segments.length > 1) {
      segments.splice(i, 1);
    }
  }

  if (!letter) {
    letter = "u";
  }

  const root = normalizeSegment(segments.join("_"));
  if (!root) return null;

  const newName = `${root}_${letter}${number}${extension}`;

  if (newName === fileName.toLowerCase()) {
    return null;
  }

  return { newName } as const;
};

const listFilesInFolder = async (folder: string) => {
  const files: any[] = [];
  let skip = 0;

  while (true) {
    const batch = await imagekit.listFiles({
      path: `gripkicks/imgs/shoes/${folder}/`,
      limit: 1000,
      skip,
    });

    if (!batch.length) break;
    files.push(...batch);
    skip += batch.length;

    if (batch.length < 1000) break;
  }

  return files;
};

const renameFiles = async () => {
  let renamed = 0;
  let skipped = 0;
  let errors = 0;

  for (const folder of BRAND_FOLDERS) {
    console.log(`\nScanning ${folder}...`);
    const files = await listFilesInFolder(folder);

    for (const file of files) {
      if (file.type !== "file") {
        skipped += 1;
        continue;
      }

      const plan = computeRename(file.name);
      if (!plan) {
        skipped += 1;
        continue;
      }

      try {
        await imagekit.renameFile({
          filePath: file.filePath,
          newFileName: plan.newName,
          purgeCache: true,
        });
        console.log(`  Renamed ${file.name} -> ${plan.newName}`);
        renamed += 1;
      } catch (error) {
        errors += 1;
        console.error(`  Failed to rename ${file.name}:`, error);
      }
    }
  }

  console.log(`\nSummary: renamed ${renamed}, skipped ${skipped}, errors ${errors}`);
};

renameFiles()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
