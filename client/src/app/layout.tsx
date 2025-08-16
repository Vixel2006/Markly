import type { Metadata } from 'next';
import './globals.css'; // Import here

export const metadata: Metadata = {
  title: 'Markly',
  description: 'AI-powered bookmark manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
