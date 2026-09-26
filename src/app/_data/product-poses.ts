// Galleries are managed in the database; removing a photo must not re-add it.
export function productPhotos(image: string, gallery: string[]): string[] {
  return [...new Set([image, ...gallery].filter(Boolean))];
}
