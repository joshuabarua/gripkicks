## Design Context

### Users
Climbers of all levels looking to find the perfect climbing shoe based on their foot shape, volume, and preferences. They use the app to browse shoes, analyze their foot profile in the "Foot Lab", and manage their personal "Shoe Sanctuary" collection. The interface should evoke excitement, joy, and curiosity as they explore the 3D models and technical details.

### Brand Personality
Engaging, Slick, Modern.
The tone is interactive and highly visual, blending the technical aspects of climbing gear with a polished, consumer-facing digital experience.

### Aesthetic Direction
Technical/precise with fluidity/organic elements.
The UI leverages an orientation-based fluid responsive design system, avoiding rigid breakpoints for a seamless scaling experience. The visual language includes a bold orange accent (`hsl(17, 83%, 54%)`), distinct custom typography (ball-pill headings, DM Mono body; so-cloudy only in Sanctuary), and engaging interactive states like 3D perspective hovers and slow-spinning gradients. It balances high-precision data display with organic, flowing interactions.

### Design Principles
1. **Fluidity Above All**: Utilize the custom orientation-based scaling system (`var(--scale)`) to ensure typography, spacing, and layouts smoothly adapt to any device without abrupt breakpoint snapping.
2. **Engaging & Interactive**: Capitalize on micro-interactions (e.g., perspective text on hovers, gradients) and 3D visuals (React Three Fiber) to spark joy and curiosity during exploration.
3. **Technical Elegance**: Present complex, precise data (shoe aggressiveness, stiffness, volume) cleanly and clearly, maintaining a slick and modern aesthetic that feels like a premium tool rather than a basic spreadsheet.
4. **Bold Contrast**: Leverage the dark/light mode foundations, ensuring the primary orange accent pops and draws attention to key interactions, while letting the 3D models and shoe imagery take center stage.
5. **Two-Font Typography**: Use Ball Pill for headings and DM Mono (`font-mono`) for all body copy, labels, data and controls. So Cloudy is reserved for Sanctuary only (its page title and Sanctuary dialogs). Do not load or use Sora, Basteleur or Tanker.

### Constraints
1. **No Marketing Fluff**: No numbered feature lists (01/02/03), no "Precision fit system", no "Smart Match", no promotional copy. Use minimal placeholder text like "Layout test. No marketing copy."
2. **No Accent-Colored Text**: The orange/red accent (`brand-red`) is for shapes, borders, buttons only. Never use it on body text, headings, or marketing copy.
3. **Minimal Copy**: Strip all "weird ass fluff" — mission statements, value propositions, founder stories, FAQ sections. Keep only functional UI labels.
4. **Editorial Test Themes**: Homepage variations follow editorial hybrid aesthetic (japanese, retro, gorp) with grain overlays, halftone patterns, serif italic typography hierarchy.
5. **Lab Visual System**: Homepage, Dashboard, Matcher and Foot Lab share the Foot Lab language: black canvas, `lab-card` charcoal cards with the red monolith hover bar, `lab-card-active` red glow for selected or primary panels, `lab-button` for primary actions, `lab-button-ghost` for secondary actions, `lab-label` for small labels, `lab-rise` staggered entrance motion, and `LabHeader` for page titles. Avoid pale chalk panels and tagline copy. Keep the Tools grid at a maximum of two columns without decorative icons, and keep the hero navigation arrow-only with an accessible label.
6. **Motion**: Entrances use the CSS `lab-rise`/`lab-fade` utilities with `riseDelay` from `src/lib/motion.ts`. Interactions (expand/collapse, sliding bars, hover/tap, exits) use framer-motion presets from `src/lib/motion.ts`. Do not put `lab-rise` on an element that also gets framer transforms; wrap it instead. `MotionConfig reducedMotion="user"` is set in providers.

## Verification and Image Maintenance

- Use Yarn 4. Run `yarn lint` and `yarn test:run` for normal verification. On resource-constrained machines, run `yarn workspace web test:run --maxWorkers=1`, `yarn test:convex --maxWorkers=1`, and `yarn test:shoe-images` separately. Avoid running parallel test workers alongside background removal.
- For local browser checks, set `E2E_CHANNEL=chrome` to use installed Chrome when the bundled Playwright Chromium browser is unavailable.
- Keep lazy shoe images mounted while loading; a timeout may show a temporary fallback but must not cancel the original request. Verify the Add Shoe dialog after waiting more than five seconds before scrolling, and check HTTP image delivery rather than database URL presence alone.
- Background removal uses Python 3.11 with `scripts/shoe-image-requirements.txt`. Create the virtual environment under the ignored `temp/` directory. Run `scripts/prepare-shoe-images.py` after selecting exact-model source images in `data/shoe-image-selections.json`.
- Review the generated checkerboard contact sheets before `yarn backfill:shoe-images approve --reviewed`. Uploads preserve existing ImageKit files, verify the original PNG bytes, and use each catalog's ImageKit folder.
- Run `yarn backfill:shoe-images plan` before `apply`. Fill missing database images only. Verify development before using `--prod`; production requires `CONVEX_PROD_URL`. Existing-image snapshots and downloads stay under `temp/shoe-images/`.

## Render keep-alive

- `workers/render-keepalive/` is a standalone Cloudflare Worker cron (not a Yarn workspace) that pings `https://api.grip-kicks.com/health` every 10 minutes to stop Render free-tier spin-down.
- Deploy it with `yarn deploy:keepalive` (uses `npx wrangler@4.150.0`, no local install).
- Render free tier includes 750 instance-hours/month, so keep only one always-on free service.
