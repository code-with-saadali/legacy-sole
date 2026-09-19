"use client";
import { usePathname } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";
import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";
export default function WhatsAppSupport() {
  const pathname=usePathname(); const {settings}=useStoreSettings();
  if(pathname.startsWith("/admin"))return null;
  return <a href={supportLink(settings.whatsapp,"Assalam o Alaikum, I need help with Legacy Sole.")} target="_blank" rel="noreferrer" aria-label="Chat with Legacy Sole on WhatsApp" className="site-chrome fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#245b3a] p-4 text-white shadow-lg transition hover:bg-[#20211e]"><FiMessageCircle size={23}/><span className="hidden text-xs font-medium sm:inline">Need a hand?</span></a>;
}
