import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let customSupabaseHost = "";
let customSupabaseProto: "http" | "https" = "https";

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    customSupabaseHost = parsed.hostname;
    customSupabaseProto = parsed.protocol.replace(":", "") as "http" | "https";
  } catch {
    // ignore parse error if malformed
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      ...(customSupabaseHost
        ? [
            {
              protocol: customSupabaseProto,
              hostname: customSupabaseHost,
            },
          ]
        : []),
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
