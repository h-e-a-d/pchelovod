import { describe, it, expect } from "vitest";
import fs from "node:fs";

// Parses the cyrillic-ext unicode-range from main.css and asserts that
// the Tajik-specific letters are covered:  ғ ӣ қ ӯ ҳ ҷ  +  Ғ Ӣ Қ Ӯ Ҳ Ҷ
const TAJIK_CODEPOINTS = [
  0x0493, 0x04e3, 0x049b, 0x04af, 0x04b3, 0x04b7,
  0x0492, 0x04e2, 0x049a, 0x04ae, 0x04b2, 0x04b6,
];

function rangesFromCss(css, family) {
  const re = new RegExp(
    `@font-face\\s*{[^}]*font-family:\\s*"${family}"[^}]*unicode-range:\\s*([^;]+);`,
    "gs",
  );
  const ranges = [];
  let match;
  while ((match = re.exec(css)) !== null) {
    for (const token of match[1].split(",")) {
      const t = token.trim();
      if (!t.startsWith("U+")) continue;
      const body = t.slice(2);
      if (body.includes("-")) {
        const [a, b] = body.split("-").map((x) => parseInt(x, 16));
        ranges.push([a, b]);
      } else {
        const v = parseInt(body, 16);
        ranges.push([v, v]);
      }
    }
  }
  return ranges;
}

function inRanges(cp, ranges) {
  return ranges.some(([a, b]) => cp >= a && cp <= b);
}

describe("font unicode-range covers Tajik Cyrillic", () => {
  const css = fs.readFileSync("src/assets/css/main.css", "utf8");

  for (const family of ["Noto Sans Variable", "Noto Serif Display Variable"]) {
    it(`${family} covers all Tajik-specific code points`, () => {
      const ranges = rangesFromCss(css, family);
      const missing = TAJIK_CODEPOINTS.filter((cp) => !inRanges(cp, ranges));
      expect(missing, `Missing U+${missing.map((c) => c.toString(16)).join(", U+")}`).toEqual([]);
    });
  }
});
