import ImageKit from 'imagekit';
import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_pQA0HTNiRRSN1Rut2M2i9nr0eZ4=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_vj6bFMhNptLIwV6lLIPWogyH5U4=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/ie871bk0r',
});

const client = new ConvexClient(process.env.CONVEX_URL || "https://peaceful-marten-189.convex.cloud");

interface ShoeImageInfo {
  brand: string;
  shoeName: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  imageUrl: string;
  fileName: string;
}

const BRAND_FOLDERS: Record<string, string> = {
  'la_sportiva': 'La Sportiva',
  'scarpa': 'Scarpa',
  'five_ten': 'Five Ten',
  'evolv': 'Evolv',
  'butora': 'Butora',
  'tenaya': 'Tenaya',
  'black_diamond': 'Black Diamond',
  'mad_rock': 'Mad Rock',
  'unparallel': 'Unparallel',
  'so_ill': 'So iLL',
};

const NAME_MAPPINGS: Record<string, string> = {
  'tc_extreme': 'TC Pro',
  'tc_pro': 'TC Pro',
  'finale_laced': 'Finale',
  'skwama_purp': 'Skwama',
  'skwama_vegan': 'Skwama Vegan',
  'miura_vs': 'Miura VS',
  'solution_comp': 'Solution Comp',
  'tarantula_boulder': 'Tarantula Boulder',
  'mythos_eco': 'Mythos Eco',
  'ondra_comp': 'Ondra Comp',
  'katana_lace': 'Katana Lace',
};

function parseGenderFromFilename(filename: string): { baseName: string; gender: 'men' | 'women' | 'kids' | 'unisex'; imageNumber: string } | null {
  let match = filename.match(/^(.+?)[_-](m|w|k)(\d+)\.jpg$/i);
  if (!match) return null;

  const baseName = match[1].replace(/-/g, '_');
  const genderCode = match[2].toLowerCase();
  const imageNumber = match[3];

  const genderMap: Record<string, 'men' | 'women' | 'kids'> = {
    'm': 'men',
    'w': 'women',
    'k': 'kids',
  };

  return {
    baseName,
    gender: genderMap[genderCode] || 'unisex',
    imageNumber,
  };
}

