import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useColorModeValue,
  VStack,
  Badge,
  Fade,
} from '@chakra-ui/react'
import { useRef, useEffect } from 'react'
import { useFlowSearch } from '../providers/FlowSearchProvider'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  SearchIcon,
} from '@/components/icons'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { useTranslate } from '@tolgee/react'
import { getBlockTypeLabel } from '@/features/editor/helpers/getBlockTypeLabel'

export const FlowSearchPanel = () => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const resultHoverBg = useColorModeValue('gray.100', 'gray.700')
  const selectedBg = useColorModeValue('blue.50', 'blue.900')

  const { t } = useTranslate()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedResultIndex,
    navigateToResult,
    nextResult,
    prevResult,
    closeSearch,
  } = useFlowSearch()

  // Focus on input when opening
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isSearchOpen])

  if (!isSearchOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleResultClick = (index: number) => {
    navigateToResult(index)
  }

  const getBlockColorScheme = (type: string): string => {
    // Bubbles - blue
    if (Object.values(BubbleBlockType).includes(type as BubbleBlockType)) {
      return 'blue'
    }
    // Inputs - orange
    if (Object.values(InputBlockType).includes(type as InputBlockType)) {
      return 'orange'
    }
    // Logic - purple
    if (Object.values(LogicBlockType).includes(type as LogicBlockType)) {
      return 'purple'
    }
    // Integrations - green
    if (
      Object.values(IntegrationBlockType).includes(type as IntegrationBlockType)
    ) {
      return 'green'
    }
    // Group - purple
    if (type === 'group') {
      return 'purple'
    }
    // Default - gray
    return 'gray'
  }

  return (
    <Fade in={isSearchOpen}>
      <Box
        position="absolute"
        top="20px"
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        bg={bg}
        borderRadius="lg"
        boxShadow="lg"
        border="1px solid"
        borderColor={borderColor}
        minW="400px"
        maxW="500px"
        w="40%"
      >
        {/* Search bar */}
        <HStack p={2} spacing={1}>
          <InputGroup size="sm">
            <InputLeftElement>
              <SearchIcon color="gray.400" boxSize={4} />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder={t('editor.search.placeholder')}
              value={searchQuery}
              onChange={handleInputChange}
              borderRadius="md"
              pr="100px"
            />
            <InputRightElement w="auto" pr={2}>
              {searchResults.length > 0 && (
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                  {selectedResultIndex + 1} {t('editor.search.of')}{' '}
                  {searchResults.length}
                </Text>
              )}
            </InputRightElement>
          </InputGroup>

          <IconButton
            aria-label={t('editor.search.previousResult')}
            icon={<ChevronUpIcon />}
            size="sm"
            variant="ghost"
            onClick={prevResult}
            isDisabled={searchResults.length === 0}
          />
          <IconButton
            aria-label={t('editor.search.nextResult')}
            icon={<ChevronDownIcon />}
            size="sm"
            variant="ghost"
            onClick={nextResult}
            isDisabled={searchResults.length === 0}
          />
          <IconButton
            aria-label={t('editor.search.closeSearch')}
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            onClick={closeSearch}
          />
        </HStack>

        {/* Results list */}
        {searchQuery.trim().length > 0 && (
          <VStack
            align="stretch"
            spacing={0}
            maxH="300px"
            overflowY="auto"
            borderTop="1px solid"
            borderColor={borderColor}
          >
            {searchResults.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text color="gray.500" fontSize="sm">
                  {t('editor.search.noResults')}
                </Text>
              </Box>
            ) : (
              searchResults.map((result, index) => (
                <Flex
                  key={`${result.blockId}-${index}`}
                  p={2}
                  cursor="pointer"
                  bg={
                    index === selectedResultIndex ? selectedBg : 'transparent'
                  }
                  _hover={{ bg: resultHoverBg }}
                  onClick={() => handleResultClick(index)}
                  align="center"
                  gap={2}
                >
                  <Badge
                    colorScheme={getBlockColorScheme(result.blockType)}
                    fontSize="xs"
                    flexShrink={0}
                  >
                    {getBlockTypeLabel(result.blockType, t)}
                  </Badge>
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="xs" color="gray.500" noOfLines={1} w="full">
                      {result.groupTitle}
                    </Text>
                    <Text fontSize="sm" noOfLines={1} w="full">
                      {result.matchContext}
                    </Text>
                  </VStack>
                </Flex>
              ))
            )}
          </VStack>
        )}
      </Box>
    </Fade>
  )
}
