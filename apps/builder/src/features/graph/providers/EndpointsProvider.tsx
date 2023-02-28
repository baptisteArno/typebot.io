import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

export type Endpoint = {
  id: string
  y: number
}

export const endpointsContext = createContext<{
  sourceEndpointYOffsets: Map<string, Endpoint>
  setSourceEndpointYOffset?: (endpoint: Endpoint) => void
  targetEndpointYOffsets: Map<string, Endpoint>
  setTargetEnpointYOffset?: (endpoint: Endpoint) => void
}>({
  sourceEndpointYOffsets: new Map(),
  targetEndpointYOffsets: new Map(),
})

export const EndpointsProvider = ({ children }: { children: ReactNode }) => {
  const [sourceEndpointYOffsets, setSourceEndpoints] = useState<
    Map<string, Endpoint>
  >(new Map())
  const [targetEndpointYOffsets, setTargetEndpoints] = useState<
    Map<string, Endpoint>
  >(new Map())

  const setSourceEndpointYOffset = useCallback((endpoint: Endpoint) => {
    setSourceEndpoints((endpoints) =>
      new Map(endpoints).set(endpoint.id, endpoint)
    )
  }, [])

  const setTargetEnpointYOffset = useCallback((endpoint: Endpoint) => {
    setTargetEndpoints((endpoints) =>
      new Map(endpoints).set(endpoint.id, endpoint)
    )
  }, [])

  return (
    <endpointsContext.Provider
      value={{
        sourceEndpointYOffsets,
        targetEndpointYOffsets,
        setSourceEndpointYOffset,
        setTargetEnpointYOffset,
      }}
    >
      {children}
    </endpointsContext.Provider>
  )
}

export const useEndpoints = () => useContext(endpointsContext)
