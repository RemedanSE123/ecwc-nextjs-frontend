'use client';

/**
 * Root-level error UI — minimal dependencies; no stack traces or technical messages for users.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === 'development' && error) {
    console.error('[Global Error]', error);
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#fafafa' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '26rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#171717' }}>
              Sorry — we couldn&apos;t load the application
            </h1>
            <p style={{ fontSize: '0.9375rem', color: '#525252', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              You can&apos;t access the system right now. Please try again later. If the problem continues,
              contact your IT administrator.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#70c82a',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
