import Head from 'next/head'
import React from 'react'

type SEOProps = any

export const SEO = ({
  iconUrl,
  thumbnailUrl,
  title,
  description,
  url,
  chatbotName,
}: SEOProps) => (
  <Head>
    <title>{title ?? chatbotName}</title>
    <link
      rel="icon"
      type="image/png"
      href={iconUrl ?? 'https://bot.typebot.io/favicon.png'}
    />
    <meta name="title" content={title ?? chatbotName} />
    <meta
      name="description"
      content={
        description ??
        'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
      }
    />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={url ?? 'https://bot.typebot.io'} />
    <meta property="og:title" content={title ?? chatbotName} />
    <meta property="og:site_name" content={title ?? chatbotName} />
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
      content={thumbnailUrl ?? 'https://bot.typebot.io/site-preview.png'}
    />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url ?? 'https://bot.typebot.io'} />
    <meta property="twitter:title" content={title ?? chatbotName} />
    <meta
      property="twitter:description"
      content={
        description ??
        'Build beautiful conversational forms and embed them directly in your applications without a line of code. Triple your response rate and collect answers that has more value compared to a traditional form.'
      }
    />
    <meta
      property="twitter:image"
      content={thumbnailUrl ?? 'https://bot.typebot.io/site-preview.png'}
    />
  </Head>
)
