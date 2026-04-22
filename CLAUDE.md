# Pchelovod — Tajik Honey & Beehives

Marketing website (business card + SEO blog) for a honey and beehive producer based in Tajikistan. **Not e-commerce.** The goal is discoverability via organic search and a credible, culturally-rooted brand presence.

---

## 1. Project goals

| Priority | Goal |
| --- | --- |
| P0 | People searching for Tajik honey / beekeeping / mountain honey find the site |
| P0 | Visitors trust the brand in under 10 seconds (hero, origin story, contact) |
| P0 | Content works in **EN / RU / TG** with proper hreflang and locale routing |
| P1 | Blog drives long-tail SEO traffic (honey varieties, beekeeping, apitherapy, Pamir flora) |
| P1 | Strong sensory/visual identity — Tajik mountain landscapes, not generic "rustic honey" stock |
| P2 | Lightweight contact / lead capture (email + WhatsApp/Telegram) |

**Explicitly out of scope:** shopping cart, inventory, payments, user accounts, i18n admin UIs, CMS. Content lives in the repo.

---

## 2. Languages and locales

- `en` — English (default, international audience)
- `ru` — Russian (regional business & diaspora)
- `tg` — Tajik (**ISO 639-1 `tg`**, Cyrillic script — Тоҷикӣ)

> Note: country code for Tajikistan is `TJ`, but the **language** code is `tg`. Use `tg` in URLs, `lang` attributes, hreflang, and sitemap entries. Keep `tj` only for country-level references (addresses, Organization schema).

**URL strategy:** path-prefix per locale — `/en/…`, `/ru/…`, `/tg/…`. Root `/` redirects to the visitor's preferred locale (Accept-Language header via Cloudflare, with a manual switcher that overrides and persists in a cookie).

**Font coverage:** Tajik Cyrillic needs `ғ ӣ қ ӯ ҳ ҷ` — verify fonts include them. Candidates: Noto Sans / Noto Serif (full coverage), Inter (partial — add fallback), Manrope (incomplete, avoid for TG).

---

## 3. Tech stack

### Framework: **Eleventy (11ty) 3.x**

Reasoning:
- Pure static output → ideal for Cloudflare Pages free tier, zero cold starts
- Tiny dependency tree, no framework churn — this site should still build cleanly in 5+ years with minimal maintenance
- First-class Markdown + Nunjucks templating, zero client-side JS unless we explicitly add it
- Official **`@11ty/eleventy-plugin-i18n`** handles locale routing, translation lookups, and hreflang link generation
- **`@11ty/eleventy-img`** gives us responsive AVIF/WebP/JPEG with correct width/height attributes (CLS-safe)
- Rock-solid ecosystem: sitemap, RSS, navigation, and syntax-highlight plugins are all mature and lightweight

**Why not Astro:** considered; equivalent SEO ceiling, but we're prioritizing longevity and minimalism over component DX.
**Why not Next.js:** overkill for a static marketing site; CF Pages adapter adds friction; bundle size hurts performance.
**Why not Hugo:** fast but less flexible for JS-driven tooling (Tailwind, custom image pipelines) and harder to extend.

### Supporting stack

| Concern | Choice |
| --- | --- |
| Templating | **Nunjucks** for layouts/partials, **Markdown** (markdown-it) for content |
| Styling | **Tailwind CSS v4** via PostCSS, compiled into `dist/assets/css/` as part of the 11ty build |
| Content | Markdown files per locale, frontmatter validated by a custom data-cascade check in `.eleventy.js` |
| Images | **`@11ty/eleventy-img`** wrapped in a Nunjucks shortcode; AVIF + WebP + JPEG fallback, responsive `srcset` |
| i18n | **`@11ty/eleventy-plugin-i18n`** + per-locale JSON dictionaries in `src/_data/i18n/` |
| Icons | Inline SVG partials (tree-shaken by default since nothing ships JS) + Lucide SVG set |
| Fonts | `@fontsource-variable/noto-sans` + `noto-serif-display` copied into `/assets/fonts/` at build, `font-display: swap`, self-hosted |
| Sitemap | **`@quasibit/eleventy-plugin-sitemap`** (one per locale + index) |
| RSS | **`@11ty/eleventy-plugin-rss`** per locale |
| Navigation | **`@11ty/eleventy-navigation`** for ordered nav + breadcrumbs |
| Forms | Static form → **Cloudflare Pages Function** → forward to email (Resend) or Telegram Bot API |
| Analytics | **Cloudflare Web Analytics** (cookieless, free, privacy-first) |
| SEO | Per-locale sitemaps, `hreflang` via `locale_links` filter, JSON-LD partials (`LocalBusiness`, `Organization`, `BlogPosting`, `BreadcrumbList`) |
| AI/LLM visibility | `/llms.txt`, clean semantic HTML, passage-level headings, FAQ schema on key pages |
| Linting | ESLint + Prettier + `prettier-plugin-jinja-template` (Nunjucks) + `prettier-plugin-tailwindcss` |
| Git hooks | `simple-git-hooks` + `lint-staged` (lightweight; avoid Husky) |
| Node | 20 LTS (match Cloudflare Pages default runtime) |

