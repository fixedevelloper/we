import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Sous-ensemble sûr d'une CSP : n'interdit ni scripts ni styles existants (Google Maps, SweetAlert…).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
];

const nextConfig : NextConfig = {
  /* config options here */
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.IMAGE_HOST || "localhost", // hôte du stockage d'images (liens signés), à renseigner en production
        pathname: "/**",
      },
    ],
  },
  sassOptions: {
    includePaths: ['src'],
  },
};

export default nextConfig;
