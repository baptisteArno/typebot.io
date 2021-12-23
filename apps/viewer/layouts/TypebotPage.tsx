import { PublicTypebot, TypebotViewer } from 'bot-engine'
import React from 'react'
import { SEO } from '../components/Seo'
import { ErrorPage } from './ErrorPage'
import { NotFoundPage } from './NotFoundPage'

export type TypebotPageProps = {
  typebot?: PublicTypebot
  url: string
  isIE: boolean
}

export const TypebotPage = ({ typebot, isIE, url }: TypebotPageProps) => {
  if (!typebot) {
    return <NotFoundPage />
  }
  if (isIE) {
    return <ErrorPage error={'IE'} />
  }
  return (
    <div style={{ height: '100vh' }}>
      <SEO url={url} chatbotName={typebot.name} />
      <TypebotViewer typebot={typebot} />
    </div>
  )
}