---

## 4. Proposed project structure

Eleventy's directory structure mirrors URL structure. Each locale lives in its own top-level folder under `src/`. The i18n plugin uses matching paths across locales to wire up hreflang automatically.

```
pchelovod/
├── src/
│   ├── _data/                     # Global data, available in all templates
│   │   ├── site.js                # { url, name, defaultLocale, locales }
│   │   ├── nav.js                 # Navigation definition
│   │   └── i18n/
│   │       ├── en.json            # UI strings for English
│   │       ├── ru.json
│   │       └── tg.json
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk           # <html lang>, meta, OG, hreflang, JSON-LD
│   │   │   ├── page.njk
│   │   │   └── post.njk
│   │   └── partials/
│   │       ├── head.njk
│   │       ├── header.njk
│   │       ├── footer.njk
│   │       ├── language-switcher.njk
│   │       ├── jsonld-org.njk
│   │       ├── jsonld-localbusiness.njk
│   │       └── jsonld-blogposting.njk
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css           # Tailwind entry + @theme tokens
│   │   ├── js/                    # Minimal — language switcher, mobile nav
│   │   │   └── nav.js
│   │   ├── fonts/                 # Copied from @fontsource at build
│   │   └── images/                # Source images (processed by eleventy-img)
│   ├── en/
│   │   ├── en.11tydata.js         # locale: 'en' for all files in folder
│   │   ├── index.njk              # Home
│   │   ├── about.md               # Origin story, apiary, people
│   │   ├── honey.md               # Varieties (mountain, acacia, wildflower…)
│   │   ├── beehives.md            # Hive products/services
│   │   ├── contact.njk
│   │   └── blog/
│   │       ├── blog.11tydata.js   # Shared frontmatter for all posts
│   │       ├── index.njk          # Blog listing
│   │       └── *.md               # Individual posts
│   ├── ru/                        # Mirrors en/ structure
│   ├── tg/                        # Mirrors en/ structure
│   ├── index.njk                  # Root — language detection + redirect
│   ├── sitemap.njk                # Sitemap index
│   ├── robots.njk
│   └── llms.njk                   # /llms.txt for AI search
├── public/                        # Passthrough copy (favicon, static files)
│   ├── favicon.svg
│   └── og/                        # Pre-generated OG images per locale/page
├── functions/                     # Cloudflare Pages Functions
│   └── api/
│       └── contact.js             # Contact form handler
├── .eleventy.js                   # Eleventy config
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── _headers                       # Cloudflare Pages headers (cache, HSTS, CSP)
├── _redirects                     # Optional — root locale detection fallback
└── README.md
```

**Note on locale folders:** the `en.11tydata.js` (and `ru`, `tg`) directory-data files set `locale`, `permalink`, and `eleventyNavigation.locale` for every file in that folder — this is how the i18n plugin groups translations together.

---

## 5. Visual identity direction

The look should feel **Tajik, not touristic.** Avoid Disney-fied "exotic Central Asia" clichés.

- **Palette:**
  - Honey gold `#D89B2A`, darker amber `#A76A1E`
  - Pamir slate-blue `#3E5670`, glacier teal `#4E8A91`
  - Warm earth `#8B5A3C`, cream `#F5EEE1`
  - Accent terracotta `#B64A2E` (suzani red, sparingly)
- **Typography:**
  - Display: serif with warmth (e.g. **Noto Serif Display**, **Cormorant**) — needs full Cyrillic incl. Tajik
  - Body: humanist sans (**Noto Sans**, **Inter** — verify Tajik glyphs)
  - Accent: consider a subtle Persian-Arabic inspired display cut **only for decorative moments**, never body text
