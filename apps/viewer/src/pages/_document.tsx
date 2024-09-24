/* eslint-disable @next/next/no-sync-scripts */
import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html translate="no">
    <Head>
      <script src="/__ENV.js" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
