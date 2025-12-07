
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'i.pravatar.cc', 'ui-avatars.com'],
  },
  env: {
    // Public Env vars exposed to the browser
    NEXT_PUBLIC_APP_NAME: 'NC BondFlow',
  }
};

module.exports = nextConfig;
