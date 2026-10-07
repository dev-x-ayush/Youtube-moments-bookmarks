# Privacy and data storage

Moment Notes is designed to work locally without an account or hosted service.

## What is stored

For each saved note, the extension stores the YouTube video ID, title and URL, the timestamp in seconds, the note text, and creation/update times. The records are stored in an IndexedDB database named `youtube-moment-notes` under the extension's browser storage origin.

## Where it stays

The extension reads the current YouTube page to identify the video and time, and sends note operations to its own background worker. The worker writes the note to the local database. The current code does not send notes or video metadata to a remote server.

Each browser profile has separate extension storage. Notes are not shared between Chrome, Brave, Edge, separate profiles, or devices. There is no sync, export, or import feature at this time.

## User controls

Users can review and delete notes from the extension library. Browser settings can clear extension storage, and uninstalling the extension can remove its data. Important notes should be copied elsewhere before removing the extension.

## Permissions

The manifest requests active-tab/scripting access and host access to YouTube pages for the extension's player and current-video features. It does not request blanket access to unrelated websites. Browser permission behavior can vary; review the permissions shown by your browser when installing an unpacked build.
