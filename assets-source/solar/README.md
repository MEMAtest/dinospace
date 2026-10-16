# Solar planet assets

Nine editable Blender 4.5.3 LTS scenes and optimised GLB/PNG exports.

## Source and credit

Earth uses the NASA Blue Marble surface-colour map recorded in `supplemental-textures.json`, replacing the bathymetric display in the reference GLB.

The input model URLs and SHA256 hashes are in `nasa-sources.json`. Mars is credited by its source page to NASA/JPL-Caltech; the other source models to NASA Visualization Technology Applications and Development (VTAD). NASA materials are used as educational reference assets; no NASA endorsement is implied. Source use guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/ . The UI is a simplified educational display, not a scale or orbital simulation.

## Rebuild

1. `python3 scripts/solar/download_sources.py` downloads and verifies original GLBs into ignored `tmp/solar-nasa-originals`.
2. Run Blender in background: `Blender --background --python scripts/solar/prepare_planets.py`.
3. `node --test test/solarPlanetModels.test.mjs test/solarDiscoveryPassport.test.mjs` checks binary completeness, embedded textures, source hashes and mobile budgets.

Preparation normalises the body radius rather than ring bounds, welds UV-seam vertices before subdivision to avoid cracks, bounds the mesh budget, limits textures to 1024px, applies PBR material settings, exports each world separately, and renders 320px transparent planet-picker thumbnails. Full NASA inputs are not shipped to browsers. All runtime files are local under `public/models/solar-v1`; the runtime never downloads them from NASA. A local procedural planet remains usable if its upgraded model fails.

`*.blend1` files are temporary Blender backup files, not source assets.
