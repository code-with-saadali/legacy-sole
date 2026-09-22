"use client";
import { useEffect, useState, type RefObject } from "react";

type Address = Record<
  "name" | "phone" | "address" | "city" | "postalCode",
  string
>;
const key = "legacy-sole-addresses";
const fields = ["name", "phone", "address", "city", "postalCode"] as const;
export default function SavedAddresses({
  formRef,
  onCity,
  disabled,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onCity: (city: string) => void;
  disabled: boolean;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(parsed))
        setAddresses(
          parsed
            .filter(
              (row): row is Address =>
                !!row &&
                fields.every((field) => typeof row[field] === "string"),
            )
            .slice(0, 5),
        );
    } catch {
      /* Saving is optional. */
    }
  }, []);
  const persist = (next: Address[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setAddresses(next);
      return true;
    } catch {
      setMessage("Could not save changes. Browser storage may be disabled.");
      return false;
    }
  };
  const save = () => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const address = Object.fromEntries(
      fields.map((field) => [field, String(data.get(field) || "").trim()]),
    ) as Address;
    if (fields.some((field) => !address[field])) {
      setMessage("Enter your name, phone and full delivery address first.");
      return;
    }
    const next = [
      address,
      ...addresses.filter(
        (row) => JSON.stringify(row) !== JSON.stringify(address),
      ),
    ];
    if (next.length > 5) {
      setMessage("You can save 5 addresses. Remove one before adding another.");
      return;
    }
    if (persist(next)) setMessage("Address saved on this device.");
  };
  const use = (address: Address) => {
    for (const field of fields) {
      if (field === "city") continue;
      const input = formRef.current?.elements.namedItem(field);
      if (input instanceof HTMLInputElement) input.value = address[field];
    }
    onCity(address.city);
    setMessage("Address filled in. You can edit the delivery details below.");
  };
  return (
    <fieldset
      disabled={disabled}
      className="rounded-2xl border border-black/10 bg-[#F8F6F1] p-5"
    >
      <legend className="px-1 text-sm font-medium">Saved addresses</legend>
      <p className="text-xs leading-5 text-black/55">
        Optional: save up to 5 addresses on this browser. Anyone using this
        device can see them.
      </p>
      <div className="mt-3 space-y-3">
        {addresses.map((address, index) => (
          <div key={index} className="rounded-xl border border-black/10 p-3">
            <p className="text-sm">
              {address.name} · {address.city}
            </p>
            <p className="mt-1 break-words text-xs text-black/55">
              {address.address} · {address.postalCode}
            </p>
            <div className="mt-2 flex gap-4 text-xs">
              <button
                type="button"
                onClick={() => use(address)}
                className="underline"
              >
                Use address
              </button>
              <button
                type="button"
                onClick={() => {
                  if (persist(addresses.filter((_, i) => i !== index)))
                    setMessage("Address removed.");
                }}
                className="underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className="mt-3 rounded-full border border-black/20 px-4 py-2 text-xs"
      >
        Save current address
      </button>
      {message && (
        <p role="status" className="mt-3 text-xs">
          {message}
        </p>
      )}
    </fieldset>
  );
}
