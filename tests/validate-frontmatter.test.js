import { describe, it, expect } from "vitest";
import { validatePost } from "../eleventy/hooks/validate-frontmatter.js";

const valid = {
  inputPath: "./src/en/blog/a.md",
  data: {
    title: "A",
    description:
      "A solid 120-character description that is plausibly SEO-ready and not too short for Google to truncate mid-sentence.",
    publishDate: new Date("2026-01-01"),
    heroImage: "/assets/images/a.jpg",
    heroAlt: "A useful alt",
    category: "honey",
    translationKey: "a",
    draft: false,
  },
};

describe("validatePost", () => {
  it("passes for a fully valid post", () => {
    expect(() => validatePost(valid)).not.toThrow();
  });

  it("throws when title is missing", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, title: undefined } });
    expect(() => validatePost(p)).toThrow(/title/);
  });

  it("throws when description is shorter than 60 chars", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, description: "too short" } });
    expect(() => validatePost(p)).toThrow(/description/);
  });

  it("throws when heroImage is missing", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, heroImage: undefined } });
    expect(() => validatePost(p)).toThrow(/heroImage/);
  });

  it("throws when heroAlt is missing", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, heroAlt: "" } });
    expect(() => validatePost(p)).toThrow(/heroAlt/);
  });

  it("throws when translationKey is missing", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, translationKey: undefined } });
    expect(() => validatePost(p)).toThrow(/translationKey/);
  });

  it("throws when category is not in the allowlist", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, category: "random" } });
    expect(() => validatePost(p)).toThrow(/category/);
  });

  it("throws when publishDate is not a Date", () => {
    const p = structuredClone({ ...valid, data: { ...valid.data, publishDate: "2026-01-01" } });
    expect(() => validatePost(p)).toThrow(/publishDate/);
  });
});
