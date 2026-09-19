import type { NextConfig } from "next";
import path from "path";

const upstreamTarget = (
  process.env.API_UPSTREAM_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://cybercore-backend-cprt.onrender.com"
    : "http://127.0.0.1:8000")
).replace(/\/+$/, "").replace(/\/api\/v1$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "127.0.0.1:3000",
    "localhost",
    "localhost:3000",
    "*.trycloudflare.com",
    "reflects-self-relation-tigers.trycloudflare.com",
    "*.loca.lt"
  ],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${upstreamTarget}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
