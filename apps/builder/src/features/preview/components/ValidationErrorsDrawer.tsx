import {
  Fade,
  Flex,
  HStack,
  useColorModeValue,
  Stack,
  Heading,
  CloseButton,
  Text,
  Badge,
  VStack,
  Box,
  Icon,
  Spinner,
} from '@chakra-ui/react'
import { useEditor } from '../../editor/providers/EditorProvider'
import { useState, useEffect, useRef } from 'react'
import { headerHeight } from '../../editor/constants'
import { useDrag } from '@use-gesture/react'
import { ResizeHandle } from './ResizeHandle'
import { AlertIcon } from '@/components/icons'
import { ValidationError } from '../../editor/hooks/useValidation'
import { useTypebot } from '../../editor/providers/TypebotProvider'
import { useGraph } from '../../graph/providers/GraphProvider'
import { useGroupsStore } from '../../graph/hooks/useGroupsStore'
import { useShallow } from 'zustand/react/shallow'
import { groupWidth } from '../../graph/constants'
import {
  ErrorType,
  ValidationErrorItemWithGroupName,
} from '@/features/typebot/constants/errorTypes'

import { useTranslate } from '@tolgee/react'
import { isNull } from '@udecode/plate-common'

const ERROR_CONFIGS: Record<
  ErrorType,
  {
    titleKey: string
    descriptionKey: string
  }
> = {
  conditionalBlocks: {
    titleKey: 'validationErrors.conditionalBlocks.title',
    descriptionKey: 'validationErrors.conditionalBlocks.description',
  },
  brokenLinks: {
    titleKey: 'validationErrors.brokenLinks.title',
    descriptionKey: 'validationErrors.brokenLinks.description',
  },
  missingTextBeforeClaudia: {
    titleKey: 'validationErrors.missingTextBeforeClaudia.title',
    descriptionKey: 'validationErrors.missingTextBeforeClaudia.description',
  },
  missingTextBetweenInputBlocks: {
    titleKey: 'validationErrors.missingTextBetweenInputBlocks.title',
    descriptionKey:
      'validationErrors.missingTextBetweenInputBlocks.description',
  },
  missingClaudiaInFlowBranches: {
    titleKey: 'validationErrors.missingClaudiaInFlowBranches.title',
    descriptionKey: 'validationErrors.missingClaudiaInFlowBranches.description',
  },
}

type Props = {
  onClose: () => void
}

