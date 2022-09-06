import { useToast } from '@chakra-ui/react'
import {
  LogicStepType,
  PublicTypebot,
  Settings,
  Theme,
  Typebot,
  Webhook,
} from 'models'
import { Router, useRouter } from 'next/router'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createPublishedTypebot,
  parsePublicTypebotToTypebot,
  parseTypebotToPublicTypebot,
  updatePublishedTypebot,
} from 'services/publicTypebot'
import {
  checkIfPublished,
  checkIfTypebotsAreEqual,
  parseDefaultPublicId,
  updateTypebot,
} from 'services/typebots/typebots'
import { fetcher, preventUserFromRefreshing } from 'services/utils'
import useSWR from 'swr'
import { isDefined, isEmpty, isNotDefined, omit } from 'utils'
import { BlocksActions, blocksActions } from './actions/blocks'
import { stepsAction, StepsActions } from './actions/steps'
import { variablesAction, VariablesActions } from './actions/variables'
import { edgesAction, EdgesActions } from './actions/edges'
import { useRegisterActions } from 'kbar'
import useUndo from 'services/utils/useUndo'
import { useDebounce } from 'use-debounce'
import { itemsAction, ItemsActions } from './actions/items'
import { dequal } from 'dequal'
import { saveWebhook } from 'services/webhook'
import { stringify } from 'qs'
import cuid from 'cuid'
import { subDomain } from '@octadesk-tech/services'
const autoSaveTimeout = 10000

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
  publishedTypebotId: string
  icon: string
}>

type SaveResponse = {
  saved: Boolean,
  updatedAt: Date
}

export type SetTypebot = (
  newPresent: Typebot | ((current: Typebot) => Typebot)
) => void
const typebotContext = createContext<
  {
    typebot?: Typebot
    publishedTypebot?: PublicTypebot
    linkedTypebots?: Typebot[]
    webhooks: Webhook[]
    isReadOnly?: boolean
    isPublished: boolean
    isPublishing: boolean
    isSavingLoading: boolean
    save: () => Promise<SaveResponse>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateWebhook: (
      webhookId: string,
      webhook: Partial<Webhook>
    ) => Promise<void>
    updateTypebot: (updates: UpdateTypebotPayload) => void
    updateOnBothTypebots: (updates: {
      publicId?: string
      name?: string
      customDomain?: string | null
    }) => void
    publishTypebot: () => void
    restorePublishedTypebot: () => void
  } & BlocksActions &
  StepsActions &
  ItemsActions &
  VariablesActions &
  EdgesActions
>({})

