import { IKContext } from "imagekitio-react";

interface ImageKitProviderProps {
  children: React.ReactNode;
}

const ImageKitProvider: React.FC<ImageKitProviderProps> = ({ children }) => {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_pQA0HTNiRRSN1Rut2M2i9nr0eZ4=";
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ie871bk0r";
  const authenticationEndpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/imagekit`;

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      transformationPosition="path"
      authenticationEndpoint={authenticationEndpoint}
    >
      {children}
    </IKContext>
  );
};

export default ImageKitProvider;
