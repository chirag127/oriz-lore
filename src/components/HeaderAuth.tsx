/*
 * HeaderAuth — the header's sole auth surface. Replaces the old static
 * <a href="/sign-in/">sign in</a> + <a href="/account/">my shelf</a> pair that
 * never updated after login. Renders a Clerk island: signed-out shows a themed
 * "sign in" button (modal); signed-in shows the UserButton avatar with a quiet
 * "my shelf" link into /account. Reading stays public everywhere — this only
 * gates the personal shelf. One ClerkProvider, scoped to this island.
 */
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react'

const pk = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

const appearance = {
  variables: {
    colorPrimary: '#c8a24b',
    colorText: '#e8e0ce',
    colorTextSecondary: '#8b93a0',
    colorBackground: '#1c2027',
    borderRadius: '3px',
    fontFamily: "'Spectral', Georgia, serif",
  },
  elements: {
    userButtonPopoverCard: {
      backgroundColor: '#1c2027',
      border: '1px solid #2a2f38',
    },
    userButtonPopoverActionButton: { color: '#e8e0ce' },
  },
} as const

export default function HeaderAuth() {
  if (!pk) return null
  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/">
      <span className="hdr-auth">
        <SignedOut>
          <SignInButton mode="modal">
            <button type="button" className="hdr-signin">sign in</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <a href="/account/" className="hdr-shelf">my shelf</a>
          <UserButton appearance={appearance} afterSignOutUrl="/" />
        </SignedIn>
      </span>
      <style>{`
        .hdr-auth { display: inline-flex; align-items: center; gap: 0.7rem; }
        .hdr-signin {
          font-family: var(--font-mono, monospace); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--brass, #c8a24b); background: transparent;
          border: 0; padding: 0; cursor: pointer;
          transition: color 120ms;
        }
        .hdr-signin:hover { color: var(--ink, #e8e0ce); }
        .hdr-signin:focus-visible { outline: 2px solid var(--brass, #c8a24b); outline-offset: 3px; }
        .hdr-shelf {
          font-family: var(--font-mono, monospace); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--brass, #c8a24b); text-decoration: none;
          transition: color 120ms;
        }
        .hdr-shelf:hover { color: var(--ink, #e8e0ce); }
      `}</style>
    </ClerkProvider>
  )
}
