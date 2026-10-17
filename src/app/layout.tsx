import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/i18n'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Nagrik Bodh — Government Updates, Clearly Explained',
    template: '%s | Nagrik Bodh',
  },
  description:
    'Nagrik Bodh simplifies government notifications, schemes, rules and compliance deadlines into clear, actionable information for every Indian citizen. Available in English and Tamil.',
  keywords: [
    'government schemes India',
    'civic awareness',
    'government notifications',
    'compliance deadlines India',
    'citizen information',
    'Tamil Nadu government updates',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Nagrik Bodh',
    title: 'Nagrik Bodh — Government Updates, Clearly Explained',
    description:
      'Clear, verified explanations of government notifications, schemes and deadlines for Indian citizens.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      'en-IN': '/',
      'ta-IN': '/?lang=ta',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <I18nProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
