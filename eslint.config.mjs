import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    ".pages/**",
    "test-results/**",
    "build/**",
    "next-env.d.ts",
    // Hand-written service worker, served statically.
    "public/**",
  ]),
]);

export default eslintConfig;
