import { browser } from 'wxt/browser';
import type { ExtensionMessage, MomentNote, VideoSnapshot } from '../../src/lib/types';
import './style.css';

let videoId = '';
let notes: MomentNote[] = [];
let refreshTimer: number | undefined;
let renderedSignature = '';
let composer: HTMLElement | undefined;

function currentVideoId(): string {
  return new URL(location.href).searchParams.get('v') ?? '';
}

function getVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video.html5-main-video');
}

function getSnapshot(): VideoSnapshot | undefined {
  const video = getVideo();
  const id = currentVideoId();
  if (!video || !id) return undefined;
  const title = document.querySelector('#above-the-fold h1 yt-formatted-string')?.textContent?.trim()
    || document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim()
    || document.title.replace(/\s*-\s*YouTube$/, '').trim()
    || 'YouTube video';
  return {
    videoId: id,
    videoTitle: title,
    videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    seconds: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
  };
}

function formatTimestamp(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function seekTo(seconds: number) {
  const video = getVideo();
  if (video) video.currentTime = seconds;
}

function showNoteToast(note: MomentNote) {
  document.querySelector('#moment-notes-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'moment-notes-toast';
  toast.textContent = `✎  ${formatTimestamp(note.seconds)} — ${note.text}`;
  toast.setAttribute('role', 'status');
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function closeComposer() {
  composer?.remove();
  composer = undefined;
}

function openComposer() {
  closeComposer();
  const player = document.querySelector<HTMLElement>('#movie_player');
  const snapshot = getSnapshot();
  if (!player || !snapshot) return;

  const panel = document.createElement('section');
  panel.id = 'moment-notes-composer';
  panel.innerHTML = `
    <header class="mn-composer-header">
      <div><strong>Save a moment</strong><span class="mn-composer-time"></span></div>
      <button class="mn-composer-close" type="button" aria-label="Close note form">×</button>
    </header>
    <form class="mn-composer-form">
      <textarea class="mn-composer-text" maxlength="500" required placeholder="What do you want to remember here?"></textarea>
      <p class="mn-composer-error" hidden></p>
      <footer class="mn-composer-actions">
        <button class="mn-composer-cancel" type="button">Cancel</button>
        <button class="mn-composer-save" type="submit">Save note</button>
      </footer>
    </form>`;
  panel.querySelector<HTMLElement>('.mn-composer-time')!.textContent = formatTimestamp(snapshot.seconds);
  const textarea = panel.querySelector<HTMLTextAreaElement>('.mn-composer-text')!;
  const form = panel.querySelector<HTMLFormElement>('.mn-composer-form')!;
  const saveButton = panel.querySelector<HTMLButtonElement>('.mn-composer-save')!;
  const error = panel.querySelector<HTMLElement>('.mn-composer-error')!;
  panel.querySelector('.mn-composer-close')!.addEventListener('click', closeComposer);
  panel.querySelector('.mn-composer-cancel')!.addEventListener('click', closeComposer);
  panel.addEventListener('click', (event) => event.stopPropagation());
  panel.addEventListener('keydown', (event) => event.stopPropagation());
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const text = textarea.value.trim();
    if (!text) return;
    saveButton.disabled = true;
    saveButton.textContent = 'Saving…';
    error.hidden = true;
    try {
      const saved = await browser.runtime.sendMessage({
        type: 'notes:create',
        note: {
          videoId: snapshot.videoId,
          videoTitle: snapshot.videoTitle,
          videoUrl: snapshot.videoUrl,
          seconds: snapshot.seconds,
          text,
        },
      } satisfies ExtensionMessage) as MomentNote;
      await loadNotes();
      closeComposer();
      showNoteToast(saved);
    } catch {
      error.textContent = 'Could not save the note. Try again.';
      error.hidden = false;
      saveButton.disabled = false;
      saveButton.textContent = 'Save note';
    }
  });
  player.append(panel);
  composer = panel;
  textarea.focus();
}

function ensureTimelineButton() {
  const controls = document.querySelector<HTMLElement>('.ytp-left-controls');
  if (!controls || controls.querySelector('#moment-notes-add-button')) return;
  const button = document.createElement('button');
  button.id = 'moment-notes-add-button';
  button.type = 'button';
  button.className = 'ytp-button moment-notes-add-button';
  button.title = 'Add a note at the current time';
  button.setAttribute('aria-label', 'Add a note at the current time');
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75h12a1.25 1.25 0 0 1 1.25 1.25v15l-7.25-4.5-7.25 4.5V5A1.25 1.25 0 0 1 6 3.75Z"/><path d="M12 7v6M9 10h6"/></svg>';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openComposer();
  });
  const timeDisplay = controls.querySelector('.ytp-time-display');
  if (timeDisplay?.nextSibling) controls.insertBefore(button, timeDisplay.nextSibling);
  else controls.append(button);
}

function drawMarkers() {
  const progress = document.querySelector<HTMLElement>('.ytp-progress-bar-container');
  const video = getVideo();
  if (!progress || !video || !Number.isFinite(video.duration) || video.duration <= 0) return;

  const signature = `${videoId}:${video.duration}:${notes.map((note) => `${note.id}@${note.seconds}`).join(',')}`;
  const existing = progress.querySelector('#moment-notes-marker-layer');
  if (existing && signature === renderedSignature) return;
  existing?.remove();

  const layer = document.createElement('div');
  layer.id = 'moment-notes-marker-layer';
  layer.setAttribute('aria-label', 'Saved note markers');
  for (const note of notes) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'moment-notes-marker';
    marker.style.left = `${Math.min(100, Math.max(0, (note.seconds / video.duration) * 100))}%`;
    marker.title = `${formatTimestamp(note.seconds)} · ${note.text}`;
    marker.setAttribute('aria-label', `Go to ${formatTimestamp(note.seconds)}: ${note.text}`);
    marker.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      seekTo(note.seconds);
      showNoteToast(note);
    });
    layer.append(marker);
  }
  progress.append(layer);
  renderedSignature = signature;
}

async function loadNotes() {
  const nextVideoId = currentVideoId();
  if (!nextVideoId) return;
  if (videoId && nextVideoId !== videoId) closeComposer();
  videoId = nextVideoId;
  renderedSignature = '';
  try {
    notes = await browser.runtime.sendMessage({ type: 'video:get-notes', videoId } satisfies ExtensionMessage);
  } catch {
    notes = [];
  }
  drawMarkers();
  ensureTimelineButton();
}

function scheduleRefresh() {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (currentVideoId() !== videoId) void loadNotes();
    else {
      drawMarkers();
      ensureTimelineButton();
    }
  }, 180);
}

export default defineContentScript({
  matches: ['https://www.youtube.com/*'],
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
      if (message.type === 'video:get-snapshot') {
        sendResponse(getSnapshot());
        return false;
      }
      if (message.type === 'video:seek') {
        seekTo(message.seconds);
        sendResponse(true);
        return false;
      }
      if (message.type === 'video:refresh-notes') {
        void loadNotes();
        sendResponse(true);
        return false;
      }
      return false;
    });
    void loadNotes();
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('yt-navigate-finish', scheduleRefresh);
    window.addEventListener('popstate', scheduleRefresh);
  },
});
