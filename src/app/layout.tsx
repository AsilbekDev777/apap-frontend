import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'APAP — Academic Performance Analytics',
  description: 'Akademik ko\'rsatkichlar boshqaruv tizimi',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="uz">
      <body className={inter.className}>{children}</body>
      </html>
  );
}