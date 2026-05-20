import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// --- IMPORT DISINI ---
import StatusJaringan from "../src/components/panels/StatusJaringan"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a", 
};

export const metadata: Metadata = {
  metadataBase: new URL("https://city-path-edu.vercel.app/"),
  title: "CityPath Edu | Visualisasi Algoritma 3D",
  description: "Belajar algoritma pathfinding seperti Dijkstra, A*, dan BFS secara interaktif dengan membangun kota 3D. Simulator edukasi yang menyenangkan!",
  
  icons: [
    {
      media: "(prefers-color-scheme: dark)",
      url: "/images/icon-light.svg",
      href: "/images/icon-light.svg",
    },
    {
      media: "(prefers-color-scheme: light)",
      url: "/images/icon-dark.svg",
      href: "/images/icon-dark.svg",
    },
  ],

  openGraph: {
    title: "CityPath Edu - Simulator Algoritma 3D",
    description: "Visualisasi interaktif algoritma pencarian jalan di dalam kota 3D.",
    siteName: "CityPath Edu",
    images: [
      {
        url: "/images/city.png", 
        width: 1200,
        height: 630,
        alt: "Preview CityPath Edu 3D",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* --- PASANG DISINI --- */}
        <StatusJaringan /> 
        {children}
      </body>
    </html>
  );
}