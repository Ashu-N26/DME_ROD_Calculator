# DME & ROD CDFA Tool (Client-only)

This is a client-side CDFA (continuous descent final approach) calculator. All math runs in the browser (no backend). The app computes DME/ALT profiles and ROD tables and supports LNAV waypoint mode.

## How to run locally
1. cd frontend
2. npm install
3. npm run dev
4. Open http://localhost:5173

## Deploy to GitHub Pages (automatic)
Push to `main`. GitHub Actions (gh-pages workflow) builds and publishes `frontend/dist` to the `gh-pages` branch.

In repository settings → Pages, select `gh-pages` branch as site source. The site will be available at `https://<username>.github.io/<repo>/`.

## Notes
- All inputs are in feet and nautical miles.
- Published altitude is rounded up to next 10 ft.
- Threshold target altitude uses `THR elevation + 50 ft`.

