import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand-warm flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-brown-muted">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline hover:text-tc transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-tc transition-colors">Privacy Policy</Link>.
        </p>
      </footer>
    </div>
  );
}
