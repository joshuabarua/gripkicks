import Image from "next/image";
import brandLogos from "./brand-logos.json";

interface BrandLogoProps {
  brand: string;
  className?: string;
  size?: "sm" | "md";
}

const approvedBrandLogos: Record<string, keyof typeof brandLogos> = {
  "Scarpa": "scarpa.svg",
  "La Sportiva": "la_sportiva.svg",
  "Five Ten": "five_ten.png",
  "Evolv": "evolv.png",
  "Butora": "butora.png",
  "Mad Rock": "mad_rock.png",
  "Black Diamond": "black_diamond.svg",
  "Ocun": "ocun.png",
  "Red Chili": "red_chili.svg",
  "So iLL": "so_ill.png",
  "Tenaya": "tenaya.svg",
  "Unparallel": "unparallel.png",
  "Edelrid": "edelrid.svg",
  "Salewa": "salewa.svg",
  "Zamberlan": "zamberlan.svg",
  "Boreal": "boreal.png",
  "Rock Pillars": "rock_pillars.png",
  "Simond": "simond.svg",
};

const normalizedBrandLogos = Object.fromEntries(
  Object.entries(approvedBrandLogos).map(([brand, logo]) => [brand.toLowerCase(), brandLogos[logo]]),
);

export function BrandLogo({ brand, className = "", size = "md" }: BrandLogoProps) {
  const logo = normalizedBrandLogos[brand.trim().toLowerCase()];

  if (!logo) {
    return (
      <span className={`uppercase leading-none text-brand-chalk ${size === "sm" ? "truncate font-mono text-[10px] font-semibold tracking-[0.16em]" : "font-ball-pill text-fluid-3xl"} ${className}`}>
        {brand}
      </span>
    );
  }

  return (
    <span title={brand} className={`relative block shrink-0 ${size === "sm" ? "h-5 w-20" : "h-9 w-[min(42vw,11rem)]"} ${className}`}>
      <Image
        src={logo}
        alt={`${brand} logo`}
        fill
        unoptimized
        sizes={size === "sm" ? "80px" : "176px"}
        className="object-contain object-left brightness-0 invert"
      />
    </span>
  );
}
