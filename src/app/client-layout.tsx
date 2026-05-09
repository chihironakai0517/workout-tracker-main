'use client';

type FontWithVariable = {
  variable: string;
};

interface ClientLayoutProps {
  children: React.ReactNode;
  geistSans: FontWithVariable;
  geistMono: FontWithVariable;
}

export default function ClientLayout({ children, geistSans, geistMono }: ClientLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning={true} className="antialiased">
        {children}
      </body>
    </html>
  );
} 