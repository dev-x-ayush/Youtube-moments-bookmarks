export interface MomentNote {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  seconds: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface VideoSnapshot {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  seconds: number;
  duration: number;
}

export type ExtensionMessage =
  | { type: 'notes:list'; videoId?: string }
  | { type: 'notes:create'; note: Omit<MomentNote, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'notes:delete'; id: string }
  | { type: 'video:get-snapshot' }
  | { type: 'video:seek'; seconds: number }
  | { type: 'video:refresh-notes' }
  | { type: 'video:get-notes'; videoId: string };

export const DB_NAME = 'youtube-moment-notes';
export const DB_VERSION = 1;
export const STORE_NAME = 'notes';
