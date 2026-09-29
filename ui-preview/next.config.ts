import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  allowedDevOrigins: [
    "localhost:3001",
    "127.0.0.1:3001",
    "localhost:3000",
    "127.0.0.1:3000",
    "*.trycloudflare.com",
    "reflects-self-relation-tigers.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;