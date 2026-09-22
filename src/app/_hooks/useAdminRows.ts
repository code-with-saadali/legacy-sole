"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function useAdminRows<T>(table: string, sort = "created_at") {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!supabase) {
      setError("Database connection is unavailable.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(sort, { ascending: false });
    if (error) setError(error.message);
    else {
      setRows((data ?? []) as T[]);
      setError("");
    }
    setLoading(false);
  }, [table, sort]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { rows, error, setError, loading, reload };
}
