import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to `out/`.
  // Deploys as-is to Vercel, GitHub Pages or any static host.
  output: "export",
  // `/work/slug/` -> `/work/slug/index.html`, which every static host resolves.
  trailingSlash: true,
  // Images are pre-optimised by `npm run media` (AVIF/WebP/JPEG), so no runtime optimiser is needed.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
