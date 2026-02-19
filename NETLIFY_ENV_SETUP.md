# Fix "Invalid API Key" Error - Netlify Environment Variables Setup

## Problem
After deploying to Netlify, you're getting "Invalid API key" error when trying to login.

## Solution
You need to add environment variables in Netlify dashboard. The `.env` file is NOT deployed for security reasons.

---

## Step-by-Step Fix

### 1. Get Your Supabase Credentials

From your `.env` file, you have:
```
VITE_SUPABASE_URL="https://zusbsuunzhaocsacanai.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Add Environment Variables in Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**

Add these **TWO** variables:

#### Variable 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://zusbsuunzhaocsacanai.supabase.co`
- **Scopes:** Leave default (All scopes)

#### Variable 2:
- **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c2JzdXVuemhhb2NzYWNhbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzY0NDAsImV4cCI6MjA4MTgxMjQ0MH0.vHHra1aIN_TpQ2DaO3adFNRL1SmR4iuaPG98HV7K4VE`
- **Scopes:** Leave default (All scopes)

### 3. Redeploy Your Site

After adding the variables:

**Option A: Trigger Redeploy**
- Go to **Deploys** tab
- Click **Trigger deploy** → **Deploy site**

**Option B: Push a New Commit**
- Make a small change (like adding a comment)
- Push to GitHub
- Netlify will auto-deploy with new env vars

---

## Verify It's Working

1. After redeploy, open your site
2. Open browser console (F12)
3. Check for errors - you should NOT see "Supabase environment variables are missing!"
4. Try logging in - it should work now!

---

## Important Notes

- ✅ Environment variables are case-sensitive: `VITE_SUPABASE_URL` (not `vite_supabase_url`)
- ✅ Must start with `VITE_` for Vite to include them in the build
- ✅ No quotes needed in Netlify (just paste the value directly)
- ✅ After adding variables, you MUST redeploy for changes to take effect

---

## Still Not Working?

1. **Check Build Logs:**
   - Go to **Deploys** → Click latest deploy → **Build log**
   - Look for any errors about missing env vars

2. **Verify Variable Names:**
   - Must be exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Check for typos or extra spaces

3. **Check Browser Console:**
   - Open site → F12 → Console tab
   - Look for error messages about Supabase

4. **Test Locally:**
   - Make sure `.env` file exists in `agri-assist-ui-main/` folder
   - Run `npm run build` locally to verify build works

---

## Quick Copy-Paste Values

**VITE_SUPABASE_URL:**
```
https://zusbsuunzhaocsacanai.supabase.co
```

**VITE_SUPABASE_PUBLISHABLE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1c2JzdXVuemhhb2NzYWNhbmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzY0NDAsImV4cCI6MjA4MTgxMjQ0MH0.vHHra1aIN_TpQ2DaO3adFNRL1SmR4iuaPG98HV7K4VE
```