- **Imagery:**
  - Hero: real photography of Pamir / Fann mountains, Iskanderkul, alpine meadows with hives
  - Avoid stock honey-jar-on-wood-table shots
  - Keep EXIF location data stripped; add IPTC metadata for SEO (`ImageObject` schema)
- **Motifs:**
  - Subtle suzani-inspired geometric borders
  - Honeycomb hex as a structural grid element, not a literal illustration
- **Tone:**
  - Calm, confident, rooted. Short sentences. Let the landscape carry emotional weight.

---

## 6. SEO plan

- **Per-locale metadata** — title, description, OG image per page per language
- **hreflang** tags on every page linking all three locale versions + `x-default` → `/en/`
- **Sitemap** — one index + per-locale sitemaps (auto-generated by `@astrojs/sitemap`)
- **Structured data (JSON-LD):**
  - `Organization` + `LocalBusiness` (address in Tajikistan, `areaServed`, contact points) on every page
  - `BlogPosting` + `Article` on posts with `inLanguage`, `author`, `datePublished`
  - `BreadcrumbList` on nested pages
  - `ImageObject` on hero images
- **Core Web Vitals targets:** LCP < 2.0s, INP < 200ms, CLS < 0.05 — achievable given static + optimized images
- **AI search (GEO):** `/llms.txt` at root, semantic HTML, FAQ schema on key pages, clear passage-level headings
- **Blog taxonomy:** categories (Honey, Beekeeping, Tajik Nature, Apitherapy) + tags; translate taxonomy labels but keep slugs locale-prefixed (`/ru/blog/kategoriya/med/`)
- **Keyword seeds (to refine):**
  - EN: Tajik honey, Pamir honey, mountain honey, raw wildflower honey, beehive Tajikistan
  - RU: таджикский мёд, памирский мёд, горный мёд, пчеловодство Таджикистан
  - TG: асали тоҷикӣ, асали кӯҳӣ, занбӯриасалпарварӣ

---

## 7. GitHub + Cloudflare Pages workflow

1. **Repo:** private GitHub repo, `main` is deployable.
2. **Branching:** trunk-based; feature branches → PR → squash merge. Short-lived.
3. **CI (GitHub Actions):** on PR — `pnpm install`, `pnpm build`, `pnpm astro check`, Lighthouse CI on preview URL.
4. **Cloudflare Pages:**
   - Connect repo, build command `pnpm build`, output `dist/`
   - Preview deployments on every branch/PR (automatic)
   - Production deploy on `main` merge
   - Custom domain via Cloudflare DNS (same account ideally — zero-config)
5. **Pages Functions** for the contact form endpoint — no separate server.
6. **Secrets:** Resend / Telegram Bot token in Pages env vars (not committed).
7. **Cache:** default Pages caching is fine; add `_headers` file for font `immutable` cache + HSTS.

---

## 8. Initial setup commands

```bash
# Scaffold
pnpm init
git init

# Core
pnpm add -D @11ty/eleventy@^3

# Plugins
pnpm add -D @11ty/eleventy-img \
           @11ty/eleventy-plugin-i18n \
           @11ty/eleventy-plugin-rss \
           @11ty/eleventy-navigation \
           @quasibit/eleventy-plugin-sitemap

# CSS pipeline
pnpm add -D tailwindcss @tailwindcss/postcss postcss postcss-cli \
           autoprefixer cssnano npm-run-all

# Fonts
pnpm add @fontsource-variable/noto-sans @fontsource-variable/noto-serif-display

# Dev tooling
pnpm add -D prettier prettier-plugin-jinja-template prettier-plugin-tailwindcss \
           eslint @eslint/js \
           simple-git-hooks lint-staged
```

**Scripts in `package.json`:**
```json
{
  "scripts": {
    "dev": "run-p dev:*",
    "dev:11ty": "eleventy --serve --quiet",
    "dev:css": "postcss src/assets/css/main.css -o _site/assets/css/main.css --watch",
    "build": "run-s build:css build:11ty",
    "build:css": "postcss src/assets/css/main.css -o _site/assets/css/main.css",
    "build:11ty": "eleventy",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write ."
  }
}
```

**`.eleventy.js` essentials:**
- Input `src/`, output `_site/` (Cloudflare Pages default)
- Register `i18n` plugin with `defaultLanguage: 'en'`
- Register sitemap, RSS, navigation plugins
- Add `image` shortcode wrapping `@11ty/eleventy-img`
- Add `dateFilter`, `absoluteUrl`, and `jsonLd` filters
- Passthrough copy: `public/` → root, `src/assets/fonts` → `/assets/fonts`
- Watch targets: `src/assets/css/**/*.css`

