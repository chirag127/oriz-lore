/*
 * SignInCard — the /sign-in page's Clerk <SignIn> surface. The ONLY Clerk
 * provider on this page (one provider per page). Reading everywhere else is
 * public and never gated; this card exists only to open a session that the
 * personal shelf (/account) uses. Themed to "Nocturne Archive": gilt lamplight
 * on a dark page, Fraunces headings, Spectral body, Space Mono labels.
 */
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react'

const pk = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

const appearance = {
  variables: {
    colorPrimary: '#c8a24b',
    colorText: '#e8e0ce',
    colorTextSecondary: '#8b93a0',
    colorBackground: '#1c2027',
    colorInputBackground: '#14171c',
    colorInputText: '#e8e0ce',
    colorDanger: '#c56b52',
    borderRadius: '3px',
    fontFamily: "'Spectral', Georgia, serif",
  },
  elements: {
    card: {
      backgroundColor: '#1c2027',
      border: '1px solid #2a2f38',
      boxShadow: '0 1px 0 rgba(200,162,75,0.35), 0 18px 52px rgba(0,0,0,0.6)',
      borderRadius: '6px',
    },
    headerTitle: {
      fontFamily: "'Fraunces', 'Hoefler Text', Georgia, serif",
      fontWeight: '600',
      color: '#e8e0ce',
      letterSpacing: '-0.01em',
    },
    headerSubtitle: { color: '#8b93a0' },
    formButtonPrimary: {
      backgroundColor: '#c8a24b',
      color: '#14171c',
      fontWeight: '700',
      borderRadius: '3px',
      textTransform: 'none',
    },
    formFieldInput: {
      backgroundColor: '#14171c',
      borderColor: '#2a2f38',
      color: '#e8e0ce',
    },
    formFieldLabel: { color: '#e8e0ce' },
    footerActionLink: { color: '#c8a24b' },
    identityPreviewEditButton: { color: '#c8a24b' },
    logoBox: { height: '28px' },
  },
} as const

function SignedInNote() {
  const { user } = useUser()
  const who = user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'reader'
  return (
    <div className="si-done">
      <div className="si-row">
        <UserButton afterSignOutUrl="/sign-in/" />
        <span className="si-hi">Signed in — {who}</span>
      </div>
      <a className="si-go" href="/account/">
        Open your shelf →
      </a>
    </div>
  )
}

export default function SignInCard() {
  if (!pk) {
    return (
      <p className="si-off">
        Sign-in is not enabled on this build. All reading stays public and open.
      </p>
    )
  }
  return (
    <ClerkProvider publishableKey={pk} afterSignOutUrl="/sign-in/">
      <SignedOut>
        <div className="si-mount">
          <SignIn routing="hash" signUpUrl="/sign-in/" fallbackRedirectUrl="/account/" appearance={appearance} />
          <p className="si-anon">
            Just here to read? <a href="/books/">Keep reading anonymously →</a> The shelves are
            always open and never ask you to sign in.
          </p>
        </div>
      </SignedOut>
      <SignedIn>
        <SignedInNote />
      </SignedIn>
      <style>{`
        .si-mount { display: flex; flex-direction: column; gap: 1.25rem; align-items: center; }
        .si-anon { color: var(--ink-mute, #b9b2a2); font-family: var(--font-serif, serif); font-style: italic; font-size: 1.0625rem; text-align: center; max-width: 48ch; margin: 0; }
        .si-anon a { color: var(--brass, #c8a24b); text-decoration: underline; text-underline-offset: 3px; }
        .si-off { color: var(--ink-mute, #b9b2a2); font-family: var(--font-serif, serif); font-style: italic; font-size: 1.0625rem; margin: 0; max-width: 52ch; }
        .si-done { display: flex; flex-direction: column; gap: 1.25rem; }
        .si-row { display: flex; align-items: center; gap: 1rem; }
        .si-hi { font-family: var(--font-mono, monospace); font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--dust, #8b93a0); }
        .si-go { align-self: flex-start; color: var(--brass, #c8a24b); font-family: var(--font-mono, monospace); font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; }
        .si-go:hover { color: var(--ink, #e8e0ce); }
      `}</style>
    </ClerkProvider>
  )
}
