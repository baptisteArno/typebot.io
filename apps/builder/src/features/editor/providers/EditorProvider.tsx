import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

export enum RightPanel {
  PREVIEW,
}

const editorContext = createContext<{
  rightPanel?: RightPanel
  setRightPanel: Dispatch<SetStateAction<RightPanel | undefined>>
  startPreviewAtGroup: string | undefined
  setStartPreviewAtGroup: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [rightPanel, setRightPanel] = useState<RightPanel>()
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>()

  return (
    <editorContext.Provider
      value={{
        rightPanel,
        setRightPanel,
        startPreviewAtGroup,
        setStartPreviewAtGroup,
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
