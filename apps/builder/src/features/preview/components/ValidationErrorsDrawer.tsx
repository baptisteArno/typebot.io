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

type Props = {
  onClose: () => void
}

export const ValidationErrorsDrawer = ({ onClose }: Props) => {
  const { validationErrors } = useEditor()
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

  const getTotalErrorCount = (errors: ValidationError | null): number => {
    if (!errors) return 0
    return (
      errors.invalidGroups.length +
      errors.brokenLinks.length +
      errors.invalidTextBeforeClaudia.length
    )
  }

  const navigateToGroup = (groupName: string) => {
    if (!typebot || !navigateToPosition) return

    // Encontrar o grupo pelo nome
    const group = typebot.groups.find((g) => g.title === groupName)
    if (!group) return

    // Focar no grupo
    focusGroup(group.id)

    // Calcular o centro da viewport (considerando o drawer à direita e o header)
    const viewportWidth = window.innerWidth - width // Subtraindo a largura do drawer
    const viewportHeight = window.innerHeight - headerHeight // Subtraindo a altura do header
    const centerX = viewportWidth / 2
    const centerY = viewportHeight / 2 + headerHeight // Adicionando o header de volta

    // Centralizar o grafo na posição do grupo
    const groupCoordinates = group.graphCoordinates
    navigateToPosition({
      x: centerX - groupCoordinates.x - groupWidth / 2, // Centralizar usando a largura real do grupo
      y: centerY - groupCoordinates.y - 75, // Offset para centralizar melhor
      scale: 1,
    })

    // Adicionar classe de highlight para animação
    setTimeout(() => {
      const groupElement = document.getElementById(`group-${group.id}`)
      if (groupElement) {
        groupElement.classList.add('highlight-error')
        // Remover a classe após a animação
        setTimeout(() => {
          groupElement.classList.remove('highlight-error')
        }, 3000)
      }
    }, 300) // Delay um pouco mais para que o drawer feche primeiro
  }

  const totalErrors = getTotalErrorCount(validationErrors)

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
          <Heading fontSize="md">Erros de Validação</Heading>
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
                Nenhuma validação executada ainda.
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Use o botão &quot;Validar&quot; no cabeçalho para verificar seu
                typebot.
              </Text>
            </VStack>
          ) : validationErrors.isValid ? (
            <VStack spacing={4} py={8}>
              <Icon as={AlertIcon} color="green.400" boxSize={12} />
              <Text color="green.500" textAlign="center" fontWeight="medium">
                ✅ Typebot válido!
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Nenhum erro de validação encontrado.
              </Text>
            </VStack>
          ) : (
            <>
              {validationErrors.invalidGroups.length > 0 && (
                <ValidationErrorSection
                  title="Condições Incompletas"
                  errors={validationErrors.invalidGroups}
                  errorType="condition"
                  description="Os seguintes grupos possuem blocos de condição sem conexões definidas:"
                  onGroupClick={navigateToGroup}
                />
              )}

              {validationErrors.brokenLinks.length > 0 && (
                <ValidationErrorSection
                  title="Links Quebrados"
                  errors={validationErrors.brokenLinks.map(
                    (link) => `${link.groupName} → ${link.typebotName}`
                  )}
                  errorType="link"
                  description="Os seguintes links apontam para typebots que não existem ou não estão publicados:"
                  onGroupClick={(errorText: string) => {
                    const groupName = errorText.split(' → ')[0]
                    navigateToGroup(groupName)
                  }}
                />
              )}

              {validationErrors.invalidTextBeforeClaudia.length > 0 && (
                <ValidationErrorSection
                  title="Texto Obrigatório Antes de Claudia"
                  errors={validationErrors.invalidTextBeforeClaudia}
                  errorType="claudia"
                  description="Os seguintes grupos possuem blocos Claudia sem blocos de texto precedentes:"
                  onGroupClick={navigateToGroup}
                />
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}

type ValidationErrorSectionProps = {
  title: string
  errors: string[]
  errorType: 'condition' | 'link' | 'claudia'
  description: string
  onGroupClick?: (groupName: string) => void
}

const ValidationErrorSection = ({
  title,
  errors,
  errorType,
  description,
  onGroupClick,
}: ValidationErrorSectionProps) => {
  const getErrorColor = () => 'orange'

  console.log(errorType)

  const getErrorIcon = () => {
    return AlertIcon
  }

  const itemBgColor = useColorModeValue('white', 'gray.800')
  const hoverBgColor = useColorModeValue(
    `${getErrorColor()}.100`,
    `${getErrorColor()}.800`
  )

  return (
    <Box
      borderWidth="1px"
      borderColor={`${getErrorColor()}.800`}
      borderRadius="md"
      p={4}
      bg={useColorModeValue(`${getErrorColor()}.50`, `${getErrorColor()}.900`)}
    >
      <VStack align="stretch" spacing={3}>
        <HStack spacing={2}>
          <Icon as={getErrorIcon()} color={`${getErrorColor()}.500`} />
          <Text fontWeight="medium" color={`${getErrorColor()}.400`}>
            {title}
          </Text>
          <Badge
            colorScheme={getErrorColor()}
            borderRadius="full"
            fontSize="xs"
            w="5"
            h="5"
            paddingEnd={1.5}
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
          {errors.map((error, index) => (
            <Box
              key={index}
              p={2}
              bg={itemBgColor}
              borderRadius="sm"
              borderLeftWidth="3px"
              borderLeftColor={`${getErrorColor()}.400`}
              cursor={onGroupClick ? 'pointer' : 'default'}
              _hover={
                onGroupClick
                  ? {
                      bg: hoverBgColor,
                      transform: 'translateX(2px)',
                    }
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
                {error}
              </Text>
            </Box>
          ))}
        </Stack>
      </VStack>
    </Box>
  )
}
