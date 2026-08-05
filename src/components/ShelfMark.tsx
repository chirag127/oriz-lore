/*
 * ShelfMark — personal reading-shelf control on a book page. PUBLIC content is
 * never gated; this island only adds a personal "on my shelf" toggle for
 * signed-in readers. Signed-out readers see an invitation, not a wall.
 *
 * Data: Firestore doc at shelves/{clerkUserId}/books/{slug}. Clerk owns the
 * identity; Firebase stores only the mark + timestamp. All keys from env.
 */
import { useEffect, useState } from 'react'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from '@clerk/clerk-react'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { getDb } from '~/lib/firebase'

const pk = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

function MarkInner({ slug, title }: { slug: string; title: string }) {
  const { user, isLoaded } = useUser()
  const [onShelf, setOnShelf] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const db = getDb()

  useEffect(() => {
    if (!isLoaded || !user || !db) {
      setOnShelf(false)
      return
    }
    const ref = doc(db, 'shelves', user.id, 'books', slug)
    getDoc(ref)
      .then((snap) => setOnShelf(snap.exists()))
      .catch(() => setOnShelf(false))
  }, [isLoaded, user, db, slug])

  async function toggle() {
    if (!user || !db || busy) return
    setBusy(true)
    const ref = doc(db, 'shelves', user.id, 'books', slug)
    try {
      if (onShelf) {
        await deleteDoc(ref)
        setOnShelf(false)
      } else {
        await setDoc(ref, { slug, title, addedAt: Date.now() })
        setOnShelf(true)
      }
    } catch {
      /* offline / rules — leave state as-is */
    } finally {
      setBusy(false)
    }
  }

  const label = onShelf ? 'on your shelf' : 'add to shelf'
  return (
    <button
      type="button"
      className="shelf-mark"
      data-on={onShelf ? 'true' : 'false'}
      aria-pressed={onShelf ?? false}
      disabled={busy || onShelf === null || !db}
      onClick={toggle}
    >
      <span className="shelf-glyph" aria-hidden="true">
        {onShelf ? '◆' : '◇'}
      </span>
      {label}
    </button>
  )
}

export default function ShelfMark({ slug, title }: { slug: string; title: string }) {
  if (!pk) return null
  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/">
      <div className="shelf-wrap">
        <SignedIn>
          <MarkInner slug={slug} title={title} />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button type="button" className="shelf-mark shelf-invite">
              <span className="shelf-glyph" aria-hidden="true">◇</span>
              sign in to keep a shelf
            </button>
          </SignInButton>
        </SignedOut>
      </div>
      <style>{`
        .shelf-wrap { display: inline-flex; }
        .shelf-mark {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--dust, #8b93a0);
          background: transparent;
          border: 1px solid var(--rule, #2a2f38);
          border-radius: 2px;
          padding: 7px 14px;
          cursor: pointer;
          transition: color 120ms, border-color 120ms, background 120ms;
        }
        .shelf-mark:hover:not(:disabled) {
          color: var(--brass, #c8a24b);
          border-color: color-mix(in oklab, var(--brass, #c8a24b) 55%, transparent);
        }
        .shelf-mark[data-on='true'] {
          color: var(--brass, #c8a24b);
          border-color: color-mix(in oklab, var(--brass, #c8a24b) 55%, transparent);
          background: color-mix(in oklab, var(--brass, #c8a24b) 10%, transparent);
        }
        .shelf-mark:disabled { opacity: 0.55; cursor: default; }
        .shelf-mark:focus-visible { outline: 2px solid var(--brass, #c8a24b); outline-offset: 2px; }
        .shelf-glyph { font-size: 0.9em; }
      `}</style>
    </ClerkProvider>
  )
}
