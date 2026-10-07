# Contributing

Thanks for helping improve YouTube Moment Notes. Contributions may include bug reports, documentation improvements, accessibility fixes, browser compatibility work, or new features.

## Before opening an issue

- Check existing issues for duplicates.
- Include your browser and version, operating system, and the steps to reproduce the problem.
- Do not include private notes, account details, or other sensitive information in screenshots or logs.

## Set up a development build

1. Install Node.js 20 or newer and Git.
2. Clone the repository and run `npm install` from its root.
3. Run `npm run dev` and load WXT's generated `.output/chrome-mv3` directory as an unpacked extension.
4. Reload the extension and the affected YouTube page when testing changes.

Useful scripts are listed in the root README. Keep generated output and installed packages out of commits; `.gitignore` excludes them.

## Pull requests

- Keep changes focused and explain the user-facing reason for the change.
- Update documentation when behavior, setup, permissions, or data handling changes.
- Do not commit personal data, browser profiles, credentials, private notes, `node_modules/`, or `.output/`.
- Describe the browsers and manual steps used to verify the change. If you did not verify it in a browser, state that clearly.

By submitting a contribution, you agree that it may be distributed under the project's MIT License.
