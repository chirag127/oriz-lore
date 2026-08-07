/*
 * HeaderAuth — compact header auth control for oriz·lore.
 * Shows UserButton when signed in, SignInButton when signed out.
 * ONE ClerkProvider. Sign-in redirects to /account/ after completion.
 */
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react'

const pk = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

export default function HeaderAuth() {
  if (!pk) return null
  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/">
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="redirect" redirectUrl="/account/">
          <button type="button" className="hdr-signin">sign in</button>
        </SignInButton>
      </SignedOut>
      <style>{`
        .hdr-signin {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          text-transform: lowercase;
          letter-spacing: 0.1em;
          color: var(--brass, #c8a24b);
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color 120ms;
        }
        .hdr-signin:hover { color: var(--ink, #e8e0ce); }
        .hdr-signin:focus-visible { outline: 2px solid var(--brass, #c8a24b); outline-offset: 3px; }
      `}</style>
    </ClerkProvider>
  )
}
