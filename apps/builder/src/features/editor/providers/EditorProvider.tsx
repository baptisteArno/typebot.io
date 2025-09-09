import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

const editorContext = createContext<{
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
  //@ts-expect-error
}>({});

export const EditorProvider = ({ children }: { children: ReactNode }) => {
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
        startPreviewFrom,
        setStartPreviewFrom,
      }}
    >
      {children}
    </editorContext.Provider>
  );
};

export const useEditor = () => useContext(editorContext);
