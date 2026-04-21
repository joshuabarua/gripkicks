import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/convex/_generated/**",
      "**/next-env.d.ts",
      "packages/app/**",
      "packages/backend-api/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
    ...config,
    files: ["packages/web/**/*.{ts,tsx,js,jsx}"],
    settings: {
      ...(config.settings ?? {}),
      next: { rootDir: "packages/web" },
    },
  })),
];

export default eslintConfig;
