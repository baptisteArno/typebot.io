import {
  Button,
  CloseButton,
  Fade,
  Flex,
  HStack,
  useColorMode,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { useEditor } from '../../editor/providers/EditorProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useTypebot } from '../../editor/providers/TypebotProvider'
import React, { useState } from 'react'
import { headerHeight } from '../../editor/constants'
import { RuntimeMenu } from './RuntimeMenu'
import { runtimes } from '../data'
import { PreviewDrawerBody } from './PreviewDrawerBody'
import { useDrag } from '@use-gesture/react'
import { ResizeHandle } from './ResizeHandle'

export const PreviewDrawer = () => {
  const isDark = useColorMode().colorMode === 'dark'
  const { save, isSavingLoading } = useTypebot()
  const { setRightPanel } = useEditor()
  const { setPreviewingBlock } = useGraph()
  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [restartKey, setRestartKey] = useState(0)
  const [selectedRuntime, setSelectedRuntime] = useState<
    (typeof runtimes)[number]
  >(runtimes[0])

  const handleRestartClick = async () => {
    await save()
    setRestartKey((key) => key + 1)
  }

  const handleCloseClick = () => {
    setPreviewingBlock(undefined)
    setRightPanel(undefined)
  }

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0])
    },
    {
      from: () => [-width, 0],
    }
  )

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      w={`${width}px`}
      bgColor={useColorModeValue('white', 'gray.900')}
      borderLeftWidth={'1px'}
      shadow="lg"
      borderLeftRadius={'lg'}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          {...useResizeHandleDrag()}
          isDark={isDark}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
        />
      </Fade>

      <VStack w="full" spacing={4}>
        <HStack justifyContent={'space-between'} w="full">
          <HStack>
            <RuntimeMenu
              selectedRuntime={selectedRuntime}
              onSelectRuntime={(runtime) => setSelectedRuntime(runtime)}
            />
            {selectedRuntime.name === 'Web' ? (
              <Button
                onClick={handleRestartClick}
                isLoading={isSavingLoading}
                variant="ghost"
              >
                Restart
              </Button>
            ) : null}
          </HStack>

          <CloseButton onClick={handleCloseClick} />
        </HStack>
        <PreviewDrawerBody key={restartKey} runtime={selectedRuntime.name} />
      </VStack>
    </Flex>
  )
}
