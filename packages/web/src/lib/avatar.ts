type AvatarIdentity = {
  userId?: string | null | undefined;
  email?: string | null | undefined;
  name?: string | null | undefined;
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
  return email || userId || "gripkicks";
};

export const getDicebearAvatarUrl = (identity: AvatarIdentity, size = 128) => {
  const seed = getAvatarSeed(identity);
  const index = hashString(seed) % BRAND_BACKGROUNDS.length;
  const backgroundColor = BRAND_BACKGROUNDS[index] || BRAND_BACKGROUNDS[0] || "f97316";
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
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return `${first}${second}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};
