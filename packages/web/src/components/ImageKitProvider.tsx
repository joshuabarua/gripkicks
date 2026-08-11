import { IKContext } from "imagekitio-react";

interface ImageKitProviderProps {
  children: React.ReactNode;
}

const ImageKitProvider: React.FC<ImageKitProviderProps> = ({ children }) => {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const authenticationEndpoint = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/imagekit`;

  if (!publicKey || !urlEndpoint) {
    console.warn("ImageKit env vars missing; rendering without ImageKit context");
    return <>{children}</>;
  }

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
