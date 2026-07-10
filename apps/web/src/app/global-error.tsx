'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: '#FDF8F5', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <p style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2C1810', fontFamily: 'Georgia, serif' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B5248', marginTop: '0.5rem' }}>
              Griffy hit an unexpected error. Please try again.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#C0593A', color: 'white', fontWeight: 600,
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  border: '1px solid #EBE0D8', color: '#2C1810', fontWeight: 600,
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
