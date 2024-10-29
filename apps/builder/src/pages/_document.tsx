import { ColorModeScript } from "@chakra-ui/react";
import { PublicEnvScript } from "@typebot.io/env/runtime";
import { customTheme } from "@typebot.io/theme/chakraTheme";
import { Head, Html, Main, NextScript } from "next/document";

const Document = () => (
  <Html translate="no">
    <Head>
      <link rel="icon" type="image/png" href="/favicon.png" />
      <meta name="google" content="notranslate" />
      <PublicEnvScript />
    </Head>
    <body>
      <ColorModeScript initialColorMode={customTheme.config.initialColorMode} />
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
