/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  experimental: {
    serverComponentsExternalPackages: ["mysql2"],
  },
};

export default nextConfig;
