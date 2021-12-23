import {
  Box,
  Button,
  CloseButton,
  Fade,
  Flex,
  FlexProps,
  useEventListener,
  VStack,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { headerHeight } from 'components/shared/TypebotHeader'
import { useEditor } from 'contexts/EditorContext'
import { useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useMemo, useState } from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'

export const PreviewDrawer = () => {
  const { typebot } = useTypebot()
  const { setRightPanel } = useEditor()
  const { previewingIds, setPreviewingIds } = useGraph()
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(400)
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false)

  const publicTypebot = useMemo(
    () => (typebot ? parseTypebotToPublicTypebot(typebot) : undefined),
    [typebot]
  )

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

  const handleNewBlockVisible = (targetId: string) =>
    setPreviewingIds({
      sourceId: !previewingIds.sourceId
        ? 'start-block'
        : previewingIds.targetId,
      targetId: targetId,
    })

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
          <Button>Restart</Button>
          <CloseButton onClick={() => setRightPanel(undefined)} />
        </Flex>

        {publicTypebot && (
          <Flex
            borderWidth={'1px'}
            borderRadius={'lg'}
            h="full"
            w="full"
            pointerEvents={isResizing ? 'none' : 'auto'}
          >
            <TypebotViewer
              typebot={publicTypebot}
              onNewBlockVisisble={handleNewBlockVisible}
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
