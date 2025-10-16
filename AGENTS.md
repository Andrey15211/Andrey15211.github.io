# Repository Guidelines

## Project Structure & Module Organization
The root landing page lives in `index.html`, `style.css`, and `script.js`; it loads the project cards and modal logic. Each showcase lives in its own directory (`1.10.25/`, `Test massive/`, `Paint/`, `Анекдоты/`, `Рисуем/`), keeping its HTML, CSS, JS, and media self-contained. New projects should follow this pattern: create a folder at the repository root, place supporting assets inside it, and add a card configuration in the root `script.js`. Use quoted paths when working with directories that contain spaces or Cyrillic characters (for example, `cd "Test massive"`).

## Build, Test, and Development Commands
- `python3 -m http.server 8000` — serves the entire site locally at http://localhost:8000 for quick manual checks.
- `python3 -m http.server 8000 -d "1.10.25"` — serves a single subproject if you want to focus on one experiment.
- `npx prettier --check "**/*.js" "**/*.css" "**/*.html"` — optional consistency audit before committing; add `--write` when ready to autofix.

## Coding Style & Naming Conventions
Follow the existing formatting: 4-space indentation in HTML/CSS and 2 spaces in JavaScript. Prefer double quotes for strings and attribute values to match `script.js`. IDs and class names remain lowercase with hyphens (e.g., `projects-grid`, `modal-link`). Keep CSS variables in `:root` for shared colors, and scope new component styles beneath a project-specific selector to avoid bleed-over when the landing page loads multiple stylesheets.

## Testing Guidelines
There is no automated test suite; rely on manual verification. After local serving, confirm that the landing page loads project metadata, the modal opens correctly, and the theme toggle persists through page reloads via `localStorage`. For `1.10.25`, verify audio cues (`correct.mp3`, `wrong.mp3`) and image assets load without 404s. Ensure quiz inputs in `Test massive` and canvas interactions in `Paint` behave in Chromium- and Gecko-based browsers, since layout relies on CSS grid and custom fonts.

## Commit & Pull Request Guidelines
The current Git history uses placeholder messages (“1”); please provide descriptive, imperative subject lines such as `feat: add memory quiz project card`. Group related changes per commit to ease reversions. Pull requests should include: a concise summary of the change, manual test notes or browser list, updated screenshots or GIFs for UI tweaks, and cross-links to any GitHub issues or tasks when relevant.
