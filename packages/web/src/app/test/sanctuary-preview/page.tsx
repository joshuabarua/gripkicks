"use client";

import { useState } from "react";
import CloudShoe from "@/components/CloudShoe";
import type { UserShoe } from "@/types/api";
import images from "../../../../../../data/shoe-images.json";

const initialShoes: UserShoe[] = ([["Boreal", "Dharma"], ["Scarpa", "Drago LV"], ["Mad Rock", "Drone"]] as const).map(([brand, name], index) => {
  const imageUrl = images.find((image) => image.brand === brand && image.name === name)?.imageUrl;
  return {
    _id: `preview-${index}`,
    shoeId: `shoe-${index}`,
    shoe: { _id: `shoe-${index}`, brand, name, ...(imageUrl ? { imageUrl } : {}), aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low" },
    ...(index === 0 ? { size: "EU 40", comfortScore: 8 } : {}),
    isFavourite: index === 0,
  };
});

export default function Page() {
  const [shoes, setShoes] = useState(initialShoes);
  const [expandedId, setExpandedId] = useState<string | null>(initialShoes[0]?._id ?? null);
  const update = (id: string, fields: Partial<UserShoe>) => setShoes((current) => current.map((shoe) => (shoe._id === id ? { ...shoe, ...fields } : shoe)));

  return (
    <main className="min-h-svh bg-brand-base p-fluid-lg">
      <div className="mx-auto grid max-w-[1600px] gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shoes.map((shoe) => (
          <CloudShoe
            key={shoe._id}
            shoe={shoe}
            expanded={expandedId === shoe._id}
            onToggleExpand={() => setExpandedId((current) => (current === shoe._id ? null : shoe._id))}
            onToggleFavourite={() => update(shoe._id, { isFavourite: !shoe.isFavourite })}
            onRemove={() => undefined}
            onRate={(field, value) => update(shoe._id, { [field]: value })}
            onUpdateDetails={(fields) => update(shoe._id, fields)}
          />
        ))}
      </div>
    </main>
  );
}
