"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function StoreChrome() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <Navbar />
  );
}
