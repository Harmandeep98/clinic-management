export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "") // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from ends
}

export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): string {
  // O(n) to build set, but O(1) for lookups
  const slugSet = new Set(existingSlugs);

  // If base slug is available, use it
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }

  // Find next available number suffix
  let counter = 1;
  while (slugSet.has(`${baseSlug}${counter}`)) {
    counter++;
  }

  return `${baseSlug}${counter}`;
}
