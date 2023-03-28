import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Image,
  Button,
} from '@chakra-ui/react'
import { isNotEmpty } from '@typebot.io/lib'
import { Background, BackgroundType } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'

type BackgroundContentProps = {
  background?: Background
  onBackgroundContentChange: (content: string) => void
}

const defaultBackgroundColor = '#ffffff'

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const { typebot } = useTypebot()
  const handleContentChange = (content: string) =>
    onBackgroundContentChange(content)

  switch (background?.type) {
    case BackgroundType.COLOR:
      return (
        <Flex justify="space-between" align="center">
          <Text>Background color:</Text>
          <ColorPicker
            value={background.content ?? defaultBackgroundColor}
            onColorChange={handleContentChange}
          />
        </Flex>
      )
    case BackgroundType.IMAGE:
      return (
        <Popover isLazy placement="top">
          <PopoverTrigger>
            {isNotEmpty(background.content) ? (
              <Image
                src={background.content}
                alt="Background image"
                cursor="pointer"
                _hover={{ filter: 'brightness(.9)' }}
                transition="filter 200ms"
                rounded="md"
              />
            ) : (
              <Button>Select an image</Button>
            )}
          </PopoverTrigger>
          <PopoverContent p="4">
            <ImageUploadContent
              filePath={`typebots/${typebot?.id}/background`}
              defaultUrl={background.content}
              onSubmit={handleContentChange}
              isGiphyEnabled={false}
            />
          </PopoverContent>
        </Popover>
      )
    default:
      return <></>
  }
}
