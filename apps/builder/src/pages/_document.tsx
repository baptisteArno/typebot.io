import { customTheme } from '@/lib/theme'
import { ColorModeScript } from '@chakra-ui/react'
import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => (
  <Html translate="no">
    <Head>
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
        rel="stylesheet"
      />
      <meta name="google" content="notranslate" />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="/__env.js" />
    </Head>
    <body>
      <ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
