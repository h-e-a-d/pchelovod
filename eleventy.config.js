import { I18nPlugin } from "@11ty/eleventy";
import navigation from "@11ty/eleventy-navigation";
import rss from "@11ty/eleventy-plugin-rss";
import sitemap from "@quasibit/eleventy-plugin-sitemap";
import { year, date, makeI18nFilter } from "./eleventy/filters.js";
import { imageShortcode } from "./eleventy/shortcodes/image.js";
import { validatePosts } from "./eleventy/hooks/validate-frontmatter.js";

export default async function (eleventyConfig) {
  const translations = {
    en: (await import("./src/_data/i18n/en.json", { with: { type: "json" } })).default,
    ru: (await import("./src/_data/i18n/ru.json", { with: { type: "json" } })).default,
    tg: (await import("./src/_data/i18n/tg.json", { with: { type: "json" } })).default,
  };

  eleventyConfig.addPlugin(I18nPlugin, {
    defaultLanguage: "en",
    errorMode: "allow-fallback",
  });
  eleventyConfig.addPlugin(navigation);
  eleventyConfig.addPlugin(rss);
  eleventyConfig.addPlugin(sitemap, {
    sitemap: { hostname: process.env.SITE_URL || "https://pchelovod.tj" },
  });

  eleventyConfig.addAsyncShortcode("image", imageShortcode);

  eleventyConfig.addFilter("i18n", makeI18nFilter(translations));
  eleventyConfig.addFilter("year", year);
  eleventyConfig.addFilter("date", date);

  eleventyConfig.addCollection("_validatePosts", (api) => {
    const posts = api.getFilteredByGlob(["./src/en/blog/*.md", "./src/ru/blog/*.md", "./src/tg/blog/*.md"]);
    validatePosts(posts);
    return [];
  });

  eleventyConfig.addPassthroughCopy({ "public": "/" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/noto-sans/files": "assets/fonts/noto-sans",
    "node_modules/@fontsource-variable/noto-serif-display/files": "assets/fonts/noto-serif-display",
  });
  eleventyConfig.ignores.add("src/assets/css/**/*");
  eleventyConfig.addWatchTarget("src/assets/css/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
