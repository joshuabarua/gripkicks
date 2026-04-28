import { compat } from "../../eslint-base.config.mjs";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/", "node_modules/", "*.config.*"],
  },
];

export default eslintConfig;
