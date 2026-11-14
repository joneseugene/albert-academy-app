import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Image uploads go through a server action: images ≤ 5 MB (checked again on the server).
      bodySizeLimit: "6mb",
    },
  },
  logging: {
    // Dev logs print server action arguments verbatim — that includes passwords
    // from sign-in and user forms. Keep them out of the terminal.
    serverFunctions: false,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
