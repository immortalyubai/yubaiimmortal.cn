# Immortal Site Launch Notes

This is a static personal site. The clean publish folder is generated in `dist/`.
Upload `dist/` for a manual static deploy, or import the project root when using Vercel / Netlify.

## Fastest Deploy

1. Run:

```bash
node scripts/build-static.mjs
```

2. Upload the `dist/` folder to Netlify Drop, Cloudflare Pages, Vercel, or any static hosting service.

## Vercel / Netlify

If importing this folder as a project:

- Build command: `node scripts/build-static.mjs`
- Output directory: `dist`

The configs are already included:

- `vercel.json`
- `netlify.toml`

## Before Public Launch

- Real contact links are already filled in `index.html`.
- Review the BGM file size before launch if loading speed becomes important.
- Rebuild `dist/` after every edit before uploading.
