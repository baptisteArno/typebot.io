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
import { useEditor } from '../providers/EditorProvider'
import { useGraph } from '@/features/graph'
import { useTypebot } from '../providers/TypebotProvider'
import React, { useState } from 'react'
import { headerHeight } from '../constants'
import { Standard } from '@typebot.io/react'
import { ChatReply } from 'models'
import { useToast } from '@/hooks/useToast'

export const PreviewDrawer = () => {
  const isDark = useColorMode().colorMode === 'dark'
  const { typebot, save, isSavingLoading } = useTypebot()
  const { setRightPanel, startPreviewAtGroup } = useEditor()
  const { setPreviewingBlock } = useGraph()
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

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

  const handleRestartClick = async () => {
    await save()
    setRestartKey((key) => key + 1)
  }

  const handleCloseClick = () => {
    setPreviewingBlock(undefined)
    setRightPanel(undefined)
  }

  const handleNewLogs = (logs: ChatReply['logs']) => {
    logs?.forEach((log) => showToast(log as UseToastOptions))
  }

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
          <Button onClick={handleRestartClick} isLoading={isSavingLoading}>
            Restart
          </Button>
          <CloseButton onClick={handleCloseClick} />
        </Flex>

        {typebot && (
          <Standard
            key={restartKey + (startPreviewAtGroup ?? '')}
            typebot={typebot}
            startGroupId={startPreviewAtGroup}
            onNewInputBlock={setPreviewingBlock}
            onNewLogs={handleNewLogs}
            style={{
              borderWidth: '1px',
              borderRadius: '0.25rem',
              pointerEvents: isResizing ? 'none' : 'auto',
            }}
          />
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
