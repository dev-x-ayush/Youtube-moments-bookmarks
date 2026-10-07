# YouTube Moment Notes

Save a short note at an exact point in a YouTube video, then return to it from the player or your private library. Notes are stored locally in your browser profile using IndexedDB. There is no account, server, or subscription.

## Features

- Save the current video time from the extension popup.
- Save a note from a pin button beside YouTube's player controls, with an inline note form.
- See saved moments on the seek bar and click a marker to jump to that time.
- Browse, search, open, and delete notes in a separate library page.
- View saved moments in a timeline visualization.
- Store note text and video details locally in IndexedDB.

## Requirements

- A desktop Chromium browser such as Chrome, Brave, or Microsoft Edge.
- Node.js 20 or newer and npm for building from source. A current LTS release is recommended.
- Git to clone the source repository.
- YouTube access for using the extension. The extension needs access to `https://www.youtube.com/*` to read the current video and add timeline controls.

This project is a browser extension, not a hosted web service or an npm package. No backend, database server, login, API key, or Python installation is required.

## Install from source

1. Clone or download this repository.
2. In a terminal, change into the project folder.
3. Install dependencies and create a production build:

   ```sh
   npm install
   npm run build
   ```

4. Open the browser's extensions page:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
5. Turn on **Developer mode**.
6. Select **Load unpacked** and choose the generated `.output/chrome-mv3` folder inside the project.
7. Open or reload a YouTube video tab. If it was already open, refresh the page so the extension can attach its player controls.

For local development with automatic rebuilds, run `npm run dev`, then load the development output folder WXT reports (usually `.output/chrome-mv3`). Keep the process running and reload the extension and YouTube tab after source changes.

The build output is generated. Do not edit files in `.output` directly; edit the source files and rebuild.

## Use the extension

### Save from the YouTube player

1. Open a regular YouTube video page (`youtube.com/watch?v=...`).
2. Use the pin button beside the player controls.
3. Enter a short note in the form over the video and choose **Save note**.
4. A marker appears on the video's seek bar. Click it later to jump to that moment and display the note.

### Save from the extension popup

1. Start or pause the video at the point you want to remember.
2. Select the Moment Notes extension icon in the browser toolbar.
3. Enter a note and choose **Save at [time]**.

### Find, open, and delete notes

- Select **Library** in the popup to open the full notes page.
- Search by note text or video title.
- Select a note to open its video at the saved time.
- Select the trash icon beside a note to delete it. Deletion is immediate.
- The popup also shows recent notes for the currently open video.

## Data, privacy, and storage

- Notes are stored in the browser extension's IndexedDB database, named `youtube-moment-notes`.
- The database contains note text, video ID/title/URL, timestamp in seconds, and creation/update times.
- The extension has no network service or account and does not upload notes.
- Data belongs to the browser profile and extension installation. Chrome, Brave, and Edge have separate profiles/storage; notes do not automatically sync between browsers or computers.
- Removing the extension or clearing its site/extension data can remove the notes. Back up important notes before uninstalling; export/import is not currently included.

## Development

```sh
npm install
npm run dev          # Chromium development build
npm run build        # Chromium production build
npm run zip          # Package the production build
npm run dev:firefox  # Firefox development build
npm run build:firefox
```

WXT builds the extension from `entrypoints/` and writes generated files under `.output/`. The source uses TypeScript, React, Tailwind CSS, `idb` for IndexedDB access, Day.js for date formatting, and Plotly.js for the library timeline.

## Project files

See [docs/PROJECT-GUIDE.md](docs/PROJECT-GUIDE.md) for the directory map and details on which files are source, configuration, dependencies, and generated output. See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common browser setup issues.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes. This project is licensed under the MIT License; see [LICENSE](LICENSE).

## Trademark notice

YouTube and Google are trademarks of Google LLC. This independent project is not affiliated with, endorsed by, or sponsored by Google LLC. Product names are used only to describe compatibility. No third-party watermark or endorsement is implied.
