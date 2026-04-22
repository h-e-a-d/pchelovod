export function year() {
  return new Date().getFullYear();
}

export function date(value, format = "yyyy-MM-dd") {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (format === "yyyy") return String(y);
  if (format === "yyyy-MM-dd") return `${y}-${m}-${day}`;
  return d.toISOString();
}

export function makeI18nFilter(translations) {
  return function i18n(key, localeOverride) {
    const locale = localeOverride || this?.ctx?.locale || this?.page?.data?.locale || "en";
    const dict = translations[locale] || translations["en"] || {};
    const parts = key.split(".");
    let val = dict;
    for (const part of parts) {
      if (val == null) break;
      val = val[part];
    }
    if (val == null && locale !== "en") {
      let fallback = translations["en"] || {};
      for (const part of parts) {
        if (fallback == null) break;
        fallback = fallback[part];
      }
      return fallback ?? key;
    }
    return val ?? key;
  };
}
