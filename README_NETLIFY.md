# CaseBuddy – Netlify Deployment

This repo is prepped for Netlify: Vite builds the React app to `dist/public` and
server endpoints are provided by Netlify Functions.

## Quick Deploy
1. **Push to GitHub** (this folder as the repo root)
2. On Netlify: **New site from Git**, pick the repo
3. Set **Build command** = `npm run build`
   Set **Publish directory** = `dist/public`
4. Add **Environment variables** (Site settings → Environment):
   - `ANTHROPIC_API_KEY` (optional; functions fall back to mock JSON if not present)
   - `ANTHROPIC_MODEL` (optional; defaults to `claude-sonnet-4-20250514`)
5. Deploy

## Included Functions
- `/.netlify/functions/subscription` → handles `GET /api/subscription/status` (trial unlocked)
- `/.netlify/functions/legal-analytics` → handles
    - `POST /api/legal-analytics/predict-outcome`
    - `POST /api/legal-analytics/judge-analytics`
    - `POST /api/legal-analytics/find-precedents`
    - `POST /api/legal-analytics/strategy-recommendations`
  If `ANTHROPIC_API_KEY` is set, functions will try the Anthropic API; otherwise
  they return structured mock data so the UI works out of the box.
- `/.netlify/functions/coupons` → minimal `validate` / `apply` demo endpoints
- `/.netlify/functions/health` → simple health check

## Build Details
- Frontend: Vite (root at `client/`), output to `dist/public`
- Path aliases: `@` → `client/src`, `@shared` → `shared`
- Redirects map `/api/*` calls to functions via `netlify.toml`
- The original Express server is **not** required on Netlify; we keep its source
  for local dev, but production uses functions instead.

## Local Dev (optional)
- `npm install`
- `npm run dev` (uses the original Express dev server)
- Or use Netlify CLI: `netlify dev` to run Vite + functions locally

## Notes
- Pages that hit gated endpoints rely on the subscription stub, which is enabled
  (trial + active subscription) so you can test the entire UI without wiring billing.
- Swap stubs with your real implementations over time if you want GCS, Neon, etc.