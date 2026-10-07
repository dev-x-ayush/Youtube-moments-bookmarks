# Project and file guide

## Source tree

```text
entrypoints/
  background/index.ts       Extension background worker and note message handling
  popup/                    Toolbar popup interface
  dashboard/                Full notes library and timeline visualization
  youtube.content/          YouTube player button, note form, and seek-bar markers
src/
  components/ui/            Shared React controls
  lib/database.ts           IndexedDB operations using idb
  lib/messaging.ts          Helpers for communicating between extension parts
  lib/types.ts              Note schema and message types
  styles/global.css         Shared UI styles
docs/                       User and project guides
package.json                Scripts and dependency declarations
pnpm-lock.yaml              Locked dependency versions for pnpm installs
pnpm-workspace.yaml         pnpm workspace/build configuration
tsconfig.json               TypeScript compiler configuration
wxt.config.ts               WXT, browser permissions, React, and Tailwind setup
```

## Generated and local-only files

- `node_modules/` contains installed packages. Recreate it with the package manager; do not commit it.
- `.output/` contains built extension files. Recreate it with `npm run build` or `npm run dev`; load `.output/chrome-mv3` in the browser.
- `.wxt/` contains generated WXT types and support files.
- Browser notes live in the extension's IndexedDB database, not in this source folder. Source control does not contain a user's notes.

These generated directories are ignored by Git. Edit source/configuration files, then rebuild; changes made directly to generated files are overwritten.

## How a note is saved

The YouTube content script reads the current watch-page video and timestamp. The popup and content script send typed extension messages to the background worker. The worker calls the shared database functions, which persist note records in IndexedDB under the extension origin. The library reads those records, supports search/deletion, and plots timestamps with Plotly.

## Browser permissions

The manifest requests `activeTab` and `scripting` for access to the active tab and content-script setup, and `https://www.youtube.com/*` host access so player integration can run on YouTube pages. It does not request access to other sites or a remote API.

## Changing the database

The current database version and record shape are declared in `src/lib/types.ts`; object-store setup is in `src/lib/database.ts`. If a future change needs a new store or index, add a versioned IndexedDB upgrade and consider how existing local notes will be preserved. Do not rename/delete the database casually: that can strand or erase user data.
