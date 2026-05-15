# Story of the City - Codex Agent Rules

## Project
Story of the City is a pixel-art healing focus timer service.
The main experience is watching a living city grow while the timer runs.
The city must feel alive, readable, dense, and beautiful at all times.

## Output rules
- Do not output full code, functions, diffs, or full file contents unless explicitly requested.
- Keep explanations short.
- Modify only the requested scope.
- Do not reinterpret the direction when fixed rules are provided.

## Core visual rules
- Perspective must always be isometric 2.5D.
- Top-down is forbidden.
- Side-view skyline is forbidden.
- Logical resolution must remain 960x540.
- Canvas must fill the full available area except the HUD.
- HiDPI must be handled with separate CSS size and backing resolution using devicePixelRatio.
- Pixel smoothing must remain disabled.
- Integer-first scaling is preferred.
- Responsive behavior must preserve a fixed aspect ratio.
- Do not stretch the canvas independently on each side.

## City rules
- The first screen must already look like a city.
- City density must be high enough to avoid empty camera space.
- The map should be about 2.5x larger than the current baseline so the camera does not reveal empty areas.
- Camera adjustment is allowed to improve framing.
- Buildings must not be simple boxes.
- Buildings must have readable roofs, sides, facades, windows, signage surfaces, structures, and shadows.
- All design elements must be fully opaque.
- Do not use transparency for buildings, cars, trees, or other visual objects.

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