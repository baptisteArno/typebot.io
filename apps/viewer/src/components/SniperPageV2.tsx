// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { SniperViewer } from 'bot-engine'
import {
  AnswerInput,
  PublicSniper,
  Sniper,
  VariableWithValue,
} from '@sniper.io/schemas'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
  injectCustomHeadCode,
  isDefined,
  isNotDefined,
  isNotEmpty,
} from '@sniper.io/lib'
import { SEO } from './Seo'
import { ErrorPage } from './ErrorPage'
import { gtmBodyElement } from '@/lib/google-tag-manager'
import {
  getExistingResultFromSession,
  setResultInSession,
} from '@/helpers/sessionStorage'
import { upsertAnswerQuery } from '@/features/answers/queries/upsertAnswerQuery'
import { createResultQuery } from '@/features/results/queries/createResultQuery'
import { updateResultQuery } from '@/features/results/queries/updateResultQuery'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'

export type SniperPageProps = {
  publishedSniper: Omit<PublicSniper, 'createdAt' | 'updatedAt'> & {
    sniper: Pick<Sniper, 'name' | 'isClosed' | 'isArchived' | 'publicId'>
  }
  url: string
  isIE: boolean
  customHeadCode: string | null
}

export const SniperPageV2 = ({
  publishedSniper,
  isIE,
  url,
  customHeadCode,
}: SniperPageProps) => {
  const { asPath, push } = useRouter()
  const [showSniper, setShowSniper] = useState(false)
  const [predefinedVariables, setPredefinedVariables] = useState<{
    [key: string]: string
  }>()
  const [error, setError] = useState<Error | undefined>(
    isIE ? new Error('Internet explorer is not supported') : undefined
  )
  const [resultId, setResultId] = useState<string | undefined>()
  const [variableUpdateQueue, setVariableUpdateQueue] = useState<
    VariableWithValue[][]
  >([])
  const [chatStarted, setChatStarted] = useState(false)

  useEffect(() => {
    setShowSniper(true)
    const urlParams = new URLSearchParams(location.search)
    clearQueryParams()
    const predefinedVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      predefinedVariables[key] = value
    })
    setPredefinedVariables(predefinedVariables)
    initializeResult().then()
    if (isDefined(customHeadCode)) injectCustomHeadCode(customHeadCode)
    const gtmId = publishedSniper.settings.metadata?.googleTagManagerId
    if (isNotEmpty(gtmId)) document.body.prepend(gtmBodyElement(gtmId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearQueryParams = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      hasQueryParams &&
      (publishedSniper.settings.general?.isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled) !== false
    )
      push(asPath.split('?')[0], undefined, { shallow: true })
  }

  const initializeResult = async () => {
    const resultIdFromSession = getExistingResultFromSession()
    if (resultIdFromSession) setResultId(resultIdFromSession)
    else {
      const { error, data } = await createResultQuery(publishedSniper.sniperId)
      if (error) return setError(error)
      if (data?.hasReachedLimit)
        return setError(new Error('This bot is now closed.'))
      if (data?.result) {
        setResultId(data.result.id)
        if (
          publishedSniper.settings.general?.isNewResultOnRefreshEnabled !== true
        )
          setResultInSession(data.result.id)
      }
    }
  }

  useEffect(() => {
    if (!resultId || variableUpdateQueue.length === 0) return
    Promise.all(variableUpdateQueue.map(sendNewVariables(resultId))).then()
    setVariableUpdateQueue([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId])

  const handleNewVariables = async (variables: VariableWithValue[]) => {
    if (!resultId)
      return setVariableUpdateQueue([...variableUpdateQueue, variables])
    await sendNewVariables(resultId)(variables)
  }

  const sendNewVariables =
    (resultId: string) => async (variables: VariableWithValue[]) => {
      const { error } = await updateResultQuery(resultId, { variables })
      if (error) setError(error)
    }

  const handleNewAnswer = async (
    answer: AnswerInput & { uploadedFiles: boolean }
  ) => {
    if (!resultId) return setError(new Error('Error: result was not created'))
    const { error } = await upsertAnswerQuery({ ...answer, resultId })
    if (error) setError(error)
    if (chatStarted) return
    updateResultQuery(resultId, {
      hasStarted: true,
    }).then(({ error }) => (error ? setError(error) : setChatStarted(true)))
  }

  const handleCompleted = async () => {
    if (!resultId) return setError(new Error('Error: result was not created'))
    const { error } = await updateResultQuery(resultId, { isCompleted: true })
    if (error) setError(error)
  }

  if (error) {
    return <ErrorPage error={error} />
  }
  return (
    <div style={{ height: '100vh' }}>
      <SEO
        url={url}
        sniperName={publishedSniper.sniper.name}
        metadata={publishedSniper.settings.metadata}
      />
      {showSniper && (
        <SniperViewer
          sniper={publishedSniper}
          resultId={resultId}
          predefinedVariables={predefinedVariables}
          onNewAnswer={handleNewAnswer}
          onCompleted={handleCompleted}
          onVariablesUpdated={handleNewVariables}
          isLoading={isNotDefined(resultId)}
        />
      )}
    </div>
  )
}
