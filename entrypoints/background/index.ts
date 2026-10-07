import { browser } from 'wxt/browser';
import { createNote, deleteNote, getNotesForVideo, listNotes } from '../../src/lib/database';
import type { ExtensionMessage } from '../../src/lib/types';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    let operation: Promise<unknown>;
    switch (message.type) {
      case 'notes:list':
        operation = listNotes(message.videoId);
        break;
      case 'notes:create':
        operation = createNote(message.note);
        break;
      case 'notes:delete':
        operation = deleteNote(message.id);
        break;
      case 'video:get-notes':
        operation = getNotesForVideo(message.videoId);
        break;
      case 'video:get-snapshot':
      case 'video:seek':
      case 'video:refresh-notes':
        return false;
    }

    void operation.then(sendResponse, (error: unknown) => {
      console.error('Could not process Moment Notes message', error);
      sendResponse({ error: error instanceof Error ? error.message : String(error) });
    });
    return true;
  });
});
