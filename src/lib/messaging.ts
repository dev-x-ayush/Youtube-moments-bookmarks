import { browser } from 'wxt/browser';
import dayjs from 'dayjs';
import type { ExtensionMessage, MomentNote, VideoSnapshot } from './types';

export async function sendExtensionMessage<T>(message: ExtensionMessage): Promise<T> {
  const response = await browser.runtime.sendMessage(message) as T | { error?: string };
  if (response && typeof response === 'object' && 'error' in response && response.error) {
    throw new Error(response.error);
  }
  return response as T;
}

export interface ActiveTab {
  id?: number;
  url?: string;
}

export async function getActiveTab(): Promise<ActiveTab | undefined> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export function getVideoIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'www.youtube.com' && parsed.hostname !== 'youtube.com') return undefined;
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v') ?? undefined;
    const match = parsed.pathname.match(/^\/(?:shorts|live|embed)\/([^/?]+)/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export async function getVideoSnapshot(tabId: number): Promise<VideoSnapshot | undefined> {
  try {
    return await browser.tabs.sendMessage(tabId, { type: 'video:get-snapshot' } satisfies ExtensionMessage);
  } catch {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['/content-scripts/youtube.js'],
      });
      return await browser.tabs.sendMessage(tabId, { type: 'video:get-snapshot' } satisfies ExtensionMessage);
    } catch {
      return undefined;
    }
  }
}

export async function getNotes(videoId?: string): Promise<MomentNote[]> {
  return sendExtensionMessage<MomentNote[]>({ type: 'notes:list', videoId });
}

export function formatTimestamp(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function formatNoteDate(timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY');
}
