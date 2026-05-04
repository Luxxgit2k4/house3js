# Garden House Portfolio

A scroll-driven Three.js website that turns a portfolio into a cinematic house tour.

Visitors begin in a flower-filled garden, move toward the house as they scroll, enter through the front door, climb the staircase, pause at the corridor where a dancing character appears, and finish on the terrace overlooking the full garden. The scene uses free-look camera motion, animated environment details, imported GLTF assets, postprocessing, and layered ambient audio to make the walkthrough feel more like a guided space than a standard landing page.

## Experience Overview

- Wind-reactive garden with flowers, grass, sky, clouds, birds, and a spinning windmill
- Slow scroll narrative that moves from the outdoor hero to the house interior
- Entrance, living area, staircase climb, corridor reveal, dancing room, and terrace finale
- Free-look camera behavior on mouse and touch so the viewer can look around naturally
- Intro overlay and sound toggle to handle browser audio restrictions cleanly
- Ambient sound layers for outdoor wind, room tone, TV space, stairs, and dance-room energy

## Tech Stack

- `Vite` for development and production builds
- `Three.js` for rendering, lighting, animation, cameras, and imported models
- `Vitest` with `jsdom` for unit testing
- `pre-commit` hooks for local quality and security checks

## Project Structure

- [src/main.js](src/main.js) boots the scene, renderer, animation loop, camera behavior, audio, and the full story flow
- [src/style.css](src/style.css) contains the visual shell, intro overlay, HUD, and scroll-space styling
- [src/app-shell.js](src/app-shell.js) renders the DOM shell around the canvas and updates the progress HUD
- [src/scene-config.js](src/scene-config.js) defines the camera path through the experience
- [src/story-math.js](src/story-math.js) holds interpolation and motion helpers used by the story system
- [src/profile-utils.js](src/profile-utils.js) contains parsing helpers and data utilities used by the project tests and content helpers
- [public/models](public/models) stores imported GLTF assets used in the scene

## Prerequisites

- A recent Node.js LTS release
- `npm`
- `pre-commit` installed locally if you want the git hooks enabled
- `gitleaks` installed locally if you want the full hook flow to run successfully

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build a production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Testing

This project uses `Vitest` because it fits a Vite-based codebase cleanly and is easy to run in local development and CI pipelines.

Run the test suite once:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The current tests focus on the logic that is practical to verify in CI:

- shell rendering and HUD updates
- camera-path sampling and scroll math helpers
- scene configuration structure
- parsing and fallback utility functions
- static data shape checks

This is a unit-test setup, not a visual regression or browser automation suite. It is enough for a pipeline gate, but it does not verify rendered pixels.

## Git Hooks

This repository includes `pre-commit` and `pre-push` hooks so the basic security and hygiene checks run before code leaves your machine.

Enable the hooks after cloning:

```bash
pre-commit install
pre-commit install --hook-type pre-push
```

Current hook behavior:

- `pre-commit` runs secret scanning, private-key detection, large-file checks, merge-conflict checks, end-of-file fixes, and trailing-whitespace cleanup
- `pre-push` runs a full `gitleaks` scan and `npm audit --audit-level=high`

If a hook fails, fix the underlying issue rather than bypassing it. In practice, the pre-push hook can block a push if dependency vulnerabilities at `high` or above are present.

## Working On The Experience

- Scroll to move through the story
- Move the mouse or touch-drag to look around
- Click `Enter experience` before expecting audio, because browsers require a user gesture before sound can start
- Use headphones or speakers when tuning the sound mix; the project relies on layered low-volume ambience rather than a single loud track

## Notes

- This is a frontend-only project with no backend service
- The scene is intentionally asset-heavy because it includes Three.js rendering, postprocessing, GLTF models, and audio logic
- Production builds may show a bundle-size warning from Vite; that is expected for the current scope of the experience
