import { IKUpload } from "imagekitio-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ShoeImageUploadProps {
  brand: string;
  shoeName: string;
  onUploadSuccess: (url: string) => void;
  onError?: (error: unknown) => void;
  className?: string;
}

const ShoeImageUpload: React.FC<ShoeImageUploadProps> = ({
  brand,
  shoeName,
  onUploadSuccess,
  onError,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Normalize brand and shoe name for folder structure
  const normalizeBrand = (brand: string): string => {
    return brand
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const normalizeShoeName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const normalizedBrand = normalizeBrand(brand);
  const normalizedShoeName = normalizeShoeName(shoeName);
  
  // Generate the folder path
  const folderPath = `gripkicks/imgs/shoes/${normalizedBrand}`;
  
  // Generate filename
  const fileName = `${normalizedShoeName}-${Date.now()}`;

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadedUrl(null);
  };

  const handleUploadSuccess = (response: { url?: string; filePath?: string }) => {
    setIsUploading(false);
    const url = response.url || response.filePath || "";
    setUploadedUrl(url || null);
    onUploadSuccess(url);
  };

  const handleUploadError = (error: unknown) => {
    setIsUploading(false);
    console.error("Upload error:", error);
    onError?.(error);
  };

  const handleRemoveImage = () => {
    setUploadedUrl(null);
    onUploadSuccess("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedUrl ? (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // IKUpload doesn't support direct ref access
                // The component will handle the upload automatically
                console.log('File selected:', file);
              }
            }}
          />
          
          <IKUpload
            fileName={fileName}
            folder={folderPath}
            useUniqueFileName={false}
            isPrivateFile={false}
            onResponse={handleUploadSuccess}
            onError={handleUploadError}
            onStart={handleUploadStart}
            tags={[brand, shoeName]}
            customMetadata={{
              brand,
              shoeName,
              uploadedAt: new Date().toISOString(),
            }}
            style={{ display: 'none' }}
            id={`ik-upload-${brand}-${shoeName}`}
          />
          
          <div className="space-y-4">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-sm text-gray-300">Upload shoe image</p>
              <p className="text-xs text-gray-500">
                Will be saved to: {folderPath}/{fileName}.jpg
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => uploadRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedUrl}
            alt={`${brand} ${shoeName}`}
            className="w-full h-48 object-cover rounded-lg"
            // ImageKit handles optimization automatically, so img is acceptable
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShoeImageUpload;
