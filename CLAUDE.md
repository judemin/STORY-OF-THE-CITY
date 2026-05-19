# Story of the City - Claude Code Rules

## Project
Story of the City is a pixel-art healing focus timer service.
The main experience is watching a living city grow while the timer runs.
The city must feel alive, readable, dense, and beautiful at all times.

## Tech stack
- **Build**: Vite + React (JavaScript, no TypeScript)
- **Entry**: `index.html` → `src/main.jsx` → `src/App.jsx`
- **Logic modules**: `src/*.js` (React 비의존, 기존 그대로)
- **CSS**: `styles/base.css`, `styles/hud.css`, `styles/canvas.css`
- **Dev**: `npm run dev` (Vite dev server, http://localhost:5173)
- **Build**: `npm run build` → `dist/`
- **Preview**: `npm run preview`
- **Deploy**: Vercel Git 연동 — framework: vite, output: dist

## Output rules
- Do not output full code, functions, diffs, or full file contents unless explicitly requested.
- Keep explanations short.
- Modify only the requested scope.
- Do not reinterpret the direction when fixed rules are provided.

## Core visual rules
- Perspective is 2D flat diorama — horizontal layered city scene (foreground / midground / background).
- Isometric 2.5D, top-down, and forced depth illusion are no longer used.
- The scene is a side-view 2D city panorama: buildings appear as flat 2D sprites with clear silhouettes.
- Logical resolution must remain 960x540.
- Canvas must fill the full available area except the HUD.
- HiDPI must be handled with separate CSS size and backing resolution using devicePixelRatio.
- Pixel smoothing must remain disabled.
- Integer-first scaling is preferred.
- Responsive behavior must preserve a fixed aspect ratio.
- Do not stretch the canvas independently on each side.

## City rules
- The first screen must already look like a city.
- The full canvas width must be filled with city scenery at all times — no black edges or empty sky.
- The scene uses 5 depth layers (world y 0–7 = far bg, 8–15, 16–23, 24–31, 32–41 = foreground).
- Each layer has its own baseY, tileW, and floorH scale for parallax depth effect.
- Buildings must not be simple boxes.
- Buildings must have readable roofs, facades, windows, signage, structures, and edge highlights.
- All design elements must be fully opaque — do not use rgba or globalAlpha on city objects.

## Scene generation rules
- Rebuild the map on every refresh or reconnection.
- Do not rely on persistent map reuse after reload.
- Prefer designed urban blocks over sparse random scatter.
- Roads, plazas, walkways, bridges, and gaps must read as intentional spaces.

## Animation rules
- All city animation must run only while the timer is actively running after Start.
- When paused, the city must be completely frozen.
- This includes cars, lighting animation, flicker, environmental motion, and all other animated city behavior.

## Time-of-day rules
- The city must follow the user's current real-world time.
- Supported periods: dawn, morning, day, afternoon, evening, night.
- Morning/day/afternoon should rely on sunlight and shadow.
- Evening/night should turn on windows, signs, streetlights, and vehicle lights naturally.
- Daytime must still look beautiful without relying on artificial lighting.

## Vehicle rules
- Cars must read as actual cars, not simple moving blocks or dots.
- Cars should follow believable road structure and direction.
- Night cars should show readable light behavior.
- Day cars should read clearly by body shape, not only by lights.

## Quality bar
- The result must feel like a designed city scene, not a rough procedural map.
- If the output still looks sparse, boxy, or unfinished, improve structure before polishing color.
- Prioritize building identity, block composition, and urban readability before minor effects.

## Context reuse rule
- Before inspecting source code, check whether the task can be resolved using existing guidance in `.docs/` or project rules in `CLAUDE.md`.
- Treat `.docs/` as the primary context store for design, plan, and testing intent.

## Token rules
- Read only the minimum relevant files.
- Do not reread the whole codebase for narrow tasks.
- Reuse `.docs/` and existing context first.
- Avoid unrelated changes.
- Keep outputs short and do not dump full code unless asked.
