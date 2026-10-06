# Contributing

Keep the first-run experience small: one useful feature, clear defaults, and reports that work offline.

1. Open an issue describing the problem and a concrete example.
2. Create a branch and make a focused change.
3. Run `npm test` and `node bin/dtm.mjs demo --out your-demo.html`.
4. Open the report on desktop and a narrow screen. Check keyboard controls.
5. For capture changes, install Playwright and Chromium, capture a local fixture, and compare two snapshots.
6. Include the behavior change and validation in your pull request.

Use Node.js built-in APIs where practical. Do not add telemetry, a remote upload endpoint or external report assets. Treat page metadata as untrusted input. Keep generated screenshots, credentials and reports out of commits.

There is no automated pixel-difference engine yet. Avoid presenting visual slider comparisons as automated regression detection.
