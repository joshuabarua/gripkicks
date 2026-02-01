import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface ShoeImage {
  brand: string;
  model: string;
  imageUrl: string;
  source: string;
}

class AdvancedShoeScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir = './scraped-shoes';
  private downloadedImages: ShoeImage[] = [];

  constructor() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });
    this.page = await this.browser.newPage();
    
    await this.page.setViewport({ width: 1920, height: 1080 });
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Block unnecessary resources for faster scraping
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async downloadImage(imageUrl: string, filename: string): Promise<boolean> {
    try {
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        timeout: 10000,
      });

      const filepath = path.join(this.outputDir, filename);
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(true));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download ${imageUrl}:`, error);
      return false;
    }
  }

  private async scrapeLaSportiva(): Promise<void> {
    console.log('Scraping La Sportiva...');
    if (!this.page) return;

    try {
      await this.page.goto('https://www.lasportiva.com/en/climbing/shoes', { waitUntil: 'networkidle2' });
      await this.delay(2000);

      const shoes = await this.page.evaluate(() => {
        const results: any[] = [];
        const products = document.querySelectorAll('.product-item');
        
        products.forEach(product => {
          const name = product.querySelector('.product-name')?.textContent?.trim();
          const image = product.querySelector('img')?.src;
          const link = product.querySelector('a')?.href;
          
          if (name && image) {
            results.push({ name, image, link });
          }
        });
        
        return results;
      });

      for (const shoe of shoes) {
        const filename = `la-sportiva-${shoe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        const success = await this.downloadImage(shoe.image, filename);
        
        if (success) {
          this.downloadedImages.push({
            brand: 'La Sportiva',
            model: shoe.name,
            imageUrl: shoe.image,
            source: shoe.link,
          });
          console.log(`Downloaded: ${shoe.name}`);
        }
      }
    } catch (error) {
      console.error('Error scraping La Sportiva:', error);
    }
  }

  private async scrapeScarpa(): Promise<void> {
    console.log('Scraping Scarpa...');
    if (!this.page) return;

    try {
      await this.page.goto('https://www.scarpa.com/en/climbing/shoes', { waitUntil: 'networkidle2' });
      await this.delay(2000);

      // Handle cookie consent if present
      const cookieButton = await this.page.$('#cookie-consent-button');
      if (cookieButton) {
        await cookieButton.click();
        await this.delay(1000);
      }

      const shoes = await this.page.evaluate(() => {
        const results: any[] = [];
        const products = document.querySelectorAll('.product-card, .shoe-card');
        
        products.forEach(product => {
          const name = product.querySelector('.product-title, .shoe-name')?.textContent?.trim();
          const image = product.querySelector('img')?.src;
          
          if (name && image) {
            results.push({ name, image });
          }
        });
        
        return results;
      });

      for (const shoe of shoes) {
        const filename = `scarpa-${shoe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        const success = await this.downloadImage(shoe.image, filename);
        
        if (success) {
          this.downloadedImages.push({
            brand: 'Scarpa',
            model: shoe.name,
            imageUrl: shoe.image,
            source: 'https://www.scarpa.com',
          });
          console.log(`Downloaded: ${shoe.name}`);
        }
      }
    } catch (error) {
      console.error('Error scraping Scarpa:', error);
    }
  }

  private async scrapeEvolv(): Promise<void> {
    console.log('Scraping Evolv...');
    if (!this.page) return;

    try {
      await this.page.goto('https://www.evolv.com/collections/climbing-shoes', { waitUntil: 'networkidle2' });
      await this.delay(2000);

      const shoes = await this.page.evaluate(() => {
        const results: any[] = [];
        const products = document.querySelectorAll('.product-item, .grid-item');
        
        products.forEach(product => {
          const name = product.querySelector('.product-title, .product-name')?.textContent?.trim();
          const image = product.querySelector('img')?.src;
          
          if (name && image) {
            results.push({ name, image });
          }
        });
        
        return results;
      });

      for (const shoe of shoes) {
        const filename = `evolv-${shoe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        const success = await this.downloadImage(shoe.image, filename);
        
        if (success) {
          this.downloadedImages.push({
            brand: 'Evolv',
            model: shoe.name,
            imageUrl: shoe.image,
            source: 'https://www.evolv.com',
          });
          console.log(`Downloaded: ${shoe.name}`);
        }
      }
    } catch (error) {
      console.error('Error scraping Evolv:', error);
    }
  }

  private async scrapeRetailers(): Promise<void> {
    console.log('Scraping from retailers...');
    const retailers = [
      {
        name: 'REI',
        url: 'https://www.rei.com/c/climbing-shoes',
        selector: '.product-card',
      },
      {
        name: 'Backcountry',
        url: 'https://www.backcountry.com/climbing-shoes',
        selector: '.product-card',
      },
    ];

    for (const retailer of retailers) {
      try {
        await this.page.goto(retailer.url, { waitUntil: 'networkidle2' });
        await this.delay(2000);

        const shoes = await this.page.evaluate((selector) => {
          const results: any[] = [];
          const products = document.querySelectorAll(selector);
          
          products.forEach(product => {
            const name = product.querySelector('.product-title')?.textContent?.trim();
            const brand = product.querySelector('.product-brand')?.textContent?.trim();
            const image = product.querySelector('img')?.src;
            
            if (name && image) {
              results.push({ name: `${brand} ${name}`, image });
            }
          });
          
          return results;
        }, retailer.selector);

        for (const shoe of shoes.slice(0, 10)) { // Limit to 10 per retailer
          const filename = `${retailer.name.toLowerCase()}-${shoe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
          const success = await this.downloadImage(shoe.image, filename);
          
          if (success) {
            this.downloadedImages.push({
              brand: shoe.name.split(' ')[0],
              model: shoe.name,
              imageUrl: shoe.image,
              source: retailer.url,
            });
            console.log(`Downloaded from ${retailer.name}: ${shoe.name}`);
          }
        }
      } catch (error) {
        console.error(`Error scraping ${retailer.name}:`, error);
      }
    }
  }

  async scrapeAll(): Promise<void> {
    await this.init();
    
    try {
      await this.scrapeLaSportiva();
      await this.delay(2000);
      
      await this.scrapeScarpa();
      await this.delay(2000);
      
      await this.scrapeEvolv();
      await this.delay(2000);
      
      await this.scrapeRetailers();
      
      // Save results
      const results = {
        timestamp: new Date().toISOString(),
        totalImages: this.downloadedImages.length,
        images: this.downloadedImages,
      };
      
      fs.writeFileSync(
        path.join(this.outputDir, 'scraping-results.json'),
        JSON.stringify(results, null, 2)
      );
      
      console.log(`\nScraping complete! Downloaded ${this.downloadedImages.length} images.`);
      console.log(`Results saved to: ${path.join(this.outputDir, 'scraping-results.json')}`);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  const scraper = new AdvancedShoeScraper();
  scraper.scrapeAll().catch(console.error);
}

export default AdvancedShoeScraper;
