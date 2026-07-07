import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Enables React's <ViewTransition> + auto-triggers it on App Router
    // navigations. Used for the "Porcelain Motion" route cross-fade. Graceful
    // fallback: unsupported browsers just swap without animating.
    viewTransition: true,
  },
};

export default nextConfig;
