const ALLOWED_CATEGORIES = ["honey", "beekeeping", "nature", "apitherapy"];

export function validatePost(item) {
  const { data, inputPath } = item;
  const errs = [];

  if (!data.title || typeof data.title !== "string")
    errs.push("title is required and must be a string");
  if (!data.description || typeof data.description !== "string" || data.description.length < 60) {
    errs.push(
      "description is required and must be at least 60 characters (ideally 120–160 for SEO)",
    );
  }
  if (!(data.publishDate instanceof Date) || Number.isNaN(data.publishDate.getTime())) {
    errs.push("publishDate is required and must parse as a Date");
  }
  if (!data.heroImage || typeof data.heroImage !== "string") errs.push("heroImage is required");
  if (!data.heroAlt || typeof data.heroAlt !== "string") errs.push("heroAlt is required");
  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errs.push(`category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }
  if (!data.translationKey || typeof data.translationKey !== "string")
    errs.push("translationKey is required");

  if (errs.length) {
    throw new Error(`[frontmatter] ${inputPath}:\n  - ${errs.join("\n  - ")}`);
  }
}

export function validatePosts(collection) {
  const errors = [];
  for (const item of collection) {
    if (item.data.draft) continue;
    try {
      validatePost(item);
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (errors.length) {
    throw new Error(`Frontmatter validation failed:\n\n${errors.join("\n\n")}`);
  }
}
