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
        source: '/add-listing/:step(\\d+)',
        destination: '/onboarding/church/:step',
        permanent: false,
      },
    ];

  },
};

export default nextConfig;
