import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SniperInDashboard } from '../dashboard/types'

const sniperDndContext = createContext<{
  draggedSniper?: SniperInDashboard
  setDraggedSniper: Dispatch<SetStateAction<SniperInDashboard | undefined>>
  mouseOverFolderId?: string | null
  setMouseOverFolderId: Dispatch<SetStateAction<string | undefined | null>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>({})

export const SniperDndProvider = ({ children }: { children: ReactNode }) => {
  const [draggedSniper, setDraggedSniper] = useState<SniperInDashboard>()
  const [mouseOverFolderId, setMouseOverFolderId] = useState<string | null>()

  useEffect(() => {
    draggedSniper
      ? document.body.classList.add('grabbing')
      : document.body.classList.remove('grabbing')
  }, [draggedSniper])

  return (
    <sniperDndContext.Provider
      value={{
        draggedSniper,
        setDraggedSniper,
        mouseOverFolderId,
        setMouseOverFolderId,
      }}
    >
      {children}
    </sniperDndContext.Provider>
  )
}

export const useSniperDnd = () => useContext(sniperDndContext)
