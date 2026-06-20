/** @type {import('next').NextConfig} */
// Security: pinned to Next 15.5.x (see package.json) — patched build.
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
