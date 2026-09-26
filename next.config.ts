import type { NextConfig } from "next";

// The app is deployed as a fully static site to GitHub Pages, which serves it
// from a subpath (https://<user>.github.io/<repo>/). The base path is supplied
// at build time via NEXT_PUBLIC_BASE_PATH (set by the deploy workflow) and is
// empty locally so `npm run dev` keeps working at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // GitHub Pages serves a directory's index.html, so emit /route/index.html.
  trailingSlash: true,
  // No image optimization server on a static host.
  images: { unoptimized: true },
};

export default nextConfig;
