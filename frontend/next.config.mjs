/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Skip linting during build (linting happens in CI/CD)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build (type checking happens in CI/CD)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
