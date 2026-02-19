# Agri Assist — Website

This repository contains the **Agri Assist website** built with **Vite + React + TypeScript + Tailwind (shadcn-ui)**.

The actual app lives in `agri-assist-ui-main/`. The repo root is a small **workspace wrapper** so you can run everything from the top-level folder.

## Run locally

```sh
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:8080`).

## Build for deployment (static website)

```sh
npm run build
```

Your deployable static site will be generated at:

- `agri-assist-ui-main/dist/`

## Preview the production build

```sh
npm run preview
```

## Deploy notes (SPA routing)

This is a **single-page app**. If you deploy to a static host (Netlify/Vercel/etc.), you must configure a rewrite so deep links (e.g. `/login`) are served by `index.html`.

This repo includes a Netlify `_redirects` file to handle that automatically.


