import { env } from '@typebot.io/env'
import { Typebot } from '@typebot.io/schemas'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useValidation, ValidationError } from '../hooks/useValidation'
import { useTypebot } from './TypebotProvider'

import { useUser } from '@/features/account/hooks/useUser'
import { TypebotEditQueueItem, useEditQueue } from '../hooks/useEditQueue'
import { useToast } from '@/hooks/useToast'
import { useTranslate } from '@tolgee/react'

type MinimalTypebot = Pick<Typebot, 'groups' | 'edges'>

export enum RightPanel {
  PREVIEW,
  VARIABLES,
  VALIDATION_ERRORS,
}

export type SocketUser = {
  id: string
  name?: string
  email?: string
}

const editorContext = createContext<{
  rightPanel?: RightPanel
  setRightPanel: Dispatch<SetStateAction<RightPanel | undefined>>
  startPreviewAtGroup: string | undefined
  setStartPreviewAtGroup: Dispatch<SetStateAction<string | undefined>>
  startPreviewAtEvent: string | undefined
  setStartPreviewAtEvent: Dispatch<SetStateAction<string | undefined>>
  validationErrors: ValidationError | null
  setValidationErrors: Dispatch<SetStateAction<ValidationError | null>>
  validateTypebot: (typebot: MinimalTypebot) => Promise<ValidationError | null>
  clearValidationErrors: () => void
  isValidating: boolean
  isSidebarExtended: boolean
  setIsSidebarExtended: Dispatch<SetStateAction<boolean>>
  isUserEditing: boolean
  queueItems: TypebotEditQueueItem[] | undefined
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const { typebot, setIsFlowEditor } = useTypebot()
  const [rightPanel, setRightPanel] = useState<RightPanel>()
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>()
  const [startPreviewAtEvent, setStartPreviewAtEvent] = useState<string>()
  const [isSidebarExtended, setIsSidebarExtended] = useState(true)
  const { showToast } = useToast()
  const { t } = useTranslate()

  const { user: currentUser } = useUser()

  const { queueItems, isLoading, joinQueue, currentEditor, leaveQueue } =
    useEditQueue(typebot?.id)

  const isUserEditing = currentEditor?.userId === currentUser?.id

  useEffect(() => {
    setIsFlowEditor((prev) => {
      if (isUserEditing && !prev) {
        showToast({
          title: t('editor.header.user.canEditNow.toast'),
          status: 'info',
        })
      }
      return isUserEditing
    })
  }, [isUserEditing, setIsFlowEditor, showToast, t])

  useEffect(() => {
    if (!typebot?.id || !currentUser?.id) return

    const handleBeforeUnload = () => {
      leaveQueue(currentUser.id)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  }, [typebot?.id, currentUser?.id, leaveQueue])

  const {
    validationErrors,
    setValidationErrors,
    validateTypebot,
    clearValidationErrors,
    isValidating,
  } = useValidation()

  const isRunningRef = useRef(false)
  const pendingTypebotRef = useRef<MinimalTypebot | null>(null)
  const [validationKey, setValidationKey] = useState<string | null>(null)

  const queuedValidateTypebot = useCallback(
    async (currentTypebot: MinimalTypebot) => {
      if (isRunningRef.current) {
        pendingTypebotRef.current = currentTypebot
        return null
      }
      isRunningRef.current = true
      try {
        return await validateTypebot(currentTypebot)
      } finally {
        isRunningRef.current = false
        if (pendingTypebotRef.current) {
          const next = pendingTypebotRef.current
          pendingTypebotRef.current = null
          queuedValidateTypebot(next)
        }
      }
    },
    [validateTypebot]
  )

  useEffect(() => {
    if (!typebot?.id || isLoading) return

    joinQueue(currentUser?.id ?? '')
    //eslint-disable-next-line
  }, [typebot?.id, currentUser?.id, isLoading])

  useEffect(() => {
    if (
      env.NEXT_PUBLIC_DISABLE_VALIDATION ||
      !typebot?.groups ||
      !typebot?.edges
    )
      return

    const newGroupsValidationKey = JSON.stringify(
      typebot.groups.map((group) => ({
        id: group.id,
        title: group.title,
        blocks: group.blocks,
      }))
    )

    const newEdgesValidationKey = JSON.stringify(typebot.edges)
    const newValidationKey = `${newGroupsValidationKey}-${newEdgesValidationKey}`

    if (newValidationKey === validationKey) return

    setValidationKey(newValidationKey)

    const minimalTypebot: MinimalTypebot = {
      groups: typebot.groups,
      edges: typebot.edges,
    }
    queuedValidateTypebot(minimalTypebot)
  }, [validationKey, typebot?.edges, typebot?.groups, queuedValidateTypebot])

  return (
    <editorContext.Provider
      value={{
        rightPanel,
        setRightPanel,
        startPreviewAtGroup,
        setStartPreviewAtGroup,
        startPreviewAtEvent,
        setStartPreviewAtEvent,
        validationErrors,
        setValidationErrors,
        validateTypebot: queuedValidateTypebot,
        clearValidationErrors,
        isValidating,
        isSidebarExtended,
        setIsSidebarExtended,
        isUserEditing,
        queueItems,
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
