import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Walkable 3D Clinic – KK Titiwangsa',
  description: 'Browser-based first-person walkthrough of an approximate KK Titiwangsa layout.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
