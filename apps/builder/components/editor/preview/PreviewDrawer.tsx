import {
  Box,
  CloseButton,
  Fade,
  Flex,
  FlexProps,
  Image,
  Stack,
  Text,
  useEventListener,
  useToast,
  UseToastOptions,
  VStack,
} from '@chakra-ui/react'
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

  const handleCloseClick = () => {
    setPreviewingEdge(undefined)
    setRightPanel(undefined)
  }

  const getShellPath = () => {
    return (
      (process.env.BASE_PATH || (window as any).BASE_PATH) + '/images/shell.svg'
    )
  }

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
            {/* <Button onClick={handleRestartClick} mr="2" disabled={true}>
              Reiniciar
            </Button> */}
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
            key={0}
            pointerEvents={isResizing ? 'none' : 'auto'}
          >
            <Stack
              marginLeft={'30px'}
              marginRight={'30px'}
              width={'100vw'}
              height={'100vh'}
              alignContent={'center'}
              justifyContent={'center'}
            >
              <Image
                src={getShellPath()}
                width={'191px'}
                height={'184px'}
                flexShrink={0}
                alignSelf={'center'}
                marginBottom={'24px'}
              />
              <Text
                color={'black'}
                textAlign={'center'}
                fontFamily={'Poppins'}
                fontSize={'18px'}
                fontStyle={'normal'}
                fontWeight={'600'}
                lineHeight={'24px'}
              >
                Em Construção...
              </Text>
              <Text
                color={'black'}
                textAlign={'center'}
                fontFamily={'Noto Sans'}
                fontSize={'14px'}
                fontStyle={'normal'}
                fontWeight={'400'}
                lineHeight={'20px'}
              >
                Estamos trabalhando e em breve você conseguirá visualizar toda a
                experiência do seu bot por aqui. Aguarde!
              </Text>
            </Stack>
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
