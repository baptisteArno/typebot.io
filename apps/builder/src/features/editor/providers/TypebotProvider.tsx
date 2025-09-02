import {
  PublicTypebot,
  PublicTypebotV6,
  TypebotV6,
  typebotV6Schema,
} from '@typebot.io/schemas'
import { Router } from 'next/router'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isDefined, omit } from '@typebot.io/lib'
import { edgesAction, EdgesActions } from './typebotActions/edges'
import { itemsAction, ItemsActions } from './typebotActions/items'
import { GroupsActions, groupsActions } from './typebotActions/groups'
import { blocksAction, BlocksActions } from './typebotActions/blocks'
import { variablesAction, VariablesActions } from './typebotActions/variables'
import { dequal } from 'dequal'
import { useToast } from '@/hooks/useToast'
import { useUndo } from '../hooks/useUndo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { preventUserFromRefreshing } from '@/helpers/preventUserFromRefreshing'
import { areTypebotsEqual } from '@/features/publish/helpers/areTypebotsEqual'
import { isPublished as isPublishedHelper } from '@/features/publish/helpers/isPublished'
import { convertPublicTypebotToTypebot } from '@/features/publish/helpers/convertPublicTypebotToTypebot'
import { trpc } from '@/lib/trpc'
import { EventsActions, eventsActions } from './typebotActions/events'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'

const autoSaveTimeout = 15000

type UpdateTypebotPayload = Partial<
  Pick<
    TypebotV6,
    | 'theme'
    | 'selectedThemeTemplateId'
    | 'settings'
    | 'publicId'
    | 'name'
    | 'icon'
    | 'customDomain'
    | 'resultsTablePreferences'
    | 'isClosed'
    | 'whatsAppCredentialsId'
    | 'riskLevel'
  >
>

export type SetTypebot = (
  newPresent: TypebotV6 | ((current: TypebotV6) => TypebotV6)
) => void

