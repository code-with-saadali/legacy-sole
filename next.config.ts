import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    domains: [
      "images.unsplash.com",
      "storage.googleapis.com",
      "ik.imagekit.io",
      "randomuser.me",
      "ui-avatars.com",
      "i.imgur.com",
    ],
  },
};

export default nextConfig;
