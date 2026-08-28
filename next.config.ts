import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (CV text extraction for the match-score feature) pulls in
  // pdfjs-dist, which resolves its worker script by an on-disk relative
  // path at runtime — bundling it mangles that path. Keeping it external
  // means Node requires it straight from node_modules instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
