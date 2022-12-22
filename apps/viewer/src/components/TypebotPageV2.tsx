import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import {
  getExistingResultFromSession,
  setResultInSession,
} from '@/utils/sessionStorage'
import Bot from '@typebot.io/react'
import { BackgroundType, InitialChatReply, Typebot } from 'models'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { ErrorPage } from './ErrorPage'
import { SEO } from './Seo'

export type TypebotPageV2Props = {
  url: string
  typebot: Pick<
    Typebot,
    'settings' | 'theme' | 'id' | 'name' | 'isClosed' | 'isArchived'
  >
}

let hasInitializedChat = false

export const TypebotPageV2 = ({ url, typebot }: TypebotPageV2Props) => {
  const { asPath, push } = useRouter()
  const [initialChatReply, setInitialChatReply] = useState<InitialChatReply>()
  const [error, setError] = useState<Error | undefined>(undefined)

  const background = typebot.theme.general.background

  const clearQueryParamsIfNecessary = useCallback(() => {
    const hasQueryParams = asPath.includes('?')
    if (
      !hasQueryParams ||
      !(typebot.settings.general.isHideQueryParamsEnabled ?? true)
    )
      return
    push(asPath.split('?')[0], undefined, { shallow: true })
  }, [asPath, push, typebot.settings.general.isHideQueryParamsEnabled])

  useEffect(() => {
    clearQueryParamsIfNecessary()
  }, [clearQueryParamsIfNecessary])

  useEffect(() => {
    if (hasInitializedChat) return
    hasInitializedChat = true
    const prefilledVariables = extractPrefilledVariables()
    const existingResultId = getExistingResultFromSession() ?? undefined

    getInitialChatReplyQuery({
      typebotId: typebot.id,
      resultId:
        typebot.settings.general.isNewResultOnRefreshEnabled ?? false
          ? undefined
          : existingResultId,
      prefilledVariables,
    }).then(({ data, error }) => {
      if (error && 'code' in error && error.code === 'FORBIDDEN') {
        setError(new Error('This bot is now closed.'))
        return
      }
      if (!data) return setError(new Error("Couldn't initiate the chat"))
      setInitialChatReply(data)
      setResultInSession(data.resultId)
    })
  }, [
    initialChatReply,
    typebot.id,
    typebot.settings.general.isNewResultOnRefreshEnabled,
  ])

  if (error) {
    return <ErrorPage error={error} />
  }
  return (
    <div
      style={{
        height: '100vh',
        // Set background color to avoid SSR flash
        backgroundColor:
          background.type === BackgroundType.COLOR
            ? background.content
            : 'white',
      }}
    >
      <SEO
        url={url}
        typebotName={typebot.name}
        metadata={typebot.settings.metadata}
      />
      {initialChatReply && (
        <Bot.Standard
          typebotId={typebot.id}
          initialChatReply={initialChatReply}
        />
      )}
    </div>
  )
}

const extractPrefilledVariables = () => {
  const urlParams = new URLSearchParams(location.search)

  const prefilledVariables: { [key: string]: string } = {}
  urlParams.forEach((value, key) => {
    prefilledVariables[key] = value
  })

  return prefilledVariables
}
