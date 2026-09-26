"use client";

import { useState } from "react";
import { validMenuHref, type MenuColumn } from "../_data/navigation";
import { supabase } from "../../lib/supabase";
import { useStoreSettings } from "./StoreSettingsProvider";
import { formFieldClasses } from "../_styles/form-classes";

export default function NavigationSettings() {
  const { settings, refreshSettings } = useStoreSettings();
  const [draft, setDraft] = useState<MenuColumn[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const columns = draft ?? settings.menu_columns;
  function edit(index: number, change: Partial<MenuColumn>) {
    setDraft(
      columns.map((column, i) =>
        i === index ? { ...column, ...change } : column,
      ),
    );
    setMessage("");
  }
  async function save() {
    if (!supabase || busy) return;
    const cleaned = columns.map((column) => ({
      title: column.title.trim(),
      caption: column.caption.trim(),
      links: column.links.map((link) => ({
        label: link.label.trim(),
        href: link.href.trim(),
      })),
    }));
    if (
      cleaned.some(
        (column) =>
          !column.title ||
          column.links.some((link) => !link.label || !validMenuHref(link.href)),
      )
    ) {
      setMessage(
        "Enter a section title and a name and valid URL for each link. Use /shop, /shop?category=Boots or an HTTPS URL.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ menu_columns: cleaned })
        .eq("id", true)
        .select("id")
        .single();
      if (error) throw error;
      await refreshSettings();
      setDraft(cleaned);
      setMessage("Navbar menu saved.");
    } catch {
      setMessage("Menu could not be saved. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  const button =
    "rounded-full border border-black/15 px-4 py-2 text-xs hover:bg-[#E9E2D7] disabled:opacity-50";
  return (
    <section className="rounded-[20px] border border-black/[0.06] bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium tracking-tight">Navbar menu</h2>
      <p className="mt-2 text-sm text-black/50">
        Add, edit or remove menu links. Save to publish your changes.
      </p>
      <fieldset disabled={busy} className="mt-6 space-y-6">
        {columns.map((column, index) => (
          <div
            key={index}
            className="space-y-4 rounded-2xl border border-black/10 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={formFieldClasses}>
                Section title
                <input
                  value={column.title}
                  onChange={(e) => edit(index, { title: e.target.value })}
                />
              </label>
              <label className={formFieldClasses}>
                Caption
                <input
                  value={column.caption}
                  onChange={(e) => edit(index, { caption: e.target.value })}
                />
              </label>
            </div>
            {column.links.map((link, linkIndex) => (
              <div key={linkIndex} className="flex flex-wrap items-end gap-3">
                <label className={`${formFieldClasses} min-w-40 flex-1`}>
                  Link name
                  <input
                    value={link.label}
                    onChange={(e) =>
                      edit(index, {
                        links: column.links.map((item, i) =>
                          i === linkIndex
                            ? { ...item, label: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className={`${formFieldClasses} min-w-40 flex-1`}>
                  URL
                  <input
                    placeholder="/shop?category=Boots"
                    value={link.href}
                    onChange={(e) =>
                      edit(index, {
                        links: column.links.map((item, i) =>
                          i === linkIndex
                            ? { ...item, href: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className={button}
                  aria-label={`Delete ${link.label || "link"}`}
                  onClick={() =>
                    edit(index, {
                      links: column.links.filter((_, i) => i !== linkIndex),
                    })
                  }
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={button}
                onClick={() =>
                  edit(index, {
                    links: [...column.links, { label: "", href: "/shop" }],
                  })
                }
              >
                Add link
              </button>
              <button
                type="button"
                className={button}
                onClick={() => setDraft(columns.filter((_, i) => i !== index))}
              >
                Delete section
              </button>
            </div>
          </div>
        ))}
        {!columns.length && (
          <p className="text-sm text-black/50">
            No menu sections. Add a section to get started.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={button}
            onClick={() =>
              setDraft([...columns, { title: "", caption: "", links: [] }])
            }
          >
            Add section
          </button>
          <button
            type="button"
            className={button}
            onClick={() => {
              setDraft(null);
              setMessage("");
            }}
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-[#20211e] px-6 py-2 text-sm text-white"
          >
            {busy ? "Saving…" : "Save menu"}
          </button>
        </div>
      </fieldset>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
