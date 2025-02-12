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
  startPreviewFrom:
    | {
        type: "group" | "event";
        id: string;
      }
    | undefined;
  setStartPreviewFrom: Dispatch<
    SetStateAction<
      | {
          type: "group" | "event";
          id: string;
        }
      | undefined
    >
  >;
  //@ts-ignore
}>({});

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [rightPanel, setRightPanel] = useState<RightPanel>();
  const [startPreviewFrom, setStartPreviewFrom] = useState<
    | {
        type: "group" | "event";
        id: string;
      }
    | undefined
  >();

  return (
    <editorContext.Provider
      value={{
        rightPanel,
        setRightPanel,
        startPreviewFrom,
        setStartPreviewFrom,
      }}
    >
      {children}
    </editorContext.Provider>
  );
};

export const useEditor = () => useContext(editorContext);
