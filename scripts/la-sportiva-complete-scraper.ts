import axios from 'axios';
import ImageKit from 'imagekit';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_pQA0HTNiRRSN1Rut2M2i9nr0eZ4=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_vj6bFMhNptLIwV6lLIPWogyH5U4=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/ie871bk0r',
});

// Complete list of La Sportiva climbing shoes
const LA_SPORTIVA_SHOES = [
  // Current Models - Men's
  'Solution',
  'Solution Comp',
  'Testarossa',
  'Katana',
  'Katana Lace',
  'Miura VS',
  'Miura Lace',
  'TC Pro',
  'TC Pro Leather',
  'Futura',
  'Cobra',
  'Python',
  'Theory',
  'Skwama',
  'Skwama Lace',
  
  // Current Models - Women's
  'Solution Women',
  'Solution Comp Women',
  'Testarossa Women',
  'Katana Women',
  'Katana Lace Women',
  'Miura VS Women',
  'Miura Lace Women',
  'TC Pro Women',
  'Futura Women',
  'Cobra Women',
  'Python Women',
  'Theory Women',
  'Skwama Women',
  'Skwama Lace Women',
  
  // LV (Low Volume) Versions
  'Futura LV',
  'Cobra LV',
  'Python LV',
  'Theory LV',
  'Miura VS LV',
  'Skwama LV',
  
  // Additional Models
  'Oxygym',
  'Tarantulace',
  'Tarantula',
  'Mythos',
  'Mythos Eco',
  'Mythos Women',
  'Maverink',
  'Maverink LV',
  'Maverink Women',
  'Nago',
  'Nago LV',
  'Nago Women',
  'Genius',
  'Genius LV',
  'Genius Women',
  'Speedster',
  'Speedster Women',
  'Sphinx',
  'Cypher',
  'Cypher LV',
  'Cypher Women',
  'Vapor',
  'Vapor V',
  'Vapor LV',
  'Vapor Lace',
  'Vapor Women',
  'Flash',
  'Flash LV',
  'Flash Women',
  'Edge',
  'Finale',
  'Finale LT',
  'Finale Women',
  'Club',
  'Club Women',
  'Climb X',
  'Geko',
  'Junior',
  'Kids',
];

interface ShoeStatus {
  name: string;
  found: boolean;
  imageCount: number;
  imageUrls: string[];
  notes?: string;
}

class LaSportivaCompleteScraper {
  private brandFolder = 'la_sportiva';
  private downloaded = 0;
  private skipped = 0;
  private shoeStatus: Map<string, ShoeStatus> = new Map();
  private imageHashes: Map<string, string> = new Map(); // To detect duplicates

  constructor() {
    // Initialize shoe status
    LA_SPORTIVA_SHOES.forEach(shoe => {
      this.shoeStatus.set(shoe, {
        name: shoe,
        found: false,
        imageCount: 0,
        imageUrls: [],
      });
    });
  }

