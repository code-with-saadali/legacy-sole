const recentKey = "legacy-sole-recently-viewed";

export function rememberProduct(slug: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentKey) || "[]");
    const current: string[] = Array.isArray(parsed) ? parsed : [];
    localStorage.setItem(
      recentKey,
      JSON.stringify(
        [slug, ...current.filter((item) => item !== slug)].slice(0, 4),
      ),
    );
    window.dispatchEvent(new Event("recent-updated"));
  } catch {
    /* Browsing still works if local storage is unavailable. */
  }
}
