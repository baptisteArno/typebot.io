import {
  LogicBlockType,
  PublicTypebot,
  ResultsTablePreferences,
  Settings,
  Theme,
  Typebot,
  Webhook,
} from 'models'
import { Router, useRouter } from 'next/router'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, omit } from 'utils'
import { edgesAction, EdgesActions } from './actions/edges'
import { itemsAction, ItemsActions } from './actions/items'
import { GroupsActions, groupsActions } from './actions/groups'
import { blocksAction, BlocksActions } from './actions/blocks'
import { variablesAction, VariablesActions } from './actions/variables'
import { dequal } from 'dequal'
import { useToast } from '@/hooks/useToast'
import { useTypebotQuery } from '@/hooks/useTypebotQuery'
import { useUndo } from '../../hooks/useUndo'
import { useLinkedTypebots } from '@/hooks/useLinkedTypebots'
import { updateTypebotQuery } from '../../queries/updateTypebotQuery'
import { preventUserFromRefreshing } from '@/utils/helpers'
import {
  createPublishedTypebotQuery,
  updatePublishedTypebotQuery,
  deletePublishedTypebotQuery,
} from '@/features/publish/queries'
import { updateWebhookQuery } from '@/features/blocks/integrations/webhook/queries/updateWebhookQuery'
import {
  checkIfTypebotsAreEqual,
  checkIfPublished,
  parseTypebotToPublicTypebot,
  parseDefaultPublicId,
  parsePublicTypebotToTypebot,
} from '@/features/publish/utils'
import { useAutoSave } from '@/hooks/useAutoSave'
import { createWebhookQuery } from '@/features/blocks/integrations/webhook/queries/createWebhookQuery'
import { duplicateWebhookQuery } from '@/features/blocks/integrations/webhook/queries/duplicateWebhookQuery'

