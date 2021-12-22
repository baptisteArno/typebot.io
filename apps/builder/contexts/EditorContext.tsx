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
}>({
  setRightPanel: () => console.log("I'm not instantiated"),
})

export const EditorContext = ({ children }: { children: ReactNode }) => {
  const [rightPanel, setRightPanel] = useState<RightPanel>()

  return (
    <editorContext.Provider
      value={{
        rightPanel,
        setRightPanel,
      }}
    >
      {children}
    </editorContext.Provider>
  )
}

export const useEditor = () => useContext(editorContext)
