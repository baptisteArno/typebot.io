import { Typebot } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

const typebotDndContext = createContext<{
  draggedTypebot?: Typebot
  setDraggedTypebot: Dispatch<SetStateAction<Typebot | undefined>>
  mouseOverFolderId?: string | null
  setMouseOverFolderId: Dispatch<SetStateAction<string | undefined | null>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const TypebotDndContext = ({ children }: { children: ReactNode }) => {
  const [draggedTypebot, setDraggedTypebot] = useState<Typebot>()
  const [mouseOverFolderId, setMouseOverFolderId] = useState<string | null>()

  useEffect(() => {
    draggedTypebot
      ? document.body.classList.add('grabbing')
      : document.body.classList.remove('grabbing')
  }, [draggedTypebot])

  return (
    <typebotDndContext.Provider
      value={{
        draggedTypebot,
        setDraggedTypebot,
        mouseOverFolderId,
        setMouseOverFolderId,
      }}
    >
      {children}
    </typebotDndContext.Provider>
  )
}

export const useTypebotDnd = () => useContext(typebotDndContext)
