/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ローカル開発用: basePathを無効化
  // basePath: '/scrum_sensei',
  // assetPrefix: '/scrum_sensei',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // ローカル開発用: standalone出力を無効化
  // output: 'standalone'
};

module.exports = nextConfig;