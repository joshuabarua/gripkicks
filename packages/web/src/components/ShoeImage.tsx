import { IKImage } from "imagekitio-react";
import { useState, useEffect } from "react";
import type { Transformation } from "imagekit-javascript/dist/src/interfaces/Transformation";

interface ShoeImageProps {
  brand: string;
  shoeName?: string;
  imageUrl?: string;
  className?: string;
  transformation?: Transformation[];
  fallbackImage?: string;
  gender?: "men" | "women" | "kids" | "unisex";
  slug?: string;
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
  className = "object-contain",
  transformation = [
    {
      height: 200,
      width: 200,
      crop: "at_max",
      cropMode: "pad_resize",
      format: "png",
      quality: 80
    }
  ],
  fallbackImage = "/imgs/placeholder_shoe.png",
  gender,
  slug,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setLoadingTimeout(false);
  }, [imageUrl, brand, shoeName, slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) {
        setLoadingTimeout(true);
        setImageLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [imageLoading, imageUrl, brand, shoeName, slug]);

  // Normalize brand name for folder structure (underscores)
  const normalizeBrand = (brand: string): string => {
    return brand
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const generateImagePath = (): string => {
    const normalizedBrand = normalizeBrand(brand);

    if (imageUrl) {
      if (imageUrl.startsWith('https://ik.imagekit.io/')) {
        const url = new URL(imageUrl);
        let path = url.pathname;
        path = path.substring(1);
        if (path.startsWith('ie871bk0r/')) {
          path = path.substring('ie871bk0r/'.length);
        }
        return path;
      }
      if (!imageUrl.startsWith('http') && !imageUrl.includes('://')) {
        let path = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        if (path.startsWith('ie871bk0r/')) {
          path = path.substring('ie871bk0r/'.length);
        }
        return path;
      }
      return imageUrl;
    }

    if (slug) {
      let normalizedSlug = slug.trim().replace(/\\/g, "/");
      normalizedSlug = normalizedSlug.replace(/^gripkicks\/imgs\/shoes\//, "");
      normalizedSlug = normalizedSlug.replace(/^\/+/, "");
      if (normalizedSlug.endsWith(".png")) {
        normalizedSlug = normalizedSlug.slice(0, -4);
      }

      const slugParts = normalizedSlug.split("/").filter(Boolean);
      if (slugParts.length > 0) {
        slugParts[0] = normalizeBrand(slugParts[0]);
        normalizedSlug = slugParts.join("/");
      }

      if (/_([mwku])$/.test(normalizedSlug)) {
        normalizedSlug = `${normalizedSlug}1`;
      }

      return `gripkicks/imgs/shoes/${normalizedSlug}.png`;
    }

    if (shoeName) {
      const normalizedName = shoeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      // Use gender to determine the suffix
      let genderSuffix = 'm1'; // default to men
      if (gender === 'women') genderSuffix = 'w1';
      else if (gender === 'kids') genderSuffix = 'k1';
      else if (gender === 'unisex') genderSuffix = 'u1';

      return `gripkicks/imgs/shoes/${normalizedBrand}/${normalizedName}_${genderSuffix}.png`;
    }

    return `gripkicks/imgs/shoes/${normalizedBrand}/default.png`;
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

  // If image failed to load or timed out, show fallback
  if (imageError || loadingTimeout) {
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
    <div className={`relative w-full h-full ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
      <IKImage
        path={imagePath}
        transformation={transformation}
        className={`w-full h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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