const autoSaveTimeout = 10000

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
  icon: string
  customDomain: string | null
  resultsTablePreferences: ResultsTablePreferences
  isClosed: boolean
}>

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
    save: () => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateWebhook: (
      webhookId: string,
      webhook: Partial<Webhook>
    ) => Promise<void>
    updateTypebot: (updates: UpdateTypebotPayload) => void
    publishTypebot: () => void
    unpublishTypebot: () => void
    restorePublishedTypebot: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const TypebotProvider = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId?: string
}) => {
  const { push } = useRouter()
  const { showToast } = useToast()

  const {
    typebot,
    publishedTypebot,
    webhooks,
    isReadOnly,
    isLoading: isFetchingTypebot,
    mutate,
  } = useTypebotQuery({
    typebotId,
  })

  const [
    localTypebot,
    { redo, undo, flush, canRedo, canUndo, set: setLocalTypebot },
  ] = useUndo<Typebot>(undefined)

  const linkedTypebotIds =
    localTypebot?.groups
      .flatMap((b) => b.blocks)
      .reduce<string[]>(
        (typebotIds, block) =>
          block.type === LogicBlockType.TYPEBOT_LINK &&
          isDefined(block.options.typebotId) &&
          !typebotIds.includes(block.options.typebotId)
            ? [...typebotIds, block.options.typebotId]
            : typebotIds,
        []
      ) ?? []

  const { typebots: linkedTypebots } = useLinkedTypebots({
    workspaceId: localTypebot?.workspaceId ?? undefined,
    typebotId,
    typebotIds: linkedTypebotIds,
    onError: (error) =>
      showToast({
        title: 'Error while fetching linkedTypebots',
        description: error.message,
      }),
  })

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) setLocalTypebot(undefined)
    if (isFetchingTypebot) return
    if (!typebot) {
      showToast({ status: 'info', description: "Couldn't find typebot" })
      push('/typebots')
      return
    }
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot({ ...typebot })
      flush()
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    push,
    setLocalTypebot,
    showToast,
    typebot,
  ])

  const saveTypebot = useCallback(
    async (updates?: Partial<Typebot>) => {
      if (!localTypebot || !typebot) return
      const typebotToSave = { ...localTypebot, ...updates }
      if (dequal(omit(typebot, 'updatedAt'), omit(typebotToSave, 'updatedAt')))
        return
      setIsSavingLoading(true)
      const { data, error } = await updateTypebotQuery(
        typebotToSave.id,
        typebotToSave
      )
      if (data?.typebot) setLocalTypebot({ ...data.typebot })
      setIsSavingLoading(false)
      if (error) {
        showToast({ title: error.name, description: error.message })
        return
      }
      mutate({
        typebot: typebotToSave,
        publishedTypebot,
        webhooks: webhooks ?? [],
      })
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    },
    [
      localTypebot,
      mutate,
      publishedTypebot,
      setLocalTypebot,
      showToast,
      typebot,
      webhooks,
    ]
  )

  const savePublishedTypebot = async (newPublishedTypebot: PublicTypebot) => {
    if (!localTypebot) return
    setIsPublishing(true)
    const { error } = await updatePublishedTypebotQuery(
      newPublishedTypebot.id,
      newPublishedTypebot,
      localTypebot.workspaceId
    )
    setIsPublishing(false)
    if (error)
      return showToast({ title: error.name, description: error.message })
    mutate({
      typebot: localTypebot,
      publishedTypebot: newPublishedTypebot,
      webhooks: webhooks ?? [],
    })
  }

  useAutoSave(
    {
      handler: saveTypebot,
      item: localTypebot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot]
  )

  useEffect(() => {
    Router.events.on('routeChangeStart', () => saveTypebot())
    return () => {
      Router.events.off('routeChangeStart', () => saveTypebot())
    }
  }, [saveTypebot])

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
    if (!checkIfTypebotsAreEqual(localTypebot, typebot)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localTypebot, typebot])

  const updateLocalTypebot = (updates: UpdateTypebotPayload) =>
    localTypebot && setLocalTypebot({ ...localTypebot, ...updates })

  const publishTypebot = async () => {
    if (!localTypebot) return
    const newLocalTypebot = { ...localTypebot }
    if (!publishedTypebot || !localTypebot.publicId) {
      const newPublicId =
        localTypebot.publicId ??
        parseDefaultPublicId(localTypebot.name, localTypebot.id)
      newLocalTypebot.publicId = newPublicId
      await saveTypebot({ publicId: newPublicId })
    }
    if (publishedTypebot) {
      await savePublishedTypebot({
        ...parseTypebotToPublicTypebot(newLocalTypebot),
        id: publishedTypebot.id,
      })
    } else {
      setIsPublishing(true)
      const { data, error } = await createPublishedTypebotQuery(
        {
          ...omit(parseTypebotToPublicTypebot(newLocalTypebot), 'id'),
        },
        localTypebot.workspaceId
      )
      setIsPublishing(false)
      if (error)
        return showToast({ title: error.name, description: error.message })
      mutate({
        typebot: localTypebot,
        publishedTypebot: data,
        webhooks: webhooks ?? [],
      })
    }
  }

  const unpublishTypebot = async () => {
    if (!publishedTypebot || !localTypebot) return
    setIsPublishing(true)
    const { error } = await deletePublishedTypebotQuery({
      publishedTypebotId: publishedTypebot.id,
      typebotId: localTypebot.id,
    })
    setIsPublishing(false)
    if (error) showToast({ description: error.message })
    mutate({
      typebot: localTypebot,
      webhooks: webhooks ?? [],
    })
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(parsePublicTypebotToTypebot(publishedTypebot, localTypebot))
    return saveTypebot()
  }

  const updateWebhook = useCallback(
    async (webhookId: string, updates: Partial<Webhook>) => {
      if (!typebot) return
      const { data } = await updateWebhookQuery({
        typebotId: typebot.id,
        webhookId,
        data: updates,
      })
      if (data)
        mutate({
          typebot,
          publishedTypebot,
          webhooks: (webhooks ?? []).map((w) =>
            w.id === webhookId ? data.webhook : w
          ),
        })
    },
    [mutate, publishedTypebot, typebot, webhooks]
  )

  const createWebhook = async (data: Partial<Webhook>) => {
    if (!typebot) return
    const response = await createWebhookQuery({
      typebotId: typebot.id,
      data,
    })
    if (!response.data?.webhook) return
    mutate({
      typebot,
      publishedTypebot,
      webhooks: (webhooks ?? []).concat(response.data?.webhook),
    })
  }

  const duplicateWebhook = async (
    existingWebhookId: string,
    newWebhookId: string
  ) => {
    if (!typebot) return
    const newWebhook = await duplicateWebhookQuery({
      existingIds: {
        typebotId: typebot.id,
        webhookId: existingWebhookId,
      },
      newIds: {
        typebotId: typebot.id,
        webhookId: newWebhookId,
      },
    })
    if (!newWebhook) return
    mutate({
      typebot,
      publishedTypebot,
      webhooks: (webhooks ?? []).concat(newWebhook),
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
        unpublishTypebot,
        isPublishing,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        updateWebhook,
        ...groupsActions(setLocalTypebot as SetTypebot, {
          onWebhookBlockCreated: createWebhook,
          onWebhookBlockDuplicated: duplicateWebhook,
        }),
        ...blocksAction(setLocalTypebot as SetTypebot, {
          onWebhookBlockCreated: createWebhook,
          onWebhookBlockDuplicated: duplicateWebhook,
        }),
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
