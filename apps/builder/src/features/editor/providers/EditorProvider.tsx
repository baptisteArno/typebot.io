import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export enum RightPanel {
  PREVIEW = 0,
  VARIABLES = 1,
}

const editorContext = createContext<{
  rightPanel?: RightPanel;
  setRightPanel: Dispatch<SetStateAction<RightPanel | undefined>>;
  startPreviewAtGroup: string | undefined;
  setStartPreviewAtGroup: Dispatch<SetStateAction<string | undefined>>;
  startPreviewAtEvent: string | undefined;
  setStartPreviewAtEvent: Dispatch<SetStateAction<string | undefined>>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({});

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [rightPanel, setRightPanel] = useState<RightPanel>();
  const [startPreviewAtGroup, setStartPreviewAtGroup] = useState<string>();
  const [startPreviewAtEvent, setStartPreviewAtEvent] = useState<string>();

  return (
    <editorContext.Provider
      value={{
        rightPanel,
        setRightPanel,
        startPreviewAtGroup,
        setStartPreviewAtGroup,
        startPreviewAtEvent,
        setStartPreviewAtEvent,
      }}
    >
      {children}
    </editorContext.Provider>
  );
};

export const useEditor = () => useContext(editorContext);
