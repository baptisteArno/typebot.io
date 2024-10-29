/* eslint-disable @next/next/no-sync-scripts */
import { PublicEnvScript } from "@typebot.io/env/runtime";
import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html translate="no">
    <Head>
      <PublicEnvScript />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