export const TypebotContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId: string
}) => {
  const router = useRouter()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { typebot, publishedTypebot, webhooks, isReadOnly, isLoading, mutate } =
    useFetchedTypebot({
      typebotId,
      onError: (error) =>
        toast({
          title: 'Error while fetching typebot',
          description: error.message,
        }),
    })

  const [
    { present: localTypebot },
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      presentRef: currentTypebotRef,
    },
  ] = useUndo<Typebot | undefined>(undefined)

  const linkedTypebotIds = localTypebot?.blocks
    .flatMap((b) => b.steps)
    .reduce<string[]>(
      (typebotIds, step) =>
        step.type === LogicStepType.TYPEBOT_LINK &&
          isDefined(step.options.typebotId)
          ? [...typebotIds, step.options.typebotId]
          : typebotIds,
      []
    )

  const { typebots: linkedTypebots } = useLinkedTypebots({
    workspaceId: localTypebot?.workspaceId ?? undefined,
    typebotId,
    typebotIds: linkedTypebotIds,
    onError: (error) =>
      toast({
        title: 'Error while fetching linkedTypebots',
        description: error.message,
      }),
  })

  useEffect(() => {
    if (!typebot || !currentTypebotRef.current) return
    if (typebotId !== currentTypebotRef.current.id) {
      setLocalTypebot({ ...typebot }, { updateDate: false })
      flush()
    } else if (
      new Date(typebot.updatedAt) >
      new Date(currentTypebotRef.current.updatedAt)
    ) {
      setLocalTypebot({ ...typebot })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot])

  const saveTypebot = async (options?: { disableMutation: boolean }) => {
    const currentSubDomain = subDomain.getSubDomain()
    const typebotToSave = {
      ...currentTypebotRef.current,
      updatedAt: new Date().toISOString(),
      subDomain: currentSubDomain || ''
    }

    setIsSavingLoading(true)
    const { error } = await updateTypebot(typebotToSave.id, typebotToSave)
    setIsSavingLoading(false)
    if (error) {
      toast({ title: error.name, description: error.message })
      return false
    }

    if (!options?.disableMutation)
      mutate({
        typebot: typebotToSave,
        publishedTypebot,
        webhooks: webhooks ?? [],
      })
    window.removeEventListener('beforeunload', preventUserFromRefreshing)

    return { saved: true, updateAt: typebotToSave.updatedAt }
  }

  const savePublishedTypebot = async (newPublishedTypebot: PublicTypebot) => {
    setIsPublishing(true)
    const { error } = await updatePublishedTypebot(
      newPublishedTypebot.id,
      newPublishedTypebot
    )
    setIsPublishing(false)
    if (error) return toast({ title: error.name, description: error.message })
    mutate({
      typebot: currentTypebotRef.current as Typebot,
      publishedTypebot: newPublishedTypebot,
      webhooks: webhooks ?? [],
    })
  }

  // useAutoSave(
  //   {
  //     handler: saveTypebot,
  //     item: localTypebot,
  //     debounceTimeout: autoSaveTimeout,
  //   },
  //   [typebot, publishedTypebot, webhooks]
  // )

  useEffect(() => {
    const save = () => saveTypebot({ disableMutation: true })
    Router.events.on('routeChangeStart', save)
    return () => {
      Router.events.off('routeChangeStart', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot, publishedTypebot, webhooks])

  const [isSavingLoading, setIsSavingLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(publishedTypebot) &&
      checkIfPublished(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot) return
    currentTypebotRef.current = localTypebot
    if (!checkIfTypebotsAreEqual(localTypebot, typebot)) {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    } else {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTypebot])

  useEffect(() => {
    if (isLoading) return
    if (!typebot) {
      toast({ status: 'info', description: "Couldn't find typebot" })
      router.replace(`${process.env.BASE_PATH_OCTADESK || ''}/typebots`)
      return
    }
    setLocalTypebot({ ...typebot })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useRegisterActions(
    [
      {
        id: 'save',
        name: 'Save typebot',
        perform: () => saveTypebot(),
      },
    ],
    [typebot, publishedTypebot, webhooks]
  )

  useRegisterActions(
    [
      {
        id: 'undo',
        name: 'Undo changes',
        perform: undo,
      },
    ],
    [localTypebot]
  )

  const updateLocalTypebot = (updates: UpdateTypebotPayload) =>
    localTypebot && setLocalTypebot({ ...localTypebot, ...updates })

  const publishTypebot = async () => {
    if (!localTypebot) return
    const publishedTypebotId = cuid()
    const newLocalTypebot = { ...localTypebot }
    if (publishedTypebot && isNotDefined(localTypebot.publishedTypebotId)) {
      updateLocalTypebot({ publishedTypebotId: publishedTypebot.id })
      await saveTypebot()
    }
    if (!publishedTypebot) {
      const newPublicId = parseDefaultPublicId(
        localTypebot.name,
        localTypebot.id
      )
      updateLocalTypebot({ publicId: newPublicId, publishedTypebotId })
      newLocalTypebot.publicId = newPublicId
      await saveTypebot()
    }
    if (publishedTypebot) {
      await savePublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebot.id,
      })
    } else {
      setIsPublishing(true)
      const { data, error } = await createPublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebotId,
      })
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
      mutate({
        typebot: localTypebot,
        publishedTypebot: data,
        webhooks: webhooks ?? [],
      })
    }
  }

  const updateOnBothTypebots = async (updates: {
    publicId?: string
    name?: string
    customDomain?: string | null
  }) => {
    updateLocalTypebot(updates)
    await saveTypebot()
    if (!publishedTypebot) return
    await savePublishedTypebot({
      ...publishedTypebot,
      ...updates,
    })
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(parsePublicTypebotToTypebot(publishedTypebot, localTypebot))
    return saveTypebot()
  }

  const updateWebhook = async (
    webhookId: string,
    updates: Partial<Webhook>
  ) => {
    if (!typebot) return
    const { data } = await saveWebhook(webhookId, updates)
    if (data)
      mutate({
        typebot,
        publishedTypebot,
        webhooks: (webhooks ?? []).map((w) =>
          w.id === webhookId ? data.webhook : w
        ),
      })
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        linkedTypebots,
        webhooks: webhooks ?? [],
        isReadOnly,
        isSavingLoading,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        publishTypebot,
        isPublishing,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        updateOnBothTypebots,
        updateWebhook,
        ...blocksActions(setLocalTypebot as SetTypebot),
        ...stepsAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)

export const useFetchedTypebot = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    {
      typebot: Typebot
      webhooks: Webhook[]
      publishedTypebot?: PublicTypebot
      isReadOnly?: boolean
    },
    Error
  >(`/getTypebot-${typebotId}`, fetcher, {
    dedupingInterval: isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? undefined : 0,
  })
  if (error) onError(error)
  return {
    typebot: data?.typebot,
    webhooks: data?.webhooks,
    publishedTypebot: data?.publishedTypebot,
    isReadOnly: data?.isReadOnly,
    isLoading: !error && !data,
    mutate,
  }
}

const useLinkedTypebots = ({
  workspaceId,
  typebotId,
  typebotIds,
  onError,
}: {
  workspaceId?: string
  typebotId?: string
  typebotIds?: string[]
  onError: (error: Error) => void
}) => {
  const params = stringify({ typebotIds, workspaceId }, { indices: false })
  const { data, error, mutate } = useSWR<
    {
      typebots: Typebot[]
    },
    Error
  >(
    typebotIds?.every((id) => typebotId === id)
      ? undefined
      : `${process.env.BASE_PATH_OCTADESK || ''}/api/typebots?${params}`,
    fetcher
  )
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}

const useAutoSave = <T,>(
  {
    handler,
    item,
    debounceTimeout,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: () => Promise<any>
    item?: T
    debounceTimeout: number
  },
  dependencies: unknown[]
) => {
  const [debouncedItem] = useDebounce(item, debounceTimeout)
  useEffect(() => {
    const save = () => handler()
    document.addEventListener('visibilitychange', save)
    return () => {
      document.removeEventListener('visibilitychange', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
  return useEffect(() => {
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedItem])
}
