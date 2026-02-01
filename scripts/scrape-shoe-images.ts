import axios from 'axios';
import * as cheerio from 'cheerio';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

const streamPipeline = promisify(pipeline);

// Configuration
const CONFIG = {
  outputDir: './scraped-images',
  minImageWidth: 400,
  minImageHeight: 300,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  delay: 1000, // 1 second delay between requests
};

// Climbing shoe brands with their official websites
const BRANDS = [
  { name: 'La Sportiva', website: 'https://www.lasportiva.com', searchPath: '/en/climbing/shoes' },
  { name: 'Scarpa', website: 'https://www.scarpa.com', searchPath: '/en/climbing/shoes' },
  { name: 'Five Ten', website: 'https://www.adidas.com', searchPath: '/five-ten-climbing-shoes' },
  { name: 'Black Diamond', website: 'https://www.blackdiamondequipment.com', searchPath: '/climbing/climbing-shoes' },
  { name: 'Evolv', website: 'https://www.evolv.com', searchPath: '/collections/climbing-shoes' },
  { name: 'Tenaya', website: 'https://www.tenaya-international.com', searchPath: '/en/shoes' },
  { name: 'Mad Rock', website: 'https://www.madrockclimbing.com', searchPath: '/collections/climbing-shoes' },
  { name: 'Boreal', website: 'https://www.boreal.com', searchPath: '/en/climbing-shoes' },
  { name: 'Butora', website: 'https://www.butorausa.com', searchPath: '/collections/climbing-shoes' },
  { name: 'Ocun', website: 'https://www.ocun.com', searchPath: '/en/climbing-shoes' },
  { name: 'Millet', website: 'https://www.millet-mountain.com', searchPath: '/en/climbing-shoes' },
  { name: 'So Ill', website: 'https://www.soillclimbing.com', searchPath: '/collections/shoes' },
  { name: 'Climb X', website: 'https://www.climb-x.com', searchPath: '/climbing-shoes' },
  { name: 'Andrea Boldrini', website: 'https://www.andreaboldrini.com', searchPath: '/en/climbing-shoes' },
  { name: 'Red Chili', website: 'https://www.redchili.de', searchPath: '/en/climbing-shoes' },
  { name: 'Unparallel', website: 'https://www.unparallelclimbing.com', searchPath: '/collections/climbing-shoes' },
  { name: 'Acopa', website: 'https://www.acopaclimbing.com', searchPath: '/shoes' },
  { name: 'Bufo', website: 'https://www.bufo.cz', searchPath: '/en/climbing-shoes' },
  { name: 'Saltic', website: 'https://www.saltic.cz', searchPath: '/en/climbing' },
  { name: 'Triop', website: 'https://www.triop.cz', searchPath: '/en/climbing-shoes' },
  { name: 'Rock Empire', website: 'https://www.rockempire.com', searchPath: '/en/climbing-shoes' },
  { name: 'Lowa', website: 'https://www.lowaboots.com', searchPath: '/en/climbing-shoes' },
  { name: 'Edelrid', website: 'https://www.edelrid.de', searchPath: '/en/climbing-shoes' },
];

// Alternative image sources
const ALTERNATIVE_SOURCES = [
  { name: 'Climbing Shoe Review', url: 'https://www.climbingshoereview.com', selector: '.shoe-image img' },
  { name: 'Weigh My Rack', url: 'https://www.weighmyrack.com', selector: '.product-image img' },
  { name: 'REI', url: 'https://www.rei.com', searchPath: '/c/climbing-shoes' },
  { name: 'Backcountry', url: 'https://www.backcountry.com', searchPath: '/climbing-shoes' },
  { name: 'Moosejaw', url: 'https://www.moosejaw.com', searchPath: '/climbing-shoes' },
];

class ShoeImageScraper {
  private downloadedImages = new Map<string, string>();
  private errors: string[] = [];

  constructor() {
    // Create output directory if it doesn't exist
    if (!existsSync(CONFIG.outputDir)) {
      mkdirSync(CONFIG.outputDir, { recursive: true });
    }
  }

