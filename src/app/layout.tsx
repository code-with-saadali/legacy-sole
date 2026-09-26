import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import StoreSettingsProvider from "./_components/StoreSettingsProvider";
import WhatsAppSupport from "./_components/WhatsAppSupport";
import CatalogProvider from "./_components/CatalogProvider";
import LenisScroll from "./_components/LenisScroll";
import StoreChrome from "./_components/StoreChrome";
import StoreFooter from "./_components/StoreFooter";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  style: "normal",
  display: "swap",
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
    <html
      lang="en"
      className="scroll-smooth scroll-pt-28 motion-reduce:scroll-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
    >
      <body
        className={`${montserrat.variable} antialiased m-0 bg-[#f4f1e9] text-[#252622] font-sans [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 [&.admin-mode]:bg-[#f0eee6] [&.admin-mode_.site-chrome]:hidden [&_button]:cursor-pointer [&_button]:[-webkit-tap-highlight-color:transparent] [&_a]:[-webkit-tap-highlight-color:transparent] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#ed682c] [&_button:focus-visible]:outline-offset-5 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-[#ed682c] [&_a:focus-visible]:outline-offset-5 motion-reduce:[&_*]:transition-none! motion-reduce:[&_*]:animate-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::before]:animate-none! motion-reduce:[&_*::after]:transition-none! motion-reduce:[&_*::after]:animate-none!`}
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
