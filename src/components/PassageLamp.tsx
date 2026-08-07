/*
 * PassageLamp — optional AI reading aid on a book page. A lamp-lit control
 * that summarizes the current commentary or re-explains it plainly. PUBLIC:
 * no auth, no key — oz-ai wraps g4f (client-side, multi-provider failover).
 *
 * Reads the rendered prose on the page (the four MDX sections) as source text.
 * If oz-ai throws (every provider down), the whole panel hides — the reading
 * page is never degraded. Lazy island: no blocking JS on first paint.
 */

import { complete } from '@chirag127/oz-ai'
import { useState } from 'react'

type Mode = 'summary' | 'plain'

function pageText(): string {
  if (typeof document === 'undefined') return ''
  const nodes = document.querySelectorAll('.book-prose .prose-body p, .book-prose .prose-body li')
  const text = Array.from(nodes)
    .map((n) => (n.textContent ?? '').trim())
    .filter(Boolean)
    .join('\n')
  return text.slice(0, 6000)
}

const PROMPT: Record<Mode, (t: string, title: string) => string> = {
  summary: (t, title) =>
    `Summarize this commentary on the book "${title}" in 3-4 tight sentences. No preamble.\n\n${t}`,
  plain: (t, title) =>
    `Re-explain this commentary on "${title}" plainly, as if to a curious first-time reader. Keep it under 120 words, warm but not dumbed-down.\n\n${t}`,
}

export default function PassageLamp({ title }: { title: string }) {
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)
  const [dead, setDead] = useState(false)
  const [mode, setMode] = useState<Mode>('summary')

  async function run(m: Mode) {
    const src = pageText()
    if (!src || busy) return
    setMode(m)
    setBusy(true)
    setOut('')
    try {
      const res = await complete(PROMPT[m](src, title), { temperature: 0.4 })
      const text = (res ?? '').trim()
      if (!text) throw new Error('empty')
      setOut(text)
    } catch {
      setDead(true)
    } finally {
      setBusy(false)
    }
  }

  if (dead) return null

  return (
    <aside className="lamp" aria-label="AI reading aid">
      <div className="lamp-head">
        <span className="lamp-glyph" aria-hidden="true">
          ☾
        </span>
        <span className="lamp-title">reading lamp</span>
        <span className="lamp-note">experimental · AI, may err</span>
      </div>
      <div className="lamp-controls">
        <button
          type="button"
          className="lamp-btn"
          data-active={mode === 'summary' ? 'true' : 'false'}
          disabled={busy}
          onClick={() => run('summary')}
        >
          summarize this page
        </button>
        <button
          type="button"
          className="lamp-btn"
          data-active={mode === 'plain' ? 'true' : 'false'}
          disabled={busy}
          onClick={() => run('plain')}
        >
          explain plainly
        </button>
      </div>
      {busy && <p className="lamp-status">lighting the lamp…</p>}
      {out && !busy && <div className="lamp-out">{out}</div>}
      <style>{`
        .lamp {
          margin: 3rem 0 0;
          padding: 1.25rem 1.375rem;
          border: 1px solid var(--rule, #2a2f38);
          border-radius: 3px;
          background: color-mix(in oklab, var(--brass, #c8a24b) 5%, var(--paper-2, #1c2027));
          max-width: var(--container-prose, 66ch);
        }
        .lamp-head {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 0.875rem;
          flex-wrap: wrap;
        }
        .lamp-glyph { color: var(--brass, #c8a24b); font-size: 1rem; }
        .lamp-title {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--brass, #c8a24b);
        }
        .lamp-note {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--dust, #8b93a0);
          margin-left: auto;
        }
        .lamp-controls { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .lamp-btn {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--dust, #8b93a0);
          background: transparent;
          border: 1px solid var(--rule, #2a2f38);
          border-radius: 2px;
          padding: 7px 13px;
          cursor: pointer;
          transition: color 120ms, border-color 120ms, background 120ms;
        }
        .lamp-btn:hover:not(:disabled) {
          color: var(--brass, #c8a24b);
          border-color: color-mix(in oklab, var(--brass, #c8a24b) 55%, transparent);
        }
        .lamp-btn[data-active='true']:not(:disabled) {
          color: var(--brass, #c8a24b);
          border-color: color-mix(in oklab, var(--brass, #c8a24b) 55%, transparent);
        }
        .lamp-btn:disabled { opacity: 0.55; cursor: default; }
        .lamp-btn:focus-visible { outline: 2px solid var(--brass, #c8a24b); outline-offset: 2px; }
        .lamp-status {
          margin: 0.875rem 0 0;
          font-family: var(--font-serif, Georgia, serif);
          font-style: italic;
          font-size: 0.9375rem;
          color: var(--ink-mute, #b9b2a2);
        }
        .lamp-out {
          margin-top: 0.875rem;
          padding-top: 0.875rem;
          border-top: 1px solid var(--rule, #2a2f38);
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1rem;
          line-height: 1.65;
          color: var(--ink, #e8e0ce);
          white-space: pre-wrap;
        }
      `}</style>
    </aside>
  )
}
