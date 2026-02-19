# Netlify Deployment Guide - Agri Assist

## Requirements

### 1. **Project structure**
Your repo must have this structure:
```
your-repo/
├── netlify.toml          ← at root
├── agri-assist-ui-main/  ← app folder
│   ├── package.json
│   ├── .env
│   ├── src/
│   ├── public/
│   └── vite.config.ts
```

**If your app is at the repo root** (no `agri-assist-ui-main` subfolder), update `netlify.toml`:
```toml
[build]
  base = "."
  command = "npm run build"
  publish = "dist"
```

### 2. **Environment variables** ⚠️ CRITICAL - Required for login to work!

**⚠️ Without these, you'll get "Invalid API key" error!**

Set these in Netlify dashboard:

**Site settings → Environment variables → Add variable**

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://zusbsuunzhaocsacanai.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c2JzdXVuemhhb2NzYWNhbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzY0NDAsImV4cCI6MjA4MTgxMjQ0MH0.vHHra1aIN_TpQ2DaO3adFNRL1SmR4iuaPG98HV7K4VE` | ✅ Yes |

**Important:**
- ✅ Variable names are case-sensitive: `VITE_SUPABASE_URL` (not lowercase)
- ✅ Must start with `VITE_` for Vite to include them
- ✅ After adding, you MUST redeploy (trigger deploy or push new commit)
- ✅ The `.env` file is NOT deployed - you MUST add these in Netlify dashboard

**See `NETLIFY_ENV_SETUP.md` for detailed step-by-step instructions.**

### 3. **Node.js version**
Netlify uses Node 18 by default. Add to `netlify.toml` if needed:
```toml
[build.environment]
  NODE_VERSION = "18"
```

---

## Deploy steps

### Option A: Deploy via GitHub (recommended)

1. Push your code to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Connect your GitHub repo.
4. Netlify will use `netlify.toml` automatically.
5. Add environment variables (see above).
6. Click **Deploy site**.

### Option B: Deploy via Netlify CLI

```bash
cd agri-assist-ui-main
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Option C: Drag & drop

1. Build locally:
   ```bash
   cd agri-assist-ui-main
   npm install
   npm run build
   ```
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**.
3. Drag the `agri-assist-ui-main/dist` folder into the deploy area.

---

## Verify

- `netlify.toml` is present at repo root.
- `base = "agri-assist-ui-main"` matches your app folder name.
- `publish = "dist"` is correct for Vite.
- SPA redirects are set (all routes → `index.html`).
- `VITE_SUPABASE_*` env vars are set in Netlify.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm run build` not found | Ensure `base` points to the folder with `package.json`. |
| 404 on refresh | Check `[[redirects]]` in `netlify.toml` or `public/_redirects`. |
| Supabase not working | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify. |
| Build fails | Check build logs; ensure `npm ci` or `npm install` runs before `npm run build`. |
