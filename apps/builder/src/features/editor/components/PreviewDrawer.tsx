import {
  Box,
  Button,
  CloseButton,
  Fade,
  Flex,
  FlexProps,
  useColorMode,
  useColorModeValue,
  useEventListener,
  UseToastOptions,
  VStack,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { useToast } from '@/hooks/useToast'
import { useEditor } from '../providers/EditorProvider'
import { useGraph } from '@/features/graph'
import { useTypebot } from '../providers/TypebotProvider'
import { Log } from 'db'
import React, { useMemo, useState } from 'react'
import { getViewerUrl } from 'utils'
import { headerHeight } from '../constants'
import { parseTypebotToPublicTypebot } from '@/features/publish'

export const PreviewDrawer = () => {
  const isDark = useColorMode().colorMode === 'dark'
  const { typebot } = useTypebot()
  const { setRightPanel, startPreviewAtGroup } = useEditor()
  const { setPreviewingEdge } = useGraph()
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  const publicTypebot = useMemo(
    () => (typebot ? { ...parseTypebotToPublicTypebot(typebot) } : undefined),
    [typebot]
  )

  const { showToast } = useToast()

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    setWidth(width - e.movementX)
  }
  useEventListener('mousemove', handleMouseMove)

  const handleMouseUp = () => {
    setIsResizing(false)
  }
  useEventListener('mouseup', handleMouseUp)

  const handleRestartClick = () => setRestartKey((key) => key + 1)

  const handleCloseClick = () => {
    setPreviewingEdge(undefined)
    setRightPanel(undefined)
  }

  const handleNewLog = (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) =>
    showToast(log as UseToastOptions)

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
          isDark={isDark}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
          onMouseDown={handleMouseDown}
        />
      </Fade>

      <VStack w="full" spacing={4}>
        <Flex justifyContent={'space-between'} w="full">
          <Button onClick={handleRestartClick}>Restart</Button>
          <CloseButton onClick={handleCloseClick} />
        </Flex>

        {publicTypebot && (
          <Flex
            borderWidth={'1px'}
            borderRadius={'lg'}
            h="full"
            w="full"
            key={restartKey + (startPreviewAtGroup ?? '')}
            pointerEvents={isResizing ? 'none' : 'auto'}
          >
            <TypebotViewer
              apiHost={getViewerUrl({ isBuilder: true })}
              typebot={publicTypebot}
              onNewGroupVisible={setPreviewingEdge}
              onNewLog={handleNewLog}
              startGroupId={startPreviewAtGroup}
              isPreview
              style={{ borderRadius: '10px' }}
            />
          </Flex>
        )}
      </VStack>
    </Flex>
  )
}

const ResizeHandle = (props: FlexProps & { isDark: boolean }) => {
  return (
    <Flex
      w="15px"
      h="50px"
      borderWidth={'1px'}
      bgColor={useColorModeValue('white', 'gray.800')}
      cursor={'col-resize'}
      justifyContent={'center'}
      align={'center'}
      borderRadius={'sm'}
      {...props}
    >
      <Box
        w="2px"
        bgColor={useColorModeValue('gray.300', 'gray.600')}
        h="70%"
        mr="0.5"
      />
      <Box
        w="2px"
        bgColor={useColorModeValue('gray.300', 'gray.600')}
        h="70%"
      />
    </Flex>
  )
}
