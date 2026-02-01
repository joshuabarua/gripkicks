import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import ImageKit from 'imagekit';

// ImageKit configuration
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_pQA0HTNiRRSN1Rut2M2i9nr0eZ4=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_vj6bFMhNptLIwV6lLIPWogyH5U4=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/ie871bk0r',
});

// Brand-specific image sources
const BRAND_IMAGE_SOURCES = {
  'la-sportiva': [
    'https://www.lasportiva.com/en/climbing/shoes',
    'https://cdn.shopify.com/s/files/1/0265/7136/files/la-sportiva-solution',
  ],
  'scarpa': [
    'https://www.scarpa.com/en/climbing/shoes',
    'https://www.scarpa.com/static/images',
  ],
  'five-ten': [
    'https://www.adidas.com/five-ten-climbing-shoes',
    'https://assets.adidas.com/images',
  ],
  'black-diamond': [
    'https://www.blackdiamondequipment.com/climbing/climbing-shoes',
    'https://cdn.shopify.com/s/files/1/0550/8638',
  ],
  'evolv': [
    'https://www.evolv.com/collections/climbing-shoes',
    'https://cdn.shopify.com/s/files/1/0253/7308',
  ],
  'tenaya': [
    'https://www.tenaya-international.com/en/shoes',
    'https://www.tenaya-international.com/static',
  ],
  'mad-rock': [
    'https://www.madrockclimbing.com/collections/climbing-shoes',
    'https://cdn.shopify.com/s/files/1/0563/3115',
  ],
};

// Shoe models to look for
const SHOE_MODELS = {
  'la-sportiva': ['solution', 'testarossa', 'futura', 'cobra', 'python', 'katana', 'miura', 'tc pro'],
  'scarpa': ['drago', 'instinct', 'maestro', 'vapor', 'helix', 'force', 'boostic', 'origin'],
  'five-ten': ['hiangle', 'quantum', 'team', 'dragon', 'moccasym', 'aleon', 'niad', 'asym'],
  'black-diamond': ['momentum', 'zone', 'aspect', 'shadows', 'certified', 'demon', 'white'],
  'evolv': ['shaman', 'optimus', 'kronos', 'geshido', 'addict', 'defy', 'tribute', 'elektro'],
  'tenaya': ['masai', 'inti', 'tarifa', 'ra', 'tata', 'oasi', 'india', 'mashu'],
  'mad-rock': ['mugen', 'shark', 'convict', 'fam', 'drone', 'redline', 'mad monkey', 'honey'],
};

interface ShoeImage {
  brand: string;
  model: string;
  url: string;
  localPath?: string;
  imageKitUrl?: string;
}

class ShoeImageUploader {
  private images: ShoeImage[] = [];
  private tempDir = './temp-images';

  constructor() {
    // Create temp directory
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.google.com',
        },
      });

      const filepath = path.join(this.tempDir, filename);
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filepath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download ${url}:`, error);
      return null;
    }
  }

  private async uploadToImageKit(filePath: string, brand: string, model: string): Promise<string | null> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = `${brand}-${model}-${Date.now()}.jpg`;
      
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: `gripkicks/imgs/shoes/${brand}`,
        tags: [brand, model, 'climbing-shoe'],
        useUniqueFileName: false,
      });

      return result.url;
    } catch (error) {
      console.error(`Failed to upload to ImageKit:`, error);
      return null;
    }
  }

  private async processBrand(brand: string): Promise<void> {
    console.log(`Processing ${brand}...`);
    const models = SHOE_MODELS[brand as keyof typeof SHOE_MODELS] || [];
    
    for (const model of models) {
      console.log(`  - ${model}`);
      
      // Try different image URL patterns
      const imagePatterns = [
        `https://via.placeholder.com/800x600/333333/ffffff?text=${brand}-${model}`, // Placeholder
        `https://cdn.shopify.com/s/files/1/0000/0000/files/${brand}-${model}`,
        `https://www.${brand.replace('-', '')}.com/images/${model}`,
      ];

      for (const url of imagePatterns) {
        const filename = `${brand}-${model}.jpg`;
        const localPath = await this.downloadImage(url, filename);
        
        if (localPath) {
          const imageKitUrl = await this.uploadToImageKit(localPath, brand, model);
          
          if (imageKitUrl) {
            this.images.push({
              brand,
              model,
              url,
              localPath,
              imageKitUrl,
            });
            
            console.log(`    ✓ Uploaded: ${imageKitUrl}`);
            break; // Success, move to next model
          }
        }
        
        // Clean up temp file
        if (localPath && fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
    }
  }

  async processAllBrands(): Promise<void> {
    console.log('Starting shoe image upload process...');
    
    for (const brand of Object.keys(BRAND_IMAGE_SOURCES)) {
      await this.processBrand(brand);
    }

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      totalImages: this.images.length,
      images: this.images,
    };

    fs.writeFileSync(
      path.join(this.tempDir, 'upload-results.json'),
      JSON.stringify(results, null, 2)
    );

    console.log(`\nComplete! Uploaded ${this.images.length} images to ImageKit.`);
    console.log(`Results saved to: ${path.join(this.tempDir, 'upload-results.json')}`);

    // Clean up temp directory
    fs.rmSync(this.tempDir, { recursive: true, force: true });
  }
}

// Alternative: Use stock image APIs
class StockImageFetcher {
  private readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  private readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  async fetchFromUnsplash(query: string, brand: string): Promise<string | null> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.log('Unsplash API key not provided');
      return null;
    }

    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: `${query} climbing shoe`,
          per_page: 1,
          orientation: 'landscape',
        },
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
        },
      });

      if (response.data.results.length > 0) {
        const photo = response.data.results[0];
        return photo.urls.regular;
      }
    } catch (error) {
      console.error('Unsplash API error:', error);
    }

    return null;
  }

  async fetchFromPexels(query: string, brand: string): Promise<string | null> {
    if (!this.PEXELS_API_KEY) {
      console.log('Pexels API key not provided');
      return null;
    }

    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: `${query} climbing shoe`,
          per_page: 1,
          orientation: 'landscape',
        },
        headers: {
          'Authorization': this.PEXELS_API_KEY,
        },
      });

      if (response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        return photo.src.large;
      }
    } catch (error) {
      console.error('Pexels API error:', error);
    }

    return null;
  }
}

// Run the uploader
if (require.main === module) {
  const uploader = new ShoeImageUploader();
  uploader.processAllBrands().catch(console.error);
}

export { ShoeImageUploader, StockImageFetcher };
