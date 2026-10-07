import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Plotly from 'plotly.js-basic-dist-min';
import { ArrowUpRight, Bookmark, Clock3, ExternalLink, Library, LoaderCircle, Search, Trash2, Youtube } from 'lucide-react';
import { browser } from 'wxt/browser';
import { Button } from '../../src/components/ui/button';
import { formatNoteDate, formatTimestamp, getNotes, sendExtensionMessage } from '../../src/lib/messaging';
import type { MomentNote } from '../../src/lib/types';
import '../../src/styles/global.css';

type PlotNode = HTMLDivElement & {
  on: (event: 'plotly_click', callback: (event: Plotly.PlotMouseEvent) => void) => void;
  removeListener: (event: 'plotly_click', callback: (event: Plotly.PlotMouseEvent) => void) => void;
};

function Timeline({ notes, onSelect }: { notes: MomentNote[]; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const videos = [...new Set(notes.map((note) => note.videoId))];
    const rowByVideo = new Map(videos.map((id, index) => [id, index]));
    const trace: Plotly.Data = {
      type: 'scatter',
      mode: 'markers',
      x: notes.map((note) => note.seconds),
      y: notes.map((note) => rowByVideo.get(note.videoId) ?? 0),
      text: notes.map((note) => note.text),
      customdata: notes.map((note) => note.id),
      marker: { size: 14, color: '#bef264', line: { color: '#ecfccb', width: 1 } },
      hovertemplate: '<b>%{text}</b><br>%{x:.0f}s<extra></extra>',
    };
    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      height: Math.max(210, videos.length * 68 + 90),
      margin: { l: 210, r: 24, t: 16, b: 42 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#94a3b8', family: 'Inter, ui-sans-serif, system-ui', size: 11 },
      xaxis: { title: { text: 'Video time (seconds)' }, gridcolor: 'rgba(148,163,184,.12)', zerolinecolor: 'rgba(148,163,184,.12)' },
      yaxis: {
        tickmode: 'array',
        tickvals: videos.map((_, index) => index),
        ticktext: videos.map((id) => notes.find((note) => note.videoId === id)?.videoTitle ?? id),
        gridcolor: 'rgba(148,163,184,.10)',
        zeroline: false,
        autorange: 'reversed',
      },
      hoverlabel: { bgcolor: '#111827', bordercolor: '#334155', font: { color: '#f8fafc' } },
    };
    const plotNode = node as PlotNode;
    void Plotly.react(node, [trace], layout, { displayModeBar: false, responsive: true });
    const onClick = (event: Plotly.PlotMouseEvent) => {
      const id = event.points[0]?.customdata;
      if (typeof id === 'string') onSelect(id);
    };
    plotNode.on('plotly_click', onClick);
    return () => { plotNode.removeListener('plotly_click', onClick); Plotly.purge(node); };
  }, [notes, onSelect]);

  if (!notes.length) return <div className="grid h-48 place-items-center text-sm text-slate-600">Save a few moments to see them on your timeline.</div>;
  return <div ref={container} className="min-h-52 w-full" />;
}

function Dashboard() {
  const [notes, setNotes] = useState<MomentNote[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setNotes(await getNotes());
    setLoading(false);
  }

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => `${note.text} ${note.videoTitle}`.toLowerCase().includes(normalized));
  }, [notes, query]);

  async function openAt(note: MomentNote) {
    await browser.tabs.create({ url: `${note.videoUrl}&t=${Math.floor(note.seconds)}s` });
  }

  async function remove(note: MomentNote) {
    await sendExtensionMessage({ type: 'notes:delete', id: note.id });
    setNotes((current) => current.filter((item) => item.id !== note.id));
  }

  const selectPoint = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (note) void openAt(note);
  };

  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-lime-300 text-slate-950"><Bookmark size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">Moment Notes</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Your video library</h1></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400"><Library size={14} /> Private on this device</div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Saved moments" value={notes.length} icon={<Bookmark size={15} />} />
          <Stat label="Videos with notes" value={new Set(notes.map((note) => note.videoId)).size} icon={<Youtube size={15} />} />
          <Stat label="Latest note" value={notes[0] ? formatNoteDate(notes[0].createdAt) : '—'} icon={<Clock3 size={15} />} />
        </section>

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101720] p-5 md:p-7">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Explore</p><h2 className="mt-1 text-lg font-semibold">Moments across your videos</h2></div>
            <span className="hidden text-xs text-slate-500 sm:block">Select a point to jump to its note</span>
          </div>
          {loading ? <div className="grid h-48 place-items-center"><LoaderCircle className="animate-spin text-slate-500" size={20} /></div> : <Timeline notes={notes} onSelect={selectPoint} />}
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-[#101720] p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notebook</p><h2 className="mt-1 text-lg font-semibold">All saved notes <span className="ml-1 text-sm font-medium text-slate-500">{filtered.length}</span></h2></div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 sm:w-72">
              <Search size={15} className="text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes or videos" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-600" />
            </label>
          </div>
          {loading ? <div className="grid h-24 place-items-center"><LoaderCircle className="animate-spin text-slate-500" size={20} /></div> : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
              <Bookmark size={22} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold">{query ? 'No matching notes' : 'Your notebook is empty'}</p>
              <p className="mt-1 text-xs text-slate-500">{query ? 'Try another search.' : 'Save a note from a YouTube video to start your collection.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {filtered.map((note) => <NoteRow key={note.id} note={note} onOpen={() => void openAt(note)} onDelete={() => void remove(note)} />)}
            </ul>
          )}
        </section>
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-600">
          <span>Stored locally in IndexedDB. No account required.</span>
          <a className="inline-flex items-center gap-1 hover:text-slate-300" href="https://www.youtube.com/" target="_blank" rel="noreferrer">Open YouTube <ArrowUpRight size={12} /></a>
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-[#101720] p-4"><div className="mb-3 flex items-center gap-2 text-slate-500">{icon}<span className="text-[11px] font-semibold uppercase tracking-[0.13em]">{label}</span></div><p className="text-xl font-bold tabular-nums">{value}</p></div>;
}

function NoteRow({ note, onOpen, onDelete }: { note: MomentNote; onOpen: () => void; onDelete: () => void }) {
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-red-400/10 text-red-300"><Youtube size={17} /></div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2"><p className="max-w-[540px] truncate text-sm font-semibold">{note.videoTitle}</p><span className="rounded-md bg-lime-300/10 px-1.5 py-1 font-mono text-[10px] text-lime-300">{formatTimestamp(note.seconds)}</span></div>
          <p className="line-clamp-2 text-xs leading-5 text-slate-400">{note.text}</p>
          <p className="mt-1 text-[10px] text-slate-600">Saved {formatNoteDate(note.createdAt)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
        <Button variant="secondary" size="sm" onClick={onOpen}><ExternalLink size={13} /> Watch moment</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete note"><Trash2 size={14} /></Button>
      </div>
    </li>
  );
}

createRoot(document.getElementById('root')!).render(<Dashboard />);
