import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAME, type MomentNote } from './types';

const databasePromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-video', 'videoId');
      store.createIndex('by-updated', 'updatedAt');
    }
  },
});

export async function listNotes(videoId?: string): Promise<MomentNote[]> {
  const database = await databasePromise;
  const notes = videoId
    ? await database.getAllFromIndex(STORE_NAME, 'by-video', videoId)
    : await database.getAll(STORE_NAME);
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNotesForVideo(videoId: string): Promise<MomentNote[]> {
  const database = await databasePromise;
  const notes = await database.getAllFromIndex(STORE_NAME, 'by-video', videoId);
  return notes.sort((a, b) => a.seconds - b.seconds);
}

export async function createNote(
  input: Omit<MomentNote, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<MomentNote> {
  const database = await databasePromise;
  const now = Date.now();
  const note: MomentNote = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await database.add(STORE_NAME, note);
  return note;
}

export async function deleteNote(id: string): Promise<void> {
  const database = await databasePromise;
  await database.delete(STORE_NAME, id);
}
