import { TypebotViewer } from 'bot-engine'
import { Answer, PublicTypebot } from 'models'
import React, { useEffect, useState } from 'react'
import { upsertAnswer } from 'services/answer'
import { SEO } from '../components/Seo'
import { createResult, updateResult } from '../services/result'
import { ErrorPage } from './ErrorPage'

export type TypebotPageProps = {
  typebot?: PublicTypebot
  url: string
  isIE: boolean
}

const sessionStorageKey = 'resultId'

export const TypebotPage = ({
  typebot,
  isIE,
  url,
}: TypebotPageProps & { typebot: PublicTypebot }) => {
  const [error, setError] = useState<Error | undefined>(
    isIE ? new Error('Internet explorer is not supported') : undefined
  )
  const [resultId, setResultId] = useState<string | undefined>()

  useEffect(() => {
    initializeResult()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeResult = async () => {
    const resultIdFromSession = sessionStorage.getItem(sessionStorageKey)
    if (resultIdFromSession) setResultId(resultIdFromSession)
    else {
      const { error, data: result } = await createResult(typebot.typebotId)
      if (error) setError(error)
      if (result) {
        setResultId(result.id)
        sessionStorage.setItem(sessionStorageKey, result.id)
      }
    }
  }

  const handleNewAnswer = async (answer: Answer) => {
    if (!resultId) return setError(new Error('Result was not created'))
    const { error } = await upsertAnswer({ ...answer, resultId })
    if (error) setError(error)
  }

  const handleCompleted = async () => {
    if (!resultId) return setError(new Error('Result was not created'))
    const { error } = await updateResult(resultId, { isCompleted: true })
    if (error) setError(error)
  }

  if (error) {
    return <ErrorPage error={error} />
  }
  return (
    <div style={{ height: '100vh' }}>
      <SEO url={url} chatbotName={typebot.name} />
      {resultId && (
        <TypebotViewer
          typebot={typebot}
          onNewAnswer={handleNewAnswer}
          onCompleted={handleCompleted}
        />
      )}
    </div>
  )
}