  private async downloadAndUploadImage(url: string, shoeName: string, imageIndex: number, source: string): Promise<boolean> {
    try {
      console.log(`      Downloading: ${shoeName} from ${source}...`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      const buffer = Buffer.from(response.data);
      
      // Create hash to detect duplicates
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      
      // Check if we already have this image
      if (this.imageHashes.has(hash)) {
        const existingShoe = this.imageHashes.get(hash);
        console.log(`        Skipping duplicate (already uploaded for ${existingShoe})`);
        this.skipped++;
        return false;
      }
      
      const metadata = await sharp(buffer).metadata();
      
      // Accept smaller images but not too small
      if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200) {
        console.log(`        Skipping tiny image: ${metadata.width}x${metadata.height}`);
        return false;
      }

      // Upscale small images to meet minimum requirements
      let processedBuffer = buffer;
      if (metadata.width < 400 || metadata.height < 300) {
        console.log(`        Upscaling from ${metadata.width}x${metadata.height}`);
        processedBuffer = await sharp(buffer)
          .resize(400, 300, { fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' })
          .jpeg({ quality: 90 })
          .toBuffer();
      } else {
        // Optimize larger images
        processedBuffer = await sharp(buffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Upload to ImageKit
      const filename = `${shoeName.toLowerCase().replace(/\s+/g, '-')}-${imageIndex}.jpg`;
      const result = await imagekit.upload({
        file: processedBuffer,
        fileName: filename,
        folder: `gripkicks/imgs/shoes/${this.brandFolder}`,
        tags: ['la-sportiva', 'climbing-shoe', shoeName.toLowerCase()],
        useUniqueFileName: false,
      });

      // Record the hash to prevent duplicates
      this.imageHashes.set(hash, shoeName);
      
      // Update shoe status
      const status = this.shoeStatus.get(shoeName);
      if (status) {
        status.found = true;
        status.imageCount++;
        status.imageUrls.push(result.url);
      }

      this.downloaded++;
      console.log(`        ✓ Uploaded: ${result.url}`);
      return true;
    } catch (error) {
      console.log(`        Failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private async scrapeAmazonImages(): Promise<void> {
    console.log('\n=== Scraping Amazon Images ===');
    
    // First, get existing images to check what we already have
    const existingImages = new Map<string, number>();
    try {
      const existingFiles = await imagekit.listFiles({
        path: `gripkicks/imgs/shoes/${this.brandFolder}/`,
        limit: 1000,
      });
      
      existingFiles.forEach(file => {
        if (file.type === 'file') {
          // Extract shoe name from filename (remove -1.jpg, -2.jpg, etc.)
          const shoeName = file.name.replace(/-\d+\.jpg$/, '').replace(/-/g, ' ');
          const count = existingImages.get(shoeName) || 0;
          existingImages.set(shoeName, count + 1);
        }
      });
      
      console.log(`Found existing images for ${existingImages.size} shoes`);
    } catch (error) {
      console.log('Could not check existing files');
    }
    
    for (const shoe of LA_SPORTIVA_SHOES) {
      // Skip if we already have images for this shoe
      if (existingImages.has(shoe)) {
        const count = existingImages.get(shoe)!;
        console.log(`\n⏭ Skipping ${shoe} - already have ${count} image(s)`);
        const status = this.shoeStatus.get(shoe);
        if (status) {
          status.found = true;
          status.imageCount = count;
          status.notes = `Already exists (${count} images)`;
        }
        continue;
      }
      
      console.log(`\nSearching Amazon for: ${shoe}`);
      let imagesFound = 0;

      try {
        // Search Amazon with different query variations
        const searchQueries = [
          `la sportiva ${shoe.toLowerCase().replace(/\s+/g, '+')} climbing shoes`,
          `la sportiva ${shoe.toLowerCase().replace(/\s+/g, '+')} shoe`,
          `la sportiva ${shoe.toLowerCase().replace(/\s+/g, '+')} women's` + (shoe.toLowerCase().includes('women') ? '' : " women's"),
          `la sportiva ${shoe.toLowerCase().replace(/\s+/g, '+')} lv` + (shoe.toLowerCase().includes('lv') ? '' : ' lv'),
        ].filter((query, index, arr) => arr.indexOf(query) === index); // Remove duplicates

        for (const query of searchQueries) {
          if (imagesFound >= 2) break;
          
          const searchUrl = `https://www.amazon.com/s?k=${query}`;
          
          const response = await axios.get(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            timeout: 10000,
          });

          const $ = cheerio.load(response.data);
          
          // Find product images with better matching
          const imagePromises: Promise<void>[] = [];
          $('.s-result-item').each((i: number, elem: any) => {
            if (imagesFound >= 2) return false;
            
            const $item = $(elem);
            const title = $item.find('h2 a span').text().toLowerCase();
            const $img = $item.find('img').first();
            const src = $img.attr('src');
            
            // Better matching logic
            const shoeWords = shoe.toLowerCase().replace(/\s+/g, ' ').split(' ');
            const titleWords = title.split(' ');
            
            // Check if all shoe words are in the title
            // Special handling for women's and LV versions
            let isMatch = true;
            for (const word of shoeWords) {
              if (word.length <= 2) continue; // Skip short words like 'vs', 'lv'
              
              const found = titleWords.some((tWord: string) => {
                // Handle special cases
                if (word === 'women') {
                  return tWord.includes('women') || tWord.includes('woman') || tWord.includes('womens');
                }
                if (word === 'lv') {
                  return tWord.includes('lv') || tWord.includes('low volume');
                }
                if (word === 'vs') {
                  return tWord === 'vs' || tWord.includes('velcro');
                }
                
                return tWord.includes(word);
              });
              
              if (!found) {
                isMatch = false;
                break;
              }
            }
            
            isMatch = isMatch && title.includes('la sportiva') && title.includes('climbing');
            
            if (src && isMatch && src.includes('images/I/') && !src.includes('.gif')) {
              // Get higher resolution version
              const highResUrl = src.replace(/._[A-Z_]+_/, '._SL1500_.');
              
              imagePromises.push(
                this.downloadAndUploadImage(highResUrl, shoe, imagesFound + 1, 'amazon')
                  .then(uploaded => {
                    if (uploaded) imagesFound++;
                  })
              );
            }
          });
          
          await Promise.all(imagePromises);
        }

        if (imagesFound === 0) {
          const status = this.shoeStatus.get(shoe);
          if (status) {
            status.notes = 'No images found on Amazon';
          }
        }
        
        console.log(`  Found ${imagesFound} images for ${shoe}`);
        
      } catch (error) {
        console.log(`  Failed: ${error instanceof Error ? error.message : String(error)}`);
        const status = this.shoeStatus.get(shoe);
        if (status) {
          status.notes = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }
  }

  private async printStatusReport(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('LA SPORTIVA SHOE IMAGE STATUS REPORT');
    console.log('='.repeat(80));
    
    let foundCount = 0;
    let totalImages = 0;
    
    console.log('\n✓ SHOES WITH IMAGES:');
    for (const [name, status] of this.shoeStatus.entries()) {
      if (status.found) {
        console.log(`  ✓ ${name}: ${status.imageCount} image(s)`);
        status.imageUrls.forEach(url => {
          console.log(`    - ${url}`);
        });
        foundCount++;
        totalImages += status.imageCount;
      }
    }
    
    console.log('\n✗ SHOES WITHOUT IMAGES:');
    for (const [name, status] of this.shoeStatus.entries()) {
      if (!status.found) {
        console.log(`  ✗ ${name}: ${status.notes || 'No images found'}`);
      }
    }
    
    console.log('\n' + '-'.repeat(80));
    console.log(`SUMMARY:`);
    console.log(`  Total shoe models: ${LA_SPORTIVA_SHOES.length}`);
    console.log(`  Shoes with images: ${foundCount} (${((foundCount / LA_SPORTIVA_SHOES.length) * 100).toFixed(1)}%)`);
    console.log(`  Total images downloaded: ${totalImages}`);
    console.log(`  Duplicates skipped: ${this.skipped}`);
    console.log(`  Unique images uploaded: ${this.downloaded}`);
    console.log('-'.repeat(80));
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalShoes: LA_SPORTIVA_SHOES.length,
        shoesWithImages: foundCount,
        totalImages: totalImages,
        duplicatesSkipped: this.skipped,
        uniqueUploaded: this.downloaded,
      },
      shoes: Array.from(this.shoeStatus.values()),
    };
    
    const fs = require('fs');
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    fs.writeFileSync('./temp/la-sportiva-scrape-report.json', JSON.stringify(report, null, 2));
    console.log(`\nDetailed report saved to: ./temp/la-sportiva-scrape-report.json`);
  }

  async run(): Promise<void> {
    console.log('=== La Sportiva Complete Image Scraper ===');
    console.log(`Target: Find images for ALL ${LA_SPORTIVA_SHOES.length} La Sportiva models`);
    console.log('Features: Duplicate detection, skip existing, no placeholders, complete status report\n');
    
    // Scrape Amazon for missing images
    await this.scrapeAmazonImages();
    
    // Print final status report
    await this.printStatusReport();
    
    console.log(`\n=== Complete! ===`);
    console.log(`Check your ImageKit dashboard:`);
    console.log(`https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/la_sportiva/`);
  }
}

// Run the scraper
const scraper = new LaSportivaCompleteScraper();
scraper.run().catch(console.error);
