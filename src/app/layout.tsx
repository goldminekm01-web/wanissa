import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Entertainment Awards Voting',
  description: 'Vote for your favorite contestants via M-Pesa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="gradient-text">Awards 2026</div>
          <nav>
            <a href="/" style={{ marginRight: '20px', color: 'var(--text-primary)' }}>Home</a>
            <a href="/categories" style={{ color: 'var(--text-primary)' }}>Categories</a>
          </nav>
        </header>
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
          <p>&copy; 2026 Entertainment Awards. Powered by M-Pesa & SMS.</p>
        </footer>
      </body>
    </html>
  );
}
