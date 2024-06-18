import { gtmHeadSnippet } from '@/lib/google-tag-manager'
import Head from 'next/head'
import Script from 'next/script'
import React from 'react'
import { isNotEmpty } from '@sniper.io/lib'
import { Settings } from '@sniper.io/schemas'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import { env } from '@sniper.io/env'

type SEOProps = {
  url: string
  sniperName: string
  metadata?: Settings['metadata']
}

export const SEO = ({
  url,
  sniperName,
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
      <title>{title ?? sniperName}</title>
      <meta name="robots" content="noindex" />
      <link
        rel="icon"
        type="image/png"
        href={
          favIconUrl ??
          defaultSettings.metadata.favIconUrl(env.NEXT_PUBLIC_VIEWER_URL[0])
        }
      />
      <meta name="title" content={title ?? sniperName} />
      <meta
        name="description"
        content={
          description ??
          'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
        }
      />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url ?? 'https://bot.sniper.io'} />
      <meta property="og:title" content={title ?? sniperName} />
      <meta property="og:site_name" content={title ?? sniperName} />
      <meta
        property="og:description"
        content={
          description ??
          'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
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
      <meta property="twitter:url" content={url ?? 'https://bot.sniper.io'} />
      <meta property="twitter:title" content={title ?? sniperName} />
      <meta
        property="twitter:description"
        content={
          description ??
          'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
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
)
