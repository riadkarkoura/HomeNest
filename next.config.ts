import type { NextConfig } from "next";

// Derived from env (not hardcoded) so a different linked Supabase project
// (staging, a future environment) doesn't silently break product image
// rendering — see migration 007 / the `products` Storage bucket.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
