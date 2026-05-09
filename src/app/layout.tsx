import './globals.css'
import { Inter } from 'next/font/google'
// import PWAInstallPrompt from '../components/PWAInstallPrompt'
// import OfflineIndicator from '../components/OfflineIndicator'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fitness App',
  description: 'Track your workouts, nutrition, and fitness goals with ease',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fitness App',
  },
  icons: {
    icon: '/workout-icon.svg',
    apple: '/workout-icon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/workout-icon.svg" />
        <link rel="apple-touch-icon" href="/workout-icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fitness App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-slate-100 text-slate-900 antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
        {/* PWA components temporarily disabled for debugging */}
        {/* <PWAInstallPrompt /> */}
        {/* <OfflineIndicator /> */}

        {/* Service Worker registration for background timer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
