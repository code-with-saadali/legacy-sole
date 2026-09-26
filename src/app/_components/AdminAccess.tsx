"use client";

import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => document.body.classList.remove("admin-mode");
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setChecking(false);
      setError("Supabase is not configured.");
      return;
    }
    let active = true;
    let version = 0;
    let currentUserId: string | null = null;
    const verify = async (userId: string | null) => {
      if (!active) return;
      const current = ++version;
      if (!userId) {
        currentUserId = null;
        setAllowed(false);
        setChecking(false);
        return;
      }
      // Revalidate the same user's access in the background without unmounting
      // the dashboard when the browser regains focus or refreshes the token.
      if (userId !== currentUserId) {
        currentUserId = userId;
        setAllowed(false);
        setChecking(true);
      }
      const { data, error } = await client.rpc("is_store_admin");
      if (!active || current !== version) return;
      setAllowed(!error && data === true);
      setError(
        error
          ? "Admin database setup is incomplete. Apply the store security migration in Supabase."
          : data
            ? ""
            : "This account does not have admin access.",
      );
      setChecking(false);
    };
    let authEventReceived = false;
    void client.auth.getSession().then(({ data }) => {
      if (!authEventReceived) void verify(data.session?.user.id ?? null);
    });
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      // Invalidate any older request as soon as a newer auth event arrives.
      const eventVersion = ++version;
      // Keep database requests outside the Auth callback's session lock.
      setTimeout(() => {
        if (active && eventVersion === version)
          void verify(session?.user.id ?? null);
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    if (error) setError(error.message);
    setBusy(false);
  };

  if (checking)
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#F4F1E9] text-sm text-[#4b5b40]"
        role="status"
      >
        Checking admin access...
      </main>
    );
  if (allowed)
    return (
      <>
        <div className="fixed right-5 top-4 z-50">
          <button
            onClick={() => void supabase?.auth.signOut()}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-xs text-[#20211e] shadow-sm hover:bg-[#E9E2D7]"
          >
            Sign out
          </button>
        </div>
        {children}
      </>
    );
  return (
    <main className="[&_h1]:font-[inherit] [&>div]:border-[#20211e1a] [&>div]:shadow-[0_24px_70px_#20211e0d] [&>div]:rounded-[30px] flex min-h-screen items-center justify-center bg-[#F4F1E9] px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-7 shadow-2xl sm:p-10">
        <Link
          href="/"
          className="text-xs font-bold tracking-[0.2em] text-[#20211e]"
        >
          LEGACY SOLE <span className="font-normal text-black/40">/ ADMIN</span>
        </Link>
        <div className="my-8 h-px bg-black/10" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#4b5b40]">
          YOUR STORE STARTS HERE
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          Sign in to look after your collection, orders and everything in
          between.
        </p>
        <form onSubmit={signIn} className="mt-8 space-y-5">
          <label className="block text-sm">
            Email
            <input
              required
              type="email"
              name="email"
              autoComplete="username"
              className="mt-2 block w-full rounded-xl border border-black/15 bg-white p-3 outline-none focus:border-[#4b5b40] focus:ring-2 focus:ring-[#4b5b40]/15"
            />
          </label>
          <div>
            <label htmlFor="admin-password" className="block text-sm">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                required
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className="block w-full rounded-xl border border-black/15 bg-white p-3 pr-12 outline-none focus:border-[#4b5b40] focus:ring-2 focus:ring-[#4b5b40]/15"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                aria-controls="admin-password"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-black/50 transition-colors hover:text-[#4b5b40]"
              >
                {showPassword ? (
                  <FiEyeOff size={18} aria-hidden="true" />
                ) : (
                  <FiEye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-[#20211e] p-3.5 text-sm font-medium text-white transition-colors hover:bg-[#4b5b40] disabled:opacity-50"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-7 text-center text-xs text-black/40">
          Legacy Sole / Store management
        </p>
      </div>
    </main>
  );
}