const typebotContext = createContext<
  {
    typebot?: TypebotV6
    publishedTypebot?: PublicTypebotV6
    publishedTypebotVersion?: PublicTypebot['version']
    currentUserMode: 'guest' | 'read' | 'write'
    is404: boolean
    isPublished: boolean
    isSavingLoading: boolean
    save: () => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateTypebot: (props: {
      updates: UpdateTypebotPayload
      save?: boolean
    }) => Promise<TypebotV6 | undefined>
    restorePublishedTypebot: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
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
  const { showToast } = useToast()
  const [is404, setIs404] = useState(false)
  const setGroupsCoordinates = useGroupsStore(
    (state) => state.setGroupsCoordinates
  )

  // Function to check if a typebot exceeds group limits and unpublish if needed
  const checkAndUnpublishIfNeeded = useCallback(
    async (typebotId: string, groupCount: number) => {
      try {
        const { shouldUnpublishTypebot } = await import('@typebot.io/lib')
        const shouldUnpublish = await shouldUnpublishTypebot(
          typebotId,
          groupCount
        )

        if (shouldUnpublish) {
          // Update local state to remove publicId
          setLocalTypebot((currentTypebot) => {
            if (currentTypebot && currentTypebot.id === typebotId) {
              return { ...currentTypebot, publicId: undefined }
            }
            return currentTypebot
          })

          showToast({
            title: 'Typebot Auto-Unpublished',
            description:
              'Typebot has been automatically unpublished due to exceeding group limits.',
          })
        }
      } catch (error) {
        console.error('Failed to check group limits for auto-unpublish:', error)
      }
    },
    [setLocalTypebot, showToast]
  )

  const {
    data: typebotData,
    isLoading: isFetchingTypebot,
    refetch: refetchTypebot,
  } = trpc.typebot.getTypebot.useQuery(
    { typebotId: typebotId as string, migrateToLatestVersion: true },
    {
      enabled: isDefined(typebotId),
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) {
          setIs404(true)
          return
        }
        setIs404(false)
        showToast({
          title: 'Could not fetch typebot',
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: 'json',
          },
        })
      },
      onSuccess: () => {
        setIs404(false)
      },
    }
  )

  const { data: publishedTypebotData } =
    trpc.typebot.getPublishedTypebot.useQuery(
      { typebotId: typebotId as string, migrateToLatestVersion: true },
      {
        enabled:
          isDefined(typebotId) &&
          (typebotData?.currentUserMode === 'read' ||
            typebotData?.currentUserMode === 'write'),
        onError: (error) => {
          showToast({
            title: 'Could not fetch published typebot',
            description: error.message,
            details: {
              content: JSON.stringify(
                error.data?.zodError?.fieldErrors,
                null,
                2
              ),
              lang: 'json',
            },
          })
        },
      }
    )

  const { mutateAsync: updateTypebot, isLoading: isSaving } =
    trpc.typebot.updateTypebot.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while updating typebot',
          description: error.message,
        }),
      onSuccess: () => {
        if (!typebotId) return
        refetchTypebot()
      },
    })

  const typebot = typebotData?.typebot as TypebotV6
  const publishedTypebot = (publishedTypebotData?.publishedTypebot ??
    undefined) as PublicTypebotV6 | undefined
  const isReadOnly =
    typebotData &&
    ['read', 'guest'].includes(typebotData?.currentUserMode ?? 'guest')

  const [
    localTypebot,
    {
      redo,
      undo,
      flush,
      canRedo,
      canUndo,
      set: setLocalTypebot,
      setUpdateDate,
    },
  ] = useUndo<TypebotV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setGroupsCoordinates(t.groups)
    },
    onRedo: (t) => {
      setGroupsCoordinates(t.groups)
    },
  })

  useEffect(() => {
    if (!typebot && isDefined(localTypebot)) {
      setLocalTypebot(undefined)
      setGroupsCoordinates(undefined)
    }
    if (isFetchingTypebot || !typebot) return
    if (
      typebot.id !== localTypebot?.id ||
      new Date(typebot.updatedAt).getTime() >
        new Date(localTypebot.updatedAt).getTime()
    ) {
      setLocalTypebot({ ...typebot })
      setGroupsCoordinates(typebot.groups)
      flush()

      // Check if the loaded typebot exceeds group limits and should be unpublished
      if (typebot.publicId) {
        checkAndUnpublishIfNeeded(typebot.id, typebot.groups.length)
      }
    }
  }, [
    flush,
    isFetchingTypebot,
    localTypebot,
    setGroupsCoordinates,
    setLocalTypebot,
    showToast,
    typebot,
    checkAndUnpublishIfNeeded,
  ])

  const saveTypebot = useCallback(
    async (updates?: Partial<TypebotV6>) => {
      if (!localTypebot || !typebot || isReadOnly) return
      const typebotToSave = {
        ...localTypebot,
        ...updates,
      }
      if (
        dequal(
          JSON.parse(JSON.stringify(omit(typebot, 'updatedAt'))),
          JSON.parse(JSON.stringify(omit(typebotToSave, 'updatedAt')))
        )
      )
        return
      const newParsedTypebot = typebotV6Schema.parse({ ...typebotToSave })
      setLocalTypebot(newParsedTypebot)
      try {
        const {
          typebot: { updatedAt },
        } = await updateTypebot({
          typebotId: newParsedTypebot.id,
          typebot: newParsedTypebot,
        })
        setUpdateDate(updatedAt)
      } catch {
        setLocalTypebot({
          ...localTypebot,
        })
      }
    },
    [
      isReadOnly,
      localTypebot,
      setLocalTypebot,
      setUpdateDate,
      typebot,
      updateTypebot,
    ]
  )

  useAutoSave(
    {
      handler: saveTypebot,
      item: localTypebot,
      debounceTimeout: autoSaveTimeout,
    },
    [saveTypebot, localTypebot]
  )

  useEffect(() => {
    const handleSaveTypebot = () => {
      saveTypebot()
    }
    Router.events.on('routeChangeStart', handleSaveTypebot)
    return () => {
      Router.events.off('routeChangeStart', handleSaveTypebot)
    }
  }, [saveTypebot])

  const isPublished = useMemo(
    () =>
      isDefined(localTypebot) &&
      isDefined(localTypebot.publicId) &&
      isDefined(publishedTypebot) &&
      isPublishedHelper(localTypebot, publishedTypebot),
    [localTypebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot || isReadOnly) return
    if (!areTypebotsEqual(localTypebot, typebot)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localTypebot, typebot, isReadOnly])

  // Periodic check for published typebots that might exceed group limits
  useEffect(() => {
    if (!localTypebot?.publicId || isReadOnly) return

    const checkInterval = setInterval(async () => {
      await checkAndUnpublishIfNeeded(
        localTypebot.id,
        localTypebot.groups.length
      )
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkInterval)
  }, [
    localTypebot?.id,
    localTypebot?.publicId,
    localTypebot?.groups.length,
    isReadOnly,
    checkAndUnpublishIfNeeded,
  ])

  const updateLocalTypebot = async ({
    updates,
    save,
  }: {
    updates: UpdateTypebotPayload
    save?: boolean
  }) => {
    if (!localTypebot || isReadOnly) return
    const newTypebot = { ...localTypebot, ...updates }
    setLocalTypebot(newTypebot)
    if (save) await saveTypebot(newTypebot)
    return newTypebot
  }

  const restorePublishedTypebot = () => {
    if (!publishedTypebot || !localTypebot) return
    setLocalTypebot(
      convertPublicTypebotToTypebot(publishedTypebot, localTypebot)
    )
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot,
        publishedTypebotVersion: publishedTypebotData?.version,
        currentUserMode: typebotData?.currentUserMode ?? 'guest',
        isSavingLoading: isSaving,
        is404,
        save: saveTypebot,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        updateTypebot: updateLocalTypebot,
        restorePublishedTypebot,
        ...groupsActions(setLocalTypebot as SetTypebot, showToast),
        ...blocksAction(setLocalTypebot as SetTypebot),
        ...variablesAction(setLocalTypebot as SetTypebot),
        ...edgesAction(setLocalTypebot as SetTypebot),
        ...itemsAction(setLocalTypebot as SetTypebot),
        ...eventsActions(setLocalTypebot as SetTypebot),
      }}
    >
      {children}
    </typebotContext.Provider>
  )
}

export const useTypebot = () => useContext(typebotContext)
