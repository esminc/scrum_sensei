/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // basePath: '/scrum_sensei',
  // assetPrefix: '/scrum_sensei',
  // trailingSlash: true,
  images: {
    unoptimized: true
  },
  output: 'standalone'
};

module.exports = nextConfig;