import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html translate="no">
    <Head>
      {/* <script
        crossOrigin="anonymous"
        src="//unpkg.com/react-scan/dist/auto.global.js"
      /> */}
      <link rel="icon" type="images/svg+xml" href="/favicon.svg" />
      <meta name="google" content="notranslate" />
      <script src="/__ENV.js" />
    </Head>
    <body className="font-body text-gray-12 bg-gray-2 dark:bg-gray-1 antialiased">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
