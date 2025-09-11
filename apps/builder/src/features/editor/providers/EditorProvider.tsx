import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { ValidationError, useValidation } from '../hooks/useValidation'
import { useTypebot } from './TypebotProvider'
import { Typebot } from '@typebot.io/schemas'
import { env } from '@typebot.io/env'

type MinimalTypebot = Pick<Typebot, 'groups' | 'edges'>

export enum RightPanel {
  PREVIEW,
  VARIABLES,
  VALIDATION_ERRORS,
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const { typebot } = useTypebot()
  const [rightPanel, setRightPanel] = useState<RightPanel>()
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>()
  const [startPreviewAtEvent, setStartPreviewAtEvent] = useState<string>()
  const [isSidebarExtended, setIsSidebarExtended] = useState(true)

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
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
