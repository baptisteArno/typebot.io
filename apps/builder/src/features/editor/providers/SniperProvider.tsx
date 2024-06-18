import {
  PublicSniper,
  PublicSniperV6,
  SniperV6,
  sniperV6Schema,
} from '@sniper.io/schemas'
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
import { isDefined, omit } from '@sniper.io/lib'
import { edgesAction, EdgesActions } from './sniperActions/edges'
import { itemsAction, ItemsActions } from './sniperActions/items'
import { GroupsActions, groupsActions } from './sniperActions/groups'
import { blocksAction, BlocksActions } from './sniperActions/blocks'
import { variablesAction, VariablesActions } from './sniperActions/variables'
import { dequal } from 'dequal'
import { useToast } from '@/hooks/useToast'
import { useUndo } from '../hooks/useUndo'
import { useAutoSave } from '@/hooks/useAutoSave'
import { preventUserFromRefreshing } from '@/helpers/preventUserFromRefreshing'
import { areSnipersEqual } from '@/features/publish/helpers/areSnipersEqual'
import { isPublished as isPublishedHelper } from '@/features/publish/helpers/isPublished'
import { convertPublicSniperToSniper } from '@/features/publish/helpers/convertPublicSniperToSniper'
import { trpc } from '@/lib/trpc'
import { EventsActions, eventsActions } from './sniperActions/events'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'

const autoSaveTimeout = 10000

type UpdateSniperPayload = Partial<
  Pick<
    SniperV6,
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

export type SetSniper = (
  newPresent: SniperV6 | ((current: SniperV6) => SniperV6)
) => void

