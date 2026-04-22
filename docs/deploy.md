# Deployment guide — Cloudflare Pages

## First-time setup

1. Push the repo to a private GitHub repository.
2. In Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**.
3. Select the repository and configure the build:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Build command | `pnpm build` |
   | Build output directory | `_site` |
   | Root directory | *(leave blank)* |
   | Node.js version | **20** |

4. Under **Environment variables**, add:

   | Variable | Where | Description |
   |---|---|---|
   | `SITE_URL` | Production | `https://pchelovod.tj` (or your domain) |
   | `RESEND_API_KEY` | Production | Resend API key for contact form emails |
   | `CONTACT_TO_EMAIL` | Production | Destination address for contact submissions |
   | `TELEGRAM_BOT_TOKEN` | Production | (Optional) Telegram Bot token |
   | `TELEGRAM_CHAT_ID` | Production | (Optional) Telegram chat ID |

5. Click **Save and Deploy**. Cloudflare clones the repo, runs `pnpm install && pnpm build`, and serves `_site/`.

## Custom domain

1. In the Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `pchelovod.tj` (and optionally `www.pchelovod.tj`).
3. If your domain's DNS is already on Cloudflare, the CNAME is added automatically.
4. HTTPS is provisioned automatically via Cloudflare's Universal SSL.

## Ongoing deployments

- Every push to `main` triggers a **production deployment**.
- Every pull request gets a unique **preview URL** (`https://<branch>.pchelovod-tj.pages.dev`).
- Preview deployments do **not** use production env vars — they run without Resend/Telegram keys, so the contact form will return a graceful error.

## Cloudflare Pages Functions

The contact form handler lives in `functions/api/contact.js`. Cloudflare automatically deploys files under `functions/` as Pages Functions — no extra configuration is needed.

To test the function locally:

```bash
pnpm dlx wrangler pages dev _site --compatibility-date=2024-01-01
```

## Cache and security headers

`public/_headers` is copied to `_site/_headers` at build time and applied by Cloudflare to every response:

- Fonts: `immutable` (1 year) — content-addressed filenames mean safe forever-caching.
- CSS/JS: 1-day cache with `stale-while-revalidate`.
- Images: 30-day cache.
- All routes: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

## Rollback

In the Pages dashboard, click any prior deployment → **Rollback to this deployment**. Takes effect in seconds.
