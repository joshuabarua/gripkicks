const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://grip-kicks.com",
  "https://www.grip-kicks.com",
];

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

export const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  const origins =
    configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ORIGINS;

  return Array.from(new Set(origins));
};