function formatShoeName(baseName: string): string {
  const normalized = baseName.toLowerCase().replace(/-/g, '_');
  if (NAME_MAPPINGS[normalized]) {
    return NAME_MAPPINGS[normalized];
  }
  return baseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function listAllShoeImages(): Promise<ShoeImageInfo[]> {
  const allImages: ShoeImageInfo[] = [];

  for (const [folderName, brandName] of Object.entries(BRAND_FOLDERS)) {
    console.log(`\nScanning ${brandName} (${folderName})...`);

    try {
      const files = await imagekit.listFiles({
        path: `gripkicks/imgs/shoes/${folderName}/`,
        limit: 1000,
      });

      for (const file of files) {
        if (file.type !== 'file' || !file.name.endsWith('.jpg')) continue;

        const parsed = parseGenderFromFilename(file.name);
        if (!parsed) {
          console.log(`  Skipping non-standard file: ${file.name}`);
          continue;
        }

        if (parsed.imageNumber !== '1') {
          continue;
        }

        allImages.push({
          brand: brandName,
          shoeName: formatShoeName(parsed.baseName),
          gender: parsed.gender,
          imageUrl: file.url,
          fileName: file.name,
        });

        console.log(`  Found: ${formatShoeName(parsed.baseName)} (${parsed.gender}) - ${file.name}`);
      }
    } catch (error) {
      console.error(`  Error scanning ${folderName}:`, error);
    }
  }

  return allImages;
}

async function syncShoesToDatabase(images: ShoeImageInfo[]) {
  console.log('\n=== Syncing to Convex Database ===\n');

  const existingShoes = await client.query(api.shoes.list, {});
  console.log(`Found ${existingShoes.length} existing shoes in database\n`);

  const existingMap = new Map<string, typeof existingShoes[0]>();
  for (const shoe of existingShoes) {
    const key = `${shoe.brand}|${shoe.name}|${shoe.gender || 'unisex'}`.toLowerCase();
    existingMap.set(key, shoe);
  }

  const processedKeys = new Set<string>();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const image of images) {
    const key = `${image.brand}|${image.shoeName}|${image.gender}`.toLowerCase();

    if (processedKeys.has(key)) {
      console.log(`Skipping duplicate: ${image.brand} ${image.shoeName} (${image.gender})`);
      skipped++;
      continue;
    }
    processedKeys.add(key);

    const existing = existingMap.get(key);

    if (existing) {
      if (existing.imageUrl !== image.imageUrl) {
        console.log(`Updating imageUrl for: ${image.brand} ${image.shoeName} (${image.gender})`);
        await client.mutation(api.shoes.update, {
          id: existing._id,
          imageUrl: image.imageUrl,
        });
        updated++;
      } else {
        skipped++;
      }
    } else {
      const baseKey = `${image.brand}|${image.shoeName}|unisex`.toLowerCase();
      const baseShoe = existingMap.get(baseKey) ||
        existingShoes.find(s =>
          s.brand.toLowerCase() === image.brand.toLowerCase() &&
          s.name.toLowerCase() === image.shoeName.toLowerCase()
        );

      if (baseShoe) {
        console.log(`Creating: ${image.brand} ${image.shoeName} (${image.gender}) from base shoe`);
        await client.mutation(api.shoes.create, {
          name: image.shoeName,
          brand: image.brand,
          imageUrl: image.imageUrl,
          gender: image.gender,
          aggressiveness: baseShoe.aggressiveness,
          stiffness: baseShoe.stiffness,
          climbingDiscipline: baseShoe.climbingDiscipline,
          volume: baseShoe.volume,
          rubberTechnologyId: baseShoe.rubberTechnologyId,
        });
        created++;
      } else {
        console.log(`No base shoe found for: ${image.brand} ${image.shoeName} (${image.gender}) - skipping`);
        skipped++;
      }
    }
  }

  console.log('\n--- Updating unisex shoes with _m1 images ---\n');
  for (const image of images) {
    if (image.gender !== 'men') continue;

    const unisexKey = `${image.brand}|${image.shoeName}|unisex`.toLowerCase();
    const unisexShoe = existingMap.get(unisexKey);

    if (unisexShoe && unisexShoe.imageUrl !== image.imageUrl) {
      console.log(`Updating unisex ${image.brand} ${image.shoeName} with _m1 image`);
      await client.mutation(api.shoes.update, {
        id: unisexShoe._id,
        imageUrl: image.imageUrl,
      });
      updated++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

async function main() {
  console.log('=== Shoe Image Sync Tool ===\n');
  console.log('Scanning ImageKit for shoe images with _m1, _w1, _k1 naming...\n');

  const images = await listAllShoeImages();

  console.log(`\n=== Found ${images.length} primary shoe images ===\n`);

  const byBrand = new Map<string, ShoeImageInfo[]>();
  for (const img of images) {
    const list = byBrand.get(img.brand) || [];
    list.push(img);
    byBrand.set(img.brand, list);
  }

  for (const [brand, brandImages] of byBrand) {
    console.log(`\n${brand}:`);
    const byShoe = new Map<string, ShoeImageInfo[]>();
    for (const img of brandImages) {
      const list = byShoe.get(img.shoeName) || [];
      list.push(img);
      byShoe.set(img.shoeName, list);
    }
    for (const [shoe, variants] of byShoe) {
      const genders = variants.map(v => v.gender).join(', ');
      console.log(`  ${shoe}: ${genders}`);
    }
  }

  await syncShoesToDatabase(images);

  console.log('\nDone!');
  process.exit(0);
}

main().catch(console.error);
