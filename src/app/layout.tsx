import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'PulseLayer | Stellar Account Trust Signal Indexer',
  description: 'Production trust signal engine indexing Stellar accounts and generating live deterministic trust scores (0-100) based on behavioral patterns.',
  keywords: ['Stellar', 'Trust Signal', 'Blockchain Indexer', 'Pulse Score', 'Horizon API', 'Fintech', 'Account Analytics'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[#00F0FF] selection:text-black transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
