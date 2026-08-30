import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const webFiles = ["packages/web/**/*.{ts,tsx,js,jsx}"];
const withWebScope = (config) => ({
  ...config,
  files: webFiles,
  settings: {
    ...(config.settings ?? {}),
    next: { rootDir: "packages/web" },
  },
});

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
  ...nextCoreWebVitals.map(withWebScope),
  ...nextTypeScript.map(withWebScope),
];

export default eslintConfig;
