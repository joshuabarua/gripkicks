# Shoe Scripts

This directory contains essential scripts for managing shoe data and images in the Gripkicks application.

## Available Scripts

### 1. Advanced Shoe Scraper (`advanced-shoe-scraper.ts`)
A comprehensive scraper for collecting shoe data from various retailers and brand websites.

### 2. La Sportiva Complete Scraper (`la-sportiva-complete-scraper.ts`)
Specialized scraper for La Sportiva shoes with detailed data extraction.

### 3. Shoe Image Scraper (`scrape-shoe-images.ts`)
Downloads and optimizes shoe images from various sources.

### 4. Upload Shoe Images (`upload-shoe-images.ts`)
Uploads processed images to ImageKit CDN.

### 5. Add Missing La Sportiva (`add-missing-la-sportiva.ts`)
Utility script to add missing La Sportiva models to the database.

## Installation

```bash
cd scripts
npm install
```

## Usage

Each script can be run individually:

```bash
# Run the advanced shoe scraper
npx ts-node advanced-shoe-scraper.ts

# Run the La Sportiva scraper
npx ts-node la-sportiva-complete-scraper.ts

# Scrape images
npx ts-node scrape-shoe-images.ts

# Upload images to CDN
npx ts-node upload-shoe-images.ts
```

## Docker Support

A Dockerfile is included for containerized execution:

```bash
docker build -t shoe-scripts .
docker run shoe-scripts
```

## Configuration

Edit environment variables in `.env` file:
- Database connection strings
- ImageKit credentials
- API keys for various retailers

## Legal Considerations

⚠️ **Important**: Always check terms of service before scraping:
1. Respect robots.txt files
2. Implement rate limiting
3. Follow API usage guidelines
4. Consider copyright implications

## Output

Scripts typically generate:
- JSON files with scraped data
- Organized image directories
- Upload reports and logs
