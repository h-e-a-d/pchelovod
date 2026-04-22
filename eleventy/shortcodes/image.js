import Image from "@11ty/eleventy-img";
import path from "node:path";

export async function imageShortcode(src, alt, sizes = "(min-width: 1024px) 1024px, 100vw", loading = "lazy") {
  if (alt === undefined) {
    throw new Error(`Missing alt attribute for image: ${src}`);
  }

  const fullSrc = src.startsWith("/") ? path.join("src", src) : src;

  const metadata = await Image(fullSrc, {
    widths: [480, 768, 1024, 1600],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "_site/assets/images/",
    urlPath: "/assets/images/",
    filenameFormat: (id, source, width, format) => {
      const name = path.basename(source, path.extname(source));
      return `${name}-${width}w-${id}.${format}`;
    },
  });

  const imageAttributes = {
    alt,
    sizes,
    loading,
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}
