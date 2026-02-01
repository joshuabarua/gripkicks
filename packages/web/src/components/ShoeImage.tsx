import { IKImage } from "imagekitio-react";
import { useState } from "react";
import type { Transformation } from "imagekit-javascript/dist/src/interfaces/Transformation";

interface ShoeImageProps {
  brand: string;
  shoeName?: string;
  imageUrl?: string;
  className?: string;
  transformation?: Transformation[];
  fallbackImage?: string;
  // Common IKImage props
  alt?: string;
  loading?: "lazy";
  lqip?: { active?: boolean; quality?: number; raw?: string; threshold?: number; blur?: number };
  polling?: number;
  queryParameters?: Record<string, string | number>;
}

const ShoeImage: React.FC<ShoeImageProps> = ({
  brand,
  shoeName,
  imageUrl,
  className = "",
  transformation = [
    {
      height: 300,
      width: 400,
      format: "auto",
      quality: 80
    }
  ],
  fallbackImage = "/placeholder-shoe.svg",
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Normalize brand name for folder structure (underscores)
  const normalizeBrand = (brand: string): string => {
    return brand
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  // Generate possible image paths
  const generateImagePath = (): string => {
    const normalizedBrand = normalizeBrand(brand);
    
    // If we have an imageUrl from the database, use it
    if (imageUrl) {
      // If it's already a full ImageKit URL, extract the path after the domain
      if (imageUrl.startsWith('https://ik.imagekit.io/')) {
        const url = new URL(imageUrl);
        let path = url.pathname;
        // Remove leading slash and any ID prefix
        path = path.substring(1); // Remove leading /
        if (path.startsWith('ie871bk0r/')) {
          path = path.substring('ie871bk0r/'.length);
        }
        return path;
      }
      // If it's already just a path (no domain), use as is
      if (!imageUrl.startsWith('http') && !imageUrl.includes('://')) {
        let path = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        // Remove ID prefix if present
        if (path.startsWith('ie871bk0r/')) {
          path = path.substring('ie871bk0r/'.length);
        }
        return path;
      }
      // If it's some other format, treat it as a path
      return imageUrl;
    }
    
    // Default path structure: gripkicks/imgs/shoes/{brand}/{shoe-name}
    if (shoeName) {
      const normalizedName = shoeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return `gripkicks/imgs/shoes/${normalizedBrand}/${normalizedName}.jpg`;
    }
    
    // Fallback to brand folder
    return `gripkicks/imgs/shoes/${normalizedBrand}/default.jpg`;
  };

  const imagePath = generateImagePath();

  // Handle image error
  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Handle image load
  const handleLoad = () => {
    setImageLoading(false);
  };

  // If image failed to load, show fallback
  if (imageError) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={fallbackImage} 
          alt={`${brand} ${shoeName || ''}`}
          className="w-full h-full"
          onError={(e) => {
            // If fallback also fails, show inline SVG placeholder
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3E${encodeURIComponent(brand)}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
      <IKImage
        path={imagePath}
        transformation={transformation}
        className={`w-full h-full ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        alt={`${brand} ${shoeName || ''}`}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ShoeImage;
