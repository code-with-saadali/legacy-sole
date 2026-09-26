"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "../_data/orders";
import { supabase } from "../../lib/supabase";

export default function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const soundEnabled = useRef(false);

  const toggleSound = async () => {
    if (soundEnabled.current) {
      soundEnabled.current = false;
      setSoundOn(false);
      return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      soundEnabled.current = true;
      setSoundOn(true);
    } catch {
      setError(
        "Sound is unavailable in this browser. Visual alerts will still appear.",
      );
    }
  };
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let version = 0;
    let knownIds: Set<string> | null = null;
    const loadOrders = async () => {
      const current = ++version;
      const { data, error } = await client
        .from("orders")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (!active || current !== version) return;
      if (error) {
        setError(error.message);
        return;
      }
      const ids = new Set((data ?? []).map((row) => String(row.id)));
      if (knownIds) {
        const incoming = [...ids].filter((id) => !knownIds!.has(id));
        if (incoming.length) {
          setNewOrderIds((current) => [...new Set([...incoming, ...current])]);
          if (soundEnabled.current && audio.current?.state === "running") {
            const oscillator = audio.current.createOscillator();
            const gain = audio.current.createGain();
            oscillator.connect(gain);
            gain.connect(audio.current.destination);
            oscillator.frequency.value = 740;
            gain.gain.setValueAtTime(0.08, audio.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              audio.current.currentTime + 0.35,
            );
            oscillator.start();
            oscillator.stop(audio.current.currentTime + 0.35);
            oscillator.onended = () => {
              oscillator.disconnect();
              gain.disconnect();
            };
          }
        }
      }
      knownIds = ids;
      setOrders(
        (data ?? []).map((row) => ({
          ...row,
          createdAt: row.created_at,
        })) as Order[],
      );
      setError("");
    };
    void loadOrders();
    const channel = client
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => void loadOrders(),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void loadOrders();
      });
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadOrders();
    }, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
      void client.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    setOrders,
    newOrderIds,
    setNewOrderIds,
    soundOn,
    toggleSound,
    error,
    setError,
  };
}
