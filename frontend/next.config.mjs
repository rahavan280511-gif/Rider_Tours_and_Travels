/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'imgd-ct.aeplcdn.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'media.istockphoto.com' },
      { protocol: 'https', hostname: 'ic4.maxabout.us' },
      { protocol: 'https', hostname: 'www.rushlane.com' },
      { protocol: 'https', hostname: 'www.flowernpetals.com' },
    ],
  },
};

export default nextConfig;
