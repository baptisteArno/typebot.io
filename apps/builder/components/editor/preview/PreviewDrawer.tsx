import {
  Box,
  Button,
  CloseButton,
  Fade,
  Flex,
  FlexProps,
  useEventListener,
  useToast,
  UseToastOptions,
  VStack,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { headerHeight } from 'components/shared/TypebotHeader'
import { useEditor } from 'contexts/EditorContext'
import { useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { Log } from 'model'
import React, { useMemo, useState } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'

export const PreviewDrawer = () => {
  const { typebot } = useTypebot()
  const { setRightPanel } = useEditor()
  const { setPreviewingEdge } = useGraph()
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(500)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)
  const [restartKey, setRestartKey] = useState(0)

  const publicTypebot = useMemo(
    () => (typebot ? { ...parseTypebotToPublicTypebot(typebot) } : undefined),
    [typebot]
  )

  const toast = useToast({
    position: 'top-right',
  })

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
    toast(log as UseToastOptions)

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      w={`${width}px`}
      bgColor="white"
      shadow="lg"
      borderLeftRadius={'lg'}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
          onMouseDown={handleMouseDown}
        />
      </Fade>

      <VStack w="full" spacing={4}>
        <Flex justifyContent={'space-between'} w="full">
          <Flex align="center">
            <Button onClick={handleRestartClick} mr="2">
              Reiniciar
            </Button>
            <OctaTooltip
              contentText={`Made with `}
              contentLink={'Typebot'}
              hrefUrl="https://www.typebot.io/?utm_source=litebadge"
              duration={2000}
              popoverColor="#303243"
              textColor="#F4F4F5"
              tooltipPlacement="right"
            />
          </Flex>
          <CloseButton onClick={handleCloseClick} />
        </Flex>

        {publicTypebot && (
          <Flex
            borderWidth={'1px'}
            borderRadius={'lg'}
            h="full"
            w="full"
            key={restartKey}
            pointerEvents={isResizing ? 'none' : 'auto'}
          >
            <TypebotViewer
              typebot={publicTypebot}
              onNewBlockVisible={setPreviewingEdge}
              onNewLog={handleNewLog}
              isPreview
            />
          </Flex>
        )}
      </VStack>
    </Flex>
  )
}

const ResizeHandle = (props: FlexProps) => {
  return (
    <Flex
      w="15px"
      h="50px"
      borderWidth={'1px'}
      bgColor={'white'}
      cursor={'col-resize'}
      justifyContent={'center'}
      align={'center'}
      {...props}
    >
      <Box w="2px" bgColor={'gray.300'} h="70%" mr="0.5" />
      <Box w="2px" bgColor={'gray.300'} h="70%" />
    </Flex>
  )
}
