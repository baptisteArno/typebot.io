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

// Minimal shape needed for validation trigger
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
    validateTypebot: baseValidateTypebot,
    clearValidationErrors,
    isValidating,
  } = useValidation()

  // Prevent overlapping validations; keep only the latest pending request.
  const isRunningRef = useRef(false)
  const pendingTypebotRef = useRef<MinimalTypebot | null>(null)

  const queuedValidateTypebot = useCallback(
    async (tb: MinimalTypebot) => {
      if (isRunningRef.current) {
        pendingTypebotRef.current = tb
        return null
      }
      isRunningRef.current = true
      try {
        // Cast to Typebot for base validation (assumption: validator only reads groups/edges)
        return await baseValidateTypebot(tb as unknown as Typebot)
      } finally {
        isRunningRef.current = false
        if (pendingTypebotRef.current) {
          const next = pendingTypebotRef.current
          pendingTypebotRef.current = null
          queuedValidateTypebot(next)
        }
      }
    },
    [baseValidateTypebot]
  )

  useEffect(() => {
    if (!typebot?.groups || !typebot?.edges) return
    if (env.NEXT_PUBLIC_DISABLE_VALIDATION) return
    const minimal: MinimalTypebot = {
      groups: typebot.groups,
      edges: typebot.edges,
    }
    queuedValidateTypebot(minimal)
  }, [typebot?.groups, typebot?.edges, queuedValidateTypebot])

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
