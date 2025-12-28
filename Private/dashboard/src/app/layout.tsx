import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skills Dashboard | Agent Skills',
  description: 'Configure and manage your Agent Skills for context engineering.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