export const ValidationErrorsDrawer = ({ onClose }: Props) => {
  const { t } = useTranslate()

  const { validationErrors, isValidating } = useEditor()
  const { isSidebarExtended } = useEditor()
  const { typebot } = useTypebot()
  const { navigateToPosition } = useGraph()
  const { focusGroup } = useGroupsStore(
    useShallow((state) => ({
      focusGroup: state.focusGroup,
    }))
  )
  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    if (isValidating) {
      setShowSpinner(true)
    } else {
      timeoutRef.current = setTimeout(() => setShowSpinner(false), 150)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [isValidating])

  const getGroupNameById = (id: string): string | undefined => {
    return typebot?.groups.find((g) => g.id === id)?.title
  }

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0])
    },
    {
      from: () => [-width, 0],
    }
  )

  const getTotalErrorCount = (
    validationErrors: ValidationError | null
  ): number => {
    if (!validationErrors) return 0
    return validationErrors.errors.length
  }

  const navigateToGroup = (groupId: string) => {
    if (!typebot || !navigateToPosition) return

    const group = typebot.groups.find((g) => g.id === groupId)
    if (!group) return

    focusGroup(groupId)

    const leftSidebarWidth = 360
    const leftOffset =
      validationErrors && isSidebarExtended ? leftSidebarWidth : 0

    const viewportWidth = window.innerWidth - width - leftOffset
    const viewportHeight = window.innerHeight - headerHeight
    const centerX = viewportWidth / 2 + leftOffset
    const centerY = viewportHeight / 2 + headerHeight

    const groupCoordinates = group.graphCoordinates
    navigateToPosition({
      x: centerX - groupCoordinates.x - groupWidth / 2,
      y: centerY - groupCoordinates.y - 150,
      scale: 1,
    })

    setTimeout(() => {
      const groupElement = document.getElementById(`group-${group.id}`)
      if (groupElement) {
        groupElement.classList.add('highlight-error')
        // Remover a classe após a animação
        setTimeout(() => {
          groupElement.classList.remove('highlight-error')
        }, 3000)
      }
    }, 100)
  }

  const totalErrors = getTotalErrorCount(validationErrors)

  const allErrors = validationErrors ? validationErrors.errors : []
  const errorsWithGroup = allErrors
    .map((error) => {
      if (!error.groupId) return null
      const groupName = getGroupNameById(error.groupId)

      if (!groupName) return null

      return { ...error, groupName }
    })
    .filter((e) => !isNull(e)) as ValidationErrorItemWithGroupName[]

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      bgColor={useColorModeValue('white', 'gray.900')}
      borderLeftWidth={'1px'}
      shadow="lg"
      borderLeftRadius={'lg'}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
      style={{ width: `${width}px` }}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          {...useResizeHandleDrag()}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
        />
      </Fade>

      <Stack w="full" spacing="4">
        <CloseButton pos="absolute" right="1rem" top="1rem" onClick={onClose} />

        <HStack spacing={3} alignItems="center" paddingRight={6}>
          <Heading fontSize="md">{t('validationErrors.title')}</Heading>
          <Badge
            colorScheme={totalErrors > 0 ? 'red' : 'green'}
            variant="solid"
            borderRadius="full"
            fontSize="xs"
            w="5"
            h="5"
            paddingEnd={1.5}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {totalErrors}
          </Badge>
          {showSpinner && (
            <HStack spacing={2}>
              <Spinner size="xs" />
              <Text fontSize="xs" color="gray.400">
                {t('validationErrors.validating')}
              </Text>
            </HStack>
          )}
        </HStack>

        <Stack overflowY="auto" py="1" spacing={4}>
          {!validationErrors ? (
            <VStack spacing={4} py={8}>
              <Icon as={AlertIcon} color="gray.400" boxSize={12} />
              <Text color="gray.500" textAlign="center">
                {t('validationErrors.noValidationYet')}
              </Text>
            </VStack>
          ) : validationErrors.isValid ? (
            <VStack spacing={4} py={8}>
              <Icon as={AlertIcon} color="green.400" boxSize={12} />
              <Text color="green.500" textAlign="center" fontWeight="medium">
                {t('validationErrors.typebotIsValid')}
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                {t('validationErrors.noValidationErrors')}
              </Text>
            </VStack>
          ) : (
            <>
              {Object.entries(ERROR_CONFIGS).map(([errorType, config]) => {
                const filteredErrors = errorsWithGroup.filter(
                  (error) => error.type === errorType
                )

                if (filteredErrors.length === 0) return null

                return (
                  <ValidationErrorSection
                    key={errorType}
                    errorType={errorType as ErrorType}
                    title={t(config.titleKey)}
                    allErrors={filteredErrors}
                    description={t(config.descriptionKey)}
                    getLabel={(e) => e.groupName}
                    onGroupClick={(e) => {
                      e.groupId && navigateToGroup(e.groupId)
                    }}
                  />
                )
              })}
            </>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}

type ValidationErrorSectionProps = {
  errorType: ErrorType
  title: string
  allErrors: ValidationErrorItemWithGroupName[]
  description: string
  color?: string
  onGroupClick?: (item: ValidationErrorItemWithGroupName) => void
  getLabel?: (item: ValidationErrorItemWithGroupName) => string
}

const ValidationErrorSection = ({
  title,
  allErrors,
  description,
  color = 'orange',
  onGroupClick,
  getLabel,
}: ValidationErrorSectionProps) => {
  const itemBgColor = useColorModeValue('white', 'gray.800')
  const hoverBgColor = useColorModeValue(`${color}.100`, `${color}.800`)
  const containerBg = useColorModeValue(`${color}.50`, `${color}.900`)

  if (!allErrors.length) return null

  return (
    <Box
      borderWidth="1px"
      borderColor={`${color}.800`}
      borderRadius="md"
      p={4}
      bg={containerBg}
    >
      <VStack align="stretch" spacing={3}>
        <HStack spacing={2}>
          <Icon as={AlertIcon} color={`${color}.500`} />
          <Text fontWeight="medium" color={`${color}.400`}>
            {title}
          </Text>
          <Badge
            colorScheme={color}
            borderRadius="full"
            fontSize="xs"
            w="5"
            h="5"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {allErrors.length}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.400">
          {description}
        </Text>
        <Stack spacing={2}>
          {allErrors.map((error, idx) => {
            const label = getLabel ? getLabel(error) : String(error)
            return (
              <Box
                key={idx}
                p={2}
                bg={itemBgColor}
                borderRadius="sm"
                borderLeftWidth="3px"
                borderLeftColor={`${color}.400`}
                cursor={onGroupClick ? 'pointer' : 'default'}
                _hover={
                  onGroupClick
                    ? { bg: hoverBgColor, transform: 'translateX(2px)' }
                    : undefined
                }
                transition="all 0.2s"
                onClick={() => onGroupClick?.(error)}
                role={onGroupClick ? 'button' : undefined}
                tabIndex={onGroupClick ? 0 : undefined}
                onKeyDown={
                  onGroupClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onGroupClick(error)
                        }
                      }
                    : undefined
                }
              >
                <Text fontSize="sm" fontWeight="medium">
                  {label}
                </Text>
              </Box>
            )
          })}
        </Stack>
      </VStack>
    </Box>
  )
}
