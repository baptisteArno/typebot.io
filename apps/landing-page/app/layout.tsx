/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next'
import { Header } from 'components/common/Header/Header'
import { Footer } from 'components/common/Footer'
import { Providers } from './providers'
import 'assets/style.css'

export const metadata: Metadata = {
  title: 'Typebot - Open-source conversational apps builder',
  description:
    'Powerful blocks to create unique chat experiences. Embed them anywhere on your apps and start collecting results like magic.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Indie+Flower:wght@400&display=swap"
          rel="stylesheet"
        />
        <script src="/__ENV.js" />
      </head>

      <body style={{ backgroundColor: '#171923' }}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
