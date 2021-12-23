import { useToast } from '@chakra-ui/react'
import {
  Block,
  PublicTypebot,
  Settings,
  Step,
  StepType,
  Target,
  Theme,
  Typebot,
} from 'bot-engine'
import { deepEqual } from 'fast-equals'
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
  parseNewBlock,
  parseNewStep,
  updateTypebot,
} from 'services/typebots'
import {
  fetcher,
  insertItemInList,
  isDefined,
  omit,
  preventUserFromRefreshing,
} from 'services/utils'
import useSWR from 'swr'
import { NewBlockPayload, Coordinates } from './GraphContext'

const typebotContext = createContext<{
  typebot?: Typebot
  publishedTypebot?: PublicTypebot
  isPublished: boolean
  isPublishing: boolean
  hasUnsavedChanges: boolean
  isSavingLoading: boolean
  save: () => void
  updateStep: (
    ids: { stepId: string; blockId: string },
    updates: Partial<Step>
  ) => void
  addNewBlock: (props: NewBlockPayload) => void
  updateBlockPosition: (blockId: string, newPositon: Coordinates) => void
  removeBlock: (blockId: string) => void
  addStepToBlock: (
    blockId: string,
    step: StepType | Step,
    index: number
  ) => void
  removeStepFromBlock: (blockId: string, stepId: string) => void
  updateTarget: (connectingIds: {
    blockId: string
    stepId: string
    target?: Target
  }) => void
  undo: () => void
  updateTheme: (theme: Theme) => void
  updateSettings: (settings: Settings) => void
  updatePublicId: (publicId: string) => void
  publishTypebot: () => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

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
  const [localTypebot, setLocalTypebot] = useState<Typebot>()
  const [localPublishedTypebot, setLocalPublishedTypebot] =
    useState<PublicTypebot>()
  const [isSavingLoading, setIsSavingLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const hasUnsavedChanges = useMemo(
    () =>
      isDefined(typebot) &&
      isDefined(localTypebot) &&
      !deepEqual(localTypebot, typebot),
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

  const saveTypebot = async () => {
    if (!localTypebot) return
    setIsSavingLoading(true)
    const { error } = await updateTypebot(localTypebot.id, localTypebot)
    setIsSavingLoading(false)
    if (error) return toast({ title: error.name, description: error.message })
    mutate({ typebot: localTypebot })
    window.removeEventListener('beforeunload', preventUserFromRefreshing)
  }

  const updateBlocks = (blocks: Block[]) => {
    if (!localTypebot) return
    setLocalTypebot({
      ...localTypebot,
      blocks: [...blocks],
    })
  }

  const updateStep = (
    { blockId, stepId }: { blockId: string; stepId: string },
    updates: Partial<Omit<Step, 'id' | 'type'>>
  ) => {
    if (!localTypebot) return
    setLocalTypebot({
      ...localTypebot,
      blocks: localTypebot.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              steps: block.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
            }
          : block
      ),
    })
  }

  const addNewBlock = ({ x, y, type, step }: NewBlockPayload) => {
    if (!localTypebot) return
    updateBlocks([
      ...localTypebot.blocks.filter((block) => block.steps.length > 0),
      parseNewBlock({
        step,
        type,
        totalBlocks: localTypebot.blocks.length,
        initialCoordinates: {
          x,
          y,
        },
      }),
    ])
  }

  const updateBlockPosition = (blockId: string, newPosition: Coordinates) => {
    if (!localTypebot) return
    blockId === 'start-block'
      ? setLocalTypebot({
          ...localTypebot,
          startBlock: {
            ...localTypebot.startBlock,
            graphCoordinates: newPosition,
          },
        })
      : updateBlocks(
          localTypebot.blocks.map((block) =>
            block.id === blockId
              ? { ...block, graphCoordinates: newPosition }
              : block
          )
        )
  }

  const addStepToBlock = (
    blockId: string,
    step: StepType | Step,
    index: number
  ) => {
    if (!localTypebot) return
    updateBlocks(
      localTypebot.blocks
        .map((block) =>
          block.id === blockId
            ? {
                ...block,
                steps: insertItemInList<Step>(
                  block.steps,
                  index,
                  typeof step === 'string'
                    ? parseNewStep(step as StepType, block.id)
                    : { ...step, blockId: block.id }
                ),
              }
            : block
        )
        .filter((block) => block.steps.length > 0)
    )
  }

  const removeStepFromBlock = (blockId: string, stepId: string) => {
    if (!localTypebot) return
    updateBlocks(
      localTypebot.blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              steps: [...block.steps.filter((step) => step.id !== stepId)],
            }
          : block
      )
    )
  }

  const updateTarget = ({
    blockId,
    stepId,
    target,
  }: {
    blockId: string
    stepId: string
    target?: Target
  }) => {
    if (!localTypebot) return
    blockId === 'start-block'
      ? setLocalTypebot({
          ...localTypebot,
          startBlock: {
            ...localTypebot.startBlock,
            steps: [{ ...localTypebot.startBlock.steps[0], target }],
          },
        })
      : updateBlocks(
          localTypebot.blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  steps: [
                    ...block.steps.map((step) =>
                      step.id === stepId ? { ...step, target } : step
                    ),
                  ],
                }
              : block
          )
        )
  }

  const removeBlock = (blockId: string) => {
    if (!localTypebot) return
    const blocks = [...localTypebot.blocks.filter((b) => b.id !== blockId)]
    setLocalTypebot({ ...localTypebot, blocks })
  }

  const updateTheme = (theme: Theme) => {
    if (!localTypebot) return
    setLocalTypebot({ ...localTypebot, theme })
  }

  const updateSettings = (settings: Settings) => {
    if (!localTypebot) return
    setLocalTypebot({ ...localTypebot, settings })
  }

  const updatePublicId = (publicId: string) => {
    if (!localTypebot) return
    setLocalTypebot({ ...localTypebot, publicId })
  }

  const publishTypebot = async () => {
    if (!localTypebot) return
    if (!localPublishedTypebot)
      updatePublicId(parseDefaultPublicId(localTypebot.name, localTypebot.id))
    if (hasUnsavedChanges) await saveTypebot()
    setIsPublishing(true)
    if (localPublishedTypebot) {
      const { error } = await updatePublishedTypebot(
        localPublishedTypebot.id,
        omit(parseTypebotToPublicTypebot(localTypebot), 'id')
      )
      setIsPublishing(false)
      if (error) return toast({ title: error.name, description: error.message })
    } else {
      const { error } = await createPublishedTypebot(
        omit(parseTypebotToPublicTypebot(localTypebot), 'id')
      )
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
        updateStep,
        addNewBlock,
        addStepToBlock,
        updateTarget,
        removeStepFromBlock,
        updateBlockPosition,
        hasUnsavedChanges,
        isSavingLoading,
        save: saveTypebot,
        removeBlock,
        undo,
        updateTheme,
        updateSettings,
        updatePublicId,
        publishTypebot,
        isPublishing,
        isPublished,
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
