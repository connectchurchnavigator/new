import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: '/onboarding/church',
        destination: '/add-listing/1',
        permanent: false,
      },
      {
        source: '/onboarding/church/:step',
        destination: '/add-listing/:step',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
