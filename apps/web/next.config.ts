import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@figame/template-system", "@figame/sandpack-runtime"],
};

export default nextConfig;