---

## 9. Content model

**Blog post frontmatter (Markdown files in `src/<locale>/blog/*.md`):**

```yaml
---
layout: layouts/post.njk
title: "Mountain honey of the Pamir"
description: "A 150-character SEO-ready description of the post."   # 120–160 chars
publishDate: 2026-04-20
updatedDate: 2026-04-22
author: "Author Name"
heroImage: /assets/images/pamir-apiary.jpg
heroAlt: "Wooden hives on an alpine meadow in the Pamir mountains"
category: honey          # honey | beekeeping | nature | apitherapy
tags: [pamir, raw-honey, varieties]
translationKey: pamir-mountain-honey
draft: false
tags: [post]             # collection tag — note: 11ty uses 'tags' for both taxonomy and collections; namespace carefully
---
```

**Frontmatter validation:** Eleventy has no built-in schema validation. We add a lightweight check in `.eleventy.js` via an `eleventyConfig.on('eleventy.before', ...)` hook — walk the `post` collection, assert required fields are present and correctly typed, throw on missing `description`, `heroImage`, `heroAlt`, or `translationKey`. This gives us the "build fails on missing SEO fields" guarantee without adding Zod.

**`translationKey`** is the glue: when a post exists in EN/RU/TG, they all share the same key, so the `post.njk` layout can render "Read in other languages" links and the i18n plugin's `locale_links` filter emits proper `<link rel="alternate" hreflang>` tags.

**Collections (defined in `.eleventy.js`):**
- `postsEn`, `postsRu`, `postsTg` — per-locale blog indexes, sorted by `publishDate desc`, filtered where `draft !== true` in production
- `honeyEn` / `honeyRu` / `honeyTg` — honey variety pages if we decide to paginate them

**Collection tag warning:** Eleventy reuses the `tags` frontmatter key for both taxonomy tags AND collection membership. Keep taxonomy tags in a separate key (`topics:` or `categoryTags:`) to avoid accidental collection pollution.

---

## 10. Open questions (to resolve before build)

1. **Domain name** — registered yet? (affects `site:` in Astro config)
2. **Brand name / logo** — do we have a wordmark, or do we design one as part of this?
3. **Photography** — existing library, or need a shoot / licensed Pamir stock?
4. **Contact channels** — email + Telegram + WhatsApp? Which are primary?
5. **Physical address + GPS** — needed for `LocalBusiness` schema and map embed
6. **Blog launch content** — how many posts per locale at launch? (Target: 3 per locale = 9 total for credible depth)
7. **Translation workflow** — human translator per locale, or author-writes-EN + translation pass?

---

## 11. Agent working notes

- **Never add e-commerce primitives** (cart, pricing pages, SKUs). This is a brochure site.
- When adding UI copy, always add all **three** locale strings in `src/_data/i18n/{en,ru,tg}.json`. Missing TG entries cause ugly fallbacks — the build-time check should fail on missing keys.
- Test with `lang="tg"` + Tajik Cyrillic sample text (`Асали тоҷикӣ аз кӯҳҳои Помир`) to catch font glyph coverage issues early.
- Keep every page **fully static**. No SSR, no client-side routing. If a page genuinely needs request-time behavior (form handling), move it to a Cloudflare Pages Function in `functions/`.
- Ship **no JavaScript by default.** Only load `assets/js/nav.js` (mobile nav + language switcher) as a deferred script. If a new feature tempts you toward a JS framework, stop and re-scope.
- Images: always via the `{% image %}` Nunjucks shortcode (wrapping `@11ty/eleventy-img`) — never raw `<img>` for content imagery. The shortcode enforces responsive `srcset`, `width`/`height`, `loading="lazy"`, and AVIF/WebP fallbacks.
- When creating a blog post in one locale, also create **placeholder stubs** in the other two locales with `draft: true` and the same `translationKey` — this prevents hreflang gaps.
- Respect the Eleventy `tags` collision: only use `tags: [post]` for collection membership. Taxonomy lives under `topics:`.
- Before shipping: run `pnpm build`, open the built `_site/` in a local server, run Lighthouse (mobile) on all three locales, and view-source to verify `<html lang>`, canonical, hreflang, and JSON-LD are correct per locale.
- Keep `.eleventy.js` readable. If it grows past ~200 lines, split plugin registration into `eleventy/plugins.js` and filters into `eleventy/filters.js`.
