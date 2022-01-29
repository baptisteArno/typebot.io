import { ToastId, useToast } from '@chakra-ui/react'
import { PublicTypebot, Settings, Theme, Typebot } from 'models'
import { useRouter } from 'next/router'
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
  parseTypebotToPublicTypebot,
  updatePublishedTypebot,
} from 'services/publicTypebot'
import {
  checkIfPublished,
  checkIfTypebotsAreEqual,
  parseDefaultPublicId,
  updateTypebot,
} from 'services/typebots'
import { fetcher, omit, preventUserFromRefreshing } from 'services/utils'
import useSWR from 'swr'
import { isDefined } from 'utils'
import { BlocksActions, blocksActions } from './actions/blocks'
import { useImmer, Updater } from 'use-immer'
import { stepsAction, StepsActions } from './actions/steps'
import { choiceItemsAction, ChoiceItemsActions } from './actions/choiceItems'
import { variablesAction, VariablesActions } from './actions/variables'
import { edgesAction, EdgesActions } from './actions/edges'
import { webhooksAction, WebhooksAction } from './actions/webhooks'
import { useDebounce } from 'use-debounce'

const autoSaveTimeout = 40000

type UpdateTypebotPayload = Partial<{
  theme: Theme
  settings: Settings
  publicId: string
  name: string
}>
const typebotContext = createContext<
  {
    typebot?: Typebot
    publishedTypebot?: PublicTypebot
    isPublished: boolean
    isPublishing: boolean
    hasUnsavedChanges: boolean
    isSavingLoading: boolean
    save: () => Promise<ToastId | undefined>
    undo: () => void
    updateTypebot: (updates: UpdateTypebotPayload) => void
    publishTypebot: () => void
  } & BlocksActions &
    StepsActions &
    ChoiceItemsActions &
    VariablesActions &
    EdgesActions &
    WebhooksAction
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
>({})

export const TypebotContext = ({
  children,
  typebotId,
}: {
  children: ReactNode
  typebotId?: string
}) => {
  const router = useRouter()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const [undoStack, setUndoStack] = useState<Typebot[]>([])
  const { typebot, publishedTypebot, isLoading, mutate } = useFetchedTypebot({
    typebotId,
    onError: (error) =>
      toast({
        title: 'Error while fetching typebot',
        description: error.message,
      }),
  })

  const [localTypebot, setLocalTypebot] = useImmer<Typebot | undefined>(
    undefined
  )

  const [debouncedLocalTypebot] = useDebounce(localTypebot, autoSaveTimeout)
  useEffect(() => {
    if (hasUnsavedChanges) saveTypebot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocalTypebot])

  const [localPublishedTypebot, setLocalPublishedTypebot] =
    useState<PublicTypebot>()
  const [isSavingLoading, setIsSavingLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const hasUnsavedChanges = useMemo(
    () =>
      isDefined(typebot) &&
      isDefined(localTypebot) &&
      !checkIfTypebotsAreEqual(localTypebot, typebot),
    [typebot, localTypebot]
  )

  const isPublished = useMemo(
    () =>
      isDefined(typebot) &&
      isDefined(publishedTypebot) &&
      checkIfPublished(typebot, publishedTypebot),
    [typebot, publishedTypebot]
  )

  useEffect(() => {
    if (!localTypebot || !typebot) return
    if (!checkIfTypebotsAreEqual(localTypebot, typebot)) {
      pushNewTypebotInUndoStack(localTypebot)
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
      router.replace('/typebots')
      return
    }
    setLocalTypebot({ ...typebot })
    if (publishedTypebot) setLocalPublishedTypebot({ ...publishedTypebot })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const pushNewTypebotInUndoStack = (typebot: Typebot) => {
    setUndoStack([...undoStack, typebot])
  }

  const undo = () => {
    const lastTypebot = [...undoStack].pop()
    setUndoStack(undoStack.slice(0, -1))
    setLocalTypebot(lastTypebot)
  }

  const saveTypebot = async (typebot?: Typebot) => {
    if (!localTypebot) return
    setIsSavingLoading(true)
    const { error } = await updateTypebot(
      typebot?.id ?? localTypebot.id,
      typebot ?? localTypebot
    )
    setIsSavingLoading(false)
    if (error) return toast({ title: error.name, description: error.message })
    mutate({ typebot: typebot ?? localTypebot })
    window.removeEventListener('beforeunload', preventUserFromRefreshing)
  }

  const updateLocalTypebot = ({
    publicId,
    settings,
    theme,
    name,
  }: UpdateTypebotPayload) => {
    setLocalTypebot((typebot) => {
      if (!typebot) return
      if (publicId) typebot.publicId = publicId
      if (settings) typebot.settings = settings
      if (theme) typebot.theme = theme
      if (name) typebot.name = name
    })
  }

  const publishTypebot = async () => {
    if (!localTypebot) return
    const newLocalTypebot = { ...localTypebot }
    if (!localPublishedTypebot) {
      const newPublicId = parseDefaultPublicId(
        localTypebot.name,
        localTypebot.id
      )
      updateLocalTypebot({ publicId: newPublicId })
      newLocalTypebot.publicId = newPublicId
    }
    if (hasUnsavedChanges || !localPublishedTypebot)
      await saveTypebot(newLocalTypebot)
    setIsPublishing(true)
    if (localPublishedTypebot) {
      const { error } = await updatePublishedTypebot(
        localPublishedTypebot.id,
        omit(parseTypebotToPublicTypebot(newLocalTypebot), 'id')
      )
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
    } else {
      const { data, error } = await createPublishedTypebot(
        omit(parseTypebotToPublicTypebot(newLocalTypebot), 'id')
      )
      setLocalPublishedTypebot(data)
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
    }
    mutate({ typebot: localTypebot })
  }

  return (
    <typebotContext.Provider
      value={{
        typebot: localTypebot,
        publishedTypebot: localPublishedTypebot,
        hasUnsavedChanges,
        isSavingLoading,
        save: saveTypebot,
        undo,
        publishTypebot,
        isPublishing,
        isPublished,
        updateTypebot: updateLocalTypebot,
        ...blocksActions(setLocalTypebot as Updater<Typebot>),
        ...stepsAction(setLocalTypebot as Updater<Typebot>),
        ...choiceItemsAction(setLocalTypebot as Updater<Typebot>),
        ...variablesAction(setLocalTypebot as Updater<Typebot>),
        ...edgesAction(setLocalTypebot as Updater<Typebot>),
        ...webhooksAction(setLocalTypebot as Updater<Typebot>),
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
  typebotId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { typebot: Typebot; publishedTypebot?: PublicTypebot },
    Error
  >(typebotId ? `/api/typebots/${typebotId}` : null, fetcher)
  if (error) onError(error)
  return {
    typebot: data?.typebot,
    publishedTypebot: data?.publishedTypebot,
    isLoading: !error && !data,
    mutate,
  }
}
