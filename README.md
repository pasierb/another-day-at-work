# Another Day at Work

A Phaser 4 workstation survival game. The current build opens directly into a responsive, static workstation shell that establishes the interface for later gameplay systems.

## Commands

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server on port 8080.
- `npm run build` creates a production build in `dist`.

## Structure

- `src/game/main.ts` configures Phaser and its 1280×720 logical canvas.
- `src/game/scenes` contains the loading and workstation scenes.
- `src/game/ui` contains shared theme, layout, and presentation primitives.
- `public/style.css` hosts and letterboxes the canvas.
- `docs` contains the game design and visual reference.
