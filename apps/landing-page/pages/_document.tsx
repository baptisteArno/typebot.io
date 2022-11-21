import { ColorModeScript } from '@chakra-ui/react'
import { theme } from 'lib/chakraTheme'
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html dir="ltr">
        <Head>
          <link rel="icon" type="image/png" href="/favicon.png" />
          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Indie+Flower:wght@400&display=swap"
            rel="stylesheet"
          />
          <noscript>
            {/*
              Here we ignore the following recommendation to solve possible SSR problems with noscript browsers/visitors
              https://nextjs.org/docs/messages/no-css-tags
            */}
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link href="./styles/aos-noscript.css" rel="stylesheet" />
          </noscript>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="/__env.js" />
        </Head>
        <body style={{ backgroundColor: '#171923' }}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
