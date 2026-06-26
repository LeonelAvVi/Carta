/** @type {import('next').NextConfig} */
const serverActionOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(serverActionOrigins?.length
    ? {
        experimental: {
          serverActions: {
            allowedOrigins: serverActionOrigins,
          },
        },
      }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  transpilePackages: ["@supabase/ssr", "@supabase/supabase-js"],
};

export default nextConfig;
