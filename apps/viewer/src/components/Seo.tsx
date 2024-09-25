import { gtmHeadSnippet } from "@/lib/google-tag-manager";
import { env } from "@typebot.io/env";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import Head from "next/head";
import Script from "next/script";
import React from "react";

type SEOProps = {
  url: string;
  typebotName: string;
  metadata?: Settings["metadata"];
};

export const SEO = ({
  url,
  typebotName,
  metadata: {
    title,
    description,
    favIconUrl,
    imageUrl,
    googleTagManagerId,
  } = {},
}: SEOProps) => (
  <>
    <Head key="seo">
      <title>{title ?? typebotName}</title>
      <meta name="robots" content="noindex" />
      <link
        rel="icon"
        type="image/png"
        href={
          favIconUrl ??
          defaultSettings.metadata.favIconUrl(env.NEXT_PUBLIC_VIEWER_URL[0])
        }
      />
      <meta name="title" content={title ?? typebotName} />
      <meta
        name="description"
        content={
          description ??
          "Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form."
        }
      />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url ?? "https://bot.typebot.io"} />
      <meta property="og:title" content={title ?? typebotName} />
      <meta property="og:site_name" content={title ?? typebotName} />
      <meta
        property="og:description"
        content={
          description ??
          "Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form."
        }
      />
      <meta
        property="og:image"
        itemProp="image"
        content={
          imageUrl ??
          defaultSettings.metadata.imageUrl(env.NEXT_PUBLIC_VIEWER_URL[0])
        }
      />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url ?? "https://bot.typebot.io"} />
      <meta property="twitter:title" content={title ?? typebotName} />
      <meta
        property="twitter:description"
        content={
          description ??
          "Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form."
        }
      />
      <meta
        property="twitter:image"
        content={
          imageUrl ??
          defaultSettings.metadata.imageUrl(env.NEXT_PUBLIC_VIEWER_URL[0])
        }
      />
    </Head>
    {isNotEmpty(googleTagManagerId) && (
      <Script id="google-tag-manager">
        {gtmHeadSnippet(googleTagManagerId)}
      </Script>
    )}
  </>
);
