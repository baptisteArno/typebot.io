import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  getConfigPath() {
    return process.env.BASE_PATH + '/config.js'
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" href="/favicon.png" />

          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />

          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap"
            rel="stylesheet"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />

          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin={'true'}
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600&display=swap"
            rel="stylesheet"
          ></link>

          <script src={this.getConfigPath()}></script>

          <style type="text/css">{`body { background: transparent !important;}`}</style>
        </Head>

        <body>
          <Main />

          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
