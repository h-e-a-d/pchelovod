export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "public": "/" });

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
