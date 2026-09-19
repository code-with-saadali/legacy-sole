"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { defaultSettings, type StoreSettings } from "../_data/store-settings";
const Context = createContext({ settings: defaultSettings, refreshSettings: async () => {} });
export function useStoreSettings() { return useContext(Context); }
export default function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings,setSettings] = useState<StoreSettings>(defaultSettings);
  const refreshSettings = useCallback(async () => { if (!supabase) return; const {data,error} = await supabase.from("store_settings").select("whatsapp,default_shipping,free_shipping_minimum,city_rates").eq("id",true).single(); if (!error && data) setSettings(data); },[]);
  useEffect(() => { void refreshSettings(); },[refreshSettings]);
  return <Context.Provider value={{settings,refreshSettings}}>{children}</Context.Provider>;
}
