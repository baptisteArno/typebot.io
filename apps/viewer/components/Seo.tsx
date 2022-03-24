import { Metadata } from 'models'
import Head from 'next/head'
import React from 'react'

type SEOProps = {
  url: string
  typebotName: string
  metadata: Metadata
}

export const SEO = ({
  url,
  typebotName,
  metadata: { title, description, favIconUrl, imageUrl },
}: SEOProps) => (
  <Head>
    <title>{title ?? typebotName}</title>
    <meta name="robots" content="noindex" />
    <link
      rel="icon"
      type="image/png"
      href={favIconUrl ?? 'https://bot.typebot.io/favicon.png'}
    />
    <meta name="title" content={title ?? typebotName} />
    <meta
      name="description"
      content={
        description ??
        'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
      }
    />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={url ?? 'https://bot.typebot.io'} />
    <meta property="og:title" content={title ?? typebotName} />
    <meta property="og:site_name" content={title ?? typebotName} />
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
      content={imageUrl ?? 'https://bot.typebot.io/site-preview.png'}
    />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url ?? 'https://bot.typebot.io'} />
    <meta property="twitter:title" content={title ?? typebotName} />
    <meta
      property="twitter:description"
      content={
        description ??
        'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
      }
    />
    <meta
      property="twitter:image"
      content={imageUrl ?? 'https://bot.typebot.io/site-preview.png'}
    />
  </Head>
)
