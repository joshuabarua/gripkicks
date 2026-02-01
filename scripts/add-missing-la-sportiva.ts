import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const client = new ConvexClient("https://peaceful-marten-189.convex.cloud");

// La Sportiva shoes to add/verify
const shoesToAdd = [
  // aragon - m / w (uncertain if exists)
  { name: "Aragon", gender: "men", aggressiveness: "moderate", climbingDiscipline: "sport", stiffness: "medium", volume: "medium" },
  { name: "Aragon", gender: "women", aggressiveness: "moderate", climbingDiscipline: "sport", stiffness: "medium", volume: "medium" },
  
  // finale_laced - m/w
  { name: "Finale", gender: "men", aggressiveness: "flat", climbingDiscipline: "trad", stiffness: "medium", volume: "low" },
  { name: "Finale", gender: "women", aggressiveness: "flat", climbingDiscipline: "trad", stiffness: "medium", volume: "low" },
  
  // genius (already exists, no gender specified)
  { name: "Genius", gender: "men", aggressiveness: "aggressive", climbingDiscipline: "sport", stiffness: "soft", volume: "low" },
  { name: "Genius", gender: "women", aggressiveness: "aggressive", climbingDiscipline: "sport", stiffness: "soft", volume: "low" },
  
  // kubo - m/w
  { name: "Kubo", gender: "men", aggressiveness: "moderate", climbingDiscipline: "gym", stiffness: "medium", volume: "medium" },
  { name: "Kubo", gender: "women", aggressiveness: "moderate", climbingDiscipline: "gym", stiffness: "medium", volume: "medium" },
  
  // mandala - m
  { name: "Mandala", gender: "men", aggressiveness: "aggressive", climbingDiscipline: "bouldering", stiffness: "soft", volume: "medium" },
  
  // mistral - m/w
  { name: "Mistral", gender: "men", aggressiveness: "moderate", climbingDiscipline: "sport", stiffness: "medium", volume: "medium" },
  { name: "Mistral", gender: "women", aggressiveness: "moderate", climbingDiscipline: "sport", stiffness: "medium", volume: "medium" },
  
  // mythos eco - m/w
  { name: "Mythos Eco", gender: "men", aggressiveness: "flat", climbingDiscipline: "trad", stiffness: "medium", volume: "low" },
  { name: "Mythos Eco", gender: "women", aggressiveness: "flat", climbingDiscipline: "trad", stiffness: "medium", volume: "low" },
  
  // ondra-comp (uncertain)
  { name: "Ondra Comp", gender: "men", aggressiveness: "aggressive", climbingDiscipline: "competition", stiffness: "soft", volume: "high" },
  { name: "Ondra Comp", gender: "women", aggressiveness: "aggressive", climbingDiscipline: "competition", stiffness: "soft", volume: "high" },
  
  // skwama vegan - m/w
  { name: "Skwama Vegan", gender: "men", aggressiveness: "aggressive", climbingDiscipline: "bouldering", stiffness: "soft", volume: "medium" },
  { name: "Skwama Vegan", gender: "women", aggressiveness: "aggressive", climbingDiscipline: "bouldering", stiffness: "soft", volume: "medium" },
  
  // stickit - k
  { name: "Stickit", gender: "kids", aggressiveness: "flat", climbingDiscipline: "gym", stiffness: "soft", volume: "low" },
  
  // tarantula boulder - m/w/k
  { name: "Tarantula Boulder", gender: "men", aggressiveness: "flat", climbingDiscipline: "bouldering", stiffness: "medium", volume: "low" },
  { name: "Tarantula Boulder", gender: "women", aggressiveness: "flat", climbingDiscipline: "bouldering", stiffness: "medium", volume: "low" },
  { name: "Tarantula Boulder", gender: "kids", aggressiveness: "flat", climbingDiscipline: "bouldering", stiffness: "soft", volume: "low" },
  
  // taranulace - m/w
  { name: "Tarantulace", gender: "men", aggressiveness: "flat", climbingDiscipline: "gym", stiffness: "medium", volume: "low" },
  { name: "Tarantulace", gender: "women", aggressiveness: "flat", climbingDiscipline: "gym", stiffness: "medium", volume: "low" },
  
  // veloce - m/w
  { name: "Veloce", gender: "men", aggressiveness: "flat", climbingDiscipline: "gym", stiffness: "medium", volume: "high" },
  { name: "Veloce", gender: "women", aggressiveness: "flat", climbingDiscipline: "gym", stiffness: "medium", volume: "high" },
];

async function addMissingShoes() {
  console.log("Checking and adding missing La Sportiva shoes...\n");
  
  // Get existing shoes
  const existingShoes = await client.query(api.shoes.list, {});
  const existingLaSportiva = existingShoes.filter(shoe => shoe.brand === "La Sportiva");
  
  console.log(`Found ${existingLaSportiva.length} La Sportiva shoes in database:`);
  existingLaSportiva.forEach(shoe => {
    console.log(`  - ${shoe.name}`);
  });
  
  console.log("\nAdding missing shoes...");
  
  for (const shoe of shoesToAdd) {
    // Check if already exists
    const exists = existingLaSportiva.some(existing => 
      existing.name.toLowerCase() === shoe.name.toLowerCase()
    );
    
    if (!exists) {
      try {
        const result = await client.mutation(api.shoes.create, {
          brand: "La Sportiva",
          name: shoe.name,
          aggressiveness: shoe.aggressiveness,
          stiffness: shoe.stiffness,
          climbingDiscipline: shoe.climbingDiscipline,
          volume: shoe.volume,
        });
        
        console.log(`✓ Added: ${shoe.name} (${shoe.gender})`);
      } catch (error) {
        console.log(`✗ Failed to add ${shoe.name} (${shoe.gender}): ${error}`);
      }
    } else {
      console.log(`- Already exists: ${shoe.name}`);
    }
  }
  
  console.log("\nDone!");
}

addMissingShoes().catch(console.error);
