import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useGraph } from './GraphProvider'
import { searchFlow, SearchResult } from '../helpers/searchFlow'
import { useDebounce } from 'use-debounce'
import { headerHeight } from '@/features/editor/constants'

type FlowSearchContextType = {
  isSearchOpen: boolean
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  searchResults: SearchResult[]
  selectedResultIndex: number
  setSelectedResultIndex: Dispatch<SetStateAction<number>>
  highlightedBlockId: string | undefined
  navigateToResult: (index: number) => void
  nextResult: () => void
  prevResult: () => void
  closeSearch: () => void
}

const flowSearchContext = createContext<FlowSearchContextType>({
  isSearchOpen: false,
  setIsSearchOpen: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  searchResults: [],
  selectedResultIndex: -1,
  setSelectedResultIndex: () => {},
  highlightedBlockId: undefined,
  navigateToResult: () => {},
  nextResult: () => {},
  prevResult: () => {},
  closeSearch: () => {},
})

export const FlowSearchProvider = ({ children }: { children: ReactNode }) => {
  const { typebot } = useTypebot()
  const { navigateToPosition, setFocusedGroupId } = useGraph()

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const [highlightedBlockId, setHighlightedBlockId] = useState<string>()

  const [debouncedQuery] = useDebounce(searchQuery, 300)

  // Executar busca com debounce
  const searchResults = useMemo(() => {
    if (!typebot?.groups || debouncedQuery.trim().length === 0) return []
    return searchFlow(typebot.groups, debouncedQuery)
  }, [typebot?.groups, debouncedQuery])

  // Resetar seleção quando resultados mudam
  useEffect(() => {
    if (searchResults.length > 0) {
      setSelectedResultIndex(0)
      setHighlightedBlockId(searchResults[0].blockId)
    } else {
      setSelectedResultIndex(-1)
      setHighlightedBlockId(undefined)
    }
  }, [searchResults])

  // Navegar para um resultado específico
  const navigateToResult = useCallback(
    (index: number) => {
      if (index < 0 || index >= searchResults.length) return

      const result = searchResults[index]
      setSelectedResultIndex(index)
      setHighlightedBlockId(result.blockId)
      setFocusedGroupId(result.groupId)

      // Calcular posição centralizada
      if (navigateToPosition) {
        const graphWidth = window.innerWidth - 320 // Considera sidebar
        const graphHeight = window.innerHeight - headerHeight

        navigateToPosition({
          x: -result.coordinates.x + graphWidth / 2 - 150,
          y: -result.coordinates.y + graphHeight / 2 - 100,
          scale: 1,
        })
      }
    },
    [searchResults, navigateToPosition, setFocusedGroupId]
  )

  // Próximo resultado
  const nextResult = useCallback(() => {
    if (searchResults.length === 0) return
    const newIndex =
      selectedResultIndex >= searchResults.length - 1
        ? 0
        : selectedResultIndex + 1
    navigateToResult(newIndex)
  }, [searchResults.length, selectedResultIndex, navigateToResult])

  // Resultado anterior
  const prevResult = useCallback(() => {
    if (searchResults.length === 0) return
    const newIndex =
      selectedResultIndex <= 0
        ? searchResults.length - 1
        : selectedResultIndex - 1
    navigateToResult(newIndex)
  }, [searchResults.length, selectedResultIndex, navigateToResult])

  // Fechar busca
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSelectedResultIndex(-1)
    setHighlightedBlockId(undefined)
  }, [])

  // Keyboard shortcut para abrir/fechar busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F ou Cmd+F para abrir
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setIsSearchOpen(true)
      }

      // Escape para fechar
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch()
      }

      // Enter para próximo resultado
      if (e.key === 'Enter' && isSearchOpen && searchResults.length > 0) {
        e.preventDefault()
        if (e.shiftKey) {
          prevResult()
        } else {
          nextResult()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, searchResults.length, nextResult, prevResult, closeSearch])

  return (
    <flowSearchContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        searchResults,
        selectedResultIndex,
        setSelectedResultIndex,
        highlightedBlockId,
        navigateToResult,
        nextResult,
        prevResult,
        closeSearch,
      }}
    >
      {children}
    </flowSearchContext.Provider>
  )
}

export const useFlowSearch = () => useContext(flowSearchContext)
