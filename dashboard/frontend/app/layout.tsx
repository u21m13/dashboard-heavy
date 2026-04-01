import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EWI Dashboard — Counterparty Risk Monitor',
  description:
    'Early Warning Indicator dashboard powered by Databricks Delta tables.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  );
}
