import { DashboardOverview } from "@/app/dashboard/DashboardPage";
import type { UserShoe } from "@/types/api";
import images from "../../../../../../data/shoe-images.json";

export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const userShoes: UserShoe[] = ([["Boreal", "Dharma"], ["Scarpa", "Drago LV"], ["Mad Rock", "Drone"]] as const).map(([brand, name], index) => {
    const imageUrl = images.find((image) => image.brand === brand && image.name === name)?.imageUrl;
    return { _id: `preview-${index}`, shoeId: `shoe-${index}`, shoe: { _id: `shoe-${index}`, brand, name, imageUrl, aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low" }, size: "EU 40", ...(index < 2 ? { comfortScore: index ? 6 : 8 } : {}), isFavourite: index === 0 };
  });
  return <DashboardOverview firstName="Josh" userShoes={state === "empty" || state === "profile" ? [] : userShoes} footProfile={state === "profile" ? null : { shape: "Egyptian", volume: "Low" }} isLoading={state === "loading"} />;
}
