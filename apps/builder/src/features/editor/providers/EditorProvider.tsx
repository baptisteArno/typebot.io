import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
  useEffect,
} from 'react'
import { ValidationError, useValidation } from '../hooks/useValidation'
import { useTypebot } from './TypebotProvider'

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
  validateTypebot: (typebotId: string) => Promise<ValidationError | null>
  clearValidationErrors: () => void
  isSidebarExtended: boolean
  setIsSidebarExtended: Dispatch<SetStateAction<boolean>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const { typebot, isSavingLoading } = useTypebot()
  const [rightPanel, setRightPanel] = useState<RightPanel>()
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>()
  const [startPreviewAtEvent, setStartPreviewAtEvent] = useState<string>()
  const [isSidebarExtended, setIsSidebarExtended] = useState(true)

  const {
    validationErrors,
    setValidationErrors,
    validateTypebot,
    clearValidationErrors,
  } = useValidation()

  const [lastValidatedVersion, setLastValidatedVersion] = useState<Date>()

  useEffect(() => {
    if (
      typebot?.id &&
      typebot.updatedAt &&
      !isSavingLoading &&
      lastValidatedVersion !== typebot.updatedAt
    ) {
      validateTypebot(typebot.id).then(() => {
        setLastValidatedVersion(typebot.updatedAt)
      })
    }
  }, [typebot, isSavingLoading, lastValidatedVersion, validateTypebot])

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
        validateTypebot,
        clearValidationErrors,
        isSidebarExtended,
        setIsSidebarExtended,
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
