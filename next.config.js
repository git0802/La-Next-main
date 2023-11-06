/** @type {import('next').NextConfig} */

// module.exports = {
const nextConfig = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
    domains: ['images.unsplash.com']
  }
};
module.exports = nextConfig;
