import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookmarkPlus, Clock3, Library, LoaderCircle, Play, Youtube } from 'lucide-react';
import { browser } from 'wxt/browser';
import { Button } from '../../src/components/ui/button';
import { Textarea } from '../../src/components/ui/textarea';
import { getActiveTab, getNotes, getVideoSnapshot, sendExtensionMessage, formatTimestamp } from '../../src/lib/messaging';
import type { MomentNote, VideoSnapshot } from '../../src/lib/types';
import '../../src/styles/global.css';

function Popup() {
  const [snapshot, setSnapshot] = useState<VideoSnapshot>();
  const [notes, setNotes] = useState<MomentNote[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    const tab = await getActiveTab();
    if (!tab?.id) {
      setSnapshot(undefined);
      setNotes([]);
      setLoading(false);
      return;
    }
    const current = await getVideoSnapshot(tab.id);
    setSnapshot(current);
    setNotes(current ? await getNotes(current.videoId) : []);
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    if (!snapshot || !draft.trim()) return;
    setSaving(true);
    setError('');
    try {
      const tab = await getActiveTab();
      const current = tab?.id ? await getVideoSnapshot(tab.id) : undefined;
      const capture = current ?? snapshot;
      const saved = await sendExtensionMessage<MomentNote>({
        type: 'notes:create',
        note: {
          videoId: capture.videoId,
          videoTitle: capture.videoTitle,
          videoUrl: capture.videoUrl,
          seconds: capture.seconds,
          text: draft.trim(),
        },
      });
      setSnapshot(capture);
      setNotes((items) => [saved, ...items].sort((a, b) => b.updatedAt - a.updatedAt));
      setDraft('');
      if (tab?.id) await browser.tabs.sendMessage(tab.id, { type: 'video:refresh-notes' }).catch(() => undefined);
    } catch {
      setError('Could not save this note. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function seek(seconds: number) {
    const tab = await getActiveTab();
    if (tab?.id) await browser.tabs.sendMessage(tab.id, { type: 'video:seek', seconds }).catch(() => undefined);
  }

  async function openLibrary() {
    await browser.tabs.create({ url: browser.runtime.getURL('/dashboard.html') });
    window.close();
  }

  const recent = notes.slice(0, 4);

  return (
    <main className="w-[390px] bg-[#090d13] p-5 text-slate-100">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-lime-300 text-slate-950"><BookmarkPlus size={20} /></div>
          <div><p className="text-sm font-bold tracking-tight">Moment Notes</p><p className="text-[11px] text-slate-500">Your private video notebook</p></div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void openLibrary()} aria-label="Open library"><Library size={15} /> Library</Button>
      </header>

      {loading ? (
        <div className="flex h-36 items-center justify-center text-slate-500"><LoaderCircle className="animate-spin" size={20} /></div>
      ) : !snapshot ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center">
          <Youtube size={24} className="mx-auto mb-3 text-red-400" />
          <h1 className="text-sm font-semibold">Open a YouTube video</h1>
          <p className="mt-1 text-xs leading-5 text-slate-500">Play a video, then click the extension to save a note at its current time.</p>
        </section>
      ) : (
        <>
          <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-lime-300"><Youtube size={13} /> Current video</div>
            <h1 className="line-clamp-2 text-sm font-semibold leading-5">{snapshot.videoTitle}</h1>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={13} /> Capturing at <span className="font-mono text-slate-200">{formatTimestamp(snapshot.seconds)}</span></div>
          </section>
          <form onSubmit={saveNote} className="space-y-2.5">
            <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="What do you want to remember here?" aria-label="Note text" className="min-h-[86px]" />
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <Button className="w-full" disabled={!draft.trim() || saving}>
              {saving ? <LoaderCircle className="animate-spin" size={16} /> : <BookmarkPlus size={16} />}
              Save at {formatTimestamp(snapshot.seconds)}
            </Button>
          </form>

          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-400">This video <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{notes.length}</span></h2>
              {notes.length > 4 && <button onClick={() => void openLibrary()} className="text-[11px] text-lime-300 hover:text-lime-200">View all</button>}
            </div>
            {recent.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-600">Your saved moments will show up here.</p>
            ) : (
              <ul className="space-y-1.5">
                {recent.map((note) => (
                  <li key={note.id}>
                    <button onClick={() => void seek(note.seconds)} className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06]">
                      <span className="mt-0.5 shrink-0 rounded-md bg-lime-300/10 px-1.5 py-1 font-mono text-[10px] text-lime-300">{formatTimestamp(note.seconds)}</span>
                      <span className="line-clamp-2 flex-1 text-xs leading-5 text-slate-300">{note.text}</span>
                      <Play size={13} className="mt-1 shrink-0 text-slate-600 group-hover:text-lime-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <footer className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-slate-600">
        <span>Saved only in this browser</span>
        <button className="inline-flex items-center gap-1 hover:text-slate-300" onClick={() => void openLibrary()}>All notes <ArrowUpRight size={11} /></button>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);
