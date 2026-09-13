import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "reflects-self-relation-tigers.trycloudflare.com",
    "*.loca.lt"
  ],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${(process.env.API_UPSTREAM_URL || "http://127.0.0.1:8000").replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
