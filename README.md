# Rideekanda Forest Monastery — Road Construction Project

A donation site for the 2,000 ft concrete road to Rideekanda Forest Monastery.
Supporters pledge the road by the linear foot (LKR 2,706/ft); a floating button
opens an animated vertical "carpet" that rolls out the road's progress.

## Files

| File | Purpose |
|------|---------|
| `index.prod.html` | **Deploy this.** Production page — pre-compiled JS, no in-browser transpiler. Rename to `index.html` on your host / GitHub Pages. |
| `index.html` | Dev page — loads the JSX directly via in-browser Babel. Handy for quick edits, slower to load. |
| `styles.css` | All styling (forest-monastery design system). |
| `sections.jsx` / `app.jsx` | **Source.** Hero, project info, engineering table, the pledge road, budget, the progress modal. |
| `sections.js` / `app.js` | Compiled output of the `.jsx` files (loaded by `index.prod.html`). |

## Deploying to GitHub Pages

1. Push this folder to a repo.
2. Rename `index.prod.html` → `index.html` (or set it as the entry point).
3. Settings → Pages → deploy from `main` / root. No build step needed.

## Editing

Edit the `.jsx` source, then recompile to refresh `sections.js` / `app.js`:

```bash
npx @babel/cli@7 --presets @babel/preset-react sections.jsx -o /tmp/s.js
# (each compiled file is wrapped in an IIFE; see existing output)
```

Pledges are stored in the visitor's browser (`localStorage`). The **Donate** button
is a front-end prototype — wire it to your payment provider before going live.
