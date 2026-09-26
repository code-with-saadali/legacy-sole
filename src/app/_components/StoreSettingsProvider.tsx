"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "../../lib/supabase";
import { defaultSettings, type StoreSettings } from "../_data/store-settings";
const Context = createContext({
  settings: defaultSettings,
  refreshSettings: async () => {},
});
export function useStoreSettings() {
  return useContext(Context);
}
export default function StoreSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const refreshSettings = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", true)
      .single();
    if (!error && data)
      setSettings({
        ...defaultSettings,
        ...data,
        new_arrivals: { ...defaultSettings.new_arrivals, ...data.new_arrivals },
        classic_feature: {
          ...defaultSettings.classic_feature,
          ...data.classic_feature,
        },
        style_guide: data.style_guide ?? defaultSettings.style_guide,
      });
  }, []);
  useEffect(() => {
    void refreshSettings();
    const resume = () => {
      if (document.visibilityState === "visible") void refreshSettings();
    };
    window.addEventListener("focus", resume);
    const timer = window.setInterval(resume, 30000);
    const channel = supabase
      ?.channel("store-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        resume,
      )
      .subscribe();
    return () => {
      window.removeEventListener("focus", resume);
      window.clearInterval(timer);
      if (channel) void supabase?.removeChannel(channel);
    };
  }, [refreshSettings]);
  return (
    <Context.Provider value={{ settings, refreshSettings }}>
      {children}
    </Context.Provider>
  );
}
