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
} from '@chakra-ui/react'
import { useEditor } from '../../editor/providers/EditorProvider'
import { useState } from 'react'
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
  BrokenLinksError,
  InvalidGroupsError,
  InvalidTextBeforeClaudiaError,
  ValidationErrorItem,
} from '@/features/typebot/constants/errorTypes'
import { useTranslate } from '@tolgee/react'

// helper para extrair nome de grupo de mensagens padronizadas
const extractGroupNameFromMessage = (msg: string): string | undefined => {
  const m = msg.match(/group '(.+?)'/i)
  return m ? m[1] : undefined
}

type Props = {
  onClose: () => void
}

export const ValidationErrorsDrawer = ({ onClose }: Props) => {
  const { t } = useTranslate()

  const { validationErrors } = useEditor()
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

  const navigateToGroup = (groupName: string) => {
    if (!typebot || !navigateToPosition) return

    const group = typebot.groups.find((g) => g.title === groupName)
    if (!group) return

    focusGroup(group.id)

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

  // Remover arrays filtrados individualmente e usar filtragem interna no componente
  const allErrors = validationErrors ? validationErrors.errors : []

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

        <HStack spacing={3} alignItems="center">
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
        </HStack>

        <Stack overflowY="auto" py="1" spacing={4}>
          {!validationErrors ? (
            <VStack spacing={4} py={8}>
              <Icon as={AlertIcon} color="gray.400" boxSize={12} />
              <Text color="gray.500" textAlign="center">
                {t('validationErrors.noValidationYet')}
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                {t('validationErrors.useValidateButton')}
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
              <ValidationErrorSection
                errorClass={InvalidGroupsError}
                title={t('validationErrors.invalidGroupsTitle')}
                allErrors={allErrors}
                description={t('validationErrors.invalidGroupsDescription')}
                getLabel={(e) =>
                  extractGroupNameFromMessage(e.message) || e.message
                }
                onGroupClick={(e) => {
                  const groupName =
                    extractGroupNameFromMessage(e.message) || e.message
                  navigateToGroup(groupName)
                }}
              />

              <ValidationErrorSection
                errorClass={BrokenLinksError}
                title={t('validationErrors.brokenLinksTitle')}
                allErrors={allErrors}
                description={t('validationErrors.brokenLinksDescription')}
                getLabel={(e) => `${e.groupName} → ${e.typebotName}`}
                onGroupClick={(e) => {
                  navigateToGroup(e.groupName)
                }}
              />

              <ValidationErrorSection
                errorClass={InvalidTextBeforeClaudiaError}
                title={t('validationErrors.invalidTextBeforeClaudiaTitle')}
                allErrors={allErrors}
                description={t(
                  'validationErrors.invalidTextBeforeClaudiaDescription'
                )}
                getLabel={(e) =>
                  extractGroupNameFromMessage(e.message) || e.message
                }
                onGroupClick={(e) => {
                  const groupName =
                    extractGroupNameFromMessage(e.message) || e.message
                  navigateToGroup(groupName)
                }}
              />
            </>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T

type ValidationErrorSectionProps<T extends ValidationErrorItem> = {
  errorClass: Constructor<T>
  title: string
  allErrors: ValidationErrorItem[]
  description: string
  onGroupClick?: (item: T) => void
  getLabel?: (item: T) => string
}

const ValidationErrorSection = <T extends ValidationErrorItem>({
  errorClass,
  title,
  allErrors,
  description,
  onGroupClick,
  getLabel,
}: ValidationErrorSectionProps<T>) => {
  const color = 'orange'
  const itemBgColor = useColorModeValue('white', 'gray.800')
  const hoverBgColor = useColorModeValue(`${color}.100`, `${color}.800`)
  const containerBg = useColorModeValue(`${color}.50`, `${color}.900`)

  const errors = allErrors.filter((e): e is T => e instanceof errorClass)
  if (!errors.length) return null

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
            {errors.length}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.400">
          {description}
        </Text>
        <Stack spacing={2}>
          {errors.map((error, idx) => {
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
