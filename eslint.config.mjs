import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundaries: vendors stay behind the backend abstraction.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/adapters/**", "src/server/backend.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/*"],
              message:
                "Supabase is only allowed in src/server/adapters/supabase. Use services / backend from src/server.",
            },
            {
              group: ["@/server/adapters/*", "**/server/adapters/*"],
              message: "Import `backend` from @/server/backend instead of a specific adapter.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
