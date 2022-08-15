import { TypebotViewer } from 'bot-engine'
import { Answer, PublicTypebot, VariableWithValue } from 'models'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { upsertAnswer } from 'services/answer'
import { isDefined } from 'utils'
import { SEO } from '../components/Seo'
import { createResult, updateResult } from '../services/result'
import { ErrorPage } from './ErrorPage'

export type TypebotPageProps = {
  typebot?: PublicTypebot
  url: string
  isIE: boolean
  customHeadCode: string | null
}

const sessionStorageKey = 'resultId'

export const TypebotPage = ({
  typebot,
  isIE,
  url,
  customHeadCode,
}: TypebotPageProps & { typebot: PublicTypebot }) => {
  const { asPath, push } = useRouter()
  const [showTypebot, setShowTypebot] = useState(false)
  const [predefinedVariables, setPredefinedVariables] = useState<{
    [key: string]: string
  }>()
  const [error, setError] = useState<Error | undefined>(
    isIE ? new Error('Internet explorer is not supported') : undefined
  )
  const [resultId, setResultId] = useState<string | undefined>()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    clearQueryParams()
    const predefinedVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      predefinedVariables[key] = value
    })
    setPredefinedVariables(predefinedVariables)
    initializeResult().then()
    if (isDefined(customHeadCode))
      document.head.innerHTML = document.head.innerHTML + customHeadCode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearQueryParams = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      hasQueryParams &&
      typebot.settings.general.isHideQueryParamsEnabled !== false
    )
      push(asPath.split('?')[0], undefined, { shallow: true })
  }

  const initializeResult = async () => {
    const resultIdFromSession = getExistingResultFromSession()
    if (resultIdFromSession) setResultId(resultIdFromSession)
    else {
      const { error, data: result } = await createResult(typebot.typebotId)
      if (error) return setError(error)
      if (result) {
        setResultId(result.id)
        if (typebot.settings.general.isNewResultOnRefreshEnabled !== true)
          setResultInSession(result.id)
      }
    }
    setShowTypebot(true)
  }

  const handleNewVariables = async (variables: VariableWithValue[]) => {
    if (!resultId) return setError(new Error('Result was not created'))
    if (variables.length === 0) return
    // const { error } = await updateResult(resultId, { variables })
    // if (error) setError(error)
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
      <SEO
        url={url}
        typebotName={typebot.name}
        metadata={typebot.settings.metadata}
      />
      {showTypebot && (
        <TypebotViewer
          typebot={typebot}
          resultId={resultId}
          predefinedVariables={predefinedVariables}
          onNewAnswer={handleNewAnswer}
          onCompleted={handleCompleted}
          onVariablesUpdated={handleNewVariables}
        />
      )}
    </div>
  )
}

const getExistingResultFromSession = () => {
  try {
    return sessionStorage.getItem(sessionStorageKey)
  } catch {}
}

const setResultInSession = (resultId: string) => {
  try {
    return sessionStorage.setItem(sessionStorageKey, resultId)
  } catch {}
}