const sniperContext = createContext<
  {
    sniper?: SniperV6
    publishedSniper?: PublicSniperV6
    publishedSniperVersion?: PublicSniper['version']
    currentUserMode: 'guest' | 'read' | 'write'
    is404: boolean
    isPublished: boolean
    isSavingLoading: boolean
    save: () => Promise<void>
    undo: () => void
    redo: () => void
    canRedo: boolean
    canUndo: boolean
    updateSniper: (props: {
      updates: UpdateSniperPayload
      save?: boolean
    }) => Promise<SniperV6 | undefined>
    restorePublishedSniper: () => void
  } & GroupsActions &
    BlocksActions &
    ItemsActions &
    VariablesActions &
    EdgesActions &
    EventsActions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const SniperProvider = ({
  children,
  sniperId,
}: {
  children: ReactNode
  sniperId?: string
}) => {
  const { showToast } = useToast()
  const [is404, setIs404] = useState(false)
  const setGroupsCoordinates = useGroupsStore(
    (state) => state.setGroupsCoordinates
  )

  const {
    data: sniperData,
    isLoading: isFetchingSniper,
    refetch: refetchSniper,
  } = trpc.sniper.getSniper.useQuery(
    { sniperId: sniperId as string, migrateToLatestVersion: true },
    {
      enabled: isDefined(sniperId),
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) {
          setIs404(true)
          return
        }
        setIs404(false)
        showToast({
          title: 'Could not fetch sniper',
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

  const { data: publishedSniperData } = trpc.sniper.getPublishedSniper.useQuery(
    { sniperId: sniperId as string, migrateToLatestVersion: true },
    {
      enabled:
        isDefined(sniperId) &&
        (sniperData?.currentUserMode === 'read' ||
          sniperData?.currentUserMode === 'write'),
      onError: (error) => {
        showToast({
          title: 'Could not fetch published sniper',
          description: error.message,
          details: {
            content: JSON.stringify(error.data?.zodError?.fieldErrors, null, 2),
            lang: 'json',
          },
        })
      },
    }
  )

  const { mutateAsync: updateSniper, isLoading: isSaving } =
    trpc.sniper.updateSniper.useMutation({
      onError: (error) =>
        showToast({
          title: 'Error while updating sniper',
          description: error.message,
        }),
      onSuccess: () => {
        if (!sniperId) return
        refetchSniper()
      },
    })

  const sniper = sniperData?.sniper as SniperV6
  const publishedSniper = (publishedSniperData?.publishedSniper ??
    undefined) as PublicSniperV6 | undefined
  const isReadOnly =
    sniperData &&
    ['read', 'guest'].includes(sniperData?.currentUserMode ?? 'guest')

  const [
    localSniper,
    { redo, undo, flush, canRedo, canUndo, set: setLocalSniper, setUpdateDate },
  ] = useUndo<SniperV6>(undefined, {
    isReadOnly,
    onUndo: (t) => {
      setGroupsCoordinates(t.groups)
    },
    onRedo: (t) => {
      setGroupsCoordinates(t.groups)
    },
  })

  useEffect(() => {
    if (!sniper && isDefined(localSniper)) {
      setLocalSniper(undefined)
      setGroupsCoordinates(undefined)
    }
    if (isFetchingSniper || !sniper) return
    if (
      sniper.id !== localSniper?.id ||
      new Date(sniper.updatedAt).getTime() >
        new Date(localSniper.updatedAt).getTime()
    ) {
      setLocalSniper({ ...sniper })
      setGroupsCoordinates(sniper.groups)
      flush()
    }
  }, [
    flush,
    isFetchingSniper,
    localSniper,
    setGroupsCoordinates,
    setLocalSniper,
    showToast,
    sniper,
  ])

  const saveSniper = useCallback(
    async (updates?: Partial<SniperV6>) => {
      if (!localSniper || !sniper || isReadOnly) return
      const sniperToSave = {
        ...localSniper,
        ...updates,
      }
      if (dequal(omit(sniper, 'updatedAt'), omit(sniperToSave, 'updatedAt')))
        return
      const newParsedSniper = sniperV6Schema.parse({ ...sniperToSave })
      setLocalSniper(newParsedSniper)
      try {
        const {
          sniper: { updatedAt },
        } = await updateSniper({
          sniperId: newParsedSniper.id,
          sniper: newParsedSniper,
        })
        setUpdateDate(updatedAt)
      } catch {
        setLocalSniper({
          ...localSniper,
        })
      }
    },
    [
      isReadOnly,
      localSniper,
      setLocalSniper,
      setUpdateDate,
      sniper,
      updateSniper,
    ]
  )

  useAutoSave(
    {
      handler: saveSniper,
      item: localSniper,
      debounceTimeout: autoSaveTimeout,
    },
    [saveSniper, localSniper]
  )

  useEffect(() => {
    const handleSaveSniper = () => {
      saveSniper()
    }
    Router.events.on('routeChangeStart', handleSaveSniper)
    return () => {
      Router.events.off('routeChangeStart', handleSaveSniper)
    }
  }, [saveSniper])

  const isPublished = useMemo(
    () =>
      isDefined(localSniper) &&
      isDefined(localSniper.publicId) &&
      isDefined(publishedSniper) &&
      isPublishedHelper(localSniper, publishedSniper),
    [localSniper, publishedSniper]
  )

  useEffect(() => {
    if (!localSniper || !sniper || isReadOnly) return
    if (!areSnipersEqual(localSniper, sniper)) {
      window.addEventListener('beforeunload', preventUserFromRefreshing)
    }

    return () => {
      window.removeEventListener('beforeunload', preventUserFromRefreshing)
    }
  }, [localSniper, sniper, isReadOnly])

  const updateLocalSniper = async ({
    updates,
    save,
  }: {
    updates: UpdateSniperPayload
    save?: boolean
  }) => {
    if (!localSniper || isReadOnly) return
    const newSniper = { ...localSniper, ...updates }
    setLocalSniper(newSniper)
    if (save) await saveSniper(newSniper)
    return newSniper
  }

  const restorePublishedSniper = () => {
    if (!publishedSniper || !localSniper) return
    setLocalSniper(convertPublicSniperToSniper(publishedSniper, localSniper))
  }

  return (
    <sniperContext.Provider
      value={{
        sniper: localSniper,
        publishedSniper,
        publishedSniperVersion: publishedSniperData?.version,
        currentUserMode: sniperData?.currentUserMode ?? 'guest',
        isSavingLoading: isSaving,
        is404,
        save: saveSniper,
        undo,
        redo,
        canUndo,
        canRedo,
        isPublished,
        updateSniper: updateLocalSniper,
        restorePublishedSniper,
        ...groupsActions(setLocalSniper as SetSniper),
        ...blocksAction(setLocalSniper as SetSniper),
        ...variablesAction(setLocalSniper as SetSniper),
        ...edgesAction(setLocalSniper as SetSniper),
        ...itemsAction(setLocalSniper as SetSniper),
        ...eventsActions(setLocalSniper as SetSniper),
      }}
    >
      {children}
    </sniperContext.Provider>
  )
}

export const useSniper = () => useContext(sniperContext)
