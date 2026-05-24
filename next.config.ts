import type { NextConfig } from "next";

// @ts-expect-error: package next-pwa belum memiliki tipe bawaan untuk TypeScript
import withPWAInit from "next-pwa";

// Konfigurasi PWA
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", 
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
};

// Bungkus nextConfig dengan PWA
export default withPWA(nextConfig);