import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async redirects() {
    return [
      {
        source: "/dant-ky",
        destination: "/dang-ky",
        permanent: true,
      },
      {
        source: "/dant-nhap",
        destination: "/dang-nhap",
        permanent: true,
      },
    ];
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