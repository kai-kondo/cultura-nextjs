import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Turbopack の独自キー `turbo` は無効です。Protocol 風プレフィックスの解決は
  // webpack の alias で対応します（Turbopack でも互換あり）。
  webpack: (config) => {
    // 例: import img from "figma:asset/hero.png" を public/assets/hero.png に解決
    config.resolve.alias["figma:asset"] = path.resolve(__dirname, "public/assets");
    return config;
  },
  // 必要なら、Turbopack 専用オプションは `turbopack` キー配下に書きます。
  // 例: ルート明示（複数 lockfile 警告の抑制）
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
