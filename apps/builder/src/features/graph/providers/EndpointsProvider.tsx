import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import { Endpoint } from '../types'

export const endpointsContext = createContext<{
  sourceEndpointYOffsets: Map<string, Endpoint>
  setSourceEndpointYOffset?: (endpoint: Endpoint) => void
  deleteSourceEndpointYOffset?: (endpointId: string) => void
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

  const deleteSourceEndpointYOffset = useCallback((endpointId: string) => {
    setSourceEndpoints((endpoints) => {
      endpoints.delete(endpointId)
      return endpoints
    })
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
        deleteSourceEndpointYOffset,
        setTargetEnpointYOffset,
      }}
    >
      {children}
    </endpointsContext.Provider>
  )
}

export const useEndpoints = () => useContext(endpointsContext)
