export const recentKey = "legacy-sole-recently-viewed";
export const recentLimit = 20;

export function rememberProduct(slug: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentKey) || "[]");
    const current: string[] = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
    localStorage.setItem(
      recentKey,
      JSON.stringify(
        [slug, ...current.filter((item) => item !== slug)].slice(
          0,
          recentLimit,
        ),
      ),
    );
    window.dispatchEvent(new Event("recent-updated"));
  } catch {
    /* Browsing still works if local storage is unavailable. */
  }
}
