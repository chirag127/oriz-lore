/*
 * AccountShelf — the signed-in reader's personal shelf. The ONLY Clerk
 * provider on the /account page. Public content is elsewhere and never gated;
 * this surface is the personal feature Clerk exists to gate. Reads the
 * reader's saved volumes from Firestore (shelves/{clerkUserId}/books), keyed
 * by Clerk id. All keys from env; renders an invitation when signed out.
 */
import { useEffect, useState } from 'react'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { getDb } from '~/lib/firebase'

const pk = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

interface ShelfBook {
  slug: string
  title: string
  addedAt: number
}

function ShelfList() {
  const { user, isLoaded } = useUser()
  const [books, setBooks] = useState<ShelfBook[] | null>(null)
  const db = getDb()

  useEffect(() => {
    if (!isLoaded || !user || !db) {
      setBooks([])
      return
    }
    const q = query(
      collection(db, 'shelves', user.id, 'books'),
      orderBy('addedAt', 'desc'),
    )
    getDocs(q)
      .then((snap) => setBooks(snap.docs.map((d) => d.data() as ShelfBook)))
      .catch(() => setBooks([]))
  }, [isLoaded, user, db])

  return (
    <div className="acct">
      <div className="acct-head">
        <span className="acct-hi">
          Signed in{user?.firstName ? ` — ${user.firstName}` : ''}
        </span>
        <UserButton afterSignOutUrl="/" />
      </div>
      {books === null ? (
        <p className="acct-empty">Opening your shelf…</p>
      ) : books.length === 0 ? (
        <p className="acct-empty">
          Nothing shelved yet. Open any volume and mark it to keep it here.
        </p>
      ) : (
        <ol className="acct-list">
          {books.map((b) => (
            <li key={b.slug}>
              <a href={`/books/${b.slug}/`}>{b.title}</a>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default function AccountShelf() {
  if (!pk) {
    return (
      <p className="acct-empty">
        Personal shelves are not enabled on this build. All reading stays public and open.
      </p>
    )
  }
  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/">
      <SignedIn>
        <ShelfList />
      </SignedIn>
      <SignedOut>
        <div className="acct">
          <p className="acct-empty">
            Sign in to keep a shelf — the volumes you mark are saved to your account and
            follow you across every oriz.in site. Reading needs no account.
          </p>
          <SignInButton mode="modal">
            <button type="button" className="acct-signin">sign in</button>
          </SignInButton>
        </div>
      </SignedOut>
      <style>{`
        .acct { display: flex; flex-direction: column; gap: 1.25rem; }
        .acct-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--rule, #2a2f38);
        }
        .acct-hi {
          font-family: var(--font-mono, monospace); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.14em; color: var(--dust, #8b93a0);
        }
        .acct-empty {
          color: var(--ink-mute, #b9b2a2); font-family: var(--font-serif, serif);
          font-style: italic; font-size: 1.0625rem; margin: 0; max-width: 52ch;
        }
        .acct-list { list-style: none; padding: 0; margin: 0; }
        .acct-list li { padding: 0.8rem 0; border-bottom: 1px solid var(--rule, #2a2f38); }
        .acct-list a {
          font-family: var(--font-display, serif); font-size: 1.25rem;
          color: var(--ink, #e8e0ce); text-decoration: none;
        }
        .acct-list a:hover { color: var(--brass, #c8a24b); }
        .acct-signin {
          align-self: flex-start;
          font-family: var(--font-mono, monospace); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.16em;
          color: var(--brass, #c8a24b); background: transparent;
          border: 1px solid color-mix(in oklab, var(--brass, #c8a24b) 45%, transparent);
          border-radius: 2px; padding: 8px 18px; cursor: pointer;
          transition: color 120ms, border-color 120ms;
        }
        .acct-signin:hover { color: var(--ink, #e8e0ce); border-color: var(--brass, #c8a24b); }
        .acct-signin:focus-visible { outline: 2px solid var(--brass, #c8a24b); outline-offset: 2px; }
      `}</style>
    </ClerkProvider>
  )
}
