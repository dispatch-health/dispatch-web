# dispatch-web

Static marketing site for Dispatch — served at [dispatch.care](https://dispatch.care/).

Plain HTML/CSS, no build step. `index.html` is the entry point; sub-pages live in their own folders (`about/`, `contact/`, `privacy-policy/`).

## Local development

```sh
pnpm install
pnpm dev
```

Opens a live-reloading server on http://localhost:3000.

## Deploy to GitHub Pages

The repo is the site — there's no build artifact. Pushing to `main` is the deploy.

### One-time setup

1. **Push `main` to GitHub** (already wired to `dispatch-health/dispatch-web`).
2. In the repo on GitHub: **Settings → Pages**.
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `/ (root)`
   - Save.
3. Wait ~30s; GitHub will show the live URL (`https://dispatch-health.github.io/dispatch-web/`).

### Custom domain (dispatch.care)

1. Add a `CNAME` file at the repo root containing exactly:
   ```
   dispatch.care
   ```
2. At your DNS provider for `dispatch.care`, add records pointing at GitHub Pages:
   - **Apex (`dispatch.care`)** — four `A` records:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - **`www` subdomain** — `CNAME` → `dispatch-health.github.io`
3. Back in **Settings → Pages**, set **Custom domain** to `dispatch.care` and tick **Enforce HTTPS** once the cert provisions (can take a few minutes).

### Day-to-day deploys

```sh
git add .
git commit -m "..."
git push origin main
```

Pages rebuilds in under a minute. The `.nojekyll` file at the root tells GitHub to skip Jekyll processing and serve files as-is.

## Notes

- `noindex, nofollow` is currently set in `index.html` — remove before going public.
- `assets/img/framer-source/` is gitignored (local-only Framer exports).
- `scripts/` contains pixel-diff/screenshot tooling used during the design port; not part of the deployed site.
