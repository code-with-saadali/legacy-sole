"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminAccess({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) { setChecking(false); setError("Supabase is not configured."); return; }
    let active = true;
    let version = 0;
    const verify = async (hasSession: boolean) => {
      const current = ++version;
      setAllowed(false);
      if (!hasSession) { if (active) setChecking(false); return; }
      const { data, error } = await client.rpc("is_store_admin");
      if (!active || current !== version) return;
      setAllowed(data === true);
      setError(error ? "Admin database setup is incomplete. Apply the store security migration in Supabase." : data ? "" : "This account does not have admin access.");
      setChecking(false);
    };
    void client.auth.getSession().then(({ data }) => verify(Boolean(data.session)));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      // Keep database requests outside the Auth callback's session lock.
      setTimeout(() => { if (active) void verify(Boolean(session)); }, 0);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
    if (error) setError(error.message);
    setBusy(false);
  };

  if (checking) return <main className="p-12" role="status">Checking admin access...</main>;
  if (allowed) return <><div className="fixed right-5 top-4 z-50"><button onClick={() => void supabase?.auth.signOut()} className="bg-[#F4F1E9] px-4 py-2 text-xs">Sign out</button></div>{children}</>;
  return (
    <main className="mx-auto min-h-[70vh] max-w-md px-6 py-20">
      <h1 className="text-4xl">Admin sign in</h1>
      <form onSubmit={signIn} className="mt-8 space-y-5">
        <label className="block text-sm">Email<input required type="email" name="email" autoComplete="username" className="mt-2 block w-full border border-black/20 bg-transparent p-3" /></label>
        <label className="block text-sm">Password<input required type="password" name="password" autoComplete="current-password" className="mt-2 block w-full border border-black/20 bg-transparent p-3" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full bg-[#252622] p-3 text-white disabled:opacity-50">{busy ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
}
