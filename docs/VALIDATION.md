# Validation for this prepared version

- Nine automated tests passed locally: input validation, snapshot preservation, escaping, malformed records, portable reports, argument parsing, capture orchestration, and browser cleanup.
- The generated fictional demo was opened in the Codex browser. Keyboard slider movement, Blink and Center were checked. A screenshot is saved in `docs/preview.png`.
- Core tests use mocked browser objects for capture orchestration. A real Playwright screenshot capture was **not verified in this preparation environment**, because it blocks spawning browser processes and has no bundled Chromium installation.
- To verify real capture on your machine: run `npm install`, `npm run setup`, start your website, then use the two capture commands in the README and compare them.
- The included GitHub Actions workflow has been prepared but has not run on GitHub yet.
