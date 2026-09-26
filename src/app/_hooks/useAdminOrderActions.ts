"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { Order } from "../_data/orders";
import { validateShipment } from "../_data/admin";
import { supabase } from "../../lib/supabase";

type Options = {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  setError: (error: string) => void;
};

export default function useAdminOrderActions({
  orders,
  setOrders,
  setError,
}: Options) {
  const [updating, setUpdating] = useState<string | null>(null);
  const updateStatus = async (id: string, status: Order["status"]) => {
    if (!supabase || updating) return;
    const order = orders.find((item) => item.id === id);
    const validation = validateShipment(
      order?.courier_name ?? "",
      order?.tracking_number ?? "",
      status,
    );
    if (validation) {
      setError(validation);
      return;
    }
    setUpdating(id);
    setError("");
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select("id,status")
        .single();
      if (error) throw error;
      setOrders((current) =>
        current.map((order) =>
          order.id === data.id ? { ...order, status: data.status } : order,
        ),
      );
    } catch (cause) {
      setError(
        (cause as { message?: string }).message ||
          "Order status could not be saved.",
      );
    } finally {
      setUpdating(null);
    }
  };

  const saveShipment = async (
    id: string,
    courier_name: string,
    tracking_number: string,
    dispatch: boolean,
  ) => {
    if (!supabase || updating) return false;
    const current = orders.find((order) => order.id === id);
    if (!current) return false;
    const status = dispatch ? "Dispatched" : current.status;
    const validation = validateShipment(courier_name, tracking_number, status);
    if (validation) {
      setError(validation);
      return false;
    }
    setUpdating(id);
    setError("");
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          courier_name: courier_name.trim(),
          tracking_number: tracking_number.trim(),
          ...(dispatch ? { status } : {}),
        })
        .eq("id", id)
        .select("id,status,courier_name,tracking_number")
        .single();
      if (error) throw error;
      setOrders((orders) =>
        orders.map((order) =>
          order.id === data.id ? { ...order, ...data } : order,
        ),
      );
      return true;
    } catch (cause) {
      const issue = cause as { message?: string; code?: string };
      setError(
        ["42703", "PGRST204"].includes(issue.code ?? "")
          ? "Courier tracking setup is not available yet. Please apply the order shipping migration."
          : issue.message || "Shipment could not be saved.",
      );
      return false;
    } finally {
      setUpdating(null);
    }
  };
  const deleteOrder = async (id: string) => {
    if (!supabase || updating) return false;
    setUpdating(id);
    setError("");
    try {
      const { error } = await supabase.rpc("admin_delete_order", {
        order_reference: id,
      });
      if (error) throw error;
      setOrders((current) => current.filter((order) => order.id !== id));
      return true;
    } catch (cause) {
      setError(
        (cause as { message?: string }).message ||
          "Order could not be deleted.",
      );
      return false;
    } finally {
      setUpdating(null);
    }
  };
  return { updating, updateStatus, saveShipment, deleteOrder };
}
