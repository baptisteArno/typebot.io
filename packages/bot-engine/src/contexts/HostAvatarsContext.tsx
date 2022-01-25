import React, { createContext, ReactNode, useContext, useState } from 'react'

// This context just keeps track of the top offset of host avatar
const hostAvatarsContext = createContext<{
  lastBubblesTopOffset: number[]
  addNewAvatarOffset: () => void
  updateLastAvatarOffset: (newOffset: number) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const HostAvatarsContext = ({ children }: { children: ReactNode }) => {
  const [lastBubblesTopOffset, setLastBubblesTopOffset] = useState<number[]>([
    -1,
  ])

  const updateLastAvatarOffset = (newOffset: number) => {
    const offsets = [...lastBubblesTopOffset]
    offsets[offsets.length - 1] = newOffset
    setLastBubblesTopOffset(offsets)
  }

  const addNewAvatarOffset = () =>
    setLastBubblesTopOffset([...lastBubblesTopOffset, -1])

  return (
    <hostAvatarsContext.Provider
      value={{
        lastBubblesTopOffset,
        updateLastAvatarOffset,
        addNewAvatarOffset,
      }}
    >
      {children}
    </hostAvatarsContext.Provider>
  )
}

export const useHostAvatars = () => useContext(hostAvatarsContext)
