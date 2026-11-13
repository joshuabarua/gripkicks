import { IKImage } from "imagekitio-react";
import { useState, useEffect } from "react";
import type { Transformation } from "imagekit-javascript/dist/src/interfaces/Transformation";


type ImageContext = 'thumbnail' | 'preview' | 'modal';

interface ShoeImageProps {
  brand: string;
  shoeName?: string;
  imageUrl?: string | undefined;
  className?: string;
  transformation?: Transformation[];
  fallbackImage?: string;
  gender?: "men" | "women" | "kids" | "unisex" | undefined;
  slug?: string | undefined;
  context?: ImageContext;
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
  transformation,
  fallbackImage = "/imgs/placeholder_shoe.png",
  context = 'preview',
  slug,
  ...props
}) => {
  // Get optimal image dimensions based on context
  const getOptimalTransformation = (context: ImageContext): Transformation[] => {
    if (transformation) return transformation;

    switch (context) {
      case 'thumbnail':
        return [
          {
            height: 48,
            width: 48,
            crop: "at_max",
            cropMode: "pad_resize",
            format: "png",
            quality: 75
          }
        ];
      case 'modal':
        return [
          {
            height: 400,
            width: 400,
            crop: "at_max",
            cropMode: "pad_resize",
            format: "png",
            quality: 85
          }
        ];
      default: // preview
        return [
          {
            height: 200,
            width: 200,
            crop: "at_max",
            cropMode: "pad_resize",
            format: "png",
            quality: 80
          }
        ];
    }
  };

  const optimizedTransformation = getOptimalTransformation(context);
  const imageKey = `${imageUrl ?? ""}:${brand}:${shoeName ?? ""}:${slug ?? ""}`;
  const [imageState, setImageState] = useState({
    key: imageKey,
    error: false,
    loading: true,
    timedOut: false,
  });
  const currentImageState = imageState.key === imageKey
    ? imageState
    : { key: imageKey, error: false, loading: true, timedOut: false };
  const { error: imageError, loading: imageLoading, timedOut: loadingTimeout } = currentImageState;

  if (imageState.key !== imageKey) {
    setImageState(currentImageState);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setImageState((current) => current.key === imageKey && current.loading
        ? { ...current, timedOut: true }
        : current);
    }, 5000);
    return () => clearTimeout(timer);
  }, [imageKey]);

  // Normalize brand name for folder structure (underscores)
  const normalizeBrand = (brand: string): string => {
    return brand
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const generateImagePath = (): string => {
    if (imageUrl) {
      if (imageUrl.startsWith('https://ik.imagekit.io/')) {
        const url = new URL(imageUrl);
        let path = url.pathname;
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        // Remove the ImageKit ID prefix if present
        if (path.startsWith('ie871bk0r/')) {
          path = path.substring('ie871bk0r/'.length);
        }
        return path;
      }
      return imageUrl;
    }

    if (slug) {
      return `gripkicks/imgs/shoes/${slug}.png`;
    }

    return `gripkicks/imgs/shoes/${normalizeBrand(brand)}/default.png`;
  };

  const imagePath = generateImagePath();

  // Handle image error
  const handleError = () => {
    setImageState((current) => current.key === imageKey
      ? { ...current, error: true, loading: false }
      : current);
  };

  // Handle image load
  const handleLoad = () => {
    setImageState((current) => current.key === imageKey
      ? { ...current, loading: false, timedOut: false }
      : current);
  };

  // If image failed to load or timed out, show fallback
  const fallback = (
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

  if (imageError) return fallback;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loadingTimeout && <div className="absolute inset-0">{fallback}</div>}
      {imageLoading && !loadingTimeout && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/imgs/default_shoe.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full animate-pulse object-contain p-6 invert opacity-40"
          />
        </div>
      )}
      <IKImage
        path={imagePath}
        transformation={optimizedTransformation}
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
