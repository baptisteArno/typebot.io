import { Badge, Flex, HStack, StackProps, Text, Tooltip } from '@chakra-ui/react'
import { StepType, DraggableStepType } from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useEffect, useState } from 'react'
import { StepIcon } from './StepIcon'
import { StepTypeLabel } from './StepTypeLabel'
import { InfoIcon } from '@chakra-ui/icons'

export const StepCard = ({
  type,
  onMouseDown,
  isDisabled = false,
  tooltip,
  badge
}: {
  type: DraggableStepType
  isDisabled?: boolean
  onMouseDown: (e: React.MouseEvent, type: DraggableStepType) => void
  tooltip?: string,
  badge?: string
}) => {
  const { draggedStepType } = useStepDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedStepType === type)
  }, [draggedStepType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Tooltip label="Você precisa ter o Whatsapp Business para usar esse componente!" isDisabled={!isDisabled}>
      <Flex pos="relative">
        <HStack
          borderWidth="1px"
          borderColor="gray.200"
          rounded="lg"
          flex="1"
          cursor={'grab'}
          opacity={isMouseDown || isDisabled ? '0.4' : '1'}
          onMouseDown={handleMouseDown}
          bgColor="gray.50"
          px="4"
          py="4"
          _hover={{ shadow: 'md' }}
          transition="box-shadow 200ms"
          pointerEvents={isDisabled ? 'none' : 'auto'}
        >
          {!isMouseDown ? (
            <>
              <StepIcon type={type} />
              <HStack style={{flex: 1}}>
                <StepTypeLabel type={type} />
                {tooltip && tooltip.length &&
                  <Tooltip
                    hasArrow
                    label={tooltip}
                    bg="gray.700"
                    color="white"
                    width={'200px'}
                  >
                    <InfoIcon marginLeft={'10px'} color={'gray.300'} />
                  </Tooltip>
                }
              </HStack>
              {badge && badge.length &&
                <Badge
                  variant="solid"
                  colorScheme="blue"
                  borderRadius="6px"
                  textAlign="center"
                >
                  {badge}
                </Badge>
              }
            </>
          ) : (
            <Text color="white" userSelect="none">
              Placeholder
            </Text>
          )}
        </HStack>
      </Flex>
    </Tooltip>
  )
}

export const StepCardOverlay = ({
  type,
  ...props
}: StackProps & { type: StepType }) => {
  return (
    <HStack
      borderWidth="1px"
      rounded="lg"
      cursor={'grabbing'}
      w="147px"
      transition="none"
      pointerEvents="none"
      px="4"
      py="4"
      bgColor="white"
      shadow="xl"
      zIndex={2}
      {...props}
    >
      <StepIcon type={type} />
      <StepTypeLabel type={type} />
    </HStack>
  )
}
