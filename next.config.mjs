/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving from public directory
  assetPrefix: process.env.NODE_ENV === "production" ? undefined : "",
  images: {
    // Allow images from the same domain
    domains: [
      "localhost",
      "picsum.photos",
      "i.picsum.photos",
      "fastly.picsum.photos",
    ],
    // Allow images from the public/uploads directory
    unoptimized: false,
  },
  // Ensure static files are served correctly
  async headers() {
    return [
      {
        // Apply headers to all static files in uploads directory
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
