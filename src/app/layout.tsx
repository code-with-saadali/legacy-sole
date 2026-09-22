import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreSettingsProvider from "./_components/StoreSettingsProvider";
import WhatsAppSupport from "./_components/WhatsAppSupport";
import CatalogProvider from "./_components/CatalogProvider";
import LenisScroll from "./_components/LenisScroll";
import StoreChrome from "./_components/StoreChrome";
import StoreFooter from "./_components/StoreFooter";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legacy Sole | Everyday Footwear, Refined.",
  description:
    "Discover everyday sneakers and running shoes at Legacy Sole. Explore versatile unisex footwear designed for comfort, movement and daily wear.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${cormorant.variable} ${geistMono.variable} antialiased`}
      >
        <CatalogProvider>
          <StoreSettingsProvider>
            <LenisScroll />
            <StoreChrome />
            {children}
            <StoreFooter />
            <WhatsAppSupport />
          </StoreSettingsProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
