export const watchKey = "legacy-sole-restock";
export function readList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
export function saveList(key: string, items: string[]) {
  localStorage.setItem(key, JSON.stringify([...new Set(items)]));
  window.dispatchEvent(new Event("product-lists-updated"));
}
