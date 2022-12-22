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
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, isNotDefined, omit } from 'utils'
import { GroupsActions, groupsActions } from './actions/groups'
import { blocksAction, BlocksActions } from './actions/blocks'
import { variablesAction, VariablesActions } from './actions/variables'
import { edgesAction, EdgesActions } from './actions/edges'
import { itemsAction, ItemsActions } from './actions/items'
import { dequal } from 'dequal'
import cuid from 'cuid'
import { useToast } from '@/hooks/useToast'
import { useTypebotQuery } from '@/hooks/useTypebotQuery'
import useUndo from '../../hooks/useUndo'
import { useLinkedTypebots } from '@/hooks/useLinkedTypebots'
import { updateTypebotQuery } from '../../queries/updateTypebotQuery'
import { preventUserFromRefreshing } from '@/utils/helpers'
import { updatePublishedTypebotQuery } from '@/features/publish'
import { saveWebhookQuery } from '@/features/blocks/integrations/webhook/queries/saveWebhookQuery'
import {
  createPublishedTypebotQuery,
  deletePublishedTypebotQuery,
  checkIfTypebotsAreEqual,
  checkIfPublished,
  parseTypebotToPublicTypebot,
  parseDefaultPublicId,
  parsePublicTypebotToTypebot,
} from '@/features/publish'
import { useAutoSave } from '@/hooks/useAutoSave'

const autoSaveTimeout = 10000

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
  publishedTypebotId: string
  icon: string
  customDomain: string
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
  typebotId: string
}) => {
  const router = useRouter()
  const { showToast } = useToast()

  const { typebot, publishedTypebot, webhooks, isReadOnly, isLoading, mutate } =
    useTypebotQuery({
      typebotId,
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

  const linkedTypebotIds = localTypebot?.groups
    .flatMap((b) => b.blocks)
    .reduce<string[]>(
      (typebotIds, block) =>
        block.type === LogicBlockType.TYPEBOT_LINK &&
        isDefined(block.options.typebotId)
          ? [...typebotIds, block.options.typebotId]
          : typebotIds,
      []
    )

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

  const saveTypebot = async () => {
    if (!currentTypebotRef.current || !typebot) return
    const typebotToSave = { ...currentTypebotRef.current }
    if (dequal(omit(typebot, 'updatedAt'), omit(typebotToSave, 'updatedAt')))
      return
    setIsSavingLoading(true)
    const { error } = await updateTypebotQuery(typebotToSave.id, typebotToSave)
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
  }

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
      typebot: currentTypebotRef.current as Typebot,
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
    [typebot, publishedTypebot, webhooks]
  )

  useEffect(() => {
    Router.events.on('routeChangeStart', saveTypebot)
    return () => {
      Router.events.off('routeChangeStart', saveTypebot)
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
      showToast({ status: 'info', description: "Couldn't find typebot" })
      router.replace('/typebots')
      return
    }
    setLocalTypebot({ ...typebot })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

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
      const { data, error } = await createPublishedTypebotQuery(
        {
          ...parseTypebotToPublicTypebot(newLocalTypebot),
          id: publishedTypebotId,
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

  const updateWebhook = async (
    webhookId: string,
    updates: Partial<Webhook>
  ) => {
    if (!typebot) return
    const { data } = await saveWebhookQuery(webhookId, updates)
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
        unpublishTypebot,
        isPublishing,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        updateWebhook,
        ...groupsActions(setLocalTypebot as SetTypebot),
        ...blocksAction(setLocalTypebot as SetTypebot),
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
