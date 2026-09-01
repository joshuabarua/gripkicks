import Image from "next/image";

interface BrandLogoProps {
  brand: string;
  className?: string;
}

const approvedBrandLogos: Record<string, string> = {};

export function BrandLogo({ brand, className = "" }: BrandLogoProps) {
  const logo = approvedBrandLogos[brand];

  if (!logo) {
    return (
      <span className={`font-so-cloudy text-fluid-3xl uppercase leading-none text-brand-chalk ${className}`}>
        {brand}
      </span>
    );
  }

  return (
    <span className={`relative block h-9 w-[min(42vw,11rem)] ${className}`}>
      <Image
        src={logo}
        alt={`${brand} logo`}
        fill
        sizes="176px"
        className="object-contain object-left brightness-0 invert"
      />
    </span>
  );
}
