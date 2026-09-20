function clampScore(value: number) {
  return Math.max(1, Math.min(10, Number(value.toFixed(1))));
}

function getSoleThickness(sole?: string) {
  const match = sole?.match(/(\d+(?:\.\d+)?)\s*mm/i);
  return match?.[1] ? Number(match[1]) : undefined;
}

export function calculateEnrichmentScores(
  shoe: {
    aggressiveness: string;
    stiffness: string;
    climbingDiscipline: string;
  },
  specs: {
    closure?: string;
    upper?: string;
    lining?: string;
    midsole?: string;
    sole?: string;
    weight?: string;
    sensitivity?: string;
    rigidity?: string;
  },
) {
  const aggressiveness = shoe.aggressiveness.toLowerCase();
  const stiffness = shoe.stiffness.toLowerCase();
  const discipline = shoe.climbingDiscipline.toLowerCase();
  const thickness = getSoleThickness(specs.sole);
  let comfort = aggressiveness === "aggressive" ? 4 : aggressiveness === "moderate" ? 6 : 7;
  let performance = aggressiveness === "aggressive" ? 8 : aggressiveness === "moderate" ? 6 : 5;
  let durability = 5;

  if (discipline === "competition") {
    comfort -= 1;
    performance += 2;
  } else if (discipline === "bouldering") {
    comfort += 0.5;
    performance += 0.5;
  } else if (discipline === "sport") {
    performance += 1;
    durability -= 0.5;
  } else if (discipline === "trad") {
    comfort += 1;
    performance -= 0.5;
    durability += 1;
  } else if (discipline === "gym") {
    comfort += 0.5;
    durability -= 0.5;
  }

  if (stiffness === "soft") {
    comfort += 1;
    performance -= 0.5;
  } else if (stiffness === "stiff") {
    comfort -= 0.5;
    performance += 1;
    durability += 0.5;
  }

  if (thickness !== undefined) {
    if (thickness <= 3) durability -= 0.5;
    if (thickness >= 4.5) durability += 0.5;
  }

  const stiffnessScore = stiffness === "soft" ? 3 : stiffness === "stiff" ? 8 : 5.5;
  const aggressionScore = aggressiveness === "aggressive" ? 9 : aggressiveness === "moderate" ? 6 : 3;
  const sensitivity = thickness !== undefined
    ? 10 - Math.min(7, thickness * 1.4) + (stiffness === "soft" ? 1 : 0)
    : 10 - stiffnessScore;

  return {
    comfort: clampScore(comfort),
    performance: clampScore(performance),
    durability: clampScore(durability),
    sensitivity: clampScore(sensitivity),
    edging: clampScore(stiffnessScore * 0.7 + aggressionScore * 0.3),
    smearing: clampScore((10 - stiffnessScore) * 0.65 + (10 - aggressionScore) * 0.35),
    toeHooking: clampScore(aggressionScore * 0.75 + (stiffness === "soft" ? 2 : 1)),
    heelHooking: clampScore(aggressionScore * 0.7 + performance * 0.3),
  };
}
