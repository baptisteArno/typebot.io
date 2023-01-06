import { createContext, ReactNode, useContext, useRef } from 'react'

const parentModalContext = createContext<{
  ref?: React.MutableRefObject<HTMLDivElement | null>
}>({})

export const ParentModalProvider = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <parentModalContext.Provider value={{ ref }}>
      {children}
    </parentModalContext.Provider>
  )
}

export const useParentModal = () => useContext(parentModalContext)
