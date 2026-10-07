# Troubleshooting

## Popup says “Open a YouTube video”

1. Confirm the tab is a regular `https://www.youtube.com/watch?...` video page. The popup cannot read arbitrary pages or every embedded player.
2. Confirm the browser granted the extension access to YouTube. In the extension's details page, allow it to read and change data on YouTube if the browser asks.
3. Reload the extension from the browser's extensions page, then refresh the YouTube tab.
4. Wait for the video player to appear and reopen the popup.
5. If it still fails, open the extension's service worker inspection page from the extensions page and check the Console for an error. Include the error text and browser version when filing an issue; remove any private information first.

## Player pin button or seek-bar markers are missing

- Use the production build or keep the WXT development process running.
- Make sure the unpacked extension points at `.output/chrome-mv3` and has no error shown on the extensions page.
- Refresh the YouTube watch tab after installing, updating, or reloading the extension.
- YouTube changes its player markup occasionally. If the popup works but the player controls do not, report the browser version, video page type, and reproducible steps.

## Notes do not appear in another browser

Notes are stored in each browser profile's extension IndexedDB. They are not synced across Chrome, Brave, Edge, profiles, or computers. The current release does not have export/import or cloud sync.

## I am about to uninstall or clear browser data

The notes belong to the extension's local browser data. Uninstalling the extension or clearing its extension data may delete them. There is currently no built-in backup/export feature, so keep the extension installed if you need those notes.

## Build or install problems

- Check that Node.js 20 or newer and npm are available.
- Run `npm install` from the project root, then `npm run build`.
- If dependency installation fails, use the current Node.js LTS release and remove/recreate `node_modules` before retrying. Do not delete the source files or browser data.
- Read the first error shown in the terminal; later errors may be consequences of the first one.
