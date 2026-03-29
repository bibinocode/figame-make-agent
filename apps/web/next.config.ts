import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
        source: "/(.*)",
      },
    ];
  },
  transpilePackages: [
    "@figame/template-system",
    "@figame/webcontainer-runtime",
  ],
};

export default nextConfig;