  private normalizeBrandName(brand: string): string {
    return brand
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Referer': 'https://www.google.com',
        },
        timeout: 10000,
      });

      const contentLength = response.headers['content-length'];
      if (contentLength && parseInt(contentLength) > CONFIG.maxFileSize) {
        return null;
      }

      const filepath = join(CONFIG.outputDir, filename);
      const writer = createWriteStream(filepath);
      await streamPipeline(response.data, writer);

      // Validate and optimize image
      const metadata = await sharp(filepath).metadata();
      if (!metadata.width || !metadata.height || 
          metadata.width < CONFIG.minImageWidth || 
          metadata.height < CONFIG.minImageHeight) {
        return null;
      }

      // Optimize image
      await sharp(filepath)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filepath.replace(/\.[^/.]+$/, '.jpg'));

      return filepath;
    } catch (error) {
      console.error(`Failed to download image from ${url}:`, error);
      return null;
    }
  }

  private async scrapeBrandWebsite(brand: typeof BRANDS[0]): Promise<void> {
    console.log(`Scraping ${brand.name}...`);
    const brandDir = join(CONFIG.outputDir, this.normalizeBrandName(brand.name));
    
    if (!existsSync(brandDir)) {
      mkdirSync(brandDir, { recursive: true });
    }

    try {
      const response = await axios.get(`${brand.website}${brand.searchPath}`, {
        headers: { 'User-Agent': CONFIG.userAgent },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const images: string[] = [];

      // Common selectors for product images
      const selectors = [
        '.product-image img',
        '.shoe-image img',
        '.product-photo img',
        '.item-image img',
        'img[alt*="shoe"]',
        'img[src*="shoe"]',
        'img[class*="product"]',
      ];

      for (const selector of selectors) {
        $(selector).each((i, elem) => {
          const src = $(elem).attr('src') || $(elem).attr('data-src');
          if (src) {
            const fullUrl = src.startsWith('http') ? src : `${brand.website}${src}`;
            if (!images.includes(fullUrl)) {
              images.push(fullUrl);
            }
          }
        });
      }

      // Download images
      for (let i = 0; i < Math.min(images.length, 20); i++) {
        const url = images[i];
        const filename = `${brand.name.replace(/[^a-z0-9]/gi, '_')}_${i + 1}.jpg`;
        const filepath = join(brandDir, filename);
        
        const downloaded = await this.downloadImage(url, filename);
        if (downloaded) {
          this.downloadedImages.set(`${brand.name}_${i}`, downloaded);
          console.log(`Downloaded: ${filename}`);
        }
        
        await this.delay(CONFIG.delay);
      }
    } catch (error) {
      console.error(`Error scraping ${brand.name}:`, error);
      this.errors.push(`${brand.name}: ${error}`);
    }
  }

  private async scrapeAlternativeSources(): Promise<void> {
    console.log('Scraping alternative sources...');
    
    for (const source of ALTERNATIVE_SOURCES) {
      try {
        const searchUrl = source.searchPath ? `${source.url}${source.searchPath}` : source.url;
        const response = await axios.get(searchUrl, {
          headers: { 'User-Agent': CONFIG.userAgent },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const images: string[] = [];

        $(source.selector).each((i, elem) => {
          const src = $(elem).attr('src') || $(elem).attr('data-src');
          if (src) {
            const fullUrl = src.startsWith('http') ? src : `${source.url}${src}`;
            images.push(fullUrl);
          }
        });

        // Download a sample of images
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          const url = images[i];
          const filename = `${source.name.replace(/[^a-z0-9]/gi, '_')}_${i + 1}.jpg`;
          
          const downloaded = await this.downloadImage(url, filename);
          if (downloaded) {
            this.downloadedImages.set(`${source.name}_${i}`, downloaded);
            console.log(`Downloaded from ${source.name}: ${filename}`);
          }
          
          await this.delay(CONFIG.delay);
        }
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
        this.errors.push(`${source.name}: ${error}`);
      }
    }
  }

  private async searchGoogleImages(brand: string): Promise<void> {
    console.log(`Searching Google Images for ${brand}...`);
    // Note: Google Images scraping is complex and may violate ToS
    // Consider using their official API instead
  }

  public async scrapeAll(): Promise<void> {
    console.log('Starting shoe image scraping...');
    
    // Scrape brand websites
    for (const brand of BRANDS) {
      await this.scrapeBrandWebsite(brand);
      await this.delay(CONFIG.delay * 2);
    }

    // Scrape alternative sources
    await this.scrapeAlternativeSources();

    // Generate report
    console.log('\nScraping complete!');
    console.log(`Total images downloaded: ${this.downloadedImages.size}`);
    
    if (this.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.errors.forEach(error => console.log(`- ${error}`));
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      totalImages: this.downloadedImages.size,
      errors: this.errors,
      downloadedImages: Array.from(this.downloadedImages.entries()),
    };

    const reportPath = join(CONFIG.outputDir, 'scraping-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${reportPath}`);
  }
}

// Run the scraper
if (require.main === module) {
  const scraper = new ShoeImageScraper();
  scraper.scrapeAll().catch(console.error);
}

export default ShoeImageScraper;
