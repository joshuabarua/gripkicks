type AvatarIdentity = {
  userId?: string | null;
  email?: string | null;
  name?: string | null;
};

const BRAND_BACKGROUNDS = ["f97316", "ea580c", "f8433a"];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getAvatarSeed = ({ userId, email }: AvatarIdentity) => {
  return userId || email || "gripkicks";
};

export const getAvatarBackground = (seed: string) => {
  const index = hashString(seed) % BRAND_BACKGROUNDS.length;
  return BRAND_BACKGROUNDS[index];
};

export const getDicebearAvatarUrl = (identity: AvatarIdentity, size = 128) => {
  const seed = getAvatarSeed(identity);
  const backgroundColor = getAvatarBackground(seed);
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    radius: "50",
    size: String(size),
  });

  return `https://api.dicebear.com/9.x/avataaars-neutral/svg?${params.toString()}`;
};

export const getInitials = ({ name, email }: AvatarIdentity) => {
  const source = name?.trim() || email?.trim() || "GK";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};
